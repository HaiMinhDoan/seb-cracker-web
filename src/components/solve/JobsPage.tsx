import { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, SkipForward, Loader2, RefreshCw, UserCheck } from 'lucide-react'
import { solveService } from '../../services/solveService'
import type { JobStatusResponse, Page } from '../../types'
import { format } from 'date-fns'

const STATUS_CONFIG = {
  DONE:          { label: 'Hoàn thành',    color: 'var(--acid)',      bg: 'rgba(200,245,60,0.1)',  icon: CheckCircle },
  FAILED:        { label: 'Thất bại',      color: 'var(--ember)',     bg: 'rgba(255,92,26,0.1)',   icon: XCircle },
  PENDING:       { label: 'Chờ xử lý',    color: 'var(--text-muted)',bg: 'var(--surface2)',       icon: Clock },
  PROCESSING:    { label: 'Đang xử lý',   color: 'var(--frost)',     bg: 'rgba(26,255,228,0.1)',  icon: Loader2 },
  SKIPPED:       { label: 'Bỏ qua',       color: 'var(--text-muted)',bg: 'var(--surface2)',       icon: SkipForward },
  WAITING_HUMAN: { label: 'Chờ tự giải',  color: '#F59E0B',          bg: 'rgba(245,158,11,0.1)',  icon: UserCheck },
}

export default function JobsPage() {
  const [data, setData] = useState<Page<JobStatusResponse> | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const res = await solveService.getMyJobs(filter || undefined, page)
      setData(res.data)
    } catch { }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter, page])

  const statuses = ['', 'DONE', 'PENDING', 'PROCESSING', 'FAILED', 'SKIPPED', 'WAITING_HUMAN']

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-700 mb-1">Lịch sử Jobs</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {data?.totalElements ?? 0} câu hỏi đã gửi
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {statuses.map((s) => {
          const cfg = s ? STATUS_CONFIG[s as keyof typeof STATUS_CONFIG] : null
          return (
            <button key={s} onClick={() => { setFilter(s); setPage(0) }}
              className="px-3 py-1.5 rounded-lg text-xs font-500 transition-all"
              style={{
                background: filter === s ? (cfg?.bg || 'rgba(200,245,60,0.1)') : 'var(--surface)',
                color: filter === s ? (cfg?.color || 'var(--acid)') : 'var(--text-muted)',
                border: `1px solid ${filter === s ? (cfg?.color || 'var(--acid)') : 'var(--border)'}`,
              }}>
              {s || 'Tất cả'}
            </button>
          )
        })}
      </div>

      <div className="surface rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--acid)' }} />
          </div>
        ) : data?.content.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>Chưa có job nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Job ID', 'Trạng thái', 'Question ID', 'Đáp án', 'Nguồn', 'Thời gian', 'Ngày tạo'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-500 uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.content.map((job, i) => {
                  const cfg = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING
                  const Icon = cfg.icon
                  return (
                    <tr key={job.job_id} className="transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: i < (data.content.length - 1) ? '1px solid var(--border)' : undefined }}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>#{job.job_id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          <Icon size={11} className={job.status === 'PROCESSING' ? 'animate-spin' : ''} />
                          {cfg.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[160px]">
                        <p className="text-sm truncate">{job.question_id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-display font-700" style={{ color: job.answer ? 'var(--acid)' : 'var(--text-muted)' }}>
                          {job.answer || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                          {job.answer_source || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                          {job.processing_time_ms ? `${job.processing_time_ms}ms` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {format(new Date(job.created_at), 'dd/MM HH:mm')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Trang {page + 1} / {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-40"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Trước</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={data.totalPages <= page + 1}
              className="px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-40"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Sau</button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Search, CheckCircle, Loader2, Edit2, Check } from 'lucide-react'
import { adminService } from '../../services/adminService'
import type { QuestionBank, Page } from '../../types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const Q_TYPES = ['', 'SINGLECHOICE', 'MULTIPLECHOICE', 'TRUEFALSE', 'ESSAY']

export default function AdminQuestionBank() {
  const [data, setData] = useState<Page<QuestionBank> | null>(null)
  const [loading, setLoading] = useState(false)
  const [subjectCode, setSubjectCode] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editAnswer, setEditAnswer] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminService.searchBank(subjectCode || undefined, type || undefined, page)
      setData(res.data)
    } catch { }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, type])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    load()
  }

  const saveVerify = async (id: number) => {
    try {
      await adminService.verifyAnswer(id, editAnswer)
      toast.success('Đã xác nhận đáp án')
      setEditingId(null)
      load()
    } catch { toast.error('Lỗi xác nhận') }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-700 mb-1">Ngân hàng câu hỏi</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{data?.totalElements ?? 0} câu hỏi</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)}
              placeholder="Mã môn học..."
              className="pl-8 pr-3 py-2 rounded-xl text-sm outline-none w-44"
              style={{
                background: 'var(--surface)',
                border: `1px solid ${searchFocused ? 'var(--frost)' : 'var(--border)'}`,
                color: 'var(--text)',
                transition: 'border-color 0.15s',
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)} />
          </div>
          <button type="submit"
            className="px-4 py-2 rounded-xl text-sm font-500"
            style={{ background: 'rgba(26,255,228,0.1)', color: 'var(--frost)' }}>
            Tìm
          </button>
        </form>

        <div className="flex gap-2">
          {Q_TYPES.map((t) => (
            <button key={t} onClick={() => { setType(t); setPage(0) }}
              className="px-3 py-1.5 rounded-lg text-xs font-500 transition-all"
              style={{
                background: type === t ? 'rgba(200,245,60,0.12)' : 'var(--surface)',
                color: type === t ? 'var(--acid)' : 'var(--text-muted)',
                border: `1px solid ${type === t ? 'var(--acid)' : 'var(--border)'}`,
              }}>
              {t || 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      <div className="surface rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--frost)' }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', 'Loại', 'Câu hỏi', 'Đáp án', 'Môn', 'Hits', 'Verified', 'Ngày', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-500 uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.content.map((q, i) => (
                  <tr key={q.id} className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: i < (data.content.length - 1) ? '1px solid var(--border)' : undefined }}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{q.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded-md"
                        style={{ background: 'var(--surface2)', color: 'var(--frost)' }}>
                        {q.questionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-sm truncate" title={q.questionText}>{q.questionText}</p>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === q.id ? (
                        <div className="flex items-center gap-1">
                          <input value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)}
                            className="w-16 px-2 py-1 rounded-lg text-sm outline-none font-display font-700"
                            style={{ background: 'var(--surface2)', border: '1px solid var(--acid)', color: 'var(--acid)' }} />
                          <button onClick={() => saveVerify(q.id)}
                            className="p-1 rounded-lg" style={{ color: 'var(--acid)' }}>
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="font-display font-700 text-lg" style={{ color: 'var(--acid)' }}>
                          {q.answer || '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{q.subjectCode}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{q.hitCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      {q.isVerified
                        ? <CheckCircle size={14} style={{ color: 'var(--acid)' }} />
                        : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {format(new Date(q.createdAt), 'dd/MM/yy')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setEditingId(q.id); setEditAnswer(q.answer || '') }}
                        className="p-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{ color: 'var(--text-muted)' }}>
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Trang {data.number + 1} / {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={data.first}
              className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Trước</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={data.last}
              className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Sau</button>
          </div>
        </div>
      )}
    </div>
  )
}
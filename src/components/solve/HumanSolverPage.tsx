import { useEffect, useState } from 'react'
import { PenLine, ChevronRight, Loader2, X, CheckCircle, Send } from 'lucide-react'
import { humanService } from '../../services/humanService.ts'
import type { ExamSessionResponse, HumanJobDetail, JobStatusResponse, Page } from '../../types/index.ts'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function HumanSolverPage() {
  const [sessions, setSessions] = useState<Page<ExamSessionResponse> | null>(null)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [selectedSession, setSelectedSession] = useState<ExamSessionResponse | null>(null)
  const [jobs, setJobs] = useState<Page<JobStatusResponse> | null>(null)
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [selectedJob, setSelectedJob] = useState<HumanJobDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sessPage, setSessPage] = useState(0)
  const [jobsPage, setJobsPage] = useState(0)

  useEffect(() => {
    const load = async () => {
      setLoadingSessions(true)
      try {
        const res = await humanService.getSessions(sessPage)
        setSessions(res.data)
      } catch { toast.error('Không tải được danh sách phiên') }
      finally { setLoadingSessions(false) }
    }
    load()
  }, [sessPage])

  const openSession = async (s: ExamSessionResponse) => {
    setSelectedSession(s)
    setSelectedJob(null)
    setAnswer('')
    setLoadingJobs(true)
    try {
      const res = await humanService.getSessionJobs(s.id, jobsPage)
      setJobs(res.data)
    } catch { toast.error('Không tải được danh sách câu hỏi') }
    finally { setLoadingJobs(false) }
  }

  const openJob = async (jobId: number) => {
    setLoadingDetail(true)
    setAnswer('')
    try {
      const res = await humanService.getJobDetail(jobId)
      setSelectedJob(res.data)
    } catch { toast.error('Không tải được chi tiết câu hỏi') }
    finally { setLoadingDetail(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob || !answer.trim()) return
    setSubmitting(true)
    try {
      await humanService.submitAnswer(selectedJob.job_id, answer.trim())
      toast.success(`Đã lưu đáp án: ${answer.trim()}`)
      setSelectedJob(null)
      setAnswer('')
      // Refresh jobs list
      if (selectedSession) {
        const res = await humanService.getSessionJobs(selectedSession.id, jobsPage)
        setJobs(res.data)
      }
    } catch { toast.error('Lỗi gửi đáp án') }
    finally { setSubmitting(false) }
  }

  const iStyle = (focused: boolean) => ({
    background: 'var(--surface2)',
    border: `1px solid ${focused ? 'var(--acid)' : 'var(--border)'}`,
    color: 'var(--text)',
    transition: 'border-color 0.15s',
  })
  const [answerFocused, setAnswerFocused] = useState(false)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.2)' }}>
            <PenLine size={16} style={{ color: '#F59E0B' }} />
          </div>
          <h1 className="font-display text-2xl font-700">Tự giải</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Các câu hỏi đang chờ bạn giải thủ công
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sessions */}
        <div>
          <h2 className="font-display font-600 text-xs uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}>Phiên thi</h2>
          {loadingSessions ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin" style={{ color: '#F59E0B' }} />
            </div>
          ) : sessions?.content.length === 0 ? (
            <div className="surface rounded-2xl p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Không có phiên nào chờ giải
            </div>
          ) : (
            <div className="space-y-2">
              {sessions?.content.map((s) => (
                <button key={s.id} onClick={() => openSession(s)}
                  className="w-full surface rounded-2xl p-4 text-left transition-all group"
                  style={{ borderColor: selectedSession?.id === s.id ? '#F59E0B' : undefined,
                           borderWidth: selectedSession?.id === s.id ? '1px' : undefined }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-600 text-sm">{s.exam_code}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md font-mono"
                          style={{ background: 'var(--surface2)', color: 'var(--frost)' }}>
                          {s.subject_code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {format(new Date(s.created_at), 'dd/MM HH:mm')}
                        </p>
                        {s.pending_count !== undefined && s.pending_count > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded-md font-600"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                            {s.pending_count} câu
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }}
                      className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
              {sessions && sessions.totalPages > 1 && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setSessPage(p => Math.max(0, p - 1))} disabled={sessPage === 0}
                    className="flex-1 py-1.5 rounded-lg text-xs disabled:opacity-40"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Trước</button>
                  <button onClick={() => setSessPage(p => p + 1)} disabled={sessions.totalPages <= sessPage + 1}
                    className="flex-1 py-1.5 rounded-lg text-xs disabled:opacity-40"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Sau</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Jobs list */}
        <div>
          <h2 className="font-display font-600 text-xs uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}>
            {selectedSession ? `Câu hỏi — ${selectedSession.exam_code}` : 'Câu hỏi'}
          </h2>
          {!selectedSession ? (
            <div className="surface rounded-2xl p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Chọn phiên thi để xem câu hỏi
            </div>
          ) : loadingJobs ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin" style={{ color: '#F59E0B' }} />
            </div>
          ) : jobs?.content.length === 0 ? (
            <div className="surface rounded-2xl p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Không có câu hỏi chờ giải
            </div>
          ) : (
            <div className="space-y-2">
              {jobs?.content.map((job) => (
                <button key={job.job_id} onClick={() => openJob(job.job_id)}
                  className="w-full surface rounded-2xl p-3 text-left transition-all group"
                  style={{ borderColor: selectedJob?.job_id === job.job_id ? '#F59E0B' : undefined }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-500">Câu #{job.job_id}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {format(new Date(job.created_at), 'dd/MM HH:mm')}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg font-500"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                      {job.status === 'DONE' ? '✓ Xong' : 'Chờ giải'}
                    </span>
                  </div>
                </button>
              ))}
              {jobs && jobs.totalPages > 1 && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setJobsPage(p => Math.max(0, p - 1))} disabled={jobsPage === 0}
                    className="flex-1 py-1.5 rounded-lg text-xs disabled:opacity-40"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Trước</button>
                  <button onClick={() => setJobsPage(p => p + 1)} disabled={jobs.totalPages <= jobsPage + 1}
                    className="flex-1 py-1.5 rounded-lg text-xs disabled:opacity-40"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Sau</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Question detail + answer */}
        <div>
          <h2 className="font-display font-600 text-xs uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}>Chi tiết câu hỏi</h2>
          {loadingDetail ? (
            <div className="surface rounded-2xl p-6 flex justify-center">
              <Loader2 size={20} className="animate-spin" style={{ color: '#F59E0B' }} />
            </div>
          ) : !selectedJob ? (
            <div className="surface rounded-2xl p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Chọn câu hỏi để giải
            </div>
          ) : (
            <div className="surface rounded-2xl p-5 animate-slide-up">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
                    Câu {selectedJob.question_id} ·
                  </p>
                  <p className="text-sm font-500">Job #{selectedJob.job_id}</p>
                </div>
                <button onClick={() => { setSelectedJob(null); setAnswer('') }}
                  className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              </div>

              <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--surface2)' }}>
                <p className="text-sm leading-relaxed">{selectedJob.question_text}</p>
              </div>

              {selectedJob?.options?.length > 0 && (
                <div className="space-y-2 mb-4">
                  {selectedJob.options.map((opt) => (
                    <button key={opt.label} type="button"
                      onClick={() => setAnswer(opt.label)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
                      style={{
                        background: answer === opt.label ? 'rgba(200,245,60,0.12)' : 'var(--surface2)',
                        border: `1px solid ${answer === opt.label ? 'var(--acid)' : 'transparent'}`,
                      }}>
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-700 flex-shrink-0"
                        style={{
                          background: answer === opt.label ? 'var(--acid)' : 'var(--border)',
                          color: answer === opt.label ? '#0D0D0D' : 'var(--text-muted)',
                        }}>
                        {opt.label}
                      </span>
                      <span style={{ color: answer === opt.label ? 'var(--text)' : 'var(--text-muted)' }}>
                        {opt.text}
                      </span>
                      {answer === opt.label && <CheckCircle size={14} className="ml-auto" style={{ color: 'var(--acid)' }} />}
                    </button>
                  ))}
                </div>
              )}

              {/* Manual text input for ESSAY or if no options */}
              {(selectedJob.question_type === 'ESSAY' || selectedJob?.options?.length === 0) && (
                <div className="mb-4">
                  <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Đáp án
                  </label>
                  <input value={answer} onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Nhập đáp án..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={iStyle(answerFocused)}
                    onFocus={() => setAnswerFocused(true)}
                    onBlur={() => setAnswerFocused(false)} />
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <button type="submit" disabled={!answer.trim() || submitting}
                  className="w-full py-3 rounded-xl font-display font-600 text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  style={{ background: 'var(--acid)', color: '#0D0D0D' }}>
                  {submitting
                    ? <Loader2 size={15} className="animate-spin" />
                    : <Send size={15} />}
                  {submitting ? 'Đang gửi...' : `Gửi đáp án${answer ? `: ${answer}` : ''}`}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { BookOpen, ChevronRight, Loader2, X, CheckCircle, XCircle } from 'lucide-react'
import { sessionService } from '../../services/sessionService'
import type { ExamSessionResponse, QuestionRecordResponse, Page } from '../../types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Page<ExamSessionResponse> | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState<ExamSessionResponse | null>(null)
  const [questions, setQuestions] = useState<QuestionRecordResponse[]>([])
  const [qLoading, setQLoading] = useState(false)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await sessionService.getMySessions(page)
        setSessions(res.data)
      } catch { }
      finally { setLoading(false) }
    }
    load()
  }, [page])

  const openSession = async (s: ExamSessionResponse) => {
    setSelectedSession(s)
    setQLoading(true)
    try {
      const res = await sessionService.getSessionQuestions(s.id)
      setQuestions(res.data)
    } catch {
      toast.error('Không thể tải câu hỏi')
    } finally {
      setQLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-700 mb-1">Phiên thi</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Lịch sử các phiên làm bài của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Session list */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--acid)' }} />
            </div>
          ) : sessions?.content.length === 0 ? (
            <div className="surface rounded-2xl p-8 text-center" style={{ color: 'var(--text-muted)' }}>
              Chưa có phiên thi nào
            </div>
          ) : sessions?.content.map((s) => (
            <button key={s.id} onClick={() => openSession(s)}
              className="w-full surface rounded-2xl p-4 text-left transition-all hover:border-opacity-80 group"
              style={{ borderColor: selectedSession?.id === s.id ? 'var(--acid)' : undefined }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-600 text-sm">{s.exam_code}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md font-mono"
                      style={{ background: 'var(--surface2)', color: 'var(--frost)' }}>
                      {s.subject_code}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {format(new Date(s.created_at), 'dd/MM/yyyy HH:mm')} · {s.device_id}
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }}
                  className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}

          {sessions && sessions.totalPages > 1 && (
            <div className="flex gap-2 pt-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={sessions.first}
                className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Trước</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={sessions.last}
                className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Sau</button>
            </div>
          )}
        </div>

        {/* Questions panel */}
        <div className="surface rounded-2xl p-5 h-fit sticky top-6">
          {!selectedSession ? (
            <div className="text-center py-10">
              <BookOpen size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chọn phiên thi để xem chi tiết</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-600">{selectedSession.exam_code}</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{questions.length} câu hỏi</p>
                </div>
                <button onClick={() => { setSelectedSession(null); setQuestions([]) }}
                  className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>

              {qLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={20} className="animate-spin" style={{ color: 'var(--acid)' }} />
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {questions.map((q) => (
                    <div key={q.id} className="rounded-xl p-3" style={{ background: 'var(--surface2)' }}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-500">Câu {q.question_number}</p>
                        <div className="flex items-center gap-1.5">
                          {q.success
                            ? <CheckCircle size={12} style={{ color: 'var(--acid)' }} />
                            : <XCircle size={12} style={{ color: 'var(--ember)' }} />}
                          {q.answer && (
                            <span className="font-display font-700 text-sm" style={{ color: 'var(--acid)' }}>
                              {q.answer}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{q.question_text}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{q.answer_source}</span>
                        {q.processing_time_ms && (
                          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                            {q.processing_time_ms}ms
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

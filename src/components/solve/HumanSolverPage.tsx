import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Loader2,
  PenLine,
  Send,
  User,
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { humanService } from '../../services/humanService.ts'
import { useAuthStore } from '../../store/authStore.ts'
import type { ExamSessionResponse, HumanJobDetail, JobStatusResponse, Page } from '../../types/index.ts'

type DraftStore = Record<string, Record<string, string>>

const ANSWER_COOKIE = 'human_solver_answers'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30
const JOBS_PAGE_SIZE = 200

function readCookie(name: string) {
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1]
  return value ? decodeURIComponent(value) : ''
}

function readDraftStore(): DraftStore {
  try {
    return JSON.parse(readCookie(ANSWER_COOKIE) || '{}')
  } catch {
    return {}
  }
}

function writeDraftStore(store: DraftStore) {
  document.cookie = `${ANSWER_COOKIE}=${encodeURIComponent(JSON.stringify(store))}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const rest = safeSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

function getJobNumber(job: JobStatusResponse | HumanJobDetail | null, fallback: number) {
  if (!job) return fallback
  if ('question_number' in job && job.question_number) return job.question_number
  if (job.question_id) return job.question_id
  return String(fallback)
}

function getQuestionSortValue(job: Pick<JobStatusResponse, 'question_id' | 'job_id'>) {
  const numberPart = job.question_id?.match(/\d+/)?.[0]
  return numberPart ? Number(numberPart) : job.job_id
}

function normalizeQuestionType(type?: string) {
  return (type || '').toUpperCase()
}

function getQuestionTypeLabel(type?: string) {
  switch (normalizeQuestionType(type)) {
    case 'SINGLECHOICE':
      return 'SINGLECHOICE'
    case 'MULTIPLECHOICE':
      return 'MULTIPLECHOICE'
    case 'TRUEFALSE':
      return 'TRUEFALSE'
    case 'ESSAY':
      return 'ESSAY'
    default:
      return type || 'Question'
  }
}

function getQuestionInstruction(type?: string) {
  switch (normalizeQuestionType(type)) {
    case 'MULTIPLECHOICE':
      return 'Chọn nhiều đáp án'
    case 'TRUEFALSE':
      return 'Chọn Đúng/Sai'
    case 'ESSAY':
      return 'Nhập câu trả lời'
    default:
      return 'Chọn 1 đáp án'
  }
}

function parseAnswerLabels(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function HumanSolverPage() {
  const [searchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const sessionIdParam = searchParams.get('sessionId')
  const activeSessionId = sessionIdParam ? Number(sessionIdParam) : null

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
  const [draftStore, setDraftStore] = useState<DraftStore>(() => readDraftStore())
  const [answerFocused, setAnswerFocused] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(50 * 60 + 14)

  const sessionKey = activeSessionId ? String(activeSessionId) : ''
  const sessionDrafts = sessionKey ? draftStore[sessionKey] || {} : {}
  const jobList = useMemo(() => {
    return [...(jobs?.content || [])].sort((a, b) => {
      const byQuestion = getQuestionSortValue(a) - getQuestionSortValue(b)
      return byQuestion || a.job_id - b.job_id
    })
  }, [jobs?.content])
  const selectedJobIndex = selectedJob
    ? jobList.findIndex((job) => job.job_id === selectedJob.job_id)
    : -1
  const displayIndex = selectedJobIndex >= 0 ? selectedJobIndex + 1 : 1

  const pendingAnswers = useMemo(
    () => Object.entries(sessionDrafts).filter(([, value]) => value.trim()),
    [sessionDrafts]
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    setSelectedJob(null)
    setAnswer('')
    setJobsPage(0)
  }, [activeSessionId])

  useEffect(() => {
    const load = async () => {
      setLoadingSessions(true)
      try {
        const res = await humanService.getSessions(sessPage)
        setSessions(res.data)
        if (activeSessionId) {
          setSelectedSession(res.data.content.find((session) => session.id === activeSessionId) || null)
        }
      } catch {
        toast.error('Không tải được danh sách bài thi')
      } finally {
        setLoadingSessions(false)
      }
    }
    load()
  }, [activeSessionId, sessPage])

  useEffect(() => {
    if (!activeSessionId) {
      setJobs(null)
      setSelectedJob(null)
      return
    }

    const load = async () => {
      setLoadingJobs(true)
      try {
        const res = await humanService.getSessionJobs(activeSessionId, jobsPage, JOBS_PAGE_SIZE)
        setJobs(res.data)
      } catch {
        toast.error('Không tải được danh sách câu hỏi')
      } finally {
        setLoadingJobs(false)
      }
    }
    load()
  }, [activeSessionId, jobsPage])

  useEffect(() => {
    if (loadingJobs || jobList.length === 0) return
    const selectedJobStillVisible = selectedJob
      ? jobList.some((job) => job.job_id === selectedJob.job_id)
      : false

    if (!selectedJobStillVisible) {
      openJob(jobList[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId, jobsPage, jobList, loadingJobs, selectedJob?.job_id])

  const openSessionInNewTab = (sessionId: number) => {
    window.open(`${window.location.origin}/human?sessionId=${sessionId}`, '_blank', 'noopener,noreferrer')
  }

  const answerForJob = (job: Pick<JobStatusResponse, 'job_id' | 'answer'>) => {
    const key = String(job.job_id)
    return Object.prototype.hasOwnProperty.call(sessionDrafts, key) ? sessionDrafts[key] : job.answer || ''
  }

  const saveAnswer = (jobId: number, value: string) => {
    if (!sessionKey) return
    setAnswer(value)
    setDraftStore((current) => {
      const next = {
        ...current,
        [sessionKey]: {
          ...(current[sessionKey] || {}),
          [String(jobId)]: value,
        },
      }
      writeDraftStore(next)
      return next
    })
  }

  const openJob = async (job: JobStatusResponse) => {
    setLoadingDetail(true)
    setAnswer(answerForJob(job))
    try {
      const res = await humanService.getJobDetail(job.job_id)
      setSelectedJob(res.data)
      const key = String(job.job_id)
      const savedAnswer = Object.prototype.hasOwnProperty.call(sessionDrafts, key)
        ? sessionDrafts[key]
        : res.data.answer || ''
      setAnswer(savedAnswer)
    } catch {
      toast.error('Không tải được chi tiết câu hỏi')
    } finally {
      setLoadingDetail(false)
    }
  }

  const toggleOption = (value: string) => {
    if (!selectedJob) return

    if (normalizeQuestionType(selectedJob.question_type) === 'MULTIPLECHOICE') {
      const selectedLabels = parseAnswerLabels(answer)
      const nextLabels = selectedLabels.includes(value)
        ? selectedLabels.filter((label) => label !== value)
        : [...selectedLabels, value]
      const optionOrder = selectedJob.options.map((option) => option.label)
      const orderedLabels = nextLabels.sort((a, b) => optionOrder.indexOf(a) - optionOrder.indexOf(b))
      saveAnswer(selectedJob.job_id, orderedLabels.join(','))
      return
    }

    saveAnswer(selectedJob.job_id, answer === value ? '' : value)
  }

  const moveQuestion = (direction: -1 | 1) => {
    if (selectedJobIndex < 0) return
    const next = jobList[selectedJobIndex + direction]
    if (next) openJob(next)
  }

  const submitAll = async () => {
    if (!activeSessionId || pendingAnswers.length === 0) return
    setSubmitting(true)
    try {
      await humanService.submitAnswers(
        pendingAnswers.map(([jobId, value]) => ({ jobId: Number(jobId), answer: value.trim() }))
      )
      toast.success(`Đã gửi ${pendingAnswers.length} đáp án`)
      const res = await humanService.getSessionJobs(activeSessionId, jobsPage, JOBS_PAGE_SIZE)
      setJobs(res.data)
    } catch {
      toast.error('Lỗi gửi danh sách đáp án')
    } finally {
      setSubmitting(false)
    }
  }

  const renderSessions = () => (
    <div className="min-h-screen p-6" style={{ background: '#0D0D0D', color: 'rgba(255,255,255,0.92)' }}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <PenLine size={17} style={{ color: '#2ECC71' }} />
              </div>
              <h1 className="font-display text-2xl font-700">Tự giải</h1>
            </div>
            <p className="text-sm" style={{ color: '#B3B3B3' }}>
              Chọn bài thi để mở tab giải riêng. Đáp án được lưu trong cookie trước khi gửi hàng loạt.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-700 uppercase tracking-[0.18em]" style={{ color: '#B3B3B3' }}>
              Bài thi đang chờ
            </h2>
            {loadingSessions && <Loader2 size={16} className="animate-spin" style={{ color: '#F1C40F' }} />}
          </div>

          {!loadingSessions && sessions?.content.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#121212] p-8 text-center text-sm" style={{ color: '#B3B3B3' }}>
              Không có bài thi nào chờ giải
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {sessions?.content.map((session) => (
                <button
                  key={session.id}
                  onClick={() => openSessionInNewTab(session.id)}
                  className="group rounded-xl border border-white/10 bg-[#121212]/90 p-4 text-left transition-all hover:border-[#2ECC71]/70 hover:bg-[#1A1A1A]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-base font-700 text-white">{session.exam_code}</span>
                        <span className="rounded-md border border-[#2ECC71]/20 bg-[#2ECC71]/10 px-2 py-0.5 text-xs font-700" style={{ color: '#2ECC71' }}>
                          {session.subject_code}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: '#B3B3B3' }}>
                        {format(new Date(session.created_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs" style={{ color: '#F1C40F' }}>
                        {session.pending_count ?? 0} câu
                      </span>
                      <ExternalLink size={16} className="transition-transform group-hover:translate-x-0.5" style={{ color: '#B3B3B3' }} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {sessions && sessions.totalPages > 1 && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSessPage((page) => Math.max(0, page - 1))}
                disabled={sessPage === 0}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
              >
                Trước
              </button>
              <button
                onClick={() => setSessPage((page) => page + 1)}
                disabled={sessions.totalPages <= sessPage + 1}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderExamHeader = () => (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0D0D0D]/90 px-5 py-4 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70">
            <ChevronLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-800 tracking-tight text-white">
                {selectedSession?.subject_code || 'PRF192'}
              </h1>
              <span className="rounded-md border border-[#2ECC71]/20 bg-[#2ECC71]/10 px-2 py-0.5 text-xs font-800" style={{ color: '#2ECC71' }}>
                HN
              </span>
            </div>
            <p className="text-xs" style={{ color: '#B3B3B3' }}>
              {selectedSession?.exam_code || `Bài thi #${activeSessionId}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm md:flex" style={{ color: '#B3B3B3' }}>
            <User size={15} />
            <span className="max-w-44 truncate text-white/85">{user?.fullName || user?.email || 'Student'}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#F1C40F]/20 bg-[#F1C40F]/10 px-3 py-2 font-mono text-sm font-700" style={{ color: '#F1C40F' }}>
            <Clock3 size={16} />
            {formatDuration(remainingSeconds)}
          </div>
          <button
            onClick={submitAll}
            disabled={pendingAnswers.length === 0 || submitting}
            className="flex items-center gap-2 rounded-lg border border-[#2ECC71]/30 bg-[#2ECC71] px-4 py-2 text-sm font-800 text-[#0D0D0D] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Gửi {pendingAnswers.length}
          </button>
        </div>
      </div>
    </header>
  )

  const renderQuestionPanel = () => (
    <section className="min-w-0 rounded-xl border border-white/10 bg-[#121212]/80 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-base font-900 text-[#0D0D0D]">
            {displayIndex}
          </div>
          <div>
            <p className="text-base font-800 text-white">
              Câu {getJobNumber(selectedJob, displayIndex)}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className="rounded-md border px-2 py-0.5 text-[11px] font-800 uppercase tracking-wide"
                style={{
                  borderColor: normalizeQuestionType(selectedJob?.question_type) === 'ESSAY' ? 'rgba(241,196,15,0.35)' : 'rgba(46,204,113,0.35)',
                  background: normalizeQuestionType(selectedJob?.question_type) === 'ESSAY' ? 'rgba(241,196,15,0.10)' : 'rgba(46,204,113,0.10)',
                  color: normalizeQuestionType(selectedJob?.question_type) === 'ESSAY' ? '#F1C40F' : '#2ECC71',
                }}
              >
                {getQuestionTypeLabel(selectedJob?.question_type)}
              </span>
              <span className="text-xs" style={{ color: '#B3B3B3' }}>
                {getQuestionInstruction(selectedJob?.question_type)}
              </span>
            </div>
            <p className="text-sm" style={{ color: '#B3B3B3' }}>
              {answer
                ? normalizeQuestionType(selectedJob?.question_type) === 'ESSAY'
                  ? 'Đã nhập câu trả lời'
                  : `Đang chọn: ${answer}`
                : 'Chưa chọn đáp án'}
            </p>
          </div>
        </div>
        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-700" style={{ color: '#B3B3B3' }}>
          {displayIndex}/{jobList.length || 0}
        </span>
      </div>

      {loadingDetail ? (
        <div className="flex min-h-[340px] items-center justify-center rounded-xl border border-white/10 bg-[#1A1A1A]">
          <Loader2 size={24} className="animate-spin" style={{ color: '#F1C40F' }} />
        </div>
      ) : !selectedJob ? (
        <div className="flex min-h-[340px] items-center justify-center rounded-xl border border-white/10 bg-[#1A1A1A] text-sm" style={{ color: '#B3B3B3' }}>
          Chọn câu hỏi để bắt đầu
        </div>
      ) : (
        <>
          <div className="mb-5 rounded-xl border border-white/10 bg-[#1A1A1A] p-5">
            <p className="text-[15px] leading-7" style={{ color: '#D8D8D8' }}>
              {selectedJob.question_text}
            </p>
          </div>

          {selectedJob.options?.length > 0 && (
            <div className="grid gap-3">
              {selectedJob.options.map((option) => {
                const active = normalizeQuestionType(selectedJob.question_type) === 'MULTIPLECHOICE'
                  ? parseAnswerLabels(answer).includes(option.label)
                  : answer === option.label
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => toggleOption(option.label)}
                    className="group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all"
                    style={{
                      background: active ? 'rgba(46,204,113,0.12)' : '#121212',
                      borderColor: active ? '#2ECC71' : 'rgba(255,255,255,0.10)',
                      boxShadow: active ? '0 0 0 1px rgba(46,204,113,0.18), 0 0 22px rgba(46,204,113,0.10)' : 'none',
                    }}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-900 transition-all"
                      style={{
                        background: active ? '#2ECC71' : '#1A1A1A',
                        borderColor: active ? '#2ECC71' : 'rgba(255,255,255,0.12)',
                        color: active ? '#0D0D0D' : '#FFFFFF',
                      }}
                    >
                      {option.label}
                    </span>
                    <span className="text-sm leading-6 transition-colors" style={{ color: active ? '#FFFFFF' : '#B3B3B3' }}>
                      {option.text}
                    </span>
                    {active && <CheckCircle size={18} className="ml-auto shrink-0" style={{ color: '#2ECC71' }} />}
                  </button>
                )
              })}
            </div>
          )}

          {(normalizeQuestionType(selectedJob.question_type) === 'ESSAY' || selectedJob.options?.length === 0) && (
            <textarea
              value={answer}
              onChange={(event) => saveAnswer(selectedJob.job_id, event.target.value)}
              onFocus={() => setAnswerFocused(true)}
              onBlur={() => setAnswerFocused(false)}
              placeholder="Nhập đáp án..."
              className="w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none"
              style={{
                minHeight: 180,
                background: '#121212',
                borderColor: answerFocused ? '#2ECC71' : 'rgba(255,255,255,0.10)',
                color: '#EDEDED',
                caretColor: '#2ECC71',
                lineHeight: 1.65,
              }}
            />
          )}
        </>
      )}
    </section>
  )

  const renderQuestionGrid = () => (
    <aside
      className="rounded-xl border border-white/10 bg-[#121212]/85 p-4 backdrop-blur-xl"
      style={{ width: 300, minWidth: 300, alignSelf: 'start', position: 'sticky', top: 88 }}
    >
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
        <button
          onClick={() => moveQuestion(-1)}
          disabled={selectedJobIndex <= 0}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70 disabled:opacity-35"
        >
          <ChevronLeft size={17} />
        </button>
        <div className="text-center">
          <p className="text-lg font-900 text-white">
            {displayIndex}/{jobList.length || 0}
          </p>
          <p className="text-xs" style={{ color: '#B3B3B3' }}>
            {pendingAnswers.length} đã chọn
          </p>
        </div>
        <button
          onClick={() => moveQuestion(1)}
          disabled={selectedJobIndex < 0 || selectedJobIndex >= jobList.length - 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/70 disabled:opacity-35"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${jobList.length ? Math.round((pendingAnswers.length / jobList.length) * 100) : 0}%`,
            background: '#2ECC71',
            boxShadow: '0 0 18px rgba(46,204,113,0.45)',
          }}
        />
      </div>

      {loadingJobs ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin" style={{ color: '#F1C40F' }} />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 44px)',
            gap: 8,
            justifyContent: 'center',
          }}
        >
          {jobList.map((job, index) => {
            const saved = answerForJob(job)
            const current = selectedJob?.job_id === job.job_id
            return (
              <button
                key={job.job_id}
                onClick={() => openJob(job)}
                className="h-11 w-11 rounded-lg border text-sm font-800 transition-all hover:border-[#2ECC71]/80 hover:bg-[#2ECC71]/10"
                style={{
                  background: saved ? 'rgba(46,204,113,0.16)' : '#1A1A1A',
                  borderColor: current ? '#F1C40F' : saved ? '#2ECC71' : 'rgba(255,255,255,0.10)',
                  color: saved ? '#2ECC71' : '#B3B3B3',
                  boxShadow: current ? '0 0 0 1px rgba(241,196,15,0.35), 0 0 18px rgba(241,196,15,0.16)' : 'none',
                }}
                title={saved ? `Đã chọn ${saved}` : 'Chưa chọn'}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      )}

      {jobs && jobs.totalPages > 1 && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setJobsPage((page) => Math.max(0, page - 1))}
            disabled={jobsPage === 0}
            className="flex-1 rounded-lg border border-white/10 py-2 text-xs text-white/80 disabled:opacity-35"
          >
            Trước
          </button>
          <button
            onClick={() => setJobsPage((page) => page + 1)}
            disabled={jobs.totalPages <= jobsPage + 1}
            className="flex-1 rounded-lg border border-white/10 py-2 text-xs text-white/80 disabled:opacity-35"
          >
            Sau
          </button>
        </div>
      )}
    </aside>
  )

  const renderExamWorkspace = () => (
    <div className="min-h-screen" style={{ background: '#0D0D0D', color: 'rgba(255,255,255,0.92)' }}>
      {renderExamHeader()}
      <main
        className="p-5"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 300px',
          gap: 20,
          alignItems: 'start',
          minWidth: 0,
        }}
      >
        {renderQuestionPanel()}
        {renderQuestionGrid()}
      </main>
      <footer className="sticky bottom-0 border-t border-white/10 bg-[#0D0D0D]/90 px-5 py-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs" style={{ color: '#B3B3B3' }}>
            Đáp án được lưu vào cookie. Bấm lại đáp án đã chọn để bỏ khoanh.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => moveQuestion(-1)}
              disabled={selectedJobIndex <= 0}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#121212] px-4 py-2 text-sm text-white/85 disabled:opacity-35"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              onClick={() => moveQuestion(1)}
              disabled={selectedJobIndex < 0 || selectedJobIndex >= jobList.length - 1}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white px-4 py-2 text-sm font-800 text-[#0D0D0D] disabled:opacity-35"
            >
              Next
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  )

  return activeSessionId ? renderExamWorkspace() : renderSessions()
}

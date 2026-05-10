import { useState, useEffect, useRef } from 'react'
import { Send, Plus, Trash2, Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { solveService } from '../../services/solveService'
import { useAuthStore } from '../../store/authStore'
import type { JobStatusResponse } from '../../types'

const QUESTION_TYPES = ['SINGLECHOICE', 'MULTIPLECHOICE', 'TRUEFALSE', 'ESSAY']

export default function SolvePage() {
  const user = useAuthStore((s) => s.user)
  const [form, setForm] = useState({
    examCode: '',
    subjectCode: '',
    deviceId: 'web-client',
    questionNumber: '1',
    questionType: 'SINGLECHOICE',
    questionText: '',
  })
  const [options, setOptions] = useState([
    { label: 'A', text: '' },
    { label: 'B', text: '' },
    { label: 'C', text: '' },
    { label: 'D', text: '' },
  ])
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [result, setResult] = useState<JobStatusResponse | null>(null)
  const [jobId, setJobId] = useState<number | null>(null)
  const [focused, setFocused] = useState<string | null>(null)

  // Ref để cleanup interval khi unmount
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const addOption = () => {
    const labels = 'ABCDEFGHIJ'
    setOptions((o) => [...o, { label: labels[o.length] || String(o.length + 1), text: '' }])
  }
  const removeOption = (i: number) => setOptions((o) => o.filter((_, idx) => idx !== i))
  const setOptionText = (i: number, text: string) =>
    setOptions((o) => o.map((opt, idx) => (idx === i ? { ...opt, text } : opt)))

  const pollResult = (jId: number) => {
    setPolling(true)
    let attempts = 0

    if (pollRef.current) clearInterval(pollRef.current)

    pollRef.current = setInterval(async () => {
      attempts++
      try {
        const job = await solveService.getJobStatus(jId, user!.email)
        if (
          job.status === 'DONE' ||
          job.status === 'FAILED' ||
          job.status === 'SKIPPED'
        ) {
          setResult(job)
          setPolling(false)
          clearInterval(pollRef.current!)
          pollRef.current = null
          if (job.status === 'DONE') toast.success('Đã có kết quả!')
          else toast.error('Không tìm được đáp án')
        }
      } catch {
        // bỏ qua lỗi poll tạm thời
      }
      if (attempts > 30) {
        clearInterval(pollRef.current!)
        pollRef.current = null
        setPolling(false)
        toast.error('Timeout — vui lòng kiểm tra lại trong Lịch sử jobs')
      }
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.examCode || !form.subjectCode || !form.questionText) {
      return toast.error('Vui lòng điền đầy đủ thông tin')
    }
    setLoading(true)
    setResult(null)
    try {
      const payload = {
        session: {
          email: user!.email,
          exam_code: form.examCode,
          subject_code: form.subjectCode,
          device_id: form.deviceId || 'web-client',
        },
        question: {
          number: form.questionNumber,
          text: form.questionText,
          options: options.filter((o) => o.text.trim()),
          question_type: form.questionType,
        },
        question_id: `${Date.now()}`,
        captured_at: new Date().toISOString().slice(0, 19),
      }
      const job = await solveService.submitQuestion(payload)
      setJobId(job.job_id)
      toast.success('Câu hỏi đã được gửi, đang xử lý...')
      pollResult(job.job_id)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi gửi câu hỏi')
    } finally {
      setLoading(false)
    }
  }

  const iStyle = (field: string) => ({
    background: 'var(--surface2)',
    border: `1px solid ${focused === field ? 'var(--acid)' : 'var(--border)'}`,
    color: 'var(--text)',
    transition: 'border-color 0.15s',
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--acid)' }}>
            <Zap size={16} className="text-black" />
          </div>
          <h1 className="font-display text-2xl font-700">Giải bài</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Nhập câu hỏi và nhận đáp án từ ngân hàng câu hỏi hoặc AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Session Info */}
            <div className="surface rounded-2xl p-5">
              <h2
                className="font-display font-600 text-sm mb-4 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Thông tin kỳ thi
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: 'examCode', label: 'Mã đề thi', placeholder: 'VD: DE001' },
                  { k: 'subjectCode', label: 'Mã môn học', placeholder: 'VD: KTLT' },
                ].map(({ k, label, placeholder }) => (
                  <div key={k}>
                    <label
                      className="block text-xs mb-1.5 uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {label}
                    </label>
                    <input
                      value={(form as any)[k]}
                      onChange={(e) => set(k, e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={iStyle(k)}
                      onFocus={() => setFocused(k)}
                      onBlur={() => setFocused(null)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="surface rounded-2xl p-5">
              <h2
                className="font-display font-600 text-sm mb-4 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Câu hỏi
              </h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-20">
                    <label
                      className="block text-xs mb-1.5 uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Câu số
                    </label>
                    <input
                      value={form.questionNumber}
                      onChange={(e) => set('questionNumber', e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={iStyle('questionNumber')}
                      onFocus={() => setFocused('questionNumber')}
                      onBlur={() => setFocused(null)}
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      className="block text-xs mb-1.5 uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Loại câu hỏi
                    </label>
                    <select
                      value={form.questionType}
                      onChange={(e) => set('questionType', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={iStyle('questionType')}
                      onFocus={() => setFocused('questionType')}
                      onBlur={() => setFocused(null)}
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs mb-1.5 uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Nội dung câu hỏi
                  </label>
                  <textarea
                    value={form.questionText}
                    onChange={(e) => set('questionText', e.target.value)}
                    rows={4}
                    placeholder="Nhập câu hỏi..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={iStyle('questionText')}
                    onFocus={() => setFocused('questionText')}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            {form.questionType !== 'ESSAY' && (
              <div className="surface rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="font-display font-600 text-sm uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Các lựa chọn
                  </h2>
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500 transition-all"
                    style={{ background: 'rgba(200,245,60,0.1)', color: 'var(--acid)' }}
                  >
                    <Plus size={12} /> Thêm
                  </button>
                </div>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-700 flex-shrink-0"
                        style={{ background: 'var(--surface2)', color: 'var(--acid)' }}
                      >
                        {opt.label}
                      </span>
                      <input
                        value={opt.text}
                        onChange={(e) => setOptionText(i, e.target.value)}
                        placeholder={`Lựa chọn ${opt.label}`}
                        className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                        style={iStyle(`opt-${i}`)}
                        onFocus={() => setFocused(`opt-${i}`)}
                        onBlur={() => setFocused(null)}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="p-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{ color: 'var(--ember)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || polling}
              className="w-full py-3 rounded-xl font-display font-600 text-sm flex items-center justify-center gap-2 transition-all acid-glow disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--acid)', color: '#0D0D0D' }}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
              ) : polling ? (
                <><Loader2 size={16} className="animate-spin" /> Đang chờ kết quả...</>
              ) : (
                <><Send size={16} /> Gửi câu hỏi</>
              )}
            </button>
          </form>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-2">
          <div className="surface rounded-2xl p-5 sticky top-6">
            <h2
              className="font-display font-600 text-sm uppercase tracking-wider mb-4"
              style={{ color: 'var(--text-muted)' }}
            >
              Kết quả
            </h2>

            {!result && !polling && (
              <div className="text-center py-10">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'var(--surface2)' }}
                >
                  <Zap size={20} style={{ color: 'var(--text-muted)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Kết quả sẽ hiển thị sau khi gửi câu hỏi
                </p>
              </div>
            )}

            {polling && !result && (
              <div className="text-center py-10">
                <Loader2
                  size={32}
                  className="animate-spin mx-auto mb-3"
                  style={{ color: 'var(--acid)' }}
                />
                <p className="text-sm font-500" style={{ color: 'var(--acid)' }}>
                  Đang xử lý...
                </p>
                {jobId && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Job #{jobId}
                  </p>
                )}
              </div>
            )}

            {result && (
              <div className="animate-slide-up space-y-4">
                <div className="flex items-center gap-2">
                  {result.status === 'DONE' ? (
                    <CheckCircle size={18} style={{ color: 'var(--acid)' }} />
                  ) : (
                    <XCircle size={18} style={{ color: 'var(--ember)' }} />
                  )}
                  <span
                    className="text-sm font-500"
                    style={{ color: result.status === 'DONE' ? 'var(--acid)' : 'var(--ember)' }}
                  >
                    {result.status === 'DONE' ? 'Tìm được đáp án' : 'Không có đáp án'}
                  </span>
                </div>

                {result.answer && (
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(200,245,60,0.08)',
                      border: '1px solid rgba(200,245,60,0.2)',
                    }}
                  >
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      Đáp án
                    </p>
                    <p className="font-display font-700 text-3xl" style={{ color: 'var(--acid)' }}>
                      {result.answer}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {[
                    { label: 'Nguồn', value: result.answer_source },
                    { label: 'Job ID', value: `#${result.job_id}` },
                    {
                      label: 'Thời gian',
                      value: result.processing_time_ms ? `${result.processing_time_ms}ms` : '-',
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>
                        {value || '-'}
                      </span>
                    </div>
                  ))}
                </div>

                {result.error_message && (
                  <div
                    className="rounded-xl p-3 text-xs"
                    style={{
                      background: 'rgba(255,92,26,0.08)',
                      border: '1px solid rgba(255,92,26,0.2)',
                      color: 'var(--ember)',
                    }}
                  >
                    {result.error_message}
                  </div>
                )}

                <button
                  onClick={() => {
                    setResult(null)
                    setJobId(null)
                  }}
                  className="w-full py-2 rounded-xl text-xs font-500 transition-all"
                  style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}
                >
                  Gửi câu hỏi mới
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

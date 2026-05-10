import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phoneNumber: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const handleChange = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) return toast.error('Mật khẩu ít nhất 8 ký tự')
    setLoading(true)
    try {
      const user = await authService.register(form)
      setAuth(user)
      toast.success('Đăng ký thành công!')
      navigate('/solve')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field: string) => ({
    background: 'var(--surface2)',
    border: `1px solid ${focused === field ? 'var(--acid)' : 'var(--border)'}`,
    color: 'var(--text)',
    transition: 'border-color 0.15s',
  })

  const fields: { key: keyof typeof form; label: string; type: string; placeholder: string; required: boolean; autoComplete: string }[] = [
    { key: 'fullName', label: 'Họ và tên', type: 'text', placeholder: 'Nguyễn Văn A', required: true, autoComplete: 'name' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true, autoComplete: 'email' },
    { key: 'phoneNumber', label: 'Số điện thoại (tuỳ chọn)', type: 'tel', placeholder: '09xxxxxxxx', required: false, autoComplete: 'tel' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid — pointer-events: none để không chặn click */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--acid) 1px, transparent 1px), linear-gradient(90deg, var(--acid) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center acid-glow"
              style={{ background: 'var(--acid)' }}
            >
              <Zap size={20} className="text-black" />
            </div>
            <span className="font-display text-2xl font-700 tracking-tight">ExamSolver</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tạo tài khoản mới</p>
        </div>

        <div className="surface rounded-2xl p-8">
          <h1 className="font-display text-xl font-600 mb-6">Đăng ký</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, placeholder, required, autoComplete }) => (
              <div key={key}>
                <label
                  className="block text-xs font-500 mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  required={required}
                  autoComplete={autoComplete}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={inputStyle(key)}
                  onFocus={() => setFocused(key)}
                  onBlur={() => setFocused(null)}
                />
              </div>
            ))}

            <div>
              <label
                className="block text-xs font-500 mb-2 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Ít nhất 8 ký tự"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none"
                  style={inputStyle('password')}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-display font-600 text-sm transition-all mt-2 acid-glow disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--acid)', color: '#0D0D0D' }}
            >
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: 'var(--acid)' }}>
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<'email' | 'password' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await authService.login(email, password)
      setAuth(user)
      toast.success('Chào mừng trở lại!')
      navigate('/solve')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Email hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field: 'email' | 'password') => ({
    background: 'var(--surface2)',
    border: `1px solid ${focused === field ? 'var(--acid)' : 'var(--border)'}`,
    color: 'var(--text)',
    transition: 'border-color 0.15s',
  })

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
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center acid-glow"
              style={{ background: 'var(--acid)' }}
            >
              <Zap size={20} className="text-black" />
            </div>
            <span className="font-display text-2xl font-700 tracking-tight" style={{ color: 'var(--text)' }}>
              ExamSolver
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Giải bài tự động, nhanh chóng</p>
        </div>

        {/* Card */}
        <div className="surface rounded-2xl p-8">
          <h1 className="font-display text-xl font-600 mb-6" style={{ color: 'var(--text)' }}>
            Đăng nhập
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-500 mb-2 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle('email')}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </div>

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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none"
                  style={inputStyle('password')}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
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
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="transition-colors" style={{ color: 'var(--acid)' }}>
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

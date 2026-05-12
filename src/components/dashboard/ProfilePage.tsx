import { useAuthStore } from '../../store/authStore'
import { User, Mail, Shield, Clock, Zap, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  if (!user) return null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-700 mb-8">Hồ sơ</h1>

      <div className="surface rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-700 flex-shrink-0"
            style={{ background: 'var(--acid)', color: '#0D0D0D' }}>
            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="font-display font-700 text-xl">{user.full_name}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-500"
                style={{
                  background: user.role === 'ADMIN' ? 'rgba(26,255,228,0.1)' : 'rgba(200,245,60,0.1)',
                  color: user.role === 'ADMIN' ? 'var(--frost)' : 'var(--acid)'
                }}>
                <Shield size={10} />
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="surface rounded-2xl p-5">
        <h3 className="font-display font-600 text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
          Thông tin chi tiết
        </h3>
        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: user.email },
            { icon: User, label: 'Họ và tên', value: user.full_name },
            { icon: Shield, label: 'Vai trò', value: user.role },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--surface2)' }}>
                <Icon size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-sm font-400">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
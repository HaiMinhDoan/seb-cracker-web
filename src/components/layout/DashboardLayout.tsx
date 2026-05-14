import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  Zap, BookOpen, Clock, Users, FileText, Database,
  LogOut, User, Shield, PenLine, Menu, X
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const navItems = [
  { to: '/solve', icon: Zap, label: 'Giải bài' },
  { to: '/jobs', icon: Clock, label: 'Lịch sử jobs' },
  { to: '/sessions', icon: BookOpen, label: 'Phiên thi' },
  { to: '/human', icon: PenLine, label: 'Tự giải' },
  { to: '/profile', icon: User, label: 'Hồ sơ' },
]

const adminItems = [
  { to: '/admin/customers', icon: Users, label: 'Khách hàng' },
  { to: '/admin/prompts', icon: FileText, label: 'Prompt AI' },
  { to: '/admin/question-bank', icon: Database, label: 'Ngân hàng câu hỏi' },
]

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Đã đăng xuất')
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed md:static w-60 h-full md:h-auto flex-shrink-0 flex flex-col border-r overflow-hidden transition-transform duration-300 z-40',
        'md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center acid-glow flex-shrink-0"
            style={{ background: 'var(--acid)' }}>
            <Zap size={16} className="text-black" />
          </div>
          <span className="font-display font-700 text-base tracking-tight">ExamSolver</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-400 transition-all group',
                  isActive
                    ? 'font-500'
                    : 'hover:opacity-80'
                )
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(200,245,60,0.12)' : 'transparent',
                color: isActive ? 'var(--acid)' : 'var(--text-muted)',
              })}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}

          {isAdmin() && (
            <>
              <div className="pt-4 pb-1 px-3">
                <div className="flex items-center gap-2">
                  <Shield size={12} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs font-500 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Admin
                  </span>
                </div>
              </div>
              {adminItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all')
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'rgba(26,255,228,0.1)' : 'transparent',
                    color: isActive ? 'var(--frost)' : 'var(--text-muted)',
                  })}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
            style={{ background: 'var(--surface2)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-600 flex-shrink-0"
              style={{ background: 'var(--acid)', color: '#0D0D0D' }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-500 truncate">{user?.full_name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
            style={{ color: 'var(--ember)' }}>
            <LogOut size={14} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:opacity-80 transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="w-6 h-6 rounded flex items-center justify-center acid-glow flex-shrink-0"
            style={{ background: 'var(--acid)' }}>
            <Zap size={14} className="text-black" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
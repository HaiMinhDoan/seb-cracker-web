import { useEffect, useState } from 'react'
import { RefreshCw, Loader2, CheckCircle, XCircle, Plus, UserPlus, Eye, EyeOff } from 'lucide-react'
import { adminService } from '../../services/adminService'
import type { CustomerResponse, Page } from '../../types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'


export default function AdminCustomers() {
  const [data, setData] = useState<Page<CustomerResponse> | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [extendModal, setExtendModal] = useState<{ id: number; email: string } | null>(null)
  const [days, setDays] = useState(30)
  const [extendFocused, setExtendFocused] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ email: '', password: '', fullName: '', phoneNumber: '', role: 'CUSTOMER' })
  const [createFocused, setCreateFocused] = useState<string | null>(null)
  const [showCreatePass, setShowCreatePass] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createForm.password.length < 8) return toast.error('Mật khẩu ít nhất 8 ký tự')
    setCreating(true)
    try {
      await authService.register(createForm)
      toast.success('Tạo tài khoản thành công')
      setCreateModal(false)
      setCreateForm({ email: '', password: '', fullName: '', phoneNumber: '', role: 'CUSTOMER' })
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi tạo tài khoản')
    } finally {
      setCreating(false)
    }
  }

  const cStyle = (f: string) => ({
    background: 'var(--surface2)',
    border: `1px solid ${createFocused === f ? 'var(--acid)' : 'var(--border)'}`,
    color: 'var(--text)',
    transition: 'border-color 0.15s',
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminService.listCustomers(page)
      setData(res.data)
    } catch { toast.error('Lỗi tải danh sách') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page])

  const toggleAI = async (c: CustomerResponse) => {
    try {
      await adminService.updateCustomer(c.id, { ai_mode_enabled: !c.ai_mode_enabled })
      toast.success(`AI mode ${!c.ai_mode_enabled ? 'bật' : 'tắt'} cho ${c.email}`)
      load()
    } catch { toast.error('Lỗi cập nhật') }
  }

  const toggleActive = async (c: CustomerResponse) => {
    try {
      await adminService.updateCustomer(c.id, { active: !c.active })
      toast.success(`Tài khoản ${!c.active ? 'đã mở' : 'đã khoá'}`)
      load()
    } catch { toast.error('Lỗi cập nhật') }
  }

  const handleExtend = async () => {
    if (!extendModal) return
    try {
      await adminService.extendAccess(extendModal.id, days)
      toast.success(`Gia hạn ${days} ngày cho ${extendModal.email}`)
      setExtendModal(null)
      load()
    } catch { toast.error('Lỗi gia hạn') }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-700 mb-1">Khách hàng</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{data?.totalElements ?? 0} tài khoản</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-500"
            style={{ background: 'rgba(200,245,60,0.12)', color: 'var(--acid)' }}
          >
            <UserPlus size={14} /> Tạo tài khoản
          </button>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>
      </div>

      <div className="surface rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--frost)' }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', 'Email', 'Họ tên', 'Vai trò', 'Active', 'AI Mode', 'Hết hạn', 'Hành động'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-500 uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.content.map((c, i) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: i < (data.content.length - 1) ? '1px solid var(--border)' : undefined }}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{c.id}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{c.email}</td>
                    <td className="px-4 py-3 text-sm">{c.full_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-xs font-500"
                        style={{
                          background: c.role === 'ADMIN' ? 'rgba(26,255,228,0.1)' : 'var(--surface2)',
                          color: c.role === 'ADMIN' ? 'var(--frost)' : 'var(--text-muted)'
                        }}>{c.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c)}>
                        {c.active
                          ? <CheckCircle size={16} style={{ color: 'var(--acid)' }} />
                          : <XCircle size={16} style={{ color: 'var(--ember)' }} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleAI(c)}
                        className="px-2 py-1 rounded-lg text-xs font-500 transition-all"
                        style={{
                          background: c.ai_mode_enabled ? 'rgba(200,245,60,0.12)' : 'var(--surface2)',
                          color: c.ai_mode_enabled ? 'var(--acid)' : 'var(--text-muted)',
                        }}>
                        {c.ai_mode_enabled ? 'ON' : 'OFF'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {c.access_expires_at ? format(new Date(c.access_expires_at), 'dd/MM/yy') : '∞'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setExtendModal({ id: c.id, email: c.email })}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-500 transition-all"
                        style={{ background: 'rgba(26,255,228,0.1)', color: 'var(--frost)' }}>
                        <Plus size={11} /> Gia hạn
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
        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={data.first}
            className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Trước</button>
          <button onClick={() => setPage((p) => p + 1)} disabled={data.last}
            className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Sau</button>
        </div>
      )}

      {/* Extend Modal */}
      {extendModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="surface rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h2 className="font-display font-600 text-lg mb-1">Gia hạn truy cập</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>{extendModal.email}</p>
            <div className="mb-5">
              <label className="block text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Số ngày
              </label>
              <input type="number" value={days} min={1} max={365}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--surface2)',
                  border: `1px solid ${extendFocused ? 'var(--frost)' : 'var(--border)'}`,
                  color: 'var(--text)',
                  transition: 'border-color 0.15s',
                }}
                onFocus={() => setExtendFocused(true)}
                onBlur={() => setExtendFocused(false)}
              />
              <div className="flex gap-2 mt-2">
                {[7, 30, 90, 365].map((d) => (
                  <button key={d} onClick={() => setDays(d)}
                    className="px-2 py-1 rounded-lg text-xs transition-all"
                    style={{
                      background: days === d ? 'rgba(26,255,228,0.1)' : 'var(--surface2)',
                      color: days === d ? 'var(--frost)' : 'var(--text-muted)'
                    }}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setExtendModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                Huỷ
              </button>
              <button onClick={handleExtend}
                className="flex-1 py-2.5 rounded-xl text-sm font-600"
                style={{ background: 'var(--frost)', color: '#0D0D0D' }}>
                Gia hạn {days} ngày
              </button>
            </div>
          </div>
        </div>
      )}

      {createModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="surface rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h2 className="font-display font-600 text-lg mb-5">Tạo tài khoản mới</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {([
                { k: 'fullName', label: 'Họ và tên', type: 'text', placeholder: 'Nguyễn Văn A' },
                { k: 'email', label: 'Email', type: 'email', placeholder: 'user@example.com' },
                { k: 'phoneNumber', label: 'Số điện thoại (tuỳ chọn)', type: 'tel', placeholder: '09xxxxxxxx' },
              ] as const).map(({ k, label, type, placeholder }) => (
                <div key={k}>
                  <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <input type={type} value={createForm[k]}
                    onChange={(e) => setCreateForm(f => ({ ...f, [k]: e.target.value }))}
                    placeholder={placeholder} required={k !== 'phoneNumber'}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={cStyle(k)}
                    onFocus={() => setCreateFocused(k)} onBlur={() => setCreateFocused(null)} />
                </div>
              ))}

              <div>
                <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Mật khẩu</label>
                <div className="relative">
                  <input type={showCreatePass ? 'text' : 'password'} value={createForm.password}
                    onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Ít nhất 8 ký tự" required
                    className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none"
                    style={cStyle('password')}
                    onFocus={() => setCreateFocused('password')} onBlur={() => setCreateFocused(null)} />
                  <button type="button" onClick={() => setShowCreatePass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                    {showCreatePass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Role</label>
                <select value={createForm.role}
                  onChange={(e) => setCreateForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={cStyle('role')}
                  onFocus={() => setCreateFocused('role')} onBlur={() => setCreateFocused(null)}>
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                  Huỷ
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 rounded-xl text-sm font-600 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'var(--acid)', color: '#0D0D0D' }}>
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>


  )
}

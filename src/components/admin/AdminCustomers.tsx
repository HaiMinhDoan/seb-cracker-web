import { useEffect, useState } from 'react'
import { RefreshCw, Loader2, CheckCircle, XCircle, Plus } from 'lucide-react'
import { adminService } from '../../services/adminService'
import type { CustomerResponse, Page } from '../../types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function AdminCustomers() {
  const [data, setData] = useState<Page<CustomerResponse> | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [extendModal, setExtendModal] = useState<{ id: number; email: string } | null>(null)
  const [days, setDays] = useState(30)
  const [extendFocused, setExtendFocused] = useState(false)

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
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
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
    </div>
  )
}

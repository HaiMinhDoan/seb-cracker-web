import { useEffect, useState } from 'react'
import { FileText, Plus, CheckCircle, RotateCcw, Loader2, ChevronDown } from 'lucide-react'
import { adminService } from '../../services/adminService'
import type { PromptVersionResponse } from '../../types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const PROMPT_TYPES = ['SINGLECHOICE', 'MULTIPLECHOICE', 'TRUEFALSE', 'ESSAY', 'SYSTEM']

export default function AdminPrompts() {
  const [selectedType, setSelectedType] = useState(PROMPT_TYPES[0])
  const [versions, setVersions] = useState<PromptVersionResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newForm, setNewForm] = useState({ versionLabel: '', promptTemplate: '', notes: '' })
  const [creating, setCreating] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [focused, setFocused] = useState<string | null>(null)

  const iStyle = (field: string) => ({
    background: 'var(--surface2)',
    border: `1px solid ${focused === field ? 'var(--acid)' : 'var(--border)'}`,
    color: 'var(--text)',
    transition: 'border-color 0.15s',
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminService.listVersions(selectedType)
      setVersions(res.data)
    } catch { }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [selectedType])

  const activate = async (id: number) => {
    try {
      await adminService.activateVersion(id)
      toast.success('Đã activate version')
      load()
    } catch { toast.error('Lỗi activate') }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.promptTemplate) return toast.error('Nhập prompt template')
    setCreating(true)
    try {
      await adminService.createVersion({
        prompt_type: selectedType,
        version_label: newForm.versionLabel,
        prompt_template: newForm.promptTemplate,
        notes: newForm.notes,
      })
      toast.success('Tạo version thành công')
      setShowCreate(false)
      setNewForm({ versionLabel: '', promptTemplate: '', notes: '' })
      load()
    } catch { toast.error('Lỗi tạo version') }
    finally { setCreating(false) }
  }



  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-700 mb-1">Prompt AI</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Quản lý versions prompt cho từng loại câu hỏi</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-500"
          style={{ background: 'rgba(200,245,60,0.12)', color: 'var(--acid)' }}>
          <Plus size={14} /> Tạo version mới
        </button>
      </div>

      {/* Type selector */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {PROMPT_TYPES.map((t) => (
          <button key={t} onClick={() => setSelectedType(t)}
            className="px-3 py-1.5 rounded-lg text-xs font-500 transition-all font-mono"
            style={{
              background: selectedType === t ? 'rgba(200,245,60,0.12)' : 'var(--surface)',
              color: selectedType === t ? 'var(--acid)' : 'var(--text-muted)',
              border: `1px solid ${selectedType === t ? 'var(--acid)' : 'var(--border)'}`,
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="surface rounded-2xl p-5 mb-5 animate-slide-up">
          <h2 className="font-display font-600 mb-4">Tạo version mới cho {selectedType}</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Version label (tuỳ chọn)
                </label>
                <input value={newForm.versionLabel} onChange={(e) => setNewForm((f) => ({ ...f, versionLabel: e.target.value }))}
                  placeholder="VD: v2-improved"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={iStyle('versionLabel')}
                  onFocus={() => setFocused('versionLabel')}
                  onBlur={() => setFocused(null)} />
              </div>
              <div>
                <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Notes</label>
                <input value={newForm.notes} onChange={(e) => setNewForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Mô tả thay đổi"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={iStyle('notes')}
                  onFocus={() => setFocused('notes')}
                  onBlur={() => setFocused(null)} />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Prompt Template *
              </label>
              <textarea value={newForm.promptTemplate}
                onChange={(e) => setNewForm((f) => ({ ...f, promptTemplate: e.target.value }))}
                rows={6} placeholder="Nhập prompt template..."
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none font-mono"
                style={iStyle('promptTemplate')}
                onFocus={() => setFocused('promptTemplate')}
                onBlur={() => setFocused(null)} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                Huỷ
              </button>
              <button type="submit" disabled={creating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600 disabled:opacity-50"
                style={{ background: 'var(--acid)', color: '#0D0D0D' }}>
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Tạo version
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Versions list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--acid)' }} />
        </div>
      ) : versions.length === 0 ? (
        <div className="surface rounded-2xl p-8 text-center" style={{ color: 'var(--text-muted)' }}>
          Chưa có version nào cho {selectedType}
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => (
            <div key={v.id} className="surface rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-700" style={{ color: 'var(--acid)' }}>
                      v{v.version_number}
                    </span>
                    {v.version_label && (
                      <span className="text-xs px-2 py-0.5 rounded-md"
                        style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                        {v.version_label}
                      </span>
                    )}
                    {v.is_active && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-500"
                        style={{ background: 'rgba(200,245,60,0.12)', color: 'var(--acid)' }}>
                        <CheckCircle size={10} /> ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>by {v.created_by}</span>
                    <span>{format(new Date(v.created_at), 'dd/MM/yyyy HH:mm')}</span>
                    {v.notes && <span className="italic">{v.notes}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!v.is_active && (
                    <button onClick={() => activate(v.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500"
                      style={{ background: 'rgba(26,255,228,0.1)', color: 'var(--frost)' }}>
                      <RotateCcw size={11} /> Activate
                    </button>
                  )}
                  <button onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                    className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-muted)' }}>
                    <ChevronDown size={16} className={`transition-transform ${expandedId === v.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {expandedId === v.id && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <pre className="mt-3 p-3 rounded-xl text-xs overflow-x-auto leading-relaxed"
                    style={{ background: 'var(--surface2)', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {v.prompt_template}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useCreateEvent } from '@/hooks/mutations/useAdminEventMutations'
import { getIdToken } from '@/lib/firebase/FirebaseAuthService'
import { PaymentMethod } from '@/shared/constants'

interface CategoryForm {
  nome: string
  valor: string
  descricao: string
  earlyBirdValor: string
  earlyBirdDeadline: string
  beneficiosInclusos: string
}

interface PerkForm {
  nome: string
  descricao: string
  limiteEstoque: string
}

const EMPTY_CATEGORY: CategoryForm = {
  nome: '',
  valor: '',
  descricao: '',
  earlyBirdValor: '',
  earlyBirdDeadline: '',
  beneficiosInclusos: '',
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'CASH', label: 'Dinheiro' },
]

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const createEvent = useCreateEvent()

  const [formData, setFormData] = useState({
    slug: '',
    titulo: '',
    subtitulo: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    local: '',
    endereco: '',
    whatsappContato: '',
  })

  const [metodosPagamento, setMetodosPagamento] = useState<PaymentMethod[]>(['PIX'])
  const [categorias, setCategorias] = useState<CategoryForm[]>([{ ...EMPTY_CATEGORY }])
  const [perk, setPerk] = useState<PerkForm>({ nome: '', descricao: '', limiteEstoque: '' })
  const [hasPerk, setHasPerk] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'categorias' | 'brinde'>('info')

  const togglePaymentMethod = (method: PaymentMethod) => {
    setMetodosPagamento((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method],
    )
  }

  const handleAddCategory = () => {
    setCategorias([...categorias, { ...EMPTY_CATEGORY }])
  }

  const handleRemoveCategory = (index: number) => {
    setCategorias(categorias.filter((_, i) => i !== index))
  }

  const handleCategoryChange = (index: number, field: keyof CategoryForm, value: string) => {
    const updated = [...categorias]
    updated[index] = { ...updated[index], [field]: value }
    setCategorias(updated)
  }

  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.')
    return Math.round(parseFloat(cleaned) * 100)
  }

  const buildCategoriasPayload = () => {
    const valid = categorias.filter((c) => c.nome.trim() && c.valor.trim())
    if (valid.length === 0) return undefined

    return valid.map((c) => {
      const hasEarlyBird = c.earlyBirdValor.trim() && c.earlyBirdDeadline.trim()
      const hasBeneficios = c.beneficiosInclusos.trim()

      return {
        nome: c.nome.trim(),
        valor: parseCurrency(c.valor),
        descricao: c.descricao.trim() || undefined,
        ...(hasEarlyBird ? {
          earlyBirdValor: parseCurrency(c.earlyBirdValor),
          earlyBirdDeadline: new Date(c.earlyBirdDeadline).toISOString(),
        } : {}),
        ...(hasBeneficios ? {
          beneficiosInclusos: c.beneficiosInclusos.split(',').map((b) => b.trim()).filter(Boolean),
        } : {}),
      }
    })
  }

  const createPerkForEvent = async (eventId: string) => {
    if (!hasPerk) return
    if (!perk.nome.trim() || !perk.limiteEstoque.trim()) return

    const token = await getIdToken()
    if (!token) return

    await fetch(`/api/admin/events/${eventId}/perks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: perk.nome.trim(),
        descricao: perk.descricao.trim(),
        limiteEstoque: parseInt(perk.limiteEstoque, 10),
      }),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.dataInicio) {
      setError('A data de início é obrigatória')
      setActiveTab('info')
      return
    }

    if (metodosPagamento.length === 0) {
      setError('Selecione pelo menos um método de pagamento')
      return
    }

    try {
      const createdEvent = await createEvent.mutateAsync({
        slug: formData.slug || undefined,
        titulo: formData.titulo,
        subtitulo: formData.subtitulo || undefined,
        descricao: formData.descricao,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim || undefined,
        local: formData.local,
        endereco: formData.endereco,
        whatsappContato: formData.whatsappContato || undefined,
        metodosPagamento,
        categorias: buildCategoriasPayload(),
      })

      await createPerkForEvent(createdEvent.id)

      resetForm()
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar evento')
    }
  }

  const resetForm = () => {
    setFormData({
      slug: '',
      titulo: '',
      subtitulo: '',
      descricao: '',
      dataInicio: '',
      dataFim: '',
      local: '',
      endereco: '',
      whatsappContato: '',
    })
    setMetodosPagamento(['PIX'])
    setCategorias([{ ...EMPTY_CATEGORY }])
    setPerk({ nome: '', descricao: '', limiteEstoque: '' })
    setHasPerk(false)
    setActiveTab('info')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative bg-bg-secondary rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="border-b border-gold/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-text-primary">Criar Novo Evento</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-gold/10 flex-shrink-0">
          {(['info', 'categorias', 'brinde'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-gold border-b-2 border-gold'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab === 'info' ? 'Evento' : tab === 'categorias' ? 'Categorias' : 'Brinde'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Slug (ID da URL)</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="ex: geracao-forte (vazio = gerado automaticamente)"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  />
                  <p className="text-xs text-text-muted mt-1">Define a URL: /eventos/{formData.slug || 'slug-gerado-do-titulo'}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Evento *</label>
                    <input
                      type="text"
                      required
                      className="input w-full"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ex: Congresso da Geração Forte"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Subtítulo</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={formData.subtitulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitulo: e.target.value }))}
                      placeholder="Ex: Follow Me — Marcos 8:34"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Descrição *</label>
                  <textarea
                    required
                    rows={3}
                    className="input w-full resize-none"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva o evento..."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Data de Início *</label>
                    <input
                      type="datetime-local"
                      required
                      className="input w-full"
                      value={formData.dataInicio}
                      onChange={(e) => {
                        console.log('[CreateEventModal] dataInicio onChange:', e.target.value)
                        setFormData(prev => ({ ...prev, dataInicio: e.target.value }))
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Data de Fim</label>
                    <input
                      type="datetime-local"
                      className="input w-full"
                      value={formData.dataFim}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Local *</label>
                    <input
                      type="text"
                      required
                      className="input w-full"
                      value={formData.local}
                      onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                      placeholder="Ex: IEQ Sede Campo 157"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Endereço *</label>
                    <input
                      type="text"
                      required
                      className="input w-full"
                      value={formData.endereco}
                      onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                      placeholder="Ex: Rua das Flores, 123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">WhatsApp de contato</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.whatsappContato}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsappContato: e.target.value }))}
                    placeholder="(91) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Métodos de Pagamento *</label>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => togglePaymentMethod(opt.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                          metodosPagamento.includes(opt.value)
                            ? 'bg-gold/20 border-gold text-gold'
                            : 'bg-bg-tertiary border-gold/10 text-text-muted hover:border-gold/30'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'categorias' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-muted">
                    Defina os tipos de inscrição e seus valores. Opcional — pode adicionar depois.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="text-sm text-gold hover:text-gold-dark transition-colors font-medium"
                  >
                    + Adicionar categoria
                  </button>
                </div>

                <div className="space-y-5">
                  {categorias.map((cat, index) => {
                    const hasEarlyBird = cat.earlyBirdValor.trim() || cat.earlyBirdDeadline.trim()

                    return (
                      <div key={index} className="bg-bg-tertiary rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gold">
                            Categoria {index + 1}
                          </span>
                          {categorias.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(index)}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                              Remover
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1">
                            Nome da categoria
                          </label>
                          <input
                            type="text"
                            className="input w-full text-sm"
                            value={cat.nome}
                            onChange={(e) => handleCategoryChange(index, 'nome', e.target.value)}
                            placeholder="Ex: Redenção, Outras Localidades..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1">
                            Descrição (exibida no card para o participante)
                          </label>
                          <input
                            type="text"
                            className="input w-full text-sm"
                            value={cat.descricao}
                            onChange={(e) => handleCategoryChange(index, 'descricao', e.target.value)}
                            placeholder="Ex: Para inscritos que residem em Redenção"
                          />
                        </div>

                        <div className="border-t border-gold/10 pt-4">
                          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
                            Valores e Preço Promocional
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-text-secondary mb-1">
                                Preço promocional (R$)
                              </label>
                              <input
                                type="text"
                                className="input w-full text-sm"
                                value={cat.earlyBirdValor}
                                onChange={(e) => handleCategoryChange(index, 'earlyBirdValor', e.target.value)}
                                placeholder="120,00"
                              />
                              <p className="text-[10px] text-text-muted mt-1">Valor com desconto, válido até a data ao lado</p>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-text-secondary mb-1">
                                Promoção válida até
                              </label>
                              <input
                                type="datetime-local"
                                className="input w-full text-sm"
                                value={cat.earlyBirdDeadline}
                                onChange={(e) => handleCategoryChange(index, 'earlyBirdDeadline', e.target.value)}
                              />
                              <p className="text-[10px] text-text-muted mt-1">Após essa data, vale o preço normal</p>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-text-secondary mb-1">
                                Preço normal (R$) {hasEarlyBird ? '(após a data)' : ''}
                              </label>
                              <input
                                type="text"
                                className="input w-full text-sm"
                                value={cat.valor}
                                onChange={(e) => handleCategoryChange(index, 'valor', e.target.value)}
                                placeholder="150,00"
                              />
                              <p className="text-[10px] text-text-muted mt-1">
                                {hasEarlyBird
                                  ? 'Valor cobrado quando o promocional expirar'
                                  : 'Valor único da inscrição (sem promoção)'}
                              </p>
                            </div>
                          </div>

                          {hasEarlyBird && cat.earlyBirdValor.trim() && cat.valor.trim() && (
                            <div className="mt-3 p-3 rounded-lg bg-gold/10 border border-gold/20 text-xs text-text-secondary">
                              <strong className="text-gold">Resumo:</strong>{' '}
                              R$ {cat.earlyBirdValor} até{' '}
                              {cat.earlyBirdDeadline
                                ? new Date(cat.earlyBirdDeadline).toLocaleDateString('pt-BR')
                                : '(defina a data)'}
                              {' '}→ depois muda para R$ {cat.valor}
                            </div>
                          )}
                        </div>

                        <div className="border-t border-gold/10 pt-4">
                          <label className="block text-xs font-medium text-text-secondary mb-1">
                            Benefícios inclusos nesta categoria
                          </label>
                          <input
                            type="text"
                            className="input w-full text-sm"
                            value={cat.beneficiosInclusos}
                            onChange={(e) => handleCategoryChange(index, 'beneficiosInclusos', e.target.value)}
                            placeholder="Ex: Almoço, Janta (separados por vírgula)"
                          />
                          <p className="text-[10px] text-text-muted mt-1">
                            Exibidos como checkmarks no card da categoria. Deixe vazio se não houver.
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'brinde' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setHasPerk(!hasPerk)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      hasPerk ? 'bg-gold' : 'bg-bg-tertiary border border-gold/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        hasPerk ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-text-secondary">
                    Evento tem brinde para os primeiros pagantes
                  </span>
                </div>

                {hasPerk && (
                  <div className="bg-bg-tertiary rounded-xl p-4 space-y-3">
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Nome do brinde *</label>
                      <input
                        type="text"
                        className="input w-full text-sm"
                        value={perk.nome}
                        onChange={(e) => setPerk({ ...perk, nome: e.target.value })}
                        placeholder="Ex: Pulseira Geração Forte"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Descrição *</label>
                      <input
                        type="text"
                        className="input w-full text-sm"
                        value={perk.descricao}
                        onChange={(e) => setPerk({ ...perk, descricao: e.target.value })}
                        placeholder="Pulseira colorida exclusiva para os primeiros pagantes"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Quantidade disponível *</label>
                      <input
                        type="number"
                        min="1"
                        className="input w-full text-sm"
                        value={perk.limiteEstoque}
                        onChange={(e) => setPerk({ ...perk, limiteEstoque: e.target.value })}
                        placeholder="500"
                      />
                    </div>
                    <p className="text-xs text-text-muted">
                      Os primeiros pagantes confirmados (via webhook) receberão o brinde automaticamente.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mx-6 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-between px-6 py-4 border-t border-gold/10 flex-shrink-0">
            <div className="flex gap-2">
              {activeTab !== 'info' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'brinde' ? 'categorias' : 'info')}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Voltar
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancelar
              </button>
              {activeTab !== 'brinde' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'info' ? 'categorias' : 'brinde')}
                  className="px-6 py-2 bg-gold/20 text-gold font-medium rounded-lg hover:bg-gold/30 transition-colors"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={createEvent.isPending}
                  className="px-6 py-2 bg-gold text-bg-primary font-medium rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createEvent.isPending ? 'Criando...' : 'Criar Evento'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

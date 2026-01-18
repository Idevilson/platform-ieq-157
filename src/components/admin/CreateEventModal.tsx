'use client'

import { useState } from 'react'
import { useCreateEvent } from '@/hooks/mutations/useAdminEventMutations'

interface Category {
  nome: string
  valor: string // String para facilitar input (converte para centavos ao enviar)
  descricao: string
}

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const createEvent = useCreateEvent()

  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    local: '',
    endereco: '',
  })

  const [categorias, setCategorias] = useState<Category[]>([
    { nome: '', valor: '', descricao: '' }
  ])

  const [error, setError] = useState<string | null>(null)

  const handleAddCategory = () => {
    setCategorias([...categorias, { nome: '', valor: '', descricao: '' }])
  }

  const handleRemoveCategory = (index: number) => {
    if (categorias.length > 1) {
      setCategorias(categorias.filter((_, i) => i !== index))
    }
  }

  const handleCategoryChange = (index: number, field: keyof Category, value: string) => {
    const newCategorias = [...categorias]
    newCategorias[index][field] = value
    setCategorias(newCategorias)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validar categorias
    const validCategorias = categorias.filter(c => c.nome.trim() && c.valor.trim())
    if (validCategorias.length === 0) {
      setError('Adicione pelo menos uma categoria com nome e valor')
      return
    }

    try {
      await createEvent.mutateAsync({
        titulo: formData.titulo,
        subtitulo: formData.subtitulo || undefined,
        descricao: formData.descricao,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim || undefined,
        local: formData.local,
        endereco: formData.endereco,
        metodosPagamento: ['PIX'],
        categorias: validCategorias.map(c => ({
          nome: c.nome.trim(),
          valor: Math.round(parseFloat(c.valor.replace(',', '.')) * 100), // Converte para centavos
          descricao: c.descricao.trim() || undefined,
        })),
      })

      // Reset form
      setFormData({
        titulo: '',
        subtitulo: '',
        descricao: '',
        dataInicio: '',
        dataFim: '',
        local: '',
        endereco: '',
      })
      setCategorias([{ nome: '', valor: '', descricao: '' }])

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar evento')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-bg-secondary rounded-xl shadow-xl max-w-5xl w-full mx-4">
        <div className="border-b border-gold/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Criar Novo Evento</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Informacoes do Evento */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gold uppercase tracking-wide">Informacoes do Evento</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Nome do Evento *
                  </label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Encontro de Jovens 2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Subtitulo
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.subtitulo}
                    onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                    placeholder="Ex: Uma experiencia com Deus"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Descricao *
                </label>
                <textarea
                  required
                  rows={2}
                  className="input w-full resize-none"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o evento..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Data de Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="input w-full"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Data de Fim
                  </label>
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={formData.dataFim}
                    onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Local *
                  </label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    placeholder="Ex: IEQ Sede Campo 157"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Endereco *
                  </label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Ex: Rua das Flores, 123"
                  />
                </div>
              </div>
            </div>

            {/* Coluna Direita - Categorias */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gold uppercase tracking-wide">
                  Categorias de Inscricao
                </h3>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="text-sm text-gold hover:text-gold-dark transition-colors"
                >
                  + Adicionar
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {categorias.map((cat, index) => (
                  <div key={index} className="bg-bg-tertiary rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-text-muted">
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

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        className="input w-full text-sm"
                        value={cat.nome}
                        onChange={(e) => handleCategoryChange(index, 'nome', e.target.value)}
                        placeholder="Nome *"
                      />
                      <input
                        type="text"
                        className="input w-full text-sm"
                        value={cat.valor}
                        onChange={(e) => handleCategoryChange(index, 'valor', e.target.value)}
                        placeholder="Valor (R$) *"
                      />
                    </div>

                    <input
                      type="text"
                      className="input w-full text-sm"
                      value={cat.descricao}
                      onChange={(e) => handleCategoryChange(index, 'descricao', e.target.value)}
                      placeholder="Descricao (opcional)"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gold/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createEvent.isPending}
              className="px-6 py-2 bg-gold text-bg-primary font-medium rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createEvent.isPending ? 'Criando...' : 'Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

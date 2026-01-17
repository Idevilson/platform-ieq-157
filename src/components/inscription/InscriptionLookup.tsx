'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { InscriptionStatus } from './InscriptionStatus'
import { apiClient } from '@/lib/services/api'

interface InscriptionResult {
  inscription: {
    id: string
    eventId: string
    categoryId: string
    status: string
    criadoEm: string
    guestData?: {
      nome: string
      email: string
    }
  }
  eventTitle?: string
  categoryName?: string
}

interface LookupResponse {
  inscriptions: InscriptionResult[]
}

interface InscriptionLookupProps {
  eventId?: string // Optional: filter by specific event
  onInscriptionFound?: (inscription: InscriptionResult) => void
}

async function lookupInscriptions(cpf: string, eventId?: string): Promise<InscriptionResult[]> {
  const params = new URLSearchParams({ cpf })
  if (eventId) {
    params.append('eventId', eventId)
  }

  const response = await apiClient.get<LookupResponse>(`/inscriptions/lookup?${params}`)
  if (response.success && response.data) {
    return response.data.inscriptions
  }
  throw new Error(response.error || 'Erro ao consultar inscrição')
}

export function InscriptionLookup({
  eventId,
  onInscriptionFound,
}: InscriptionLookupProps) {
  const [cpf, setCpf] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<InscriptionResult[] | null>(null)

  const lookupMutation = useMutation({
    mutationFn: (cleanCpf: string) => lookupInscriptions(cleanCpf, eventId),
    onSuccess: (inscriptions) => {
      setResults(inscriptions)
      if (inscriptions.length === 1 && onInscriptionFound) {
        onInscriptionFound(inscriptions[0])
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Erro ao consultar inscrição')
    },
  })

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
    setError(null)
    setResults(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) {
      setError('CPF deve ter 11 dígitos')
      return
    }

    setError(null)
    lookupMutation.mutate(cleanCpf)
  }

  const isLoading = lookupMutation.isPending

  return (
    <div className="inscription-lookup">
      <form onSubmit={handleSubmit} className="inscription-lookup__form">
        <h4>Consultar inscrição</h4>
        <p className="form-description">
          Digite seu CPF para consultar suas inscrições{eventId ? ' neste evento' : ''}.
        </p>

        <div className="form-group">
          <label htmlFor="lookup-cpf">CPF</label>
          <input
            id="lookup-cpf"
            type="text"
            value={cpf}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            maxLength={14}
            disabled={isLoading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          disabled={isLoading || cpf.replace(/\D/g, '').length !== 11}
          className="btn-secondary"
        >
          {isLoading ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      {results !== null && (
        <div className="inscription-lookup__results">
          {results.length === 0 ? (
            <div className="no-results">
              <p>Nenhuma inscrição encontrada para este CPF{eventId ? ' neste evento' : ''}.</p>
            </div>
          ) : (
            <div className="results-list">
              <h4>Inscrições encontradas</h4>
              {results.map((result) => (
                <div key={result.inscription.id} className="result-item">
                  <div className="result-item__header">
                    <span className="result-item__event">{result.eventTitle || 'Evento'}</span>
                    <InscriptionStatus status={result.inscription.status as 'pendente' | 'confirmado' | 'cancelado'} />
                  </div>
                  <div className="result-item__details">
                    <p><strong>Categoria:</strong> {result.categoryName || 'N/A'}</p>
                    <p><strong>Data da inscrição:</strong> {new Date(result.inscription.criadoEm).toLocaleDateString('pt-BR')}</p>
                    {result.inscription.guestData && (
                      <p><strong>Nome:</strong> {result.inscription.guestData.nome}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

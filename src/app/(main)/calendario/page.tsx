"use client"

import { useState } from 'react'

interface Atividade {
  id: number
  titulo: string
  dia: number
  horario: string
  tipo: 'culto' | 'celula' | 'evento' | 'reuniao'
  recorrente?: boolean
}

const atividadesSemanais: Atividade[] = [
  { id: 1, titulo: "Escola Biblica Dominical", dia: 0, horario: "09:00", tipo: "culto", recorrente: true },
  { id: 2, titulo: "Culto de Celebracao", dia: 0, horario: "18:00", tipo: "culto", recorrente: true },
  { id: 3, titulo: "Culto de Ensino", dia: 3, horario: "19:30", tipo: "culto", recorrente: true },
  { id: 4, titulo: "Culto de Libertacao", dia: 5, horario: "19:30", tipo: "culto", recorrente: true },
  { id: 5, titulo: "Celulas nos Lares", dia: 6, horario: "19:00", tipo: "celula", recorrente: true },
  { id: 6, titulo: "Reuniao de Lideres", dia: 6, horario: "15:00", tipo: "reuniao", recorrente: true },
]

const diasSemana = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"]

const tipoColors: Record<string, string> = {
  culto: 'bg-gold/20 border-gold/30 text-gold',
  celula: 'bg-green-500/20 border-green-500/30 text-green-400',
  evento: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
  reuniao: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
}

const tipoColorsSmall: Record<string, string> = {
  culto: 'bg-gold/80 text-bg-primary',
  celula: 'bg-green-500/80 text-white',
  evento: 'bg-purple-500/80 text-white',
  reuniao: 'bg-blue-500/80 text-white',
}

const legendaColors: Record<string, string> = {
  culto: 'bg-gold',
  celula: 'bg-green-500',
  evento: 'bg-purple-500',
  reuniao: 'bg-blue-500',
}

export default function Calendario() {
  const [mesAtual, setMesAtual] = useState(new Date())

  const primeiroDiaMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1)
  const ultimoDiaMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0)
  const diasNoMes = ultimoDiaMes.getDate()
  const primeiroDiaSemana = primeiroDiaMes.getDay()

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))
  }

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))
  }

  const getAtividadesDoDia = (dia: number) => {
    const data = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia)
    const diaSemana = data.getDay()
    return atividadesSemanais.filter(a => a.dia === diaSemana)
  }

  const nomeMes = mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const diasCalendario = []

  for (let i = 0; i < primeiroDiaSemana; i++) {
    diasCalendario.push(
      <div key={`vazio-${i}`} className="min-h-[80px] md:min-h-[100px] bg-bg-tertiary/30 rounded-lg" />
    )
  }

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const atividades = getAtividadesDoDia(dia)
    const hoje = new Date()
    const isHoje = dia === hoje.getDate() &&
                   mesAtual.getMonth() === hoje.getMonth() &&
                   mesAtual.getFullYear() === hoje.getFullYear()

    diasCalendario.push(
      <div
        key={dia}
        className={`min-h-[80px] md:min-h-[100px] p-2 rounded-lg border transition-all ${
          isHoje
            ? 'bg-gold/10 border-gold/50'
            : atividades.length > 0
              ? 'bg-bg-secondary border-gold/20 hover:border-gold/40'
              : 'bg-bg-secondary border-transparent hover:border-gold/10'
        }`}
      >
        <span className={`text-sm font-medium ${isHoje ? 'text-gold' : 'text-text-primary'}`}>
          {dia}
        </span>
        {atividades.length > 0 && (
          <div className="mt-1 space-y-1">
            {atividades.slice(0, 2).map(atividade => (
              <div
                key={atividade.id}
                className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded truncate ${tipoColorsSmall[atividade.tipo]}`}
              >
                {atividade.titulo.length > 12 ? atividade.titulo.substring(0, 12) + '...' : atividade.titulo}
              </div>
            ))}
            {atividades.length > 2 && (
              <span className="text-[10px] text-text-muted">+{atividades.length - 2}</span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-3">Calendario</h1>
          <p className="text-text-secondary">Programacao da nossa igreja</p>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Programacao Semanal</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {atividadesSemanais.map(atividade => (
              <div
                key={atividade.id}
                className={`card p-4 text-center border ${tipoColors[atividade.tipo]}`}
              >
                <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
                  {diasSemana[atividade.dia]}
                </div>
                <div className="text-sm font-semibold mb-1">{atividade.titulo}</div>
                <div className="text-lg font-bold">{atividade.horario}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={mesAnterior}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-bg-tertiary hover:bg-gold/20 text-text-primary hover:text-gold transition-all"
            >
              &lt;
            </button>
            <h2 className="text-xl font-semibold text-gold capitalize">{nomeMes}</h2>
            <button
              onClick={proximoMes}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-bg-tertiary hover:bg-gold/20 text-text-primary hover:text-gold transition-all"
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {diasSemana.map(dia => (
              <div key={dia} className="text-center text-xs font-medium text-text-muted uppercase py-2">
                {dia.substring(0, 3)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {diasCalendario}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {[
            { tipo: 'culto', label: 'Cultos' },
            { tipo: 'celula', label: 'Celulas' },
            { tipo: 'evento', label: 'Eventos' },
            { tipo: 'reuniao', label: 'Reunioes' },
          ].map(item => (
            <div key={item.tipo} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${legendaColors[item.tipo]}`} />
              <span className="text-sm text-text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

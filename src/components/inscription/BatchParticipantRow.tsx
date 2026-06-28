"use client";

import { Gender, ShirtSize, SHIRT_SIZES } from "@/shared/constants";

interface BatchParticipantRowProps {
  index: number;
  nome: string;
  sexo: Gender | "";
  tamanho: ShirtSize | "";
  soldOutSizes: readonly ShirtSize[];
  onChange: (index: number, field: "nome" | "sexo" | "tamanho", value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export function BatchParticipantRow({
  index,
  nome,
  sexo,
  tamanho,
  soldOutSizes,
  onChange,
  onRemove,
  canRemove,
}: BatchParticipantRowProps) {
  const nomeTrim = nome.trim()
  const nomeBorder =
    nomeTrim.length === 0 ? 'border-gold/20' :
    nomeTrim.length < 2 ? 'border-red-500/60' :
    'border-green-500/60'
  const sexoBorder = sexo ? 'border-green-500/60' : 'border-gold/20'
  const tamanhoBorder = tamanho ? 'border-green-500/60' : 'border-gold/20'

  const removeButton = (className: string) => (
    <button
      type="button"
      onClick={() => onRemove(index)}
      disabled={!canRemove}
      className={`w-8 h-8 flex-shrink-0 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors items-center justify-center ${className}`}
      title="Remover participante"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 flex-shrink-0 rounded-full bg-gold/10 text-gold text-sm font-medium flex items-center justify-center">
          {index + 1}
        </span>
        <input
          type="text"
          value={nome}
          onChange={(e) => onChange(index, "nome", e.target.value)}
          placeholder="Nome completo"
          className={`flex-1 min-w-0 bg-bg-primary border ${nomeBorder} rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50`}
        />
        {removeButton("flex sm:hidden")}
      </div>

      <div className="flex items-center gap-2 pl-9 sm:pl-0 sm:contents">
        <select
          value={sexo}
          onChange={(e) => onChange(index, "sexo", e.target.value)}
          className={`flex-1 min-w-0 bg-bg-primary border ${sexoBorder} rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50 sm:flex-none sm:w-32`}
        >
          <option value="">Sexo</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
        </select>

        <select
          value={tamanho}
          onChange={(e) => onChange(index, "tamanho", e.target.value)}
          className={`flex-1 min-w-0 bg-bg-primary border ${tamanhoBorder} rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50 sm:flex-none sm:w-24`}
        >
          <option value="">Camisa</option>
          {SHIRT_SIZES.map((s) => {
            const esgotado = soldOutSizes.includes(s)
            return (
              <option key={s} value={s} disabled={esgotado}>
                {esgotado ? `${s} (esgotado)` : s}
              </option>
            )
          })}
        </select>
      </div>

      {removeButton("hidden sm:flex")}
    </div>
  );
}

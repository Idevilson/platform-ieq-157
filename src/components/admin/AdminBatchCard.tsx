"use client";

import { useState } from "react";
import { AdminBatchListItem } from "@/shared/types/inscription";
import { formatCPF, formatDateTime } from "@/lib/formatters";
import { INSCRIPTION_PAYMENT_METHOD_LABELS, InscriptionPaymentMethod } from "@/shared/constants";

interface AdminBatchCardProps {
  batch: AdminBatchListItem;
  onConfirmCash: (batchId: string) => void;
  onDelete: (batchId: string) => void;
  isConfirming: boolean;
  isDeleting: boolean;
}

function batchStatusClass(status: string): string {
  if (status === "confirmado") return "bg-green-500/20 text-green-400 border-green-500/30";
  if (status === "cancelado") return "bg-red-500/20 text-red-400 border-red-500/30";
  return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
}

export function AdminBatchCard({
  batch,
  onConfirmCash,
  onDelete,
  isConfirming,
  isDeleting,
}: AdminBatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isPending = batch.status === "pendente";
  const isCash = batch.preferredPaymentMethod === "CASH";

  return (
    <div className="bg-bg-secondary rounded-xl border border-gold/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${batchStatusClass(batch.status)}`}>
              {batch.status === "confirmado" ? "Confirmado" : batch.status === "cancelado" ? "Cancelado" : "Pendente"}
            </span>
            <span className="text-xs text-text-muted">
              {INSCRIPTION_PAYMENT_METHOD_LABELS[batch.preferredPaymentMethod as InscriptionPaymentMethod]}
            </span>
          </div>
          <p className="font-semibold text-text-primary">{batch.responsavelNome}</p>
          <p className="text-sm text-text-secondary font-mono">{formatCPF(batch.responsavelCpf)}</p>
        </div>
        <div className="text-right">
          <p className="text-gold font-bold text-lg">{batch.valorTotalFormatado}</p>
          <p className="text-xs text-text-muted">{batch.totalParticipantes} participantes · {batch.cidade}</p>
          <p className="text-xs text-text-muted">{formatDateTime(batch.criadoEm)}</p>
        </div>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-sm text-text-secondary hover:text-gold transition-colors flex items-center gap-1"
      >
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {expanded ? "Ocultar participantes" : `Ver ${batch.totalParticipantes} participantes`}
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {batch.participantes.map((p, i) => (
            <div key={i} className="bg-bg-primary rounded-lg px-3 py-1.5 text-xs">
              <span className="text-text-primary font-medium">{p.nome}</span>
              <span className="ml-1 text-text-muted">({p.sexo === "masculino" ? "M" : "F"}</span>
              {p.tamanho && <span className="text-text-muted"> · {p.tamanho}</span>}
              <span className="text-text-muted">)</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gold/10 flex flex-wrap gap-3">
        {isPending && isCash && (
          <button
            onClick={() => onConfirmCash(batch.id)}
            disabled={isConfirming}
            className="flex-1 min-w-32 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium hover:bg-green-500/30 disabled:opacity-50 transition-colors"
          >
            {isConfirming ? "Confirmando..." : "✓ Confirmar Dinheiro"}
          </button>
        )}

        {confirmingDelete ? (
          <div className="flex-1 flex gap-2">
            <button
              onClick={() => onDelete(batch.id)}
              disabled={isDeleting}
              className="flex-1 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="flex-1 min-w-32 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            Excluir Lote
          </button>
        )}
      </div>
    </div>
  );
}

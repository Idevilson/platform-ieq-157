"use client";

import { useState } from "react";
import { AdminBatchListItem } from "@/shared/types/inscription";
import { EventCategoryDTO } from "@/shared/types/event";
import { formatCPF, formatDateTime } from "@/lib/formatters";
import { getCategoryStyle } from "@/lib/eventCategoryStyle";
import { INSCRIPTION_PAYMENT_METHOD_LABELS, InscriptionPaymentMethod, KitItemDef } from "@/shared/constants";
import { useAdminUpdateBatchResponsavel, useAdminRegeneratePayment, useAdminUpdateBatchParticipants } from "@/hooks/mutations/useAdminBatchMutations";
import { useDeliverBatchKit } from "@/hooks/mutations/useEventKit";
import { KitDeliveryList } from "./KitDeliveryList";
import { EditBatchResponsavelModal } from "./EditBatchResponsavelModal";
import { EditBatchParticipantsModal } from "./EditBatchParticipantsModal";

interface AdminBatchCardProps {
  batch: AdminBatchListItem;
  categories?: EventCategoryDTO[];
  kitItems?: KitItemDef[];
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
  categories = [],
  kitItems = [],
  onConfirmCash,
  onDelete,
  isConfirming,
  isDeleting,
}: AdminBatchCardProps) {
  const categoryStyle = getCategoryStyle(batch.categoryId, categories);
  const [expanded, setExpanded] = useState(false);
  const deliverKit = useDeliverBatchKit(batch.eventId);
  const [kitDeliveries, setKitDeliveries] = useState(batch.kitDeliveries ?? []);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [regenerateError, setRegenerateError] = useState("");

  const updateResponsavel = useAdminUpdateBatchResponsavel(batch.eventId);
  const updateParticipants = useAdminUpdateBatchParticipants(batch.eventId);
  const regeneratePayment = useAdminRegeneratePayment(batch.eventId);

  const isPending = batch.status === "pendente";
  const isCash = batch.preferredPaymentMethod === "CASH";
  const isConfirmed = batch.status === "confirmado";
  const canRegeneratePayment = !isConfirmed && !isCash;

  async function handleSaveResponsavel(data: { nome: string; cpf: string }) {
    await updateResponsavel.mutateAsync({ batchId: batch.id, nome: data.nome, cpf: data.cpf });
  }

  async function handleRegeneratePayment() {
    setRegenerateError("");
    try {
      await regeneratePayment.mutateAsync(batch.id);
      const confirmationUrl = `/eventos/${batch.eventId}/inscricao-coletiva/confirmado?batchId=${batch.id}`;
      window.open(confirmationUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setRegenerateError(err instanceof Error ? err.message : "Erro ao gerar pagamento");
    }
  }

  return (
    <>
      {showParticipantsModal && (
        <EditBatchParticipantsModal
          batchId={batch.id}
          batchStatus={batch.status}
          initialParticipants={batch.participantes}
          onSave={async (batchId, participantes) => {
            await updateParticipants.mutateAsync({ batchId, participantes })
          }}
          onClose={() => setShowParticipantsModal(false)}
        />
      )}

      {showEditModal && (
        <EditBatchResponsavelModal
          currentNome={batch.responsavelNome}
          currentCpf={batch.responsavelCpf}
          onSave={handleSaveResponsavel}
          onClose={() => setShowEditModal(false)}
        />
      )}

      <div className={`rounded-xl border p-5 ${categoryStyle.cardBg || 'bg-bg-secondary border-gold/10'}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${batchStatusClass(batch.status)}`}>
                {batch.status === "confirmado" ? "Confirmado" : batch.status === "cancelado" ? "Cancelado" : "Pendente"}
              </span>
              {categoryStyle.label && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryStyle.tagClass}`}>
                  {categoryStyle.label}
                </span>
              )}
              <span className="text-xs text-text-muted">
                {INSCRIPTION_PAYMENT_METHOD_LABELS[batch.preferredPaymentMethod as InscriptionPaymentMethod]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-text-primary">
                {batch.responsavelNome || <span className="text-text-muted italic">Sem nome</span>}
              </p>
              {!batch.responsavelNome || !batch.responsavelCpf ? (
                <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full">
                  Dados incompletos
                </span>
              ) : null}
            </div>
            <p className="text-sm text-text-secondary font-mono">
              {batch.responsavelCpf ? formatCPF(batch.responsavelCpf) : <span className="text-red-400 text-xs">CPF não informado</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gold font-bold text-lg">{batch.valorTotalFormatado}</p>
            <p className="text-xs text-text-muted">{batch.totalParticipantes} participantes · {batch.cidade}</p>
            <p className="text-xs text-text-muted">{formatDateTime(batch.criadoEm)}</p>
            {batch.confirmadoPorNome && (
              <p className="text-xs text-green-400">Confirmado (dinheiro) por {batch.confirmadoPorNome}</p>
            )}
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
                {p.temBrinde && <span className="ml-1">🎁</span>}
              </div>
            ))}
          </div>
        )}

        {isConfirmed && kitItems.length > 0 && (
          <KitDeliveryList
            items={kitItems}
            deliveries={kitDeliveries}
            elegivelLed={batch.participantes.filter((p) => p.temBrinde).length > 0}
            quantidadePorItem={batch.totalParticipantes}
            ledQuantidade={batch.participantes.filter((p) => p.temBrinde).length}
            busy={deliverKit.isPending}
            onDeliverFull={() => {
              deliverKit.mutateAsync({ batchId: batch.id }).then((r) => setKitDeliveries(r.kitDeliveries)).catch(() => {})
            }}
          />
        )}

        {regenerateError && (
          <p className="mt-3 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {regenerateError}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-gold/10 flex flex-wrap gap-3">
          {batch.status !== "cancelado" && (
            <button
              onClick={() => setShowParticipantsModal(true)}
              className="flex-1 min-w-32 py-2 bg-gold/10 text-gold border border-gold/30 rounded-lg text-sm font-medium hover:bg-gold/20 transition-colors"
            >
              Editar Participantes
            </button>
          )}

          {batch.status !== "confirmado" && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 min-w-32 py-2 bg-gold/10 text-gold border border-gold/30 rounded-lg text-sm font-medium hover:bg-gold/20 transition-colors"
            >
              Editar Responsável
            </button>
          )}

          {canRegeneratePayment && (
            <button
              onClick={handleRegeneratePayment}
              disabled={regeneratePayment.isPending}
              className="flex-1 min-w-32 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 disabled:opacity-50 transition-colors"
            >
              {regeneratePayment.isPending
                ? "Gerando..."
                : batch.paymentId
                  ? "Regerar PIX"
                  : "Gerar PIX"}
            </button>
          )}

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
    </>
  );
}

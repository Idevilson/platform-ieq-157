"use client";

import { useState } from "react";
import { Gender, ShirtSize, SHIRT_SIZES } from "@/shared/constants";

interface Participant {
  nome: string;
  sexo: Gender | "";
  tamanho: ShirtSize | "";
}

interface EditBatchParticipantsModalProps {
  batchId: string;
  batchStatus: string;
  initialParticipants: { nome: string; sexo: string; tamanho?: string }[];
  onSave: (batchId: string, participantes: { nome: string; sexo: Gender; tamanho?: ShirtSize }[]) => Promise<void>;
  onClose: () => void;
}

export function EditBatchParticipantsModal({
  batchId,
  batchStatus,
  initialParticipants,
  onSave,
  onClose,
}: EditBatchParticipantsModalProps) {
  const [participants, setParticipants] = useState<Participant[]>(
    initialParticipants.map(p => ({
      nome: p.nome,
      sexo: (p.sexo as Gender) || "",
      tamanho: (p.tamanho as ShirtSize) || "",
    }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isConfirmed = batchStatus === "confirmado";

  function handleChange(index: number, field: keyof Participant, value: string) {
    setParticipants(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setError("");
  }

  function handleAdd() {
    if (participants.length >= 50) return;
    setParticipants(prev => [...prev, { nome: "", sexo: "", tamanho: "" }]);
  }

  function handleRemove(index: number) {
    if (participants.length <= 2) return;
    setParticipants(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const filled = participants.filter(p => p.nome.trim().length >= 2 && p.sexo);
    if (filled.length < 2) {
      setError("Preencha pelo menos 2 participantes com nome e sexo.");
      return;
    }

    for (const p of participants) {
      if (p.nome.trim().length > 0 && p.nome.trim().length < 2) {
        setError("Todos os nomes devem ter pelo menos 2 caracteres.");
        return;
      }
    }

    const validParticipants = filled.map(p => ({
      nome: p.nome.trim(),
      sexo: p.sexo as Gender,
      tamanho: p.tamanho ? (p.tamanho as ShirtSize) : undefined,
    }));

    setSaving(true);
    setError("");
    try {
      await onSave(batchId, validParticipants);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar participantes");
    } finally {
      setSaving(false);
    }
  }

  const validCount = participants.filter(p => p.nome.trim().length >= 2 && p.sexo).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary rounded-2xl border border-gold/20 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gold/10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Editar Participantes</h2>
            <p className="text-xs text-text-muted mt-0.5">
              {validCount} / {participants.length} preenchidos · Limite: 50
            </p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isConfirmed && (
          <div className="mx-6 mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-sm text-yellow-400 flex-shrink-0">
            Lote confirmado — o valor total será recalculado com base na categoria. Pulseiras serão ajustadas automaticamente.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 p-6 space-y-2">
            <div className="grid grid-cols-[1fr_120px_100px_32px] gap-2 mb-1">
              <span className="text-xs font-medium text-text-muted">Nome</span>
              <span className="text-xs font-medium text-text-muted">Sexo</span>
              <span className="text-xs font-medium text-text-muted">Tamanho</span>
              <span />
            </div>

            {participants.map((p, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px_100px_32px] gap-2 items-center">
                <input
                  type="text"
                  value={p.nome}
                  onChange={e => handleChange(i, "nome", e.target.value)}
                  placeholder={`Participante ${i + 1}`}
                  className="bg-bg-primary border border-gold/20 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50"
                />
                <select
                  value={p.sexo}
                  onChange={e => handleChange(i, "sexo", e.target.value)}
                  className="bg-bg-primary border border-gold/20 rounded-lg px-2 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50"
                >
                  <option value="">Sexo</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
                <select
                  value={p.tamanho}
                  onChange={e => handleChange(i, "tamanho", e.target.value)}
                  className="bg-bg-primary border border-gold/20 rounded-lg px-2 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50"
                >
                  <option value="">-</option>
                  {SHIRT_SIZES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  disabled={participants.length <= 2}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAdd}
              disabled={participants.length >= 50}
              className="mt-2 flex items-center gap-1.5 text-sm text-gold hover:text-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar participante
            </button>
          </div>

          <div className="p-6 border-t border-gold/10 flex-shrink-0 space-y-3">
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gold/20 text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-gold text-bg-primary font-semibold rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50 text-sm"
              >
                {saving ? "Salvando..." : `Salvar ${validCount} participante${validCount !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

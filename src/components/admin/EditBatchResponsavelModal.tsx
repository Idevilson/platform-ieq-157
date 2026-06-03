"use client";

import { useState } from "react";

interface EditBatchResponsavelModalProps {
  currentNome: string;
  currentCpf: string;
  onSave: (data: { nome: string; cpf: string }) => Promise<void>;
  onClose: () => void;
}

function cleanCpf(value: string): string {
  return value.replace(/\D/g, "");
}

function formatCpfInput(value: string): string {
  const digits = cleanCpf(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function EditBatchResponsavelModal({
  currentNome,
  currentCpf,
  onSave,
  onClose,
}: EditBatchResponsavelModalProps) {
  const [nome, setNome] = useState(currentNome);
  const [cpf, setCpf] = useState(formatCpfInput(currentCpf));
  const [errors, setErrors] = useState<{ nome?: string; cpf?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCpf(formatCpfInput(e.target.value));
    setErrors((prev) => ({ ...prev, cpf: "" }));
  }

  function validate(): boolean {
    const errs: { nome?: string; cpf?: string } = {};
    if (!nome.trim()) errs.nome = "Nome é obrigatório";
    const digits = cleanCpf(cpf);
    if (!digits) errs.cpf = "CPF é obrigatório";
    else if (digits.length !== 11) errs.cpf = "CPF deve ter 11 dígitos";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError("");
    try {
      await onSave({ nome: nome.trim(), cpf: cleanCpf(cpf) });
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary rounded-2xl border border-gold/20 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gold/10">
          <h2 className="text-lg font-semibold text-text-primary">Editar Responsável</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Nome <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => { setNome(e.target.value); setErrors((p) => ({ ...p, nome: "" })); }}
              placeholder="Nome completo"
              className="w-full bg-bg-primary border border-gold/20 rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50"
            />
            {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              CPF <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className="w-full bg-bg-primary border border-gold/20 rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 font-mono"
            />
            {errors.cpf && <p className="text-red-400 text-xs mt-1">{errors.cpf}</p>}
          </div>

          {saveError && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {saveError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
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
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

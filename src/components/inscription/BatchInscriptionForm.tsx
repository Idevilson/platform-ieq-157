"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BatchParticipantRow } from "./BatchParticipantRow";
import { CategorySelector } from "./CategorySelector";
import { useCreateBatchInscription, useCreateBatchPayment } from "@/hooks/mutations/useBatchInscriptionMutations";
import { Gender, ShirtSize, InscriptionPaymentMethod, INSCRIPTION_PAYMENT_METHOD_LABELS } from "@/shared/constants";
import { soldOutShirtSizes } from "@/shared/config/shirtAvailability";
import { UserDTO } from "@/shared/types";
import { BatchInscriptionDTO } from "@/shared/types/inscription";

interface Category {
  id: string;
  nome: string;
  valor: number;
  valorFormatado: string;
  descricao?: string;
  ordem?: number;
  valorAtual?: number;
  valorAtualFormatado?: string;
  beneficiosInclusos?: string[];
}

interface Participant {
  nome: string;
  sexo: Gender | "";
  tamanho: ShirtSize | "";
}

interface BatchInscriptionFormProps {
  eventId: string;
  categories: Category[];
  user: UserDTO;
  onSuccess?: (batch: BatchInscriptionDTO) => void;
}

export function BatchInscriptionForm({
  eventId,
  categories,
  user,
  onSuccess,
}: BatchInscriptionFormProps) {
  const userData = user as UserDTO & {
    nome?: string;
    cpf?: string;
    email?: string;
    telefone?: string;
    dataNascimento?: string;
    sexo?: Gender;
    cidade?: string;
  };

  const missingProfileFields = useMemo(() => {
    const missing: string[] = [];
    if (!userData.nome?.trim()) missing.push("nome completo");
    if (!userData.cpf?.trim()) missing.push("CPF");
    return missing;
  }, [userData.nome, userData.cpf]);

  const soldOutSizes = useMemo(() => soldOutShirtSizes(eventId), [eventId]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories.find((c) => c.nome.toLowerCase().includes("lote"))?.id ||
      categories[0]?.id ||
      "",
  );
  const [paymentMethod, setPaymentMethod] = useState<InscriptionPaymentMethod>("PIX");
  const [cidade, setCidade] = useState("");
  const [campoMissionario, setCampoMissionario] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([
    { nome: "", sexo: "", tamanho: "" },
    { nome: "", sexo: "", tamanho: "" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdBatch, setCreatedBatch] = useState<BatchInscriptionDTO | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const createBatch = useCreateBatchInscription();
  const createPayment = useCreateBatchPayment();

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const validParticipants = participants.filter((p) => p.nome.trim().length >= 2 && p.sexo);
  const totalCents = (selectedCategory?.valor ?? 0) * validParticipants.length;

  const fmt = (cents: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

  const totalFormatado = fmt(totalCents);

  const perPersonFormatado = selectedCategory?.valorAtualFormatado ?? selectedCategory?.valorFormatado ?? "";

  function calcTaxaCents(total: number, method: InscriptionPaymentMethod): number {
    if (method === "PIX") return 199;
    if (method === "CREDIT_CARD") return Math.round(total * 2.99 / 100 + 49);
    return 0;
  }

  const taxaCents = paymentMethod !== "CASH" ? calcTaxaCents(totalCents, paymentMethod) : 0;
  const totalComTaxaFormatado = fmt(totalCents + taxaCents);

  function handleParticipantChange(index: number, field: "nome" | "sexo" | "tamanho", value: string) {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setErrors((e) => ({ ...e, [`p_${index}_${field}`]: "" }));
  }

  function handleAddParticipant() {
    if (participants.length >= 50) return;
    setParticipants((prev) => [...prev, { nome: "", sexo: "", tamanho: "" }]);
  }

  function handleRemoveParticipant(index: number) {
    if (participants.length <= 2) return;
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!selectedCategoryId) errs.category = "Selecione uma categoria";
    if (!cidade.trim()) errs.cidade = "Cidade de origem é obrigatória";
    if (!campoMissionario.trim()) errs.campoMissionario = "Número do campo missionário é obrigatório";

    if (missingProfileFields.length > 0) {
      errs.responsavel = `Dados obrigatórios ausentes no seu perfil: ${missingProfileFields.join(" e ")}.`;
    }

    const filled = participants.filter((p) => p.nome.trim().length >= 2 && p.sexo);
    if (filled.length < 2) {
      errs.participants = "Preencha pelo menos 2 participantes (nome e sexo)";
    }

    participants.forEach((p, i) => {
      if (p.nome.trim().length > 0 && p.nome.trim().length < 2) {
        errs[`p_${i}_nome`] = "Nome deve ter pelo menos 2 caracteres";
      }
      if (p.nome.trim().length >= 2 && !p.sexo) {
        errs[`p_${i}_sexo`] = "Selecione o sexo";
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const filledParticipants = participants
      .filter((p) => p.nome.trim().length >= 2 && p.sexo)
      .map((p) => ({ nome: p.nome.trim(), sexo: p.sexo as Gender, tamanho: p.tamanho as ShirtSize | undefined || undefined }));

    try {
      const batch = await createBatch.mutateAsync({
        eventId,
        categoryId: selectedCategoryId,
        preferredPaymentMethod: paymentMethod,
        responsavel: {
          nome: userData.nome ?? "",
          cpf: userData.cpf ?? "",
          email: userData.email ?? "",
          telefone: userData.telefone ?? "",
          dataNascimento: userData.dataNascimento ?? new Date().toISOString(),
          sexo: (userData.sexo as Gender) ?? "masculino",
          cidade: cidade.trim(),
          campoMissionario: campoMissionario.trim(),
        },
        cidade: cidade.trim(),
        participantes: filledParticipants,
      });

      if (paymentMethod === "PIX" || paymentMethod === "CREDIT_CARD") {
        const batchWithPayment = await createPayment.mutateAsync(batch.id);
        setCreatedBatch(batchWithPayment);
        onSuccess?.(batchWithPayment);
      } else {
        setCreatedBatch(batch);
        onSuccess?.(batch);
      }
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Erro ao criar inscrição coletiva" });
    }
  }

  async function handleCopyPix() {
    if (!createdBatch?.pixCopiaECola) return;
    try {
      await navigator.clipboard.writeText(createdBatch.pixCopiaECola as unknown as string);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    } catch {
      setCopiedPix(false);
    }
  }

  if (createdBatch) {
    return (
      <div className="space-y-6">
        <div className="bg-bg-secondary rounded-2xl border border-gold/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Inscrição Coletiva Criada!</h3>
              <p className="text-sm text-text-secondary">{createdBatch.totalParticipantes} participantes · {createdBatch.cidade}</p>
            </div>
          </div>

          {createdBatch.pixCopiaECola && (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                Total: <span className="text-gold font-semibold">{createdBatch.valorTotalFormatado}</span>
              </p>
              <p className="text-sm text-text-secondary">PIX Copia e Cola:</p>
              <div className="bg-bg-primary p-3 rounded-lg border border-gold/10">
                <code className="text-xs text-text-primary break-all block mb-2">
                  {String(createdBatch.pixCopiaECola).substring(0, 100)}...
                </code>
                <button
                  onClick={handleCopyPix}
                  className="w-full py-2 bg-gold text-bg-primary font-medium rounded-lg hover:bg-gold-light transition-colors text-sm"
                >
                  {copiedPix ? "Copiado!" : "Copiar Código PIX"}
                </button>
              </div>
              <p className="text-xs text-text-muted text-center">
                Após o pagamento, todas as inscrições serão confirmadas automaticamente.
              </p>
            </div>
          )}

          {createdBatch.checkoutUrl && (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                Total: <span className="text-gold font-semibold">{createdBatch.valorTotalFormatado}</span>
              </p>
              <a
                href={createdBatch.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gold text-bg-primary font-semibold rounded-xl hover:bg-gold-light transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pagar com Cartão
              </a>
              <p className="text-xs text-text-muted text-center">
                Após o pagamento, todas as inscrições serão confirmadas automaticamente.
              </p>
            </div>
          )}

          {createdBatch.preferredPaymentMethod === "CASH" && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-yellow-400">
                Pagamento em dinheiro selecionado. Apresente-se na recepção para confirmação.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isLoading = createBatch.isPending || createPayment.isPending;

  const hasProfileIssue = missingProfileFields.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasProfileIssue && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-4">
          <p className="text-sm font-semibold text-red-400 mb-1">Perfil incompleto</p>
          <p className="text-sm text-red-300">
            Para fazer uma inscrição coletiva, seu perfil precisa ter:{" "}
            <span className="font-medium">{missingProfileFields.join(" e ")}</span>.
          </p>
          <Link
            href="/minha-conta/perfil"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-red-400 underline underline-offset-2 hover:text-red-300 transition-colors"
          >
            Completar meu perfil
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      <CategorySelector
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />
      {errors.category && <p className="text-red-400 text-sm">{errors.category}</p>}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Cidade de Origem <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={cidade}
          onChange={(e) => { setCidade(e.target.value); setErrors((err) => ({ ...err, cidade: "" })); }}
          placeholder="Ex: São Paulo"
          className="w-full bg-bg-primary border border-gold/20 rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50"
        />
        {errors.cidade && <p className="text-red-400 text-sm mt-1">{errors.cidade}</p>}
        <p className="text-xs text-text-muted mt-1">Cidade de origem para todos os participantes do lote</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Número do campo missionário <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={campoMissionario}
          onChange={(e) => { setCampoMissionario(e.target.value.replace(/\D/g, "")); setErrors((err) => ({ ...err, campoMissionario: "" })); }}
          placeholder="Ex: 157"
          className="w-full bg-bg-primary border border-gold/20 rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50"
        />
        {errors.campoMissionario && <p className="text-red-400 text-sm mt-1">{errors.campoMissionario}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Forma de Pagamento</label>
        <div className="flex flex-wrap gap-3">
          {(["PIX", "CREDIT_CARD", "CASH"] as InscriptionPaymentMethod[]).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPaymentMethod(method)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                paymentMethod === method
                  ? "bg-gold/20 border-gold text-gold"
                  : "bg-bg-primary border-gold/20 text-text-secondary hover:border-gold/40"
              }`}
            >
              {INSCRIPTION_PAYMENT_METHOD_LABELS[method]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-text-secondary">
            Participantes ({participants.length}/50) <span className="text-red-400">*</span>
          </label>
          <button
            type="button"
            onClick={handleAddParticipant}
            disabled={participants.length >= 50}
            className="text-sm text-gold hover:text-gold-light disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar
          </button>
        </div>

        <div className="space-y-2">
          {participants.map((p, i) => (
            <BatchParticipantRow
              key={i}
              index={i}
              nome={p.nome}
              sexo={p.sexo}
              tamanho={p.tamanho}
              soldOutSizes={soldOutSizes}
              onChange={handleParticipantChange}
              onRemove={handleRemoveParticipant}
              canRemove={participants.length > 2}
            />
          ))}
        </div>
        {errors.participants && <p className="text-red-400 text-sm mt-2">{errors.participants}</p>}
      </div>

      {selectedCategory && validParticipants.length >= 2 && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">
              {validParticipants.length} participantes × {perPersonFormatado}
            </span>
            <span className="text-text-primary">{totalFormatado}</span>
          </div>
          {paymentMethod !== "CASH" && (
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">
                Taxa {paymentMethod === "PIX" ? "PIX (R$ 1,99 fixo)" : "Cartão (2,99% + R$ 0,49)"}
              </span>
              <span className="text-text-muted">{fmt(taxaCents)}</span>
            </div>
          )}
          <div className="border-t border-gold/20 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-text-secondary">Total</span>
            <span className="text-gold">{paymentMethod !== "CASH" ? totalComTaxaFormatado : totalFormatado}</span>
          </div>
        </div>
      )}

      {errors.submit && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || hasProfileIssue}
        title={hasProfileIssue ? `Complete seu perfil antes de continuar: falta ${missingProfileFields.join(" e ")}` : undefined}
        className="w-full py-3 bg-gold text-bg-primary font-semibold rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Processando..." : `Inscrever ${validParticipants.length} Participante${validParticipants.length !== 1 ? "s" : ""}`}
      </button>
    </form>
  );
}

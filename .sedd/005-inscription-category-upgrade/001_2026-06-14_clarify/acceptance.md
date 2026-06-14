# Acceptance Criteria - Migration 001

Expectativa: "Admin troca categoria de inscrição paga e cobra a diferença (respeitando a
data/early bird e as taxas); a troca só vale após o pagamento confirmar (SSE); fica claro o
upgrade pendente no admin e na consulta pública (contate o suporte); consulta pública e
total arrecadado seguem corretos; nada existente quebra."

## Critérios

- [ ] **AC-001:** Admin localiza a inscrição e vê preview da diferença
  - Verificar: no ConfirmModal, selecionar nova categoria + método mostra
    diferença (base), taxa e total corretos.

- [ ] **AC-002:** Diferença respeita a data da inscrição (early bird)
  - Verificar: inscrição criada no período antecipado calcula a nova categoria pelo preço
    antecipado (`getCurrentPrice(criadoEm)`), não pelo preço atual.

- [ ] **AC-003:** Taxa aplicada por cima (não entra no cálculo da diferença)
  - Verificar: PIX → diferença + R$1,99; Cartão → diferença + 2,99% + R$0,49.

- [ ] **AC-004:** Geração abre nova aba dedicada admin-only
  - Verificar: clicar "Gerar upgrade" abre `/minha-conta/admin/.../upgrade` em nova aba;
    usuário não-admin não acessa a página.

- [ ] **AC-005:** Pagamento emitido/compartilhável por método
  - Verificar: PIX mostra QR + copia-e-cola; cartão mostra link de checkout; dinheiro mostra
    botão "Confirmar recebimento".

- [ ] **AC-006:** Confirmação por SSE; categoria só muda após pagar
  - Verificar: enquanto não paga, página mostra "Aguardando pagamento" e a inscrição mantém
    a categoria/valor antigos; ao pagar (webhook) o SSE atualiza para "Upgrade confirmado" e
    a categoria/valor mudam.

- [ ] **AC-007:** Dinheiro confirmado pelo admin aplica o upgrade (com confirmedBy)
  - Verificar: botão confirmar dinheiro registra adminId e aplica a troca.

- [ ] **AC-008:** Cancelar upgrade pendente
  - Verificar: cancela a cobrança no Asaas e limpa o pendingUpgrade; inscrição volta ao
    estado anterior sem cobrança presa.

- [ ] **AC-009:** "Upgrade pendente" visível no admin
  - Verificar: badge na lista e no detalhe enquanto pendente.

- [ ] **AC-010:** Consulta pública por CPF mostra "contate o suporte" quando pendente
  - Verificar: aviso com WhatsApp do evento; e a consulta continua exibindo o pagamento
    ORIGINAL (nunca a cobrança de ajuste).

- [ ] **AC-011:** SSE do participante não mostra a cobrança de ajuste
  - Verificar: com um AJUSTE presente, o status-stream do participante segue refletindo o
    pagamento original.

- [ ] **AC-012:** Total arrecadado reflete o upgrade após confirmar
  - Verificar: card "Receita Confirmada" e relatório diário sobem para o novo valor da
    inscrição após a diferença confirmar; sem dupla contagem.

- [ ] **AC-013:** Não-regressão geral
  - Verificar: inscrição individual, lote, webhook padrão e brinde seguem funcionando;
    `npm test && npm run lint` verde.

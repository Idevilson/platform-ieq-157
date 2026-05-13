# Acceptance Criteria — Migration 001

---

- [ ] **AC-001:** Usuário logado vê botão "Inscrever grupo" na página do evento; usuário não logado não vê
  - Verificar: logar, acessar página do evento, botão aparece; deslogar, botão some

- [ ] **AC-002:** Acessar `/eventos/[id]/inscricao-coletiva` sem login redireciona para login
  - Verificar: abrir URL direto sem autenticação, redirect ocorre

- [ ] **AC-003:** Form do responsável valida todos os campos obrigatórios (nome, CPF, email, telefone, dataNascimento, sexo, cidade)
  - Verificar: tentar avançar com campo vazio, erro aparece no campo

- [ ] **AC-004:** É possível adicionar até 50 participantes e não mais que isso
  - Verificar: adicionar 50, botão "Adicionar participante" desabilita; tentar via API com 51, retorna 400

- [ ] **AC-005:** Mínimo de 2 participantes é exigido para submeter
  - Verificar: tentar com 1 participante, botão de avançar bloqueado; tentar via API com 1, retorna 400

- [ ] **AC-006:** Resumo exibe "N participantes × R$XX,XX + R$1,99 = R$YYY,YY" corretamente
  - Verificar: adicionar 3 participantes em categoria de R$120, resumo mostra R$361,99

- [ ] **AC-007:** PIX QR code é gerado e o código copia-e-cola funciona
  - Verificar: completar form, avançar para etapa de pagamento, QR code aparece, copiar código

- [ ] **AC-008:** Após pagamento PIX confirmado, todas as inscrições do lote ficam com status "confirmado"
  - Verificar: simular webhook `PAYMENT_CONFIRMED`, buscar inscrições do lote no admin, todas confirmadas

- [ ] **AC-009:** Webhook processado 2x não duplica confirmações nem realoca brindes
  - Verificar: enviar webhook 2x para o mesmo lote, inscrições confirmadas apenas uma vez

- [ ] **AC-010:** Busca por CPF do responsável em `/eventos` exibe o lote agrupado (não 50 inscrições soltas)
  - Verificar: pesquisar CPF do responsável, ver card do lote com contador de participantes

- [ ] **AC-011:** Card do lote na consulta CPF é expansível e mostra lista de participantes (nome + sexo)
  - Verificar: clicar em "Ver participantes", lista aparece corretamente

- [ ] **AC-012:** Admin vê seção "Lotes" na página do evento com todos os lotes listados
  - Verificar: acessar admin do evento, aba/seção Lotes aparece

- [ ] **AC-013:** Botão "Confirmar pagamento" aparece APENAS para lotes com `metodoPagamento = CASH` e `status = pendente`
  - Verificar: lote PIX não mostra botão; lote CASH confirmado não mostra botão; lote CASH pendente mostra

- [ ] **AC-014:** Admin confirma pagamento CASH e lote inteiro fica confirmado
  - Verificar: clicar "Confirmar pagamento" em lote CASH, todas as inscrições ficam confirmadas

- [ ] **AC-015:** Botão "Excluir lote" solicita confirmação antes de executar
  - Verificar: clicar excluir, modal de confirmação aparece; cancelar, nada acontece; confirmar, lote removido

- [ ] **AC-016:** Excluir lote com PIX pendente cancela o pagamento no Asaas
  - Verificar: excluir lote com PIX, payment cancelado no Asaas (checar sandbox)

- [ ] **AC-017:** Requisição `POST /api/batch-inscriptions` sem Bearer token retorna 401
  - Verificar: chamar endpoint sem header Authorization, retorna 401

- [ ] **AC-018:** Inscrição coletiva não interfere no fluxo de inscrição individual
  - Verificar: usuário com lote criado consegue fazer inscrição individual normalmente; inscrição individual aparece separada dos lotes no admin

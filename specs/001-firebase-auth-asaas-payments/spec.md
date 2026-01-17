# Feature Specification: Integração Firebase Auth + Asaas Payments

**Feature Branch**: `001-firebase-auth-asaas-payments`
**Created**: 2026-01-14
**Status**: Draft
**Input**: Integrar autenticação Firebase e pagamentos Asaas na plataforma IEQ 157, seguindo princípios de Domain-Driven Design (DDD).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro e Login de Membro (Priority: P1)

Um membro da igreja deseja se cadastrar na plataforma para poder se inscrever em eventos como o Encontro com Deus. Ele precisa criar uma conta usando email/senha ou autenticação Google, e posteriormente completar seu perfil com dados pessoais necessários para pagamentos.

**Why this priority**: Sem autenticação, nenhuma outra funcionalidade pode operar. É a base para todo o sistema de inscrições e pagamentos.

**Independent Test**: Pode ser testado criando uma conta, fazendo login e verificando acesso às áreas protegidas.

**Acceptance Scenarios**:

1. **Given** um visitante na página de cadastro, **When** ele preenche email, senha e nome e submete o formulário, **Then** uma conta é criada e ele é redirecionado para o perfil.
2. **Given** um visitante na página de login, **When** ele clica em "Entrar com Google", **Then** o fluxo OAuth é iniciado e após autorização ele é autenticado na plataforma.
3. **Given** um usuário autenticado sem CPF cadastrado, **When** ele tenta se inscrever em um evento pago, **Then** ele é direcionado para completar seu perfil antes de prosseguir.
4. **Given** um usuário na página de recuperação de senha, **When** ele informa seu email cadastrado, **Then** um link de redefinição é enviado para o email.

---

### User Story 2 - Inscrição em Evento (Priority: P1)

Um membro autenticado deseja se inscrever em um evento da igreja (ex: Encontro com Deus). Ele seleciona o evento, escolhe uma categoria (se aplicável) e confirma sua inscrição.

**Why this priority**: A inscrição é o objetivo principal do sistema - permitir que membros participem dos eventos da igreja.

**Independent Test**: Pode ser testado selecionando um evento aberto, escolhendo categoria e verificando que a inscrição foi registrada.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com CPF na página de um evento aberto, **When** ele seleciona uma categoria e confirma inscrição, **Then** uma inscrição pendente é criada.
2. **Given** um usuário que já possui inscrição ativa no evento, **When** ele tenta se inscrever novamente, **Then** o sistema informa que já existe uma inscrição e não permite duplicação.
3. **Given** um evento com status fechado, **When** um usuário tenta se inscrever, **Then** o sistema informa que as inscrições estão encerradas.
4. **Given** um usuário autenticado SEM CPF, **When** ele tenta se inscrever, **Then** ele é direcionado para completar o CPF no perfil.

---

### User Story 3 - Pagamento de Inscrição (Priority: P1)

Um membro com inscrição pendente deseja pagar para confirmar sua participação. Ele pode escolher entre PIX, boleto ou cartão de crédito conforme configurado para o evento.

**Why this priority**: O pagamento confirma a participação e é essencial para o funcionamento operacional da igreja.

**Independent Test**: Pode ser testado criando uma inscrição, gerando um pagamento PIX e verificando que o QR Code é exibido.

**Acceptance Scenarios**:

1. **Given** uma inscrição pendente e evento configurado com PIX, **When** o usuário seleciona PIX, **Then** um QR Code e código copia-e-cola são exibidos.
2. **Given** uma inscrição pendente e evento configurado com boleto, **When** o usuário seleciona boleto, **Then** um link para o boleto é gerado.
3. **Given** uma inscrição pendente e evento configurado com cartão, **When** o usuário seleciona cartão e informa dados, **Then** o pagamento é processado.
4. **Given** um pagamento PIX confirmado pelo Asaas via webhook, **When** o webhook é recebido, **Then** a inscrição é automaticamente confirmada.
5. **Given** uma inscrição já com pagamento pendente, **When** o usuário acessa o pagamento, **Then** os dados do pagamento existente são exibidos (sem criar duplicação).

---

### User Story 4 - Acompanhamento de Inscrições e Pagamentos (Priority: P2)

Um membro deseja visualizar suas inscrições e o status dos pagamentos. Ele acessa sua conta e pode ver o histórico completo.

**Why this priority**: Oferece transparência e permite que o usuário acompanhe seu progresso, mas não é bloqueante para o fluxo principal.

**Independent Test**: Pode ser testado logando com um usuário que tem inscrições e verificando a listagem.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com inscrições, **When** ele acessa "Minhas Inscrições", **Then** todas as inscrições são listadas com status.
2. **Given** um usuário autenticado com pagamentos, **When** ele acessa "Meus Pagamentos", **Then** todos os pagamentos são listados com detalhes.

---

### User Story 5 - Gestão de Eventos pelo Admin (Priority: P2)

Um administrador da igreja deseja criar e gerenciar eventos, definindo categorias, valores e métodos de pagamento aceitos.

**Why this priority**: Necessário para criar eventos, mas pode ser feito via seed/banco inicialmente.

**Independent Test**: Pode ser testado criando um evento via painel admin e verificando que aparece para usuários.

**Acceptance Scenarios**:

1. **Given** um admin autenticado no painel, **When** ele cria um novo evento com categorias e métodos de pagamento, **Then** o evento é salvo e disponibilizado.
2. **Given** um evento existente, **When** o admin altera o status para "fechado", **Then** novas inscrições são bloqueadas.
3. **Given** um evento com inscrições, **When** o admin visualiza o evento, **Then** estatísticas de inscrições e pagamentos são exibidas.

---

### User Story 6 - Gestão de Inscrições pelo Admin (Priority: P3)

Um administrador deseja visualizar todas as inscrições de um evento, filtrando por status e exportando relatórios.

**Why this priority**: Funcionalidade de gestão que pode ser implementada após o fluxo principal.

**Independent Test**: Pode ser testado acessando a listagem de inscrições de um evento com dados.

**Acceptance Scenarios**:

1. **Given** um admin no painel de inscrições, **When** ele seleciona um evento, **Then** todas as inscrições são listadas.
2. **Given** a lista de inscrições, **When** o admin filtra por status "confirmado", **Then** apenas inscrições confirmadas são exibidas.

---

### Edge Cases

- **Webhook antes do pagamento local**: Sistema implementa fila com retry (máx 3 tentativas) com logging de todas as tentativas.
- **Pagamento expirado**: Inscrição é cancelada automaticamente quando pagamento vence (webhook OVERDUE do Asaas).
- O que acontece se o usuário tentar pagar com um método não habilitado para o evento?
- Como tratar falhas de comunicação com a API do Asaas durante criação de pagamento?
- O que acontece se o CPF informado for inválido?
- Como tratar tentativas de login com email não cadastrado via Google OAuth?
- **Acompanhamento de visitante**: Área "Consultar Inscrição" na página do evento permite consulta por CPF.

## Requirements *(mandatory)*

### Functional Requirements

**Autenticação**
- **FR-001**: Sistema DEVE permitir cadastro de usuários com email e senha
- **FR-002**: Sistema DEVE permitir autenticação via Google OAuth
- **FR-003**: Sistema DEVE validar formato de email no cadastro
- **FR-004**: Sistema DEVE permitir recuperação de senha via email
- **FR-005**: Sistema DEVE manter sessão do usuário entre visitas
- **FR-006**: Sistema DEVE diferenciar usuários comuns de administradores

**Perfil de Usuário**
- **FR-007**: Sistema DEVE permitir que usuário atualize nome, telefone e CPF
- **FR-008**: Sistema DEVE validar CPF usando algoritmo oficial de verificação
- **FR-009**: Sistema DEVE exigir CPF válido para permitir inscrições em eventos pagos

**Eventos**
- **FR-010**: Sistema DEVE exibir lista de eventos disponíveis
- **FR-011**: Sistema DEVE permitir que eventos tenham múltiplas categorias com valores diferentes
- **FR-012**: Sistema DEVE permitir configurar quais métodos de pagamento cada evento aceita (PIX, Boleto, Cartão)
- **FR-013**: Sistema DEVE controlar status do evento (aberto, fechado, encerrado)
- **FR-014**: Admin DEVE poder criar, editar e gerenciar eventos

**Inscrições**
- **FR-015**: Sistema DEVE permitir inscrições em eventos abertos tanto para usuários autenticados quanto para visitantes sem cadastro
- **FR-015a**: Para usuários autenticados, inscrição é vinculada à conta Firebase e visível em "Minhas Inscrições"
- **FR-015b**: Para visitantes sem cadastro, sistema DEVE coletar nome, email, telefone e CPF no formulário de inscrição
- **FR-016**: Sistema DEVE impedir inscrição duplicada do mesmo usuário/email no mesmo evento
- **FR-017**: Sistema DEVE registrar inscrição com status "pendente" até confirmação de pagamento
- **FR-018**: Sistema DEVE atualizar status da inscrição para "confirmado" após pagamento confirmado
- **FR-018a**: Sistema DEVE cancelar inscrição automaticamente quando pagamento expira (status OVERDUE)
- **FR-019**: Sistema DEVE permitir que usuário autenticado cancele inscrição pendente
- **FR-019a**: Página do evento DEVE ter área de "Consultar Inscrição" onde visitante informa CPF para ver status de suas inscrições naquele evento

**Pagamentos**
- **FR-020**: Sistema DEVE integrar com API Asaas para processamento de pagamentos
- **FR-021**: Sistema DEVE criar cliente no Asaas quando usuário realizar primeiro pagamento
- **FR-022**: Sistema DEVE gerar QR Code PIX quando método PIX for selecionado
- **FR-023**: Sistema DEVE gerar boleto quando método boleto for selecionado
- **FR-024**: Sistema DEVE processar pagamento com cartão quando método cartão for selecionado
- **FR-025**: Sistema DEVE receber webhooks do Asaas para atualização de status de pagamento
- **FR-026**: Sistema DEVE validar autenticidade dos webhooks recebidos
- **FR-027**: Sistema DEVE usar ambiente sandbox do Asaas para testes

**Painel Admin**
- **FR-028**: Admin DEVE poder visualizar todas as inscrições por evento
- **FR-029**: Admin DEVE poder visualizar estatísticas de inscrições e pagamentos
- **FR-030**: Admin DEVE poder filtrar inscrições por status

### Key Entities

- **User**: Representa um membro da igreja. Possui email, nome, telefone, CPF, role (user/admin) e referência ao cliente Asaas.
- **Event**: Representa um evento da igreja. Possui título, descrição, datas, local, status, categorias disponíveis e métodos de pagamento aceitos.
- **EventCategory**: Categoria dentro de um evento. Possui nome e valor associado.
- **Inscription**: Registro de inscrição de um usuário em um evento. Possui referência ao usuário, evento, categoria, valor e status.
- **Payment**: Registro de pagamento de uma inscrição. Possui referência à inscrição, método de pagamento, valor, status e dados específicos (QR Code PIX, URL boleto).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários completam o fluxo de cadastro até login em menos de 3 minutos
- **SC-002**: Usuários completam inscrição + pagamento PIX em menos de 5 minutos
- **SC-003**: 95% dos pagamentos PIX são confirmados e refletidos no sistema em menos de 2 minutos após o pagamento real
- **SC-004**: Sistema suporta pelo menos 50 inscrições simultâneas sem degradação perceptível
- **SC-005**: Taxa de erro em processamento de pagamentos inferior a 1%
- **SC-006**: 100% dos webhooks do Asaas são processados corretamente
- **SC-007**: Admin consegue visualizar status de todas as inscrições de um evento em tempo real
- **SC-008**: Validação de CPF rejeita 100% dos CPFs inválidos com mensagem clara ao usuário

## Clarifications

### Session 2026-01-15

- Q: Como tratar webhook que chega antes do pagamento ser salvo localmente? → A: Implementar fila com retry (máx 3 tentativas) com registro/logging de todas as tentativas.
- Q: Inscrições são apenas para usuários autenticados? → A: Não. Inscrições podem ser feitas por usuários autenticados (vinculadas à conta Firebase) OU por visitantes sem cadastro. O frontend deve suportar ambos os fluxos.
- Q: Como visitante sem cadastro acompanha status da inscrição? → A: Através de área dedicada dentro da página do evento, onde o visitante informa o CPF para consultar suas inscrições naquele evento específico.
- Q: O que acontece com inscrição quando pagamento expira (boleto vencido)? → A: Inscrição é cancelada automaticamente após vencimento do pagamento.
- Q: Eventos terão controle de vagas/capacidade? → A: Não. Eventos não têm limite de vagas, inscrições são ilimitadas.
- Q: Sistema deve enviar notificações por email? → A: Não. Acompanhamento é feito exclusivamente pela plataforma. Usuários autenticados consultam em "Minha Conta", visitantes consultam por CPF na área dedicada do evento.

## Assumptions

- O ambiente Asaas será inicialmente sandbox para testes, com migração para produção após validação
- A igreja já possui conta no Asaas com API Key disponível
- O Firebase já está configurado no projeto com Authentication habilitado
- Usuários terão acesso à internet estável para completar pagamentos
- A maioria dos pagamentos será via PIX devido à praticidade
- Não há necessidade de reembolso automático via sistema nesta versão inicial
- Eventos gratuitos não passam pelo fluxo de pagamento (apenas registro de inscrição)
- Eventos não possuem limite de vagas - inscrições são ilimitadas
- Sistema não envia notificações por email - acompanhamento é feito exclusivamente pela plataforma

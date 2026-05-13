# Feature 004 — Inscrição Coletiva (BatchInscription)

**Criado em:** 2026-05-09
**Branch:** main (sem branch separada)
**Status:** spec

---

## Expectation

> Um usuário logado consegue inscrever até 50 participantes de uma vez em um evento, preenchendo apenas nome e sexo por pessoa e uma cidade única para o grupo. Um único PIX é gerado cobrindo o total. Após o pagamento, todas as inscrições são confirmadas automaticamente. Na consulta por CPF na página `/eventos`, o responsável vê o lote completo vinculado ao seu CPF.

---

## Contexto

O sistema atual suporta apenas inscrições individuais (1 pessoa → 1 inscrição → 1 pagamento). Coordenadores de grupos (família, célula, turma) precisam inscrever várias pessoas sem repetir o processo. Esta feature cria uma sessão de inscrição coletiva paralela ao fluxo existente, sem quebrar nenhuma funcionalidade.

---

## User Stories

### US-01 — Acessar inscrição coletiva
**Como** usuário logado na página do evento,
**quero** ver uma opção de "Inscrição Coletiva" além da individual,
**para que** eu possa inscrever meu grupo sem repetir o processo.

**Critérios:**
- Tab/toggle "Inscrição Individual | Inscrição Coletiva" visível apenas para usuários autenticados
- Usuários não logados não veem a opção coletiva
- Usuário que já tem inscrição individual ainda pode criar um lote (não são mutuamente exclusivos)

### US-02 — Preencher dados do responsável
**Como** responsável pelo grupo,
**quero** preencher meus dados completos de identificação,
**para que** o sistema saiba quem é o responsável financeiro pelo lote.

**Critérios:**
- Campos coletados: nome, CPF, email, telefone, data de nascimento, sexo, cidade
- Exatamente os mesmos campos da inscrição normal (GuestInscriptionForm)
- CPF do responsável é a chave de rastreamento do lote na consulta pública

### US-03 — Adicionar participantes ao lote
**Como** responsável,
**quero** adicionar cada participante informando apenas nome e sexo,
**para que** o preenchimento seja rápido para grupos grandes.

**Critérios:**
- Campo único de cidade de origem para todos os participantes (preenchido uma vez)
- Por participante: apenas nome (texto livre) e sexo (M/F)
- Mínimo 2 participantes, máximo 50
- Botão "Adicionar participante" (+ linha) e botão remover por linha
- Sem validação de CPF por participante (não é coletado)

### US-04 — Visualizar resumo e pagar
**Como** responsável,
**quero** ver o total calculado e pagar com PIX,
**para que** eu pague tudo de uma vez.

**Critérios:**
- Resumo: "N participantes × R$XX,XX + R$1,99 de taxa = **R$YYY,YY**"
- Único QR code PIX gerado para o valor total
- Mesma UI de QR code já usada na inscrição individual

### US-05 — Confirmação automática do lote
**Como** sistema,
**quando** o pagamento PIX for confirmado pelo Asaas,
**devo** confirmar todas as inscrições do lote automaticamente.

**Critérios:**
- Webhook detecta `externalReference = eventId:batch:batchId`
- Todas as `Inscription`s do lote mudam de `pendente` → `confirmado`
- Brindes alocados individualmente para cada participante (se disponível)
- Idempotente (re-execuções do webhook não duplicam confirmações)

### US-06 — Consulta por CPF mostra o lote
**Como** responsável,
**quando** pesquisar meu CPF na página `/eventos`,
**quero** ver o lote de inscrições vinculado ao meu CPF,
**para que** eu possa acompanhar o status.

**Critérios:**
- Resultado mostra o lote agrupado (não participantes soltos)
- Exibe: responsável, cidade, nº de participantes, status do pagamento
- Expande para mostrar lista de participantes (nome + sexo)
- Status de pagamento compartilhado (um PIX para todos)

### US-07 — Admin gerencia lotes
**Como** administrador,
**quero** ver, aprovar e excluir lotes de inscrição na gestão do evento,
**para que** eu possa controlar inscrições coletivas com pagamento em dinheiro ou remover lotes inválidos.

**Critérios:**
- Seção/aba "Lotes" na página admin do evento
- Mostra: responsável (nome + CPF), cidade, nº participantes, valor total, status
- Expansível para ver participantes do lote (nome + sexo)
- Botão **"Confirmar pagamento"** visível apenas quando `metodoPagamento = CASH` e status = `pendente`
  - Confirma o lote inteiro (todas as `Inscription`s → `confirmado`) sem passar pelo Asaas
  - Mesmo fluxo de alocação de brindes do webhook
- Botão **"Excluir lote"** disponível para qualquer status
  - Exclui o documento `batchInscriptions/{id}`
  - Exclui todas as `Inscription`s vinculadas (`inscriptionIds[]`)
  - Cancela pagamento PIX no Asaas se houver (status `pendente`)
  - Confirmação antes de executar (ação irreversível)
- Inscrições do lote também aparecem na lista normal com indicador visual de `batchId`

---

## Architecture Analysis

### Current Architecture (Relevant)

```
src/server/
  domain/inscription/
    entities/Inscription.ts           — private ctor + static create/fromPersistence/toJSON
    value-objects/GuestData.ts        — nome, email, cpf, telefone, dataNascimento, sexo, cidade
    repositories/IInscriptionRepository.ts
  application/inscription/
    CreateInscription.ts              — usuário logado
    CreateGuestInscription.ts         — guest (full GuestData)
    LookupInscriptionByCPF.ts         — consulta pública por CPF
  application/payment/
    ProcessAsaasWebhook.ts            — parse externalReference eventId:inscriptionId
  infrastructure/firebase/repositories/
    FirebaseInscriptionRepositoryAdmin.ts
src/components/inscription/
  SmartInscriptionForm.tsx            — roteador auth/guest
  GuestInscriptionForm.tsx            — form completo guest
  InscriptionLookup.tsx               — consulta CPF em /eventos
src/app/api/inscriptions/
  route.ts                            — POST: cria inscrição
  lookup/route.ts                     — GET: busca por CPF
```

### Impact Assessment

**Arquivos a modificar:** 8
**Novos arquivos:** 8
**Mudança no Firebase:** nova coleção top-level `batchInscriptions`
**Mudança na API:** nova rota `/api/batch-inscriptions`
**Mudança no webhook:** extensão do parser de `externalReference`

### Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `SmartInscriptionForm.tsx` | Adicionar tab Individual/Coletiva (só para logados) |
| `InscriptionLookup.tsx` | Exibir lotes agrupados quando CPF é de responsável |
| `IInscriptionRepository.ts` | Sem mudança — batch tem repositório próprio |
| `ProcessAsaasWebhook.ts` | Estender `parseExternalReference` para detectar prefixo `batch:` |
| `src/app/api/inscriptions/lookup/route.ts` | Chamar também `LookupBatchByCPF` e unificar resultado |
| `src/app/(main)/eventos/page.tsx` | Nenhuma mudança (InscriptionLookup já embutido) |
| `src/shared/types/inscription.ts` | Adicionar `BatchInscriptionDTO`, `BatchParticipantDTO` |
| `src/app/minha-conta/admin/eventos/[id]/page.tsx` | Adicionar seção de lotes |

### Novos arquivos

| Arquivo | Responsabilidade |
|---|---|
| `domain/inscription/entities/BatchInscription.ts` | Entidade do lote |
| `domain/inscription/value-objects/BatchParticipant.ts` | VO: nome + sexo |
| `domain/inscription/repositories/IBatchInscriptionRepository.ts` | Interface |
| `application/inscription/CreateBatchInscription.ts` | Use case |
| `application/inscription/LookupBatchByCPF.ts` | Use case CPF lookup |
| `infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin.ts` | Impl |
| `src/app/api/batch-inscriptions/route.ts` | POST cria lote |
| `src/app/api/batch-inscriptions/[id]/payment/route.ts` | GET/POST pagamento |
| `src/components/inscription/BatchInscriptionForm.tsx` | Form principal |
| `src/components/inscription/BatchParticipantRow.tsx` | Linha de participante |
| `src/hooks/mutations/useBatchInscriptionMutations.ts` | Mutations TanStack Query |

---

## Architecture Contract

### Tech Stack Bindings

| Camada | Tecnologia | Local |
|---|---|---|
| State / Queries | TanStack Query | `src/hooks/queries/` |
| Mutations | TanStack Query `useMutation` | `src/hooks/mutations/` |
| Validação API | Zod | junto ao use case |
| Entidades | Private ctor + `static create()` + `static fromPersistence()` | `domain/inscription/entities/` |
| Repositórios | Interface domínio + impl Firebase | `infrastructure/firebase/repositories/` |
| DI | Manual na rota | dentro do `route.ts` |
| API | Next.js Route Handlers | `src/app/api/batch-inscriptions/` |

### Location Bindings

| Tipo | DEVE ficar em | NUNCA criar em |
|---|---|---|
| Entidade | `src/server/domain/inscription/entities/` | fora do domínio |
| VO | `src/server/domain/inscription/value-objects/` | inline no use case |
| Use case | `src/server/application/inscription/` | na rota API |
| Repositório impl | `src/server/infrastructure/firebase/repositories/` | no use case |
| Hook mutation | `src/hooks/mutations/` | dentro do componente |
| Componente | `src/components/inscription/` | em `app/` |

### Contract Bindings

| Dado | externalReference no Asaas |
|---|---|
| Individual | `eventId:inscriptionId` |
| Lote | `eventId:batch:batchId` |

Webhook detecta `batch:` pelo split e ramifica para `ProcessBatchPayment`.

---

## Modelo de Dados Firebase

### Nova coleção: `batchInscriptions/{batchId}`

```
batchInscriptions/{batchId}
  ├── eventId: string
  ├── categoryId: string
  ├── status: 'pendente' | 'confirmado' | 'cancelado'
  ├── paymentId: string                ← ID do Payment document
  ├── valorTotal: number               ← cents (N × preço categoria)
  ├── responsavel: {
  │     nome: string
  │     cpf: string                    ← chave de busca na consulta pública
  │     email: string
  │     telefone: string
  │     dataNascimento: string         ← ISO date string
  │     sexo: 'M' | 'F'
  │     cidade: string
  │   }
  ├── cidade: string                   ← cidade única para todos os participantes
  ├── inscriptionIds: string[]         ← IDs das Inscription individuais criadas
  ├── participantes: [
  │     { nome: string, sexo: 'M' | 'F' }   ← imutável após criação
  │   ]
  ├── criadoEm: Timestamp
  └── atualizadoEm: Timestamp
```

**Tamanho estimado:** 50 × ~60 bytes ≈ 3KB por documento ✓

### Coleção existente: `inscriptions/{inscriptionId}` — novo campo

```
inscriptions/{inscriptionId}
  ├── ...todos os campos existentes
  └── batchId?: string    ← presente apenas em inscrições de lote
```

Inscrições de lote são criadas com `guestData` mínimo:
```
guestData: { nome: string, sexo: 'M' | 'F', cidade: string }
```
Sem CPF, email ou telefone (não coletados para participantes do lote).

### Webhook `externalReference`

```
Individual:  "geracaoForte:abc123"
Lote:        "geracaoForte:batch:xyz789"
```

---

## Regras de Negócio

1. Mínimo 2 participantes, máximo 50 por lote
2. Método de pagamento: **apenas PIX** (valor total + R$1,99 de taxa única)
3. O responsável NÃO precisa ser um dos participantes do lote
4. Usuário logado que já tem inscrição individual pode criar lote
5. Não há validação de CPF duplicado para participantes (CPF não é coletado)
6. Confirmação do lote é atômica: ou todos confirmam, ou nenhum (transaction Firestore)
7. Brindes alocados individualmente para cada `inscriptionId` do lote

---

## Página dedicada

A inscrição coletiva **não será uma tab embutida** na página do evento. Terá uma rota própria:

```
/eventos/[eventId]/inscricao-coletiva
```

**Motivação:** O formulário em 2 etapas (dados do responsável + lista de participantes + pagamento) é extenso demais para caber junto com o form individual. Uma página dedicada dá mais espaço, melhor usabilidade em mobile e URL própria para compartilhar.

**Integração com a página do evento:**
- Botão/link "Inscrever grupo" na página do evento — visível apenas para usuários logados
- Redireciona para `/eventos/[eventId]/inscricao-coletiva`
- A página valida autenticação no lado servidor (redirect para login se não autenticado)

**Novos arquivos de rota:**
- `src/app/(main)/eventos/[id]/inscricao-coletiva/page.tsx`

---

## Fora de Escopo

- Desconto por volume (pode ser feature futura)
- Edição de participantes após criação
- Inscrição coletiva para usuários não logados (guests)
- Múltiplas categorias em um mesmo lote
- Cancelamento parcial (cancela o lote inteiro)

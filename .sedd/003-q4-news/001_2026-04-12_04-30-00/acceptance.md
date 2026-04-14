# Acceptance Criteria - Migration 001

## Critérios Positivos (DEVE)

- [ ] **AC-001:** Visitante vê "Q4-News" na navbar superior e pode clicar para acessar /q4-news
- [ ] **AC-002:** Página /q4-news exibe cards com thumbnail YouTube, título, resumo, data e autor (só publicados)
- [ ] **AC-003:** Clicar num card leva a /q4-news/[id] com vídeo YouTube embed responsivo + conteúdo completo
- [ ] **AC-004:** Postagens com status "rascunho" NÃO aparecem na listagem pública
- [ ] **AC-005:** Usuário com permissão adm-q4-news vê "Q4-News" no menu admin
- [ ] **AC-006:** Admin Q4-News consegue criar postagem (slug, título, resumo, conteúdo, YouTube URL, status)
- [ ] **AC-007:** Ao colar link YouTube, thumbnail aparece como preview no formulário
- [ ] **AC-008:** Admin consegue editar postagem existente (todos os campos)
- [ ] **AC-009:** Admin consegue alternar status entre rascunho/publicado
- [ ] **AC-010:** Admin consegue excluir postagem
- [ ] **AC-011:** Listagem admin mostra todas as postagens (incluindo rascunhos) com badge de status
- [ ] **AC-012:** Permissão adm-q4-news funciona independente do admin geral — user sem role admin mas com permissão consegue acessar
- [ ] **AC-013:** Admin geral (role: admin) tem acesso automático ao Q4-News sem precisar de permissão específica

## Critérios Negativos (NÃO DEVE)

- [ ] **AC-N01:** Nenhum rich text editor no formulário (textarea simples)
- [ ] **AC-N02:** Nenhuma biblioteca externa para YouTube embed
- [ ] **AC-N03:** Nenhum comentário inútil no código
- [ ] **AC-N04:** Nenhum `else` desnecessário (early return)

# Prompts — Protótipo Congresso de Jovens 2026 (Google Stitch AI)

> Use cada prompt em sequência no Stitch AI.  
> Referência visual de identidade: **Logo IEQ** — 4 quadrantes (Cruz vermelha, Pomba dourada, Cálice azul, Coroa roxa) sobre fundo dark.

---

## Contexto de identidade visual (cole antes de qualquer prompt)

```
Design system de referência:
- Fundo principal: #0D0D0D (quase preto)
- Fundo secundário: #111827 (cinza escuro)
- Cor de destaque primária: #D4A017 (ouro)
- Cores da marca IEQ: Vermelho #E02020 · Dourado #F5B800 · Azul #00AADD · Roxo #7B3FB5
- Tipografia headings: bold, maiúsculas, espaçamento de letras amplo
- Tipografia body: regular, claro, levemente esmaecido
- Bordas e cards: arredondados (border-radius 12–20px), borda sutil dourada com opacidade baixa
- Botão CTA: gradiente dourado, texto escuro, bordas arredondadas full
- Estética geral: moderno, impactante, voltado para juventude cristã, atmosfera de evento ao vivo
```

---

## PROMPT 1 — Página completa (visão geral)

```
Crie o layout completo de uma landing page de evento religioso/cristão para jovens chamado "Congresso de Jovens 2026" da Igreja do Evangelho Quadrangular (IEQ 157).

A página deve ser uma single page com as seguintes seções na ordem abaixo:
1. Hero Section
2. Organizadores e Anfitriões (Pastor Heitor Alexandre e Pastora Val Nery)
3. Sobre o Evento
4. Palestrantes
5. Kit do Participante
6. Cronograma
7. Inscrição / CTA final

Design: fundo escuro (#0D0D0D), tipografia bold em branco, detalhes e acentos em dourado (#D4A017). Visual de evento ao vivo, energético, jovem, mas com referência espiritual cristã. Sem elementos kitsch.
```

---

## PROMPT 2 — Hero Section

```
Crie o Hero Section da landing page do "Congresso de Jovens 2026".

Elementos obrigatórios:
- Logotipo IEQ no topo (ícone quadrangular com cruz vermelha, pomba dourada, cálice azul, coroa roxa — fundo branco ou transparente com fundo escuro do site)
- Badge de topo: texto "IEQ 157 · REDENÇÃO - PA" em letras pequenas maiúsculas com espaçamento amplo, cor dourada com opacidade 80%
- Título principal: "CONGRESSO DE JOVENS" em tipografia ultra bold, branco, tamanho hero (64–96px)
- Subtítulo: "2026" com tratamento gráfico diferenciado (contorno dourado ou gradiente)
- Data: "15 · 16 · 17 DE AGOSTO" em dourado
- Verso bíblico pequeno abaixo da data (estilo itálico, cinza claro)
- Botão CTA: "GARANTA SUA INSCRIÇÃO" com fundo gradiente de dourado, texto escuro, tamanho grande, pill shape
- Fundo: gradiente vertical de #0D0D0D para #111827, com um efeito sutil de partículas ou luz radial atrás do título (luz dourada/branca no centro — efeito de palco/spotlight)
- Seção ocupa 100vh, conteúdo centralizado
```

---

## PROMPT 3 — Seção Organizadores e Anfitriões

```
Crie a seção "Organizadores e Anfitriões" para o Congresso de Jovens 2026.

Contexto: o casal pastoral responsável pelo evento é o Pastor Heitor Alexandre e a Pastora Val Nery. Há uma foto profissional dos dois juntos com fundo transparente/recortado — eles estão lado a lado, ele à esquerda, ela à direita, ambos em trajes pretos formais, postura confiante e acolhedora.

Layout desktop:
- Duas colunas: foto à esquerda (45%) e texto à direita (55%)
- A foto usa o recorte com fundo transparente — posicionar sobre um fundo com gradiente dourado sutil (radial, de baixo para cima) que cria uma "aura" por trás do casal
- A foto deve ter tamanho generoso, sem bordas ou molduras, deixando o casal "respirar" na seção

Layout mobile:
- Foto centralizada no topo com largura máxima de 320px
- Texto empilhado abaixo

Fundo da seção: #0D0D0D com uma linha decorativa dourada horizontal no topo separando da seção anterior

Conteúdo textual (coluna direita):
- Label de topo: "REALIZAÇÃO" em letras pequenas maiúsculas espaçadas, dourado com 70% opacidade
- Título: "Pr. HEITOR ALEXANDRE" em bold, branco, 28px — linha abaixo: "& Pra. VAL NERY" no mesmo estilo
- Linha separadora fina dourada (80px de largura)
- Cargo/função: "Pastores Titulares · IEQ 157 · Redenção - PA" em cinza claro, 14px, itálico
- Parágrafo de apresentação: texto caloroso apresentando o casal como líderes da comunidade e anfitriões do congresso (placeholder: "Com décadas de ministério e um coração voltado para a juventude, o Pastor Heitor e a Pastora Val abrem as portas da IEQ 157 para um fim de semana que vai transformar vidas.")
- Dois badges abaixo do parágrafo:
  * "PASTOR TITULAR" — fundo #D4A017 15% opacidade, texto #D4A017
  * "ANFITRIÃ DO EVENTO" — mesmo estilo
```

---

## PROMPT 4 — Seção Sobre o Evento *(layout jovial — v2)*

```
Crie a seção "Sobre o Evento" para o Congresso de Jovens 2026 com visual jovem, energético e impactante. 
NÃO use layout centralizado com parágrafos longos. O visual deve ter tensão, movimento e atitude.

── FAIXA MARQUEE (elemento separador antes da seção) ──
- Faixa horizontal com scroll infinito em loop, fundo #D4A017
- Texto repetido em sequência: "CONGRESSO DE JOVENS 2026 · 15 A 17 DE AGOSTO · IEQ 157 · REDENÇÃO - PA ·"
- Fonte bold, texto escuro (#0D0D0D), uppercase, tamanho 13px
- Inclinada levemente (rotate -1.5deg), quebrando a linearidade da página — efeito "tape/fita"

── CORPO DA SEÇÃO ──
Fundo: #0D0D0D

Layout: assimétrico, duas colunas no desktop

Coluna esquerda (55%):
- Número gigante "3" em tipografia ultra bold, cor #D4A017 com opacidade 10%, posicionado como elemento decorativo de fundo (font-size: 320px, absolute, overflow hidden)
- Sobre esse número, empilhadas 3 frases curtas e impactantes no estilo manifesto:
  * Linha 1: "3 DIAS." — branco, bold, 48px
  * Linha 2: "6 VOZES." — branco, bold, 48px  
  * Linha 3: "1 GERAÇÃO." — gradiente dourado, bold, 48px
- Abaixo: uma única frase curta em cinza claro, 16px, máximo 2 linhas (não parágrafos longos):
  "Um fim de semana de pregação, adoração e comunhão que vai mudar o que você acredita ser possível."
- Botão inline: "VER PROGRAMAÇÃO →" em texto dourado, sem fundo, com seta animada no hover

Coluna direita (45%):
- Stack de 3 cards verticais, levemente deslocados entre si (offset de 12px à direita a cada card — efeito cascata/deck)
- Cada card: fundo #141414, borda esquerda 3px sólida com cor distinta, padding 20px, border-radius 12px
  * Card 1 — borda #E02020 (vermelho): ícone 🔥 + "MINISTRAÇÃO" bold + "Palavra que transforma" cinza
  * Card 2 — borda #F5B800 (amarelo): ícone 🎵 + "LOUVOR" bold + "Adoração que liberta" cinza
  * Card 3 — borda #00AADD (azul): ícone 🤝 + "COMUNHÃO" bold + "Rede que fortalece" cinza
- Cada card com leve sombra colorida correspondente à borda

Mobile: coluna esquerda empilhada em cima, número decorativo menor (180px), cards em lista vertical sem offset
```

---

## PROMPT 4 — Seção Palestrantes

```
Crie a seção de Palestrantes para o Congresso de Jovens 2026.

Dados dos palestrantes (6 no total):
1. J. RAMALHO
2. P. BENIGTSON
3. M. CARMONA
4. JUNIOR FERNANDES
5. HEITOR ALEXANDRE
6. VAL NERY

Layout: grid 3 colunas no desktop, 2 colunas no tablet, 1 no mobile.

Cada card de palestrante:
- Fundo: #1A1A2E ou #111827 com borda sutil dourada
- Foto real do palestrante: imagem quadrada que ocupa toda a metade superior do card, com máscara de gradiente na parte inferior (de transparente para a cor de fundo do card) para transição suave entre foto e texto
- O nome do palestrante deve aparecer sobre esse gradiente, na parte inferior da foto
- Nome do palestrante em bold, branco, maiúsculas, tamanho médio, com sombra de texto para legibilidade
- Tag/badge abaixo do nome: "PALESTRANTE" em dourado, fonte pequena, centralizado
- Leve brilho/glow dourado na borda do card ao hover
- Card com sombra sutil
- Estado de carregamento (skeleton): retângulo com shimmer no lugar da foto, enquanto a imagem não carrega

Título da seção: "PALESTRANTES" com linha decorativa dourada abaixo
Subtítulo: "Vozes ungidas para uma geração"
Fundo da seção: #0D0D0D
```

---

## PROMPT 5 — Seção Kit do Participante

```
Crie a seção "Kit do Participante" para o Congresso de Jovens 2026.

Conceito: quem se inscreve recebe um kit físico exclusivo do evento entregue em uma embalagem personalizada com todos os itens juntos.

Itens do kit:
1. Camiseta oficial do evento
2. Garrafa de água personalizada
3. Pulseira de LED VIP (efeito luminoso)
4. Pulseira de identificação do evento

Estrutura visual da seção — duas partes:

── PARTE 1: Imagem do kit completo ──
- Imagem principal em destaque ocupando a largura total da seção (ou coluna esquerda no desktop)
- Mostra uma foto/mockup da embalagem personalizada aberta com todos os 4 itens organizados dentro, visíveis e bem iluminados
- A caixa deve ter identidade visual do evento (logo do Congresso de Jovens 2026)
- Luz dramática vindo de cima, fundo escuro, itens com reflexo suave
- Badge flutuante sobre a imagem: "KIT COMPLETO" em dourado, pill shape
- Use imagem placeholder realista (produto lifestyle, caixa premium aberta com itens de evento)

── PARTE 2: Grid de itens individuais ──
- Grid 2×2 abaixo da imagem principal (ou coluna direita no desktop)
- Cada célula do grid = 1 item do kit
- Cada célula contém:
  * Foto/imagem individual do item (objeto isolado em fundo escuro ou neutro)
  * Nome do item em bold, branco
  * Descrição curta em cinza
  * Badge "VIP" em dourado apenas na pulseira de LED
- As 4 imagens individuais devem ter tratamento visual consistente (mesmo ângulo, mesma iluminação, fundo #141414)
- Ao clicar/hover em uma célula: leve zoom na imagem + borda dourada

Layout geral da seção:
- Fundo: gradiente diagonal de #0D0D0D para #1A1A2E
- Título da seção: "SEU KIT EXCLUSIVO" em dourado ultra bold, centralizado
- Subtítulo: "Cada inscrição inclui uma caixa cuidadosamente montada com:"
- Desktop: imagem do kit completo à esquerda (60% da largura) + grid 2×2 à direita (40%)
- Mobile: imagem do kit completo no topo, grid 2×2 embaixo empilhado
- Nota de rodapé: "* Kit disponível para inscrições realizadas até [DATA LIMITE]" em fonte pequena, cinza
- CTA: botão "QUERO MEU KIT" com fundo dourado, texto escuro, centralizado abaixo do grid
```

---

## PROMPT 6 — Seção Cronograma

```
Crie a seção de Cronograma para o Congresso de Jovens 2026 (15, 16 e 17 de agosto).

Layout: 3 colunas (uma por dia) no desktop, empilhadas no mobile.

Cada coluna de dia:
- Header colorido com o nome do dia e data
  * Sexta-feira 15/08: cor de destaque dourada
  * Sábado 16/08: cor de destaque azul (#00AADD)
  * Domingo 17/08: cor de destaque roxa (#7B3FB5)
- Linha do tempo vertical dentro de cada coluna
- Cada item da linha do tempo tem: horário (ex: 19h00) à esquerda + evento/atividade à direita
- Ícone pequeno por tipo de atividade: 🎵 louvor, 🎤 ministração, 🍽️ refeição, ✝️ ceia, 📖 abertura, 🏁 encerramento

Conteúdo de placeholder (substituir depois):
- Sexta: 19h00 Abertura · 20h00 Louvor · 21h00 Ministração · 22h30 Encerramento do dia
- Sábado: 08h00 Café da manhã · 09h00 Louvor · 10h00 Ministração · 12h30 Almoço · 15h00 Ministração · 19h00 Louvor noturno · 20h30 Ministração · 22h30 Encerramento
- Domingo: 08h30 Café da manhã · 09h30 Louvor · 10h30 Ministração · 12h00 Santa Ceia · 13h00 Encerramento

Aviso em destaque no topo da seção: banner suave "Programação sujeita a ajustes"

Título da seção: "CRONOGRAMA" com ícone de relógio
Fundo: #111827
```

---

## PROMPT 7 — Seção de Inscrição / CTA Final

```
Crie a seção de Inscrição (seção final) para o Congresso de Jovens 2026.

Elementos:
- Fundo: gradiente radial de #1A1A1A para #0D0D0D, com glow dourado sutil no centro
- Título: "FAÇA SUA INSCRIÇÃO" bold, branco
- Datas do evento destacadas: 3 badges com "15 AGO", "16 AGO", "17 AGO" em fundo dourado, texto escuro
- Aviso de early bird: banner com fundo dourado/âmbar suave: "🔥 Inscrição antecipada com desconto até [DATA LIMITE]"
- Cards de categorias de inscrição (2 opções, lado a lado no desktop):
  * Card 1 — "INSCRIÇÃO INDIVIDUAL": preço em destaque, lista de benefícios (incluindo kit), botão "INSCREVER"
  * Card 2 — "INSCRIÇÃO VIP": badge "VIP" dourado, preço maior em destaque, lista de benefícios premium (inclui kit + pulseira LED VIP + assento preferencial), botão "INSCREVER" — este card deve ter borda dourada e leve destaque/glow para se destacar
- Rodapé da seção: "Dúvidas? Fale no WhatsApp" com ícone e botão outline

Fundo geral da seção: gradiente escuro com textura sutil, tom de finalização/fechamento de página
```

---

## PROMPT 8 — Componente: Card de Palestrante (detalhe)

```
Crie apenas o componente Card de Palestrante em detalhe para o Congresso de Jovens 2026.

Especificações do card:
- Dimensões: 280×360px
- Fundo: #141414 com borda 1px sólida #D4A017 com opacidade 30%
- Border radius: 16px
- Sombra: 0 4px 24px rgba(212, 160, 23, 0.1)
- overflow: hidden

Parte superior (60% do card):
- Foto real do palestrante ocupando toda a largura (object-fit: cover)
- Gradiente de sobreposição no terço inferior da foto: de rgba(20,20,20,0) para rgba(20,20,20,1)
- Esse gradiente faz a foto "fundir" naturalmente com o fundo do card

Parte inferior (40% do card):
- Nome do palestrante: bold, branco, 18px, maiúsculas, centralizado
- Badge "PALESTRANTE": background #D4A017 com 15% opacidade, texto #D4A017, font-size 11px, letter-spacing amplo, pill shape, centralizado

Estado hover:
- Borda sobe para opacidade 70%
- Foto com leve escala (scale 1.03) com transition suave
- Leve elevação do card (translateY -4px)

Mostre o card para: HEITOR ALEXANDRE e VAL NERY como exemplos, usando fotos placeholder realistas (rosto de pregador/pastor, estilo profissional)
```

---

## PROMPT 9 — Componente: Card de Item do Kit (detalhe)

```
Crie o componente visual de card de item individual para a seção "Kit do Participante" do Congresso de Jovens 2026.

Layout do card (formato quadrado, estilo produto):
- Dimensões: 200×240px
- Fundo: #141414, border-radius 14px, overflow: hidden
- Borda 1px sólida rgba(212,160,23,0.2)

Parte superior — imagem do produto (60% do card):
- Foto real/mockup do item isolado em fundo escuro neutro (#1A1A1A), objeto centralizado
- Iluminação suave vinda de cima, leve sombra/reflexo embaixo do objeto
- Ocupa toda a largura do card (object-fit: contain, padding 12px)
- Badge "VIP" flutuando no canto superior direito da imagem (só na pulseira LED): fundo #D4A017, texto escuro 10px bold

Parte inferior — informações (40% do card):
- Separador linha 1px dourada com 20% opacidade
- Nome do item: bold, branco, 14px, maiúsculas
- Descrição: regular, #9CA3AF, 12px, max 2 linhas

Estado hover:
- Borda sobe para rgba(212,160,23,0.6)
- Imagem: leve zoom (scale 1.05) com transition 300ms
- Sombra do card: 0 8px 32px rgba(212,160,23,0.15)

Mostre os 4 cards lado a lado em grid 2×2:
1. Camiseta Oficial — foto de camiseta preta com estampa do evento, dobrada sobre fundo escuro
2. Garrafa de Água — foto de garrafa personalizada em preto/dourado
3. Pulseira de LED VIP — foto da pulseira acesa com efeito de luz LED [+ badge VIP]
4. Pulseira de Identificação — foto de pulseira de tecido com logo do evento
```

---

## PROMPT 10 — Mobile: Hero + Header

```
Mostre como ficaria o Hero Section e o Header de navegação do Congresso de Jovens 2026 em viewport mobile (375px de largura).

Header mobile:
- Logo IEQ pequeno (40px) à esquerda
- "CONGRESSO JOVENS" texto compacto ao centro
- Ícone hamburguer à direita em dourado
- Fundo semitransparente com blur (backdrop-filter)

Hero mobile:
- Logo IEQ centralizado, tamanho 80px
- Badge "IEQ 157 · REDENÇÃO - PA" em letras mínimas
- Título "CONGRESSO DE JOVENS" em 40px bold, centralizado
- "2026" em 56px com tratamento gráfico
- Data em 14px dourado
- Botão CTA em largura full (100%)
- Tudo com padding lateral de 24px
- Fundo com glow radial centralizado atrás do título
```

---

## Notas de implementação

| Seção | Componente Next.js sugerido | Rota |
|---|---|---|
| Página completa | `congresso-jovens/page.tsx` | `/eventos/congresso-jovens` |
| Hero | `CongressoHeroSection.tsx` | — |
| Organizadores | `OrganizadoresSection.tsx` | usa `pr-heitor-e-pra-val.png` |
| Palestrantes | `PalestrantesGrid.tsx` | — |
| Kit | `KitParticipante.tsx` | — |
| Cronograma | `CronogramaSection.tsx` | — |
| Inscrição | Usa `SmartInscriptionForm` existente | — |

**Paleta de cores para código:**
```
gold:     #D4A017
red:      #E02020  (Cruz)
yellow:   #F5B800  (Pomba)
blue:     #00AADD  (Cálice)
purple:   #7B3FB5  (Coroa)
bg-dark:  #0D0D0D
bg-card:  #141414
bg-sec:   #111827
```

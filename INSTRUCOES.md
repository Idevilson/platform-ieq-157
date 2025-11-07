# Encontro com Deus - IEQ Campo 157

Página de inscrição e divulgação do evento "Encontro com Deus" da Igreja do Evangelho Quadrangular Campo 157 - Redenção/PA.

## ✅ Projeto Configurado

O layout foi copiado do projeto "congresso-homens" e adaptado para o evento "Encontro com Deus".

## 📋 Próximos Passos

### 1. Adicionar Imagens

Adicione as seguintes imagens na pasta `public/imagens/`:

- `logoIEQ.png` - Logo da IEQ
- `capa_evento.jpeg` - Capa do evento
- `palestrante1.jpeg` - Foto do palestrante 1
- `palestrante2.jpeg` - Foto do palestrante 2
- `palestrante3.jpeg` - Foto do palestrante 3

### 2. Personalizar Informações do Evento

Edite o arquivo `src/App.tsx` e atualize:

#### Dados do Evento (linhas 169-183)
- Data do evento
- Endereço completo
- Telefone para contato

#### Palestrantes (linhas 45-62)
```typescript
const palestrantes = [
  {
    nome: "NOME DO PALESTRANTE",
    cargo: "CARGO/FUNÇÃO",
    imagem: "/imagens/palestrante1.jpeg",
  },
  // ... adicione mais palestrantes
];
```

#### Categorias de Inscrição (linhas 64-88)
```typescript
const categorias = [
  {
    id: 1,
    nome: "Básico",
    valor: 50,
    descricao: "Descrição do pacote",
    beneficios: [
      "Benefício 1",
      "Benefício 2",
    ],
  },
  // ... adicione mais categorias
];
```

#### Códigos PIX (linhas 34-43)
```typescript
const obterCodigoPix = (valor: number) => {
  switch (valor) {
    case 50:
      return "SEU_CODIGO_PIX_AQUI";
    case 80:
      return "SEU_CODIGO_PIX_AQUI";
    default:
      return "";
  }
};
```

### 3. Configurar Google Sheets

Edite o arquivo `src/services/googleSheets.ts`:

1. Acesse: https://sheetdb.io/
2. Clique em "Create API"
3. Cole o link da sua planilha do Google Sheets
4. Copie a URL da API gerada
5. Cole no arquivo substituindo `SEU_API_KEY_AQUI` (linha 21)

### 4. Configurar Endereço e Mapa

No arquivo `src/App.tsx`:

#### Endereço (linhas 433-437)
```typescript
<p>[Rua/Avenida]</p>
<p>[Bairro]</p>
<p>Redenção - PA</p>
<p>CEP: [CEP]</p>
```

#### Link do Google Maps (linha 440)
```typescript
href="https://maps.google.com/LINK_DO_SEU_LOCAL"
```

#### Iframe do Mapa (linha 451)
Substitua pela URL de embed do Google Maps do seu local

### 5. Números de Telefone

Atualize os números de telefone nos seguintes locais:

- Linha 312: WhatsApp para envio de comprovante
- Linha 321: Número exibido no botão

## 🚀 Executar o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📱 Funcionalidades

- ✅ Página responsiva (mobile e desktop)
- ✅ Formulário de inscrição
- ✅ Múltiplas categorias de inscrição
- ✅ Pagamento via PIX com QR Code
- ✅ Integração com Google Sheets (via SheetDB)
- ✅ Envio de comprovante via WhatsApp
- ✅ Compartilhamento no WhatsApp
- ✅ Mapa do local do evento

## 🎨 Personalização de Cores

As cores principais estão definidas no arquivo `src/index.css`:

```css
--bg-primary: #0a0a0a;       /* Fundo principal */
--bg-secondary: #1a1a1a;     /* Fundo secundário */
--bg-tertiary: #2a2a2a;      /* Fundo terciário */
--accent-orange: #ff6b35;     /* Cor de destaque */
--accent-gold: #ffd700;       /* Cor dourada */
```

## 📄 Estrutura do Projeto

```
encontro-com-deus/
├── public/
│   └── imagens/              # Imagens do evento
├── src/
│   ├── services/
│   │   └── googleSheets.ts   # Integração Google Sheets
│   ├── App.tsx               # Componente principal
│   ├── App.css               # Estilos principais
│   ├── index.css             # Estilos globais
│   └── main.tsx              # Entry point
├── index.html                # HTML principal
└── package.json              # Dependências
```

## 🔧 Tecnologias Utilizadas

- React 19
- TypeScript
- Vite
- QRCode.react
- SheetDB (para Google Sheets)

## 📝 Observações

- Os códigos PIX fornecidos são exemplos e devem ser substituídos pelos códigos reais
- Configure o Google Sheets antes de colocar em produção
- Teste todos os fluxos de inscrição antes do lançamento
- Verifique se as imagens estão otimizadas para web

---

**Desenvolvido para IEQ Campo 157 - Redenção/PA**
*Capital do Avivamento*

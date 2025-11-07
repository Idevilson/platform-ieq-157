# 📋 Configuração do Google Apps Script

Este guia te ajudará a configurar o Google Apps Script para receber os dados do formulário de inscrição diretamente no Google Sheets.

## 🎯 Passo a Passo

### 1. Criar a Planilha do Google Sheets

1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha
3. Nomeie a planilha como: **"Encontro com Deus - Inscrições"**

### 2. Configurar os Cabeçalhos da Planilha

Na primeira linha da planilha, adicione os seguintes cabeçalhos (na ordem):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Data/Hora | Igreja | Região | Nome | CPF | Cargo | Estado Civil | Idade | Rua | Número | Bairro | Cidade | Estado | CEP | Telefone | Categoria | Valor | Status Pagamento |

### 3. Abrir o Editor do Apps Script

1. Na planilha, clique em **Extensões** → **Apps Script**
2. Uma nova aba abrirá com o editor do Apps Script
3. Você verá um arquivo chamado `Code.gs` ou `Código.gs`

### 4. Colar o Código

1. **Delete todo o código** que está no editor
2. Abra o arquivo `google-apps-script.gs` (na raiz do projeto)
3. **Copie todo o conteúdo** do arquivo
4. **Cole no editor** do Apps Script
5. Clique no ícone de **disquete** 💾 para salvar (ou Ctrl+S)

### 5. Testar o Código (Opcional mas Recomendado)

1. No editor do Apps Script, selecione a função `testar` no menu dropdown
2. Clique no botão ▶️ **Executar**
3. Na primeira vez, será solicitado permissões:
   - Clique em **Analisar permissões**
   - Escolha sua conta do Google
   - Clique em **Avançado**
   - Clique em **Acessar [nome do projeto] (não seguro)**
   - Clique em **Permitir**
4. Verifique se uma linha de teste foi adicionada na planilha

### 6. Implantar como Aplicativo Web

1. No editor do Apps Script, clique em **Implantar** → **Nova implantação**
2. Clique no ícone de **engrenagem** ⚙️ ao lado de "Selecione o tipo"
3. Escolha **Aplicativo da Web**
4. Configure:
   - **Descrição**: "API de Inscrições Encontro com Deus"
   - **Executar como**: **Eu** (sua conta)
   - **Quem tem acesso**: **Qualquer pessoa**
5. Clique em **Implantar**
6. Clique em **Autorizar acesso** (se solicitado)
7. **Copie a URL** que aparece (ela termina com `.../exec`)

### 7. Configurar a URL no Projeto

1. Abra o arquivo `src/services/googleSheets.ts`
2. Localize a linha:
   ```typescript
   const APPS_SCRIPT_URL = "SUA_URL_DO_APPS_SCRIPT_AQUI";
   ```
3. Substitua `"SUA_URL_DO_APPS_SCRIPT_AQUI"` pela URL que você copiou
4. Exemplo:
   ```typescript
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx.../exec";
   ```
5. Salve o arquivo

## ✅ Pronto!

Agora quando alguém preencher o formulário no site, os dados serão enviados automaticamente para a planilha do Google Sheets!

## 🔍 Verificar se Está Funcionando

1. Preencha o formulário no site
2. Abra a planilha do Google Sheets
3. Verifique se uma nova linha foi adicionada com os dados

## 🔧 Solução de Problemas

### Os dados não aparecem na planilha?

1. Verifique se a URL do Apps Script está correta no arquivo `googleSheets.ts`
2. Verifique se você escolheu "Qualquer pessoa" em "Quem tem acesso"
3. Abra o Console do navegador (F12) e procure por erros
4. Verifique se executou a função `testar()` com sucesso

### Erro de permissões?

1. No Apps Script, vá em **Implantar** → **Gerenciar implantações**
2. Clique no ícone de lápis ✏️ (editar)
3. Crie uma **Nova versão**
4. Copie a nova URL gerada
5. Atualize a URL no arquivo `googleSheets.ts`

## 📊 Estrutura dos Dados

Os dados são salvos na seguinte ordem:

1. **Data/Hora** - Gerada automaticamente
2. **Igreja** - Nome da igreja
3. **Região** - Região da igreja
4. **Nome** - Nome completo do participante
5. **CPF** - CPF do participante (com validação)
6. **Cargo** - Cargo na igreja
7. **Estado Civil** - Solteiro, Casado, etc.
8. **Idade** - Idade do participante
9. **Rua** - Nome da rua
10. **Número** - Número da residência
11. **Bairro** - Bairro
12. **Cidade** - Cidade
13. **Estado** - Estado (UF)
14. **CEP** - CEP (opcional)
15. **Telefone** - Telefone de contato
16. **Categoria** - Trabalho ou Participação
17. **Valor** - R$ 100,00 ou R$ 150,00
18. **Status Pagamento** - Pendente (padrão)

## 🔒 Recursos de Segurança

### Validação de CPF
- O sistema valida automaticamente se o CPF é válido
- Impede inscrições duplicadas pelo mesmo CPF
- CPF é formatado automaticamente (000.000.000-00)

### Verificação de Duplicidade
O sistema verifica automaticamente se já existe inscrição com:
- **CPF** - Bloqueia se o CPF já estiver cadastrado
- **Telefone** - Avisa se o telefone já estiver em uso
- **Nome** - Consulta por nome completo

## 🎨 Dicas Extras

### Formatação Condicional

Você pode adicionar cores automáticas na planilha:

1. Selecione a coluna **Q** (Status Pagamento)
2. **Formatar** → **Formatação condicional**
3. Adicione regras:
   - Se o texto contém "Pendente" → Vermelho
   - Se o texto contém "Confirmado" → Verde
   - Se o texto contém "Cancelado" → Cinza

### Notificação por Email

Você pode adicionar esta função no Apps Script para receber email a cada nova inscrição:

```javascript
function enviarNotificacao(dados) {
  var destinatario = "seu-email@gmail.com";
  var assunto = "Nova Inscrição - Encontro com Deus";
  var mensagem = "Nova inscrição recebida!\n\n" +
                 "Nome: " + dados.nome + "\n" +
                 "Categoria: " + dados.categoria + "\n" +
                 "Valor: R$ " + dados.valor;

  MailApp.sendEmail(destinatario, assunto, mensagem);
}
```

E chame essa função dentro do `doPost()`:
```javascript
enviarNotificacao(dados);
```

---

**Pronto! Agora você tem um sistema completo de inscrições integrado com Google Sheets! 🎉**

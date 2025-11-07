// ===================================================================
// GOOGLE APPS SCRIPT PARA RECEBER DADOS DO FORMULÁRIO
// ===================================================================
// Este código deve ser colado no Google Apps Script da sua planilha
// ===================================================================

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var acao = e.parameter.acao;

    // Verificar se pessoa já está inscrita
    if (acao === "verificarInscricao") {
      var telefone = e.parameter.telefone;
      var nome = e.parameter.nome;
      var cpf = e.parameter.cpf;

      if (!telefone && !nome && !cpf) {
        return ContentService
          .createTextOutput(JSON.stringify({
            status: "error",
            message: "Telefone, nome ou CPF são obrigatórios"
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var dados = sheet.getDataRange().getValues();

      // Registra no log quantas linhas foram encontradas
      Logger.log("Total de linhas na planilha: " + dados.length);
      Logger.log("Buscando por - CPF: " + cpf + ", Telefone: " + telefone + ", Nome: " + nome);

      // Pula a primeira linha (cabeçalhos)
      for (var i = 1; i < dados.length; i++) {
        var cpfNaPlanilha = dados[i][4];       // Coluna E (CPF) - índice 4
        var telefoneNaPlanilha = dados[i][14]; // Coluna O (Telefone)
        var nomeNaPlanilha = dados[i][3];      // Coluna D (Nome) - índice 3

        // Remove formatação do CPF para comparação
        if (cpfNaPlanilha) {
          cpfNaPlanilha = cpfNaPlanilha.toString().replace(/\D/g, "");
        }

        Logger.log("Linha " + (i+1) + " - CPF: " + cpfNaPlanilha + ", Nome: " + nomeNaPlanilha);

        // Verifica por CPF, telefone OU nome
        if ((cpf && cpfNaPlanilha === cpf) ||
            (telefone && telefoneNaPlanilha === telefone) ||
            (nome && nomeNaPlanilha.toLowerCase() === nome.toLowerCase())) {
          Logger.log("ENCONTRADO! Linha " + (i+1));
          return ContentService
            .createTextOutput(JSON.stringify({
              status: "success",
              jaInscrito: true,
              dados: {
                nome: dados[i][3],      // Coluna D (Nome)
                telefone: dados[i][14],  // Coluna O (Telefone)
                categoria: dados[i][15], // Coluna P (Categoria)
                dataInscricao: dados[i][0] // Coluna A (Data/Hora)
              }
            }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }

      // Não encontrou inscrição
      Logger.log("Nenhuma inscrição duplicada encontrada");
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          jaInscrito: false
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "Ação não reconhecida"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // Obtém a planilha ativa
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse dos dados recebidos
    var dados = JSON.parse(e.postData.contents);

    // Cria a data e hora atual
    var dataHora = new Date();
    var dataFormatada = Utilities.formatDate(dataHora, "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss");

    // Monta a linha de dados na ordem das colunas da planilha
    var linha = [
      dataFormatada,              // Data/Hora (A)
      dados.igreja || "",         // Igreja (B)
      dados.regiao || "",         // Região (C)
      dados.nome || "",           // Nome (D)
      dados.cpf || "",            // CPF (E)
      dados.cargo || "",          // Cargo (F)
      dados.estadoCivil || "",    // Estado Civil (G)
      dados.idade || "",          // Idade (H)
      dados.rua || "",            // Rua (I)
      dados.numero || "",         // Número (J)
      dados.bairro || "",         // Bairro (K)
      dados.cidade || "",         // Cidade (L)
      dados.estado || "",         // Estado (M)
      dados.cep || "",            // CEP (N)
      dados.telefone || "",       // Telefone (O)
      dados.categoria || "",      // Categoria (P)
      "R$ " + dados.valor || "",  // Valor (Q)
      dados.statusPagamento || "" // Status Pagamento (R)
    ];

    // Adiciona a linha na planilha
    sheet.appendRow(linha);

    // Retorna sucesso
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Dados salvos com sucesso!" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Retorna erro
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Função de teste (opcional)
function testar() {
  var dadosTeste = {
    igreja: "IEQ Teste",
    regiao: "Região Teste",
    nome: "João Silva",
    cpf: "123.456.789-00",
    cargo: "Membro",
    estadoCivil: "Solteiro(a)",
    idade: "25",
    rua: "Rua Teste",
    numero: "123",
    bairro: "Centro",
    cidade: "Redenção",
    estado: "PA",
    cep: "68550-000",
    telefone: "(94) 99999-9999",
    categoria: "Inscrição de Participação",
    valor: 150,
    statusPagamento: "Pendente"
  };

  var e = {
    postData: {
      contents: JSON.stringify(dadosTeste)
    }
  };

  var resultado = doPost(e);
  Logger.log(resultado.getContent());
}

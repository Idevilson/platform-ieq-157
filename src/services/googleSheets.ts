// Serviço para enviar dados para Google Sheets via Apps Script

interface DadosInscricao {
  igreja: string;
  regiao: string;
  nome: string;
  cpf: string;
  cargo: string;
  estadoCivil: string;
  idade: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  categoria: string;
  valor: number;
  statusPagamento: string;
}

// ===================================================================
// CONFIGURAÇÃO DO GOOGLE APPS SCRIPT
// ===================================================================
// 1. Acesse sua planilha do Google Sheets
// 2. Clique em "Extensões" > "Apps Script"
// 3. Copie o código do arquivo google-apps-script.gs (na raiz do projeto)
// 4. Cole no editor do Apps Script
// 5. Clique em "Implantar" > "Nova implantação"
// 6. Escolha "Aplicativo da Web"
// 7. Em "Executar como": escolha sua conta
// 8. Em "Quem tem acesso": escolha "Qualquer pessoa"
// 9. Clique em "Implantar"
// 10. Copie a URL gerada e cole abaixo
//
// Exemplo: https://script.google.com/macros/s/ABC123.../exec
// ===================================================================

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby3a2EGi6vQKp8P0ORKwFtcchviKytLXMlRExDXisgFOFgbES850cELtJg-oV9uzf-P/exec";

export async function verificarInscricao(
  telefone?: string,
  nome?: string,
  cpf?: string,
): Promise<{
  jaInscrito: boolean;
  dados?: {
    nome: string;
    telefone: string;
    categoria: string;
    dataInscricao: string;
  };
}> {
  try {
    const params = new URLSearchParams();
    params.append("acao", "verificarInscricao");
    if (telefone) params.append("telefone", telefone);
    if (nome) params.append("nome", nome);
    if (cpf) params.append("cpf", cpf);

    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, {
      method: "GET",
    });

    const resultado = await response.json();

    if (resultado.status === "success") {
      return {
        jaInscrito: resultado.jaInscrito,
        dados: resultado.dados,
      };
    }

    return { jaInscrito: false };
  } catch (error) {
    console.error("❌ Erro ao verificar inscrição:", error);
    return { jaInscrito: false };
  }
}

export async function enviarParaGoogleSheets(
  dados: DadosInscricao,
): Promise<boolean> {
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Necessário para Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    // No modo 'no-cors', não conseguimos ler a resposta
    // Mas o envio será bem-sucedido se não houver erro
    console.log("✅ Dados enviados para Google Sheets!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar dados para Google Sheets:", error);
    return false;
  }
}

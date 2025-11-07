import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { enviarParaGoogleSheets, verificarInscricao } from "../services/googleSheets";
import "../styles/EncontroComDeus.css";
import cruzImg from "../imagens/cruz.png";
import pombaImg from "../imagens/pomba.png";
import caliceImg from "../imagens/calice.png";
import coroaImg from "../imagens/coroa.png";
import logoIEQ from "../imagens/logoIEQ.png";
import onlyLogo from "../imagens/only-logo.png";
import pastoresImg from "../imagens/pr-heitor-e-pra-val.png";

function EncontroComDeus() {
  const [categoriaInscricao, setCategoriaInscricao] = useState<number | null>(
    null,
  );
  const formularioRef = useRef<HTMLDivElement>(null);
  const pagamentoRef = useRef<HTMLDivElement>(null);
  const [mostrarPagamento, setMostrarPagamento] = useState(false);
  const [dadosInscricao, setDadosInscricao] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    mensagem: string;
    tipo: "erro" | "sucesso";
  } | null>(null);
  const [formData, setFormData] = useState({
    igreja: "",
    regiao: "",
    nome: "",
    cpf: "",
    cargo: "",
    estadoCivil: "",
    idade: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    telefone: "",
  });

  const mostrarToast = (
    mensagem: string,
    tipo: "erro" | "sucesso" = "erro",
  ) => {
    setToast({ mensagem, tipo });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Scroll suave para o formulário quando categoria for selecionada
  useEffect(() => {
    if (categoriaInscricao && formularioRef.current) {
      setTimeout(() => {
        formularioRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [categoriaInscricao]);

  // Scroll suave para a tela de pagamento quando for exibida
  useEffect(() => {
    if (mostrarPagamento && pagamentoRef.current) {
      setTimeout(() => {
        pagamentoRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [mostrarPagamento]);

  // Validação de CPF
  const validarCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, "");

    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;

    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  // Formatar CPF enquanto digita
  const formatarCPF = (valor: string): string => {
    valor = valor.replace(/\D/g, "");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return valor;
  };

  const obterCodigoPix = () => {
    // Código PIX único para todos os valores
    return "00020126470014BR.GOV.BCB.PIX0125hg.alexandre157@gmail.com5204000053039865802BR5925HEITOR ALEXANDRE DA SILVA6008REDENCAO622505217sFMwNkqe2pi2iwCwXccb63042D14";
  };

  const categorias = [
    {
      id: 1,
      nome: "Inscrição de Trabalho no Evento",
      valor: 100,
      descricao: "Para colaboradores e voluntários do evento",
      beneficios: [
        "Participação em todas as atividades espirituais",
        "Função específica de serviço durante o evento",
        "Experiência de servir no Reino de Deus",
        "Treinamento e capacitação para sua área",
        "Comunhão com a equipe de trabalho",
        "Momentos de ministração entre as atividades",
        "Alimentação completa (café, almoço e jantar)",
        "Hospedagem durante todo o evento",
      ],
    },
    {
      id: 2,
      nome: "Inscrição de Participação",
      valor: 180,
      descricao: "Para participantes que desejam vivenciar o encontro",
      beneficios: [
        "Acesso completo a todas as ministrações e pregações",
        "Participação em momentos de oração e louvor",
        "Momentos de adoração e intimidade com Deus",
        "Participação em dinâmicas e atividades espirituais",
        "Tempo de reflexão e meditação na Palavra",
        "Ministração individual e coletiva",
        "Alimentação completa (café, almoço e jantar)",
        "Hospedagem durante todo o evento",
      ],
    },
  ];

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    let valorFinal = value;

    // Formatar CPF enquanto digita
    if (name === "cpf") {
      valorFinal = formatarCPF(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: valorFinal,
    }));

    // Verificar se já existe inscrição quando o telefone for preenchido (mínimo 10 caracteres)
    if (name === "telefone" && value.length >= 10) {
      const resultado = await verificarInscricao(value);
      if (resultado.jaInscrito && resultado.dados) {
        mostrarToast(
          `${resultado.dados.nome} já está inscrito(a) na categoria "${resultado.dados.categoria}"!`,
          "erro"
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Impedir múltiplos envios
    if (loading) return;

    setLoading(true);

    try {
      // Validação básica
    if (
      !formData.igreja ||
      !formData.regiao ||
      !formData.nome ||
      !formData.cpf ||
      !formData.cargo ||
      !formData.estadoCivil ||
      !formData.idade ||
      !formData.rua ||
      !formData.numero ||
      !formData.bairro ||
      !formData.cidade ||
      !formData.estado ||
      !formData.telefone
    ) {
        mostrarToast("Por favor, preencha todos os campos obrigatórios", "erro");
        setLoading(false);
        return;
      }

      // Validação de CPF
      if (!validarCPF(formData.cpf)) {
        mostrarToast("CPF inválido! Por favor, verifique o número digitado.", "erro");
        setLoading(false);
        return;
      }

      // Verificar se CPF já está cadastrado
      const cpfLimpo = formData.cpf.replace(/\D/g, "");

      console.log("🔍 Verificando CPF:", cpfLimpo);
      const verificacaoCPF = await verificarInscricao(undefined, undefined, cpfLimpo);
      console.log("📋 Resultado da verificação:", verificacaoCPF);

      if (verificacaoCPF.jaInscrito && verificacaoCPF.dados) {
        mostrarToast(
          `Este CPF já está cadastrado! Inscrição de ${verificacaoCPF.dados.nome} na categoria "${verificacaoCPF.dados.categoria}".`,
          "erro"
        );
        setLoading(false);
        return;
      }

      // Salvar dados da inscrição
      const categoria = categorias.find((c) => c.id === categoriaInscricao);
      const dadosCompletos = {
        ...formData,
        categoria: categoria?.nome || "",
        valor: categoria?.valor || 0,
        statusPagamento: "Pendente",
      };

      console.log("📤 Enviando dados para Google Sheets...");

      // Enviar dados para Google Sheets
      const sucesso = await enviarParaGoogleSheets({
        ...formData,
        categoria: categoria?.nome || "",
        valor: categoria?.valor || 0,
        statusPagamento: "Pendente",
      });

      if (!sucesso) {
        mostrarToast("Erro ao enviar dados. Tente novamente.", "erro");
        setLoading(false);
        return;
      }

      console.log("✅ Dados enviados com sucesso!");

      setDadosInscricao(dadosCompletos);

      // Mostrar tela de pagamento
      setMostrarPagamento(true);
    } catch (error) {
      console.error("Erro ao processar inscrição:", error);
      mostrarToast("Erro ao processar inscrição. Tente novamente.", "erro");
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigoPix = (codigoPix: string) => {
    navigator.clipboard.writeText(codigoPix);
    mostrarToast("Código PIX copiado para a área de transferência!", "sucesso");
  };

  const voltarParaInscricoes = () => {
    setMostrarPagamento(false);
    setDadosInscricao(null);
    setFormData({
      igreja: "",
      regiao: "",
      nome: "",
      cpf: "",
      cargo: "",
      estadoCivil: "",
      idade: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      telefone: "",
    });
    setCategoriaInscricao(null);
  };

  const voltarParaPaginaInicial = () => {
    setMostrarPagamento(false);
    setDadosInscricao(null);
  };

  const compartilharNoWhatsApp = () => {
    const textoCompartilhamento = `✨ *ENCONTRO COM DEUS* ✨

🙏 *IEQ Sede Campo 157 - Redenção/PA*
🏛️ *Capital do Avivamento*

━━━━━━━━━━━━━━━━━━━

Venha viver uma experiência transformadora de encontro com o Senhor! Um momento especial de renovação espiritual, adoração e ministração da Palavra.

🔥 *O que te espera:*
• Ministrações poderosas
• Momentos de oração e louvor
• Comunhão e edificação
• Experiência única com Deus

━━━━━━━━━━━━━━━━━━━

💰 *Inscrições Abertas:*

📋 *Trabalho no Evento* - R$ 100,00
   → Sirva no Reino e participe das atividades

🎯 *Participação* - R$ 180,00
   → Vivência completa do encontro

━━━━━━━━━━━━━━━━━━━

📲 *Entre em contato:*
(94) 99144-1198

*"Porque onde estiverem dois ou três reunidos em meu nome, ali estou eu no meio deles."*
_Mateus 18:20_

🙌 Não perca essa oportunidade!`;

    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(textoCompartilhamento)}`;
    window.open(urlWhatsApp, "_blank");
  };

  // Se mostrar pagamento, exibir tela de pagamento PIX
  if (mostrarPagamento && dadosInscricao) {
    return (
      <div className="evento-container">
        <header className="evento-header">
          <div className="simbolos-container">
            <img src={cruzImg} alt="Cruz - Jesus Salvador que salva do pecado" className="simbolo" />
            <img src={pombaImg} alt="Pomba - Jesus Batizador no Espírito Santo" className="simbolo" />
            <img src={caliceImg} alt="Cálice - Jesus Curador que restaura corpo e alma" className="simbolo" />
            <img src={coroaImg} alt="Coroa - Jesus Rei Vindouro" className="simbolo" />
          </div>
          <div className="header-content">
            <div className="tema-evento">
              <h2>IEQ SEDE CAMPO 157</h2>
            </div>
            <h1>ENCONTRO COM DEUS</h1>
            <p className="subtema">REDENÇÃO - PA CAPITAL DO AVIVAMENTO</p>
          </div>
        </header>

        <main className="evento-main">
          <section className="pagamento-section">
            <div className="pagamento-container">
              <h2>Pagamento via PIX</h2>

              <div className="pagamento-sucesso" ref={pagamentoRef}>
                <span className="icone-sucesso">✓</span>
                <p>Inscrição recebida com sucesso!</p>
              </div>

              <div className="dados-inscricao">
                <h3>Dados da Inscrição</h3>
                <p>
                  <strong>Nome:</strong> {dadosInscricao.nome}
                </p>
                <p>
                  <strong>Telefone:</strong> {dadosInscricao.telefone}
                </p>
                <p>
                  <strong>Cidade:</strong> {dadosInscricao.cidade}
                </p>
                <p>
                  <strong>Igreja:</strong> {dadosInscricao.igreja}
                </p>
                <p>
                  <strong>Pastor:</strong> {dadosInscricao.pastor}
                </p>
                <p>
                  <strong>Categoria:</strong> {dadosInscricao.categoria}
                </p>
                <p className="valor-destaque">
                  <strong>Valor:</strong> R$ {dadosInscricao.valor}
                </p>
              </div>

              <div className="instrucoes-pagamento">
                <h3>Instruções</h3>
                <ol>
                  <li>Escaneie o QR Code ou copie o código PIX</li>
                  <li>Abra o aplicativo do seu banco</li>
                  <li>
                    Escolha a opção PIX e cole o código ou escaneie o QR Code
                  </li>
                  <li>Confirme o pagamento de R$ {dadosInscricao.valor}</li>
                  <li>
                    <strong>
                      Após o pagamento, envie o comprovante para o WhatsApp
                    </strong>
                  </li>
                </ol>
              </div>

              <div className="qrcode-container">
                <h3>Escaneie o QR Code para pagar</h3>
                <div className="qrcode-box">
                  <QRCodeSVG
                    value={obterCodigoPix()}
                    size={256}
                    style={{ width: '100%', height: 'auto', maxWidth: '256px' }}
                  />
                </div>
                <p className="instrucao">
                  Abra o app do seu banco e escaneie o QR Code acima
                </p>
              </div>

              <div className="codigo-pix-container">
                <h3>Ou copie o código PIX</h3>
                <div className="codigo-pix-box">
                  <input
                    type="text"
                    value={obterCodigoPix()}
                    readOnly
                    className="codigo-pix-input"
                  />
                  <button
                    onClick={() =>
                      copiarCodigoPix(obterCodigoPix())
                    }
                    className="btn-copiar"
                  >
                    Copiar Código
                  </button>
                </div>
              </div>

              <div className="comprovante-whatsapp">
                <div className="comprovante-header">
                  <span className="comprovante-icon">📱</span>
                  <h3>Envie seu Comprovante</h3>
                </div>
                <p className="comprovante-texto">
                  Após realizar o pagamento, envie o comprovante para confirmar
                  sua inscrição:
                </p>
                <a
                  href={`https://wa.me/5594991441198?text=${encodeURIComponent(
                    `Olá! Segue o comprovante do pagamento da inscrição do Encontro com Deus.\n\nNome: ${dadosInscricao.nome}\nCategoria: ${dadosInscricao.categoria}\nValor: R$ ${dadosInscricao.valor}\n\nAguardo confirmação!`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-enviar-comprovante"
                >
                  <span className="whatsapp-icon">💬</span>
                  Enviar Comprovante via WhatsApp
                  <span className="numero-whatsapp">(94) 99144-1198</span>
                </a>
              </div>

              <div className="botoes-acoes">
                <button
                  onClick={voltarParaPaginaInicial}
                  className="btn-voltar-inicio"
                >
                  Voltar para o Evento
                </button>
                <button
                  onClick={compartilharNoWhatsApp}
                  className="btn-compartilhar"
                >
                  <span className="whatsapp-icon">📱</span>
                  Compartilhar no WhatsApp
                </button>
                <button
                  onClick={voltarParaInscricoes}
                  className="btn-nova-inscricao"
                >
                  Fazer Nova Inscrição
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="evento-footer">
          <img
            src={logoIEQ}
            alt="Logo Igreja do Evangelho Quadrangular Redenção-PA Campo 157"
            className="logo-ieq-footer"
          />
          <p>Igreja Do Evangelho Quadrangular</p>
          <p className="footer-campo">Campo 157 - Redenção - PA</p>
          <p className="footer-slogan">Capital do Avivamento</p>
        </footer>

        {toast && (
          <div className={`toast toast-${toast.tipo}`}>
            <div className="toast-icon">
              {toast.tipo === "erro" ? "⚠️" : "✓"}
            </div>
            <p>{toast.mensagem}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="evento-container">
      <header className="evento-header">
        <div className="simbolos-container">
          <img src={cruzImg} alt="Cruz - Jesus Salvador que salva do pecado" className="simbolo" />
          <img src={pombaImg} alt="Pomba - Jesus Batizador no Espírito Santo" className="simbolo" />
          <img src={caliceImg} alt="Cálice - Jesus Curador que restaura corpo e alma" className="simbolo" />
          <img src={coroaImg} alt="Coroa - Jesus Rei Vindouro" className="simbolo" />
        </div>
        <div className="header-content">
          <div className="tema-evento">
            <h2>IEQ SEDE CAMPO 157</h2>
          </div>
          <h1>ENCONTRO COM DEUS</h1>
          <p className="subtema">REDENÇÃO - PA CAPITAL DO AVIVAMENTO</p>
        </div>
      </header>

      <main className="evento-main">
        <section className="sobre-section">
          <h2>O Que é o Encontro com Deus?</h2>
          <div className="sobre-container">
            <div className="sobre-intro">
              <p>
                O <strong>Encontro com Deus</strong> é um retiro espiritual intensivo promovido pela Igreja do Evangelho Quadrangular,
                uma experiência transformadora que ajuda os participantes a aprofundarem o relacionamento pessoal com Deus,
                longe das rotinas diárias, por meio de imersão em oração, louvor e ensino bíblico.
              </p>
            </div>

            <div className="beneficios-grid">
              <div className="beneficio-card">
                <div className="beneficio-icon">✝️</div>
                <h3>Renovação Espiritual</h3>
                <p>Reflexão profunda sobre pecados, perdão e restauração da alma através da Palavra de Deus.</p>
              </div>

              <div className="beneficio-card">
                <div className="beneficio-icon">🌱</div>
                <h3>Crescimento Pessoal</h3>
                <p>Meditação nas verdades do Evangelho, inspirado no exemplo de Jesus buscando lugares solitários para orar.</p>
              </div>

              <div className="beneficio-card">
                <div className="beneficio-icon">🤝</div>
                <h3>Comunidade e Discipulado</h3>
                <p>Fortalecer laços entre participantes e incentivar o serviço na igreja local.</p>
              </div>

              <div className="beneficio-card">
                <div className="beneficio-icon">🔥</div>
                <h3>Experiência Carismática</h3>
                <p>Momentos de batismo no Espírito Santo, curas e profecias, comuns no pentecostalismo quadrangular.</p>
              </div>
            </div>

            <div className="evangelho-quadrangular">
              <h3>O Evangelho Quadrangular</h3>
              <div className="pilares-grid">
                <div className="pilar">
                  <div className="pilar-icon">
                    <img src={cruzImg} alt="Cruz representando Jesus Salvador" className="pilar-img" />
                  </div>
                  <h4>Jesus Salvador</h4>
                  <p>Que salva do pecado</p>
                </div>
                <div className="pilar">
                  <div className="pilar-icon">
                    <img src={pombaImg} alt="Pomba representando o Espírito Santo" className="pilar-img" />
                  </div>
                  <h4>Batizador no Espírito Santo</h4>
                  <p>Que empodera os crentes</p>
                </div>
                <div className="pilar">
                  <div className="pilar-icon">
                    <img src={caliceImg} alt="Cálice representando Jesus Curador" className="pilar-img" />
                  </div>
                  <h4>Jesus Curador</h4>
                  <p>Que restaura corpo e alma</p>
                </div>
                <div className="pilar">
                  <div className="pilar-icon">
                    <img src={coroaImg} alt="Coroa representando Jesus Rei Vindouro" className="pilar-img" />
                  </div>
                  <h4>Rei Vindouro</h4>
                  <p>Que promete retorno</p>
                </div>
              </div>
            </div>

            <div className="transformacao-box">
              <h3>Uma Jornada de Transformação</h3>
              <p>
                Muitos participantes relatam <strong>transformações duradouras</strong>, como superação de vícios,
                reconciliações familiares e maior compromisso com a fé. É uma oportunidade única de escapar das
                distrações do mundo e se reconectar com o divino.
              </p>
              <blockquote>
                "Jesus é o mesmo ontem, hoje e para sempre" - Hebreus 13:8
              </blockquote>
            </div>
          </div>
        </section>

        <section className="oque-levar-section">
          <h2>O Que Devo Levar?</h2>

          <div className="levar-container">
            <div className="levar-box levar-sim">
              <div className="levar-header">
                <span className="levar-icon">✅</span>
                <h3>O QUE DEVO LEVAR!</h3>
              </div>
              <div className="levar-content">
                <div className="item-destaque">
                  <strong>COLCHÃO OU REDE,</strong> Chinelo, roupas leves, sapatos confortáveis, lençóis, toalha, material de higiene pessoal, <strong>bíblia, caderno para anotações, canetas,</strong> talher, prato, copo para café e uma garrafinha para água.
                </div>
              </div>
            </div>

            <div className="levar-box levar-nao">
              <div className="levar-header">
                <span className="levar-icon">⛔</span>
                <h3>O QUE NÃO DEVO LEVAR!</h3>
              </div>
              <div className="levar-content">
                <div className="item-destaque">
                  <strong>Celular,</strong> Livros, revistas, alimentos, trabalhos ou tarefas escolares, ou qualquer outra coisa que tire sua atenção no encontro.
                </div>
                <div className="aviso-importante">
                  <span className="aviso-icon">⚠️</span>
                  <strong>NÃO QUEBRE NENHUMA DESTAS REGRAS!</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="datas-section">
          <div className="datas-container">
            <div className="datas-icon">📅</div>
            <div className="datas-content">
              <h2>Data do Evento</h2>
              <p className="datas-periodo">28 a 30 de Novembro de 2025</p>
              <p className="datas-local">IEQ Sede - Redenção/PA</p>
            </div>
          </div>
        </section>

        <section className="organizadores-section">
          <h2>Organizadores</h2>
          <div className="organizadores-container">
            <div className="organizadores-content">
              <div className="logo-organizadores">
                <img src={onlyLogo} alt="Logo da Igreja do Evangelho Quadrangular com os quatro símbolos: Cruz, Pomba, Cálice e Coroa" className="logo-simbolos" />
              </div>
              <div className="pastores-organizadores">
                <img src={pastoresImg} alt="Pastor Heitor Alexandre Diretor do Campo 157 e Pastora Val Nery Coordenadora de Células - Organizadores do Encontro com Deus 2025" className="foto-pastores" />
                <div className="texto-organizadores">
                  <p className="nome-pastor"><strong>Pr. Heitor Alexandre</strong></p>
                  <p className="cargo-pastor">Diretor do Campo 157</p>
                  <p className="nome-pastor"><strong>Pra. Val Nery</strong></p>
                  <p className="cargo-pastor">Ministra do Evangelho e Coordenadora de Células</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="local-section">
          <h2>Local de Partida do Evento</h2>
          <div className="local-container">
            <div className="local-info">
              <div className="endereco-card">
                <div className="endereco-header">
                  <span className="endereco-icon">🗺️</span>
                  <h3>Local de Partida</h3>
                </div>
                <div className="endereco-detalhes">
                  <div className="endereco-linha">
                    <span className="linha-label">Rua:</span>
                    <span className="linha-valor">Caiapós</span>
                  </div>
                  <div className="endereco-linha">
                    <span className="linha-label">Bairro:</span>
                    <span className="linha-valor">Morada da Paz</span>
                  </div>
                  <div className="endereco-linha">
                    <span className="linha-label">Cidade:</span>
                    <span className="linha-valor">Redenção - PA</span>
                  </div>
                  <div className="endereco-linha">
                    <span className="linha-label">CEP:</span>
                    <span className="linha-valor">68550-480</span>
                  </div>
                </div>
              </div>
              <a
                href="https://www.google.com/maps/place/Ieq+Sede/@-8.0395146,-50.0262441,14z/data=!4m6!3m5!1s0x92e007fc571e9ebf:0x57bd15154cabeebd!8m2!3d-8.0395146!4d-50.0262441!16s%2Fg%2F11b76lbt61?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-maps"
              >
                <span className="maps-icon">🗺️</span>
                Ver no Google Maps
              </a>
            </div>
            <div className="mapa-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.5!2d-50.0262441!3d-8.0395146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x92e007fc571e9ebf%3A0x57bd15154cabeebd!2sIeq%20Sede!5e0!3m2!1spt-BR!2sbr!4v1700000000000"
                width="100%"
                style={{ border: 0, borderRadius: "12px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização do Evento"
              ></iframe>
            </div>
          </div>
        </section>

        <section className="inscricoes-section" id="inscricoes">
          <h2>Inscrições</h2>

          <div className="instrucao-selecao">
            <p>👇 Escolha o tipo de inscrição que melhor se adequa a você:</p>
          </div>

          <div className="categorias-grid">
            {categorias.map((categoria) => (
              <div
                key={categoria.id}
                className={`categoria-card ${categoriaInscricao === categoria.id ? "selecionada" : ""}`}
                onClick={() => setCategoriaInscricao(categoria.id)}
              >
                <h3>{categoria.nome}</h3>
                <div className="preco">
                  <span className="valor">R$ {categoria.valor}</span>
                </div>
                <p className="descricao">{categoria.descricao}</p>
                <ul className="beneficios-lista">
                  {categoria.beneficios.map((beneficio, index) => (
                    <li key={index}>{beneficio}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {categoriaInscricao && (
            <div className="formulario-inscricao" ref={formularioRef}>
              <h3>
                Dados de Inscrição para {categoriaInscricao === 1 ? "Trabalho" : "Participação"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="igreja">Igreja *</label>
                  <input
                    type="text"
                    id="igreja"
                    name="igreja"
                    value={formData.igreja}
                    onChange={handleInputChange}
                    required
                    placeholder="Nome da sua igreja"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="regiao">Região *</label>
                  <input
                    type="text"
                    id="regiao"
                    name="regiao"
                    value={formData.regiao}
                    onChange={handleInputChange}
                    required
                    placeholder="Região da igreja"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nome">Nome Completo *</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cpf">CPF *</label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    required
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cargo">Cargo *</label>
                  <input
                    type="text"
                    id="cargo"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    required
                    placeholder="Seu cargo na igreja"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="estadoCivil">Estado Civil *</label>
                    <select
                      id="estadoCivil"
                      name="estadoCivil"
                      value={formData.estadoCivil}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="idade">Idade *</label>
                    <input
                      type="number"
                      id="idade"
                      name="idade"
                      value={formData.idade}
                      onChange={handleInputChange}
                      required
                      placeholder="Sua idade"
                      min="1"
                      max="120"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="rua">Rua *</label>
                  <input
                    type="text"
                    id="rua"
                    name="rua"
                    value={formData.rua}
                    onChange={handleInputChange}
                    required
                    placeholder="Nome da rua"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="numero">Número *</label>
                    <input
                      type="text"
                      id="numero"
                      name="numero"
                      value={formData.numero}
                      onChange={handleInputChange}
                      required
                      placeholder="Nº"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bairro">Bairro *</label>
                    <input
                      type="text"
                      id="bairro"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleInputChange}
                      required
                      placeholder="Seu bairro"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cidade">Cidade *</label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      required
                      placeholder="Sua cidade"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="estado">Estado *</label>
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">UF</option>
                      <option value="AC">AC</option>
                      <option value="AL">AL</option>
                      <option value="AP">AP</option>
                      <option value="AM">AM</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="DF">DF</option>
                      <option value="ES">ES</option>
                      <option value="GO">GO</option>
                      <option value="MA">MA</option>
                      <option value="MT">MT</option>
                      <option value="MS">MS</option>
                      <option value="MG">MG</option>
                      <option value="PA">PA</option>
                      <option value="PB">PB</option>
                      <option value="PR">PR</option>
                      <option value="PE">PE</option>
                      <option value="PI">PI</option>
                      <option value="RJ">RJ</option>
                      <option value="RN">RN</option>
                      <option value="RS">RS</option>
                      <option value="RO">RO</option>
                      <option value="RR">RR</option>
                      <option value="SC">SC</option>
                      <option value="SP">SP</option>
                      <option value="SE">SE</option>
                      <option value="TO">TO</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="cep">CEP</label>
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleInputChange}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="telefone">Telefone *</label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    required
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="form-resumo">
                  <p>
                    <strong>Categoria:</strong>{" "}
                    {categorias.find((c) => c.id === categoriaInscricao)?.nome}
                  </p>
                  <p>
                    <strong>Valor:</strong> R${" "}
                    {categorias.find((c) => c.id === categoriaInscricao)?.valor}
                  </p>
                </div>

                <button type="submit" className="btn-inscrever" disabled={loading}>
                  {loading ? "Processando..." : "Finalizar Inscrição"}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>

      <footer className="evento-footer">
        <img
          src={logoIEQ}
          alt="Logo Igreja do Evangelho Quadrangular Redenção-PA Campo 157"
          className="logo-ieq-footer"
        />
        <p>Igreja Do Evangelho Quadrangular</p>
        <p className="footer-campo">Campo 157 - Redenção - PA</p>
        <p className="footer-slogan">Capital do Avivamento</p>
      </footer>

      {toast && (
        <div className={`toast toast-${toast.tipo}`}>
          <div className="toast-icon">{toast.tipo === "erro" ? "⚠️" : "✓"}</div>
          <p>{toast.mensagem}</p>
        </div>
      )}
    </div>
  );
}

export default EncontroComDeus;

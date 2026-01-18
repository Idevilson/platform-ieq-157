export interface CategoriaEvento {
  id: string;
  nome: string;
  valor: number;
  descricao: string;
  beneficios: string[];
}

export interface Evento {
  id: string;
  titulo: string;
  subtitulo?: string;
  dataInicio: string;
  dataFim?: string;
  local: string;
  endereco: string;
  descricao: string;
  descricaoCompleta?: string;
  imagem?: string;
  status: 'aberto' | 'encerrado' | 'em_breve';
  categorias?: CategoriaEvento[];
  temInscricao: boolean;
  googleMapsUrl?: string;
  whatsappContato?: string;
}

export const eventos: Evento[] = [
  {
    id: 'startup',
    titulo: 'STARTUP',
    subtitulo: 'A Uncao dos Quatro Seres',
    dataInicio: '2026-01-30',
    dataFim: '2026-02-01',
    local: 'IEQ 157',
    endereco: 'Redencao - PA',
    descricao: 'Uma experiencia espiritual baseada na visao de Ezequiel sobre os quatro seres viventes. Receba a uncao da sabedoria, autoridade, forca e visao.',
    descricaoCompleta: `Quando o profeta Ezequiel contempla a gloria de Deus, ele ve quatro seres viventes, cada um com quatro rostos: homem, leao, boi e aguia.

Esses rostos representam aspectos da atuacao divina e, profeticamente, apontam para dimensoes espirituais que o Senhor deseja derramar sobre Sua igreja e sobre Seus servos.

Neste evento, meditaremos sobre as quatro uncoes representadas por esses rostos:
- A Uncao de Sabedoria (Rosto de Homem)
- A Uncao do Rei (Rosto de Leao)
- A Uncao da Forca (Rosto de Boi)
- A Uncao da Visao (Rosto de Aguia)

"A forma de seus rostos era como o de homem; a direita, os quatro tinham rosto de leao; a esquerda, rosto de boi; e tambem rosto de aguia, todos os quatro." - Ezequiel 1:10`,
    status: 'aberto',
    temInscricao: true,
    googleMapsUrl: 'https://maps.google.com',
    whatsappContato: '5594991441198',
    categorias: [
      {
        id: 'inscricao-individual',
        nome: 'Inscrição Individual',
        valor: 50,
        descricao: 'Participação completa no evento',
        beneficios: [
          'Acesso aos 3 dias de evento',
          'Material de apoio',
          'Certificado de participação',
          'Coffee break incluso'
        ]
      }
    ]
  },
  {
    id: 'encontro-com-deus',
    titulo: 'Encontro com Deus',
    subtitulo: 'Um momento de transformacao e renovacao espiritual',
    dataInicio: '2025-11-28',
    dataFim: '2025-11-30',
    local: 'Local do Evento',
    endereco: 'Redencao - PA',
    descricao: 'O Encontro com Deus e um retiro espiritual transformador, onde voce tera a oportunidade de viver uma experiencia profunda com o Senhor.',
    descricaoCompleta: `O Encontro com Deus e um retiro espiritual transformador da Igreja do Evangelho Quadrangular. Durante 3 dias, voce tera a oportunidade de viver uma experiencia profunda com o Senhor, atraves de momentos de louvor, adoracao, ministracao da Palavra e oracoes individuais.

Este evento e baseado nos quatro pilares do Evangelho Quadrangular:
- Jesus Salva (simbolizado pela Cruz)
- Jesus Batiza com o Espirito Santo (simbolizado pela Pomba)
- Jesus Cura (simbolizado pelo Calice)
- Jesus Voltara (simbolizado pela Coroa)`,
    status: 'encerrado',
    temInscricao: false,
    googleMapsUrl: 'https://maps.google.com',
    whatsappContato: '5594999999999',
    categorias: [
      {
        id: 'trabalho',
        nome: 'Inscricao de Trabalho no Evento',
        valor: 100,
        descricao: 'Para colaboradores e voluntarios do evento',
        beneficios: [
          'Funcoes especificas durante o evento',
          'Treinamento previo',
          'Alimentacao inclusa',
          'Hospedagem inclusa'
        ]
      },
      {
        id: 'participacao',
        nome: 'Inscricao de Participacao',
        valor: 180,
        descricao: 'Para participantes gerais do encontro',
        beneficios: [
          'Acesso completo ao evento',
          'Momentos de louvor e adoracao',
          'Ministracao individual',
          'Alimentacao inclusa',
          'Hospedagem inclusa'
        ]
      }
    ]
  },
  {
    id: 'congresso-jovem',
    titulo: 'Congresso de Jovens 2026',
    subtitulo: 'Geracao que transforma',
    dataInicio: '2026-08-15',
    dataFim: '2026-08-17',
    local: 'IEQ 157',
    endereco: 'Redencao - PA',
    descricao: 'Um fim de semana intenso de louvor, pregacao e comunhao para a juventude.',
    status: 'em_breve',
    temInscricao: false
  },
  {
    id: 'conferencia-mulheres',
    titulo: 'Conferencia de Mulheres',
    subtitulo: 'Mulheres de Fe',
    dataInicio: '2026-05-10',
    local: 'IEQ 157',
    endereco: 'Redencao - PA',
    descricao: 'Uma conferencia especial para mulheres, com ministracao, louvor e momentos de edificacao.',
    status: 'em_breve',
    temInscricao: false
  }
];

export function getEventoById(id: string): Evento | undefined {
  return eventos.find(evento => evento.id === id);
}

export function getEventosAbertos(): Evento[] {
  return eventos.filter(evento => evento.status === 'aberto');
}

export function getProximoEvento(): Evento | undefined {
  const hoje = new Date();
  return eventos
    .filter(evento => new Date(evento.dataInicio) >= hoje)
    .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())[0];
}

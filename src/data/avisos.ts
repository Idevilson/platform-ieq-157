export interface Aviso {
  id: number;
  titulo: string;
  data: string;
  conteudo: string;
  resumo: string;
  categoria: 'geral' | 'culto' | 'evento' | 'urgente';
}

export const avisos: Aviso[] = [
  {
    id: 1,
    titulo: 'Inscricoes Abertas - Encontro com Deus 2025',
    data: '2025-01-15',
    categoria: 'evento',
    resumo: 'As inscricoes para o Encontro com Deus 2025 estao oficialmente abertas!',
    conteudo: `As inscricoes para o Encontro com Deus 2025 estao oficialmente abertas!

O evento acontecera nos dias 28 a 30 de Novembro de 2025.

Temos duas categorias de inscricao:
- Inscricao de Trabalho: R$ 100,00
- Inscricao de Participacao: R$ 180,00

Faca sua inscricao atraves do nosso site ou procure a secretaria da igreja.

Nao perca essa oportunidade de viver um encontro transformador com Deus!`
  },
  {
    id: 2,
    titulo: 'Alteracao no Horario do Culto de Quarta',
    data: '2025-01-10',
    categoria: 'culto',
    resumo: 'A partir de janeiro, o culto de quarta-feira sera as 19h30.',
    conteudo: `Informamos a todos os membros e visitantes que, a partir deste mes, o culto de quarta-feira passara a ser realizado as 19h30 (anteriormente as 19h).

A mudanca visa melhor atender a todos que trabalham e precisam de mais tempo para chegar a igreja.

Contamos com a presenca de todos!

Deus abencoe.`
  },
  {
    id: 3,
    titulo: 'Campanha de Arrecadacao de Alimentos',
    data: '2025-01-05',
    categoria: 'geral',
    resumo: 'Participe da nossa campanha de arrecadacao de alimentos nao pereciveis.',
    conteudo: `Nossa igreja esta realizando uma campanha de arrecadacao de alimentos nao pereciveis para ajudar familias carentes da nossa comunidade.

Como participar:
- Traga alimentos nao pereciveis nos cultos
- Deixe na secretaria da igreja
- Periodo: Durante todo o mes de janeiro

Sugestoes de alimentos:
- Arroz, feijao, macarrao
- Oleo, acucar, sal
- Leite em po, cafe
- Enlatados em geral

"Quem se compadece do pobre empresta ao Senhor, e este lhe retribuira." - Proverbios 19:17`
  },
  {
    id: 4,
    titulo: 'Reuniao de Lideres',
    data: '2025-01-20',
    categoria: 'geral',
    resumo: 'Convocamos todos os lideres de departamento para reuniao importante.',
    conteudo: `Convocamos todos os lideres de departamento para uma reuniao importante no proximo sabado, dia 25 de janeiro, as 15h.

Pauta:
- Planejamento anual 2025
- Calendario de eventos
- Definicao de metas
- Organizacao dos departamentos

Local: Salao principal da igreja

A presenca de todos e indispensavel.`
  }
];

export function getAvisoById(id: number): Aviso | undefined {
  return avisos.find(aviso => aviso.id === id);
}

export function getUltimosAvisos(quantidade: number = 3): Aviso[] {
  return [...avisos]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, quantidade);
}

export function formatarData(dataString: string): string {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

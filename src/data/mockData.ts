// src/data/mockData.ts

import type { Process } from '../types'; // Importa a definição de 'Process'

// A palavra 'export' aqui é crucial. Ela permite que outros arquivos usem esta lista.
export const allProcesses: Process[] = [
  {
    id: '1',
    numero: '2024/001',
    objeto: 'Aquisição de Material de Escritório',
    secretaria: 'Secretaria de Administração',
    status: 'aguardando-documento',
    dataAbertura: '15/01/2024',
    prazoFinal: '28/01/2024',
    responsavel: 'Maria Silva Santos',
    valorEstimado: 'R$ 45.000,00',
    observacoes: 'Aguardando complementação da documentação técnica',
    timeline: [
      { data: '15/01/2024', evento: 'Processo Iniciado', responsavel: 'Sistema', detalhes: 'Processo criado no sistema' },
      { data: '16/01/2024', evento: 'Análise Inicial', responsavel: 'João Santos', detalhes: 'Documentação inicial aprovada' },
      { data: '18/01/2024', evento: 'Solicitação de Complementação', responsavel: 'Maria Silva', detalhes: 'Solicitada documentação adicional' }
    ]
  },
  {
    id: '2',
    numero: '2024/002',
    objeto: 'Contratação de Serviços de Limpeza',
    secretaria: 'Secretaria de Obras',
    status: 'publicado',
    dataAbertura: '10/01/2024',
    prazoFinal: '15/02/2024',
    responsavel: 'Carlos Roberto Lima',
    valorEstimado: 'R$ 120.000,00',
    observacoes: 'Edital publicado no diário oficial',
    timeline: [
      { data: '10/01/2024', evento: 'Processo Iniciado', responsavel: 'Sistema', detalhes: 'Processo criado no sistema' },
      { data: '12/01/2024', evento: 'Análise Aprovada', responsavel: 'Ana Costa', detalhes: 'Documentação completa aprovada' },
      { data: '20/01/2024', evento: 'Edital Publicado', responsavel: 'Carlos Lima', detalhes: 'Publicação no diário oficial' }
    ]
  },
  {
    id: '3',
    numero: '2024/003',
    objeto: 'Aquisição de Equipamentos de Informática',
    secretaria: 'Secretaria de Tecnologia',
    status: 'em-analise',
    dataAbertura: '20/01/2024',
    prazoFinal: '05/02/2024',
    responsavel: 'Ana Paula Costa',
    valorEstimado: 'R$ 85.000,00',
    observacoes: 'Em fase de análise técnica das especificações',
    timeline: [
      { data: '20/01/2024', evento: 'Processo Iniciado', responsavel: 'Sistema', detalhes: 'Processo criado no sistema' },
      { data: '22/01/2024', evento: 'Análise em Andamento', responsavel: 'Pedro Oliveira', detalhes: 'Iniciada análise técnica' }
    ]
  },
  {
    id: '4',
    numero: '2023/158',
    objeto: 'Reforma do Prédio Principal',
    secretaria: 'Secretaria de Obras',
    status: 'finalizado',
    dataAbertura: '15/11/2023',
    prazoFinal: '20/12/2023',
    responsavel: 'Roberto Santos Silva',
    valorEstimado: 'R$ 250.000,00',
    observacoes: 'Processo finalizado com sucesso',
    timeline: [
      { data: '15/11/2023', evento: 'Processo Iniciado', responsavel: 'Sistema', detalhes: 'Processo criado no sistema' },
      { data: '20/11/2023', evento: 'Análise Aprovada', responsavel: 'José Silva', detalhes: 'Documentação aprovada' },
      { data: '25/11/2023', evento: 'Edital Publicado', responsavel: 'Maria Santos', detalhes: 'Publicação realizada' },
      { data: '10/12/2023', evento: 'Proposta Vencedora', responsavel: 'Comissão', detalhes: 'Empresa XYZ Ltda selecionada' },
      { data: '20/12/2023', evento: 'Processo Finalizado', responsavel: 'Sistema', detalhes: 'Contrato assinado' }
    ]
  }
];
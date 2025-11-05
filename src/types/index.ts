// src/types/index.ts

export interface Process {
    id: string;
    numero: string;
    objeto: string;
    secretaria: string;
    status: 'em-analise' | 'aguardando-documento' | 'publicado' | 'finalizado';
    dataAbertura: string;
    prazoFinal: string;
    responsavel: string;
    valorEstimado: string;
    observacoes: string;
    timeline: Array<{
      data: string;
      evento: string;
      responsavel: string;
      detalhes: string;
    }>;
  }
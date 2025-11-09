const Relatorios = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios e Estatísticas</h2>
        <p className="text-gray-600">Gere relatórios detalhados sobre os processos de licitação.</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="text-center text-gray-500">
          <p className="mb-2">O módulo de relatórios será conectado à base de dados na fase final do projeto.</p>
          <p className="text-sm">Permitirá a exportação de dados em formato PDF e CSV, e a visualização de gráficos sobre o tempo médio de cada etapa do processo, custos por secretaria, entre outras métricas.</p>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
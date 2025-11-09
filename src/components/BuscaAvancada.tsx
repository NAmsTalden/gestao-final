import { useState, useMemo } from 'react';
import { Search, Filter, X, Calendar, Building2, User, DollarSign } from 'lucide-react';
import type { Process } from '../types';
import ProcessoListagem from './ProcessoListagem';

interface BuscaAvancadaProps {
  processes: Process[];
  onEditProcess: (processId: string) => void;
  onDeleteProcess: (processId: string) => void;
  onUpdateProcess: (processId: string, newStatus: Process['status'], newTimelineEvent: Process['timeline'][0]) => void;
}

const BuscaAvancada = ({ processes, onEditProcess, onDeleteProcess, onUpdateProcess }: BuscaAvancadaProps) => {
  const [filters, setFilters] = useState({
    numero: '',
    objeto: '',
    secretaria: '',
    responsavel: '',
    status: '' as Process['status'] | '',
    dataInicio: '',
    dataFim: '',
    valorMin: '',
    valorMax: '',
  });

  const filteredProcesses = useMemo(() => {
    return processes.filter(process => {
      if (filters.numero && !process.numero.toLowerCase().includes(filters.numero.toLowerCase())) return false;
      if (filters.objeto && !process.objeto.toLowerCase().includes(filters.objeto.toLowerCase())) return false;
      if (filters.secretaria && !process.secretaria.toLowerCase().includes(filters.secretaria.toLowerCase())) return false;
      if (filters.responsavel && !process.responsavel.toLowerCase().includes(filters.responsavel.toLowerCase())) return false;
      if (filters.status && process.status !== filters.status) return false;
      
      if (filters.dataInicio) {
        const dataAbertura = new Date(process.dataAbertura.split('/').reverse().join('-'));
        const dataInicio = new Date(filters.dataInicio);
        if (dataAbertura < dataInicio) return false;
      }
      
      if (filters.dataFim) {
        const dataAbertura = new Date(process.dataAbertura.split('/').reverse().join('-'));
        const dataFim = new Date(filters.dataFim);
        if (dataAbertura > dataFim) return false;
      }
      
      if (filters.valorMin) {
        const valorProcesso = parseFloat(process.valorEstimado.replace(/[^\d,.-]/g, '').replace(',', '.'));
        const valorMin = parseFloat(filters.valorMin);
        if (valorProcesso < valorMin) return false;
      }
      
      if (filters.valorMax) {
        const valorProcesso = parseFloat(process.valorEstimado.replace(/[^\d,.-]/g, '').replace(',', '.'));
        const valorMax = parseFloat(filters.valorMax);
        if (valorProcesso > valorMax) return false;
      }
      
      return true;
    });
  }, [processes, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      numero: '',
      objeto: '',
      secretaria: '',
      responsavel: '',
      status: '',
      dataInicio: '',
      dataFim: '',
      valorMin: '',
      valorMax: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Busca Avançada</h1>
        <p className="text-gray-600">Utilize múltiplos filtros para encontrar processos específicos.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Filtros de Busca</h2>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
              aria-label="Limpar todos os filtros"
            >
              <X size={16} />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
              Nº do Processo
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="numero"
                type="text"
                value={filters.numero}
                onChange={(e) => handleFilterChange('numero', e.target.value)}
                placeholder="Ex: 2025/123"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="objeto" className="block text-sm font-medium text-gray-700 mb-1">
              Objeto da Licitação
            </label>
            <input
              id="objeto"
              type="text"
              value={filters.objeto}
              onChange={(e) => handleFilterChange('objeto', e.target.value)}
              placeholder="Buscar por objeto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="secretaria" className="block text-sm font-medium text-gray-700 mb-1">
              Secretaria
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="secretaria"
                type="text"
                value={filters.secretaria}
                onChange={(e) => handleFilterChange('secretaria', e.target.value)}
                placeholder="Buscar por secretaria..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700 mb-1">
              Responsável
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="responsavel"
                type="text"
                value={filters.responsavel}
                onChange={(e) => handleFilterChange('responsavel', e.target.value)}
                placeholder="Buscar por responsável..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Todos os status</option>
              <option value="em-analise">Em Análise</option>
              <option value="aguardando-documento">Aguardando Documento</option>
              <option value="publicado">Publicado</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          <div>
            <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-1">
              Data Início
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="dataInicio"
                type="date"
                value={filters.dataInicio}
                onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-1">
              Data Fim
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="dataFim"
                type="date"
                value={filters.dataFim}
                onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="valorMin" className="block text-sm font-medium text-gray-700 mb-1">
              Valor Mínimo (R$)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="valorMin"
                type="number"
                step="0.01"
                value={filters.valorMin}
                onChange={(e) => handleFilterChange('valorMin', e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="valorMax" className="block text-sm font-medium text-gray-700 mb-1">
              Valor Máximo (R$)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="valorMax"
                type="number"
                step="0.01"
                value={filters.valorMax}
                onChange={(e) => handleFilterChange('valorMax', e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{filteredProcesses.length}</strong> processo(s) encontrado(s) com os filtros aplicados.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Resultados da Busca ({filteredProcesses.length})
          </h3>
        </div>
        <ProcessoListagem
          processes={filteredProcesses}
          onEditProcess={onEditProcess}
          onDeleteProcess={onDeleteProcess}
          onUpdateProcess={onUpdateProcess}
        />
      </div>
    </div>
  );
};

export default BuscaAvancada;

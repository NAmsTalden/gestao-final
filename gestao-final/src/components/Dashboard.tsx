import { useMemo } from 'react';
import { FileText, AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';
import ProcessoListagem from './ProcessoListagem';
import type { Process } from '../types';

interface DashboardProps {
  processes: Process[];
  searchTerm: string;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  onEditProcess: (processId: string) => void;
  onDeleteProcess: (processId: string) => void;
  onUpdateProcess: (processId: string, newStatus: Process['status'], newTimelineEvent: Process['timeline'][0]) => void;
}

const Dashboard = ({ processes, searchTerm, activeFilter, setActiveFilter, onEditProcess, onDeleteProcess, onUpdateProcess }: DashboardProps) => {
  const filteredProcesses = useMemo(() => { let filtered = processes; if (searchTerm) { filtered = filtered.filter(process => process.numero.toLowerCase().includes(searchTerm.toLowerCase()) || process.objeto.toLowerCase().includes(searchTerm.toLowerCase()) || process.secretaria.toLowerCase().includes(searchTerm.toLowerCase())); } if (activeFilter && activeFilter !== 'todos') { switch (activeFilter) { case 'prazos-vencendo': filtered = filtered.filter(p => p.status === 'aguardando-documento'); break; case 'concluidos-mes': filtered = filtered.filter(p => p.status === 'finalizado'); break; case 'alertas': filtered = filtered.filter(p => p.status === 'aguardando-documento'); break; default: break; } } return filtered; }, [searchTerm, activeFilter, processes]);
  const stats = { totalAtivos: processes.filter(p => p.status !== 'finalizado').length, prazosVencendo: processes.filter(p => p.status === 'aguardando-documento').length, concluídosNoMês: processes.filter(p => p.status === 'finalizado').length, alertas: processes.filter(p => p.status === 'aguardando-documento').length };
  const StatCard = ({ title, value, icon: Icon, color, filterKey, description }: { title: string; value: number; icon: any; color: string; filterKey: string; description: string; }) => (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${activeFilter === filterKey ? 'ring-2 ring-blue-500 shadow-md' : ''}`} 
      onClick={() => setActiveFilter(activeFilter === filterKey ? '' : filterKey)} 
      role="button" 
      tabIndex={0} 
      aria-label={`${title}: ${value}. ${activeFilter === filterKey ? 'Filtro ativo. Clique para remover filtro' : 'Clique para filtrar'}`}
      aria-pressed={activeFilter === filterKey}
      onKeyDown={(e) => { 
        if (e.key === 'Enter' || e.key === ' ') { 
          e.preventDefault();
          setActiveFilter(activeFilter === filterKey ? '' : filterKey); 
        } 
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`} aria-hidden="true">
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral e acompanhamento dos processos de licitação.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total de Processos Ativos" value={stats.totalAtivos} icon={FileText} color="bg-blue-500" filterKey="ativos" description="Processos em andamento" />
        <StatCard title="Prazos Vencendo" value={stats.prazosVencendo} icon={AlertTriangle} color="bg-yellow-500" filterKey="prazos-vencendo" description="Próximos 7 dias" />
        <StatCard title="Concluídos no Mês" value={stats.concluídosNoMês} icon={CheckCircle2} color="bg-green-500" filterKey="concluidos-mes" description="Janeiro 2024" />
        <StatCard title="Alertas/Pendências" value={stats.alertas} icon={Clock} color="bg-red-500" filterKey="alertas" description="Requer atenção" />
      </div>
      {activeFilter && (
        <div className="mb-4 flex items-center space-x-2" role="status" aria-live="polite">
          <span className="text-sm text-gray-600">Filtro ativo:</span>
          <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {activeFilter === 'prazos-vencendo' ? 'Prazos Vencendo' : activeFilter === 'concluidos-mes' ? 'Concluídos no Mês' : activeFilter === 'alertas' ? 'Alertas/Pendências' : 'Filtro Ativo'}
            <button 
              onClick={() => setActiveFilter('')} 
              className="ml-2 hover:bg-blue-200 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              aria-label="Remover filtro ativo"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        </div>
      )}
      <ProcessoListagem processes={filteredProcesses} onEditProcess={onEditProcess} onDeleteProcess={onDeleteProcess} onUpdateProcess={onUpdateProcess} />
    </div>
  );
};

export default Dashboard;
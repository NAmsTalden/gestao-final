import { useState, useEffect } from 'react';
import { Eye, Edit3, Trash2, FileText } from 'lucide-react';
import type { Process } from '../types';
import ProcessModal from './ProcessModal';

interface ProcessoListagemProps {
  processes: Process[];
  onEditProcess: (processId: string) => void;
  onDeleteProcess: (processId: string) => void;
  onUpdateProcess: (processId: string, newStatus: Process['status'], newTimelineEvent: Process['timeline'][0]) => void;
}

const ProcessoListagem: React.FC<ProcessoListagemProps> = ({ processes, onEditProcess, onDeleteProcess, onUpdateProcess }) => {
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);

  // =======================================================================================
  // CORREÇÃO AQUI: Este useEffect sincroniza o modal com a lista principal.
  // Ele "observa" a lista 'processes'. Se o processo que está no modal for atualizado na
  // lista principal, ele força a atualização do modal também.
  // =======================================================================================
  useEffect(() => {
    if (selectedProcess) {
      // Encontra a versão mais recente do processo selecionado na lista principal
      const updatedProcess = processes.find(p => p.id === selectedProcess.id);
      if (updatedProcess) {
        // Atualiza o estado local para refletir as alterações (novo histórico, etc.)
        setSelectedProcess(updatedProcess);
      }
    }
  }, [processes, selectedProcess]);


  const getStatusColor = (status: string) => { /* ... (código existente sem alterações) ... */ switch (status) { case 'em-analise': return 'bg-blue-100 text-blue-800 border-blue-200'; case 'aguardando-documento': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; case 'publicado': return 'bg-green-100 text-green-800 border-green-200'; case 'finalizado': return 'bg-gray-100 text-gray-800 border-gray-200'; default: return 'bg-gray-100 text-gray-800 border-gray-200'; } };
  const getStatusText = (status: string) => { /* ... (código existente sem alterações) ... */ switch (status) { case 'em-analise': return 'Em Análise'; case 'aguardando-documento': return 'Aguardando Documento'; case 'publicado': return 'Publicado'; case 'finalizado': return 'Finalizado'; default: return status; } };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Listagem de Processos ({processes.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº do Processo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objeto da Licitação</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secretaria Solicitante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Atual</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Abertura</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo Final</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processes.map((process) => (
              <tr key={process.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{process.numero}</div></td>
                <td className="px-6 py-4"><div className="text-sm text-gray-900 max-w-xs truncate" title={process.objeto}>{process.objeto}</div></td>
                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{process.secretaria}</div></td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(process.status)}`}>{getStatusText(process.status)}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.dataAbertura}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.prazoFinal}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button onClick={() => setSelectedProcess(process)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" aria-label="Visualizar detalhes" title="Visualizar Detalhes"><Eye size={16} /></button>
                    <button onClick={() => onEditProcess(process.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" aria-label="Editar processo" title="Editar"><Edit3 size={16} /></button>
                    <button onClick={() => onDeleteProcess(process.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label="Apagar processo" title="Apagar"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {processes.length === 0 && ( <div className="text-center py-12"> <FileText className="mx-auto h-12 w-12 text-gray-400" /> <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum processo encontrado</h3> <p className="mt-1 text-sm text-gray-500">Não há processos que correspondam a esta visualização.</p> </div> )}
      </div>
      
      {selectedProcess && (
        <ProcessModal 
          process={selectedProcess} 
          onClose={() => setSelectedProcess(null)}
          onUpdateProcess={onUpdateProcess}
        />
      )}
    </div>
  );
};

export default ProcessoListagem;
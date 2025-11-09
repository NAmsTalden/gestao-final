import { useState } from 'react';
import { X, Calendar, Building2, User, DollarSign, FileText, Clock, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import type { Process } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ProcessModalProps {
  process: Process;
  onClose: () => void;
  onUpdateProcess: (processId: string, newStatus: Process['status'], newTimelineEvent: Process['timeline'][0]) => void;
}

const ProcessModal: React.FC<ProcessModalProps> = ({ process, onClose, onUpdateProcess }) => {
  const [newStatus, setNewStatus] = useState<Process['status']>(process.status);
  const [newEventDetails, setNewEventDetails] = useState('');

  const handleUpdateSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newEventDetails.trim()) { alert("Por favor, preencha a descrição do evento."); return; }
    const newTimelineEvent = { data: new Date().toLocaleString('pt-BR'), evento: `Status alterado para: ${getStatusText(newStatus)}`, responsavel: 'Natã Crispim Ramos', detalhes: newEventDetails, };
    onUpdateProcess(process.id, newStatus, newTimelineEvent);
    setNewEventDetails('');
  };

  const getStatusColor = (status: string) => { switch (status) { case 'em-analise': return 'bg-blue-100 text-blue-800 border-blue-200'; case 'aguardando-documento': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; case 'publicado': return 'bg-green-100 text-green-800 border-green-200'; case 'finalizado': return 'bg-gray-100 text-gray-800 border-gray-200'; default: return 'bg-gray-100 text-gray-800 border-gray-200'; } };
  const getStatusText = (status: string) => { switch (status) { case 'em-analise': return 'Em Análise'; case 'aguardando-documento': return 'Aguardando Documento'; case 'publicado': return 'Publicado'; case 'finalizado': return 'Finalizado'; default: return status; } };
  const getTimelineIcon = (evento: string) => { if (evento.includes('Finalizado') || evento.includes('Aprovado')) { return <CheckCircle2 className="w-4 h-4 text-green-500" />; } if (evento.includes('Solicitação') || evento.includes('Aguardando')) { return <AlertTriangle className="w-4 h-4 text-yellow-500" />; } return <Clock className="w-4 h-4 text-blue-500" />; };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg leading-6 font-bold text-gray-900 mb-2" id="modal-title">Processo Nº {process.numero}</h3>
                <p className="text-gray-600 mb-3">{process.objeto}</p>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(process.status)}`}>{getStatusText(process.status)}</span>
              </div>
              <button onClick={onClose} className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-label="Fechar modal"><X size={24} /></button>
            </div>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações Principais</h4>
                <div className="space-y-4">
                  {/* ... outros campos ... */}
                  <div className="flex items-start space-x-3"><Building2 className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="text-sm font-medium text-gray-900">Secretaria Solicitante</p><p className="text-sm text-gray-600">{process.secretaria}</p></div></div>
                  <div className="flex items-start space-x-3"><User className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="text-sm font-medium text-gray-900">Responsável</p><p className="text-sm text-gray-600">{process.responsavel}</p></div></div>
                  <div className="flex items-start space-x-3"><Calendar className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="text-sm font-medium text-gray-900">Data de Abertura</p><p className="text-sm text-gray-600">{process.dataAbertura}</p></div></div>
                  <div className="flex items-start space-x-3"><Calendar className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="text-sm font-medium text-gray-900">Prazo Final</p><p className="text-sm text-gray-600">{process.prazoFinal}</p></div></div>
                  
                  {/* vvv CAMPO DE VALOR ATUALIZADO vvv */}
                  <div className="flex items-start space-x-3"><DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Valor Estimado</p>
                      <p className="text-sm text-gray-600">{formatCurrency(process.valorEstimado)}</p>
                    </div>
                  </div>
                  {/* ^^^ FIM DA ATUALIZAÇÃO ^^^ */}

                  <div className="flex items-start space-x-3"><FileText className="w-5 h-5 text-gray-400 mt-0.5" /><div><p className="text-sm font-medium text-gray-900">Observações</p><p className="text-sm text-gray-600">{process.observacoes}</p></div></div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Histórico do Processo</h4>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {process.timeline.map((item, itemIdx) => ( <li key={itemIdx}><div className="relative pb-8">{itemIdx !== process.timeline.length - 1 ? (<span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>) : null}<div className="relative flex space-x-3"><div><span className="h-8 w-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">{getTimelineIcon(item.evento)}</span></div><div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4"><div><p className="text-sm font-medium text-gray-900">{item.evento}</p><p className="text-sm text-gray-500">{item.detalhes}</p><p className="text-xs text-gray-400">Por: {item.responsavel}</p></div><div className="text-right text-xs whitespace-nowrap text-gray-500">{item.data}</div></div></div></div></li> ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-2 mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Novo Evento ao Histórico</h4>
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Alterar Status para:</label>
                    <select id="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value as Process['status'])} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" >
                      <option value="em-analise">Em Análise</option>
                      <option value="aguardando-documento">Aguardando Documento</option>
                      <option value="publicado">Publicado</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">Descrição do Evento:</label>
                    <textarea id="details" value={newEventDetails} onChange={(e) => setNewEventDetails(e.target.value)} rows={3} placeholder="Descreva a atualização ou o motivo da mudança de status..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                      <Send size={16} className="mr-2" />
                      Adicionar ao Histórico
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button onClick={onClose} type="button" className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessModal;
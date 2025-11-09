import { useState, useEffect } from 'react';
import type { Process } from '../types';
import { formatCurrency, parseCurrency } from '../utils/formatters';

const FormInput = ({ label, value, onChange, placeholder, type = 'text', id, ariaDescribedBy }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, type?: string, id?: string, ariaDescribedBy?: string }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-describedby={ariaDescribedBy}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        required
      />
    </div>
  );
};

interface ProcessoFormProps {
  onSaveProcess: (processData: Process) => void;
  processoParaEditar?: Process | null;
}

const ProcessoForm = ({ onSaveProcess, processoParaEditar }: ProcessoFormProps) => {
  const [numero, setNumero] = useState('');
  const [objeto, setObjeto] = useState('');
  const [secretaria, setSecretaria] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [valorEstimado, setValorEstimado] = useState('');

  useEffect(() => {
    if (processoParaEditar) {
      setNumero(processoParaEditar.numero);
      setObjeto(processoParaEditar.objeto);
      setSecretaria(processoParaEditar.secretaria);
      setResponsavel(processoParaEditar.responsavel);
      setValorEstimado(parseCurrency(processoParaEditar.valorEstimado));
    }
  }, [processoParaEditar]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const processData = {
      id: processoParaEditar ? processoParaEditar.id : Math.random().toString(36).substr(2, 9),
      numero,
      objeto,
      secretaria,
      responsavel,
      valorEstimado: formatCurrency(valorEstimado),
      status: processoParaEditar ? processoParaEditar.status : 'em-analise',
      dataAbertura: processoParaEditar ? processoParaEditar.dataAbertura : new Date().toLocaleDateString('pt-BR'),
      prazoFinal: processoParaEditar ? processoParaEditar.prazoFinal : '',
      observacoes: processoParaEditar ? processoParaEditar.observacoes : 'Processo recém-criado.',
      timeline: processoParaEditar ? processoParaEditar.timeline : [
        { data: new Date().toLocaleString('pt-BR'), evento: 'Processo Iniciado', responsavel: 'Sistema', detalhes: 'Processo criado via formulário' }
      ]
    };
    
    onSaveProcess(processData);
    alert(`Processo ${processoParaEditar ? 'atualizado' : 'adicionado'} com sucesso!`);

    if (!processoParaEditar) {
      setNumero('');
      setObjeto('');
      setSecretaria('');
      setResponsavel('');
      setValorEstimado('');
    }
  };

  const pageTitle = processoParaEditar ? 'Editar Processo de Licitação' : 'Criar Novo Processo de Licitação';
  const pageSubtitle = processoParaEditar ? 'Altere as informações necessárias abaixo.' : 'Preencha as informações abaixo para iniciar um novo processo.';

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-gray-600">{pageSubtitle}</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6" aria-label={pageTitle}>
          <FormInput 
            id="numero-processo"
            label="Nº do Processo" 
            value={numero} 
            onChange={(e) => setNumero(e.target.value)} 
            placeholder="Ex: 2025/123" 
          />
          <FormInput 
            id="objeto-licitacao"
            label="Objeto da Licitação" 
            value={objeto} 
            onChange={(e) => setObjeto(e.target.value)} 
            placeholder="Ex: Aquisição de Material de Escritório" 
          />
          <FormInput 
            id="secretaria-solicitante"
            label="Secretaria Solicitante" 
            value={secretaria} 
            onChange={(e) => setSecretaria(e.target.value)} 
            placeholder="Ex: Secretaria de Administração" 
          />
          <FormInput 
            id="responsavel-inicial"
            label="Responsável Inicial" 
            value={responsavel} 
            onChange={(e) => setResponsavel(e.target.value)} 
            placeholder="Ex: Nome do Servidor" 
          />
          <FormInput 
            id="valor-estimado"
            label="Valor Estimado" 
            value={valorEstimado} 
            onChange={(e) => setValorEstimado(e.target.value)} 
            placeholder="Ex: 45000.00" 
            type="number"
            ariaDescribedBy="valor-help"
          />
          <p id="valor-help" className="text-xs text-gray-500 -mt-4">
            Digite apenas números (ex: 45000.00)
          </p>
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              aria-label={processoParaEditar ? "Atualizar processo" : "Criar novo processo"}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Salvar Processo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessoForm;
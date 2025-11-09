import { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProcessoForm from './components/NovoProcesso';
import ProcessoListagem from './components/ProcessoListagem';
import NewPassword from './components/NewPassword';
import BuscaAvancada from './components/BuscaAvancada';
import Relatorios from './components/Relatorios';
import Configuracoes from './components/Configuracoes';
import Login from './components/Login';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Process } from './types';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [processoParaEditar, setProcessoParaEditar] = useState<Process | null>(null);
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
          setSession(null);
          return;
        }
        
        setSession(currentSession);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const fetchProcesses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('processes')
        .select('*')
        .order('dataAbertura', { ascending: false });

      if (error) throw error;
      if (data) setProcesses(data as Process[]);
    } catch (error) {
      console.error("Erro ao buscar processos:", error);
      const typedError = error as Error;
      alert(`Não foi possível conectar ao Supabase. Verifique suas chaves .env e as políticas RLS. (Erro: ${typedError.message})`);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchProcesses();
    }
  }, [session, fetchProcesses]);
  const notifications = useMemo(() => {
    return processes
      .filter(p => p.status === 'aguardando-documento' || p.status === 'em-analise')
      .map(p => ({
        id: p.id,
        text: `Processo ${p.numero} (${p.objeto}) requer atenção.`,
        type: p.status === 'aguardando-documento' ? 'warning' as const : 'info' as const,
      }));
  }, [processes]);

  const handleSaveProcess = async (processData: Process) => {
    try {
      const { error } = await supabase
        .from('processes')
        .upsert(processData);

      if (error) throw error;
      
      await fetchProcesses();
      setActiveSection('dashboard');
      setProcessoParaEditar(null);
    } catch (error) {
      console.error("Erro ao salvar processo:", error);
      const typedError = error as Error;
      alert(`Erro ao salvar processo. Tente novamente. (${typedError.message})`);
    }
  };

  const handleEditProcess = (processId: string) => {
    const processo = processes.find(p => p.id === processId);
    if (processo) {
      setProcessoParaEditar(processo);
      setActiveSection('novo-processo');
    }
  };

  const handleDeleteProcess = async (processId: string) => {
    if (window.confirm("Tem a certeza que deseja apagar este processo? Esta ação não pode ser desfeita.")) {
      try {
        const { error } = await supabase
          .from('processes')
          .delete()
          .match({ id: processId });

        if (error) throw error;
        setProcesses(prevProcesses => prevProcesses.filter(p => p.id !== processId));
      } catch (error) {
        console.error("Erro ao deletar processo:", error);
        const typedError = error as Error;
        alert(`Erro ao deletar processo. Tente novamente. (${typedError.message})`);
      }
    }
  };

  const handleNewProcessClick = () => {
    setProcessoParaEditar(null);
    setActiveSection('novo-processo');
  };

  const handleUpdateProcess = async (processId: string, newStatus: Process['status'], newTimelineEvent: Process['timeline'][0]) => {
    try {
      const processToUpdate = processes.find(p => p.id === processId);
      if (!processToUpdate) {
        throw new Error("Processo não encontrado.");
      }

      const currentTimeline = processToUpdate.timeline || [];
      const newTimeline = [...currentTimeline, newTimelineEvent];

      const { data: updatedProcess, error } = await supabase
        .from('processes')
        .update({
          status: newStatus,
          timeline: newTimeline
        })
        .match({ id: processId })
        .select()
        .single();

      if (error) throw error;
      
      if (updatedProcess) {
        setProcesses(prevProcesses => 
          prevProcesses.map(p => (p.id === processId ? (updatedProcess as Process) : p))
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      const typedError = error as Error;
      alert(`Erro ao atualizar status. Tente novamente. (${typedError.message})`);
    }
  };

  const processosFiltrados = useMemo(() => {
    return processes.filter(process =>
      process.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.secretaria.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processes, searchTerm]);
  const renderContent = () => {
    const dashboardProps = {
      processes: processosFiltrados,
      searchTerm,
      activeFilter,
      setActiveFilter,
      onEditProcess: handleEditProcess,
      onDeleteProcess: handleDeleteProcess,
      onUpdateProcess: handleUpdateProcess
    };

    switch (activeSection) {
      case 'dashboard':
        return <Dashboard {...dashboardProps} />;
      case 'novo-processo':
        return <ProcessoForm onSaveProcess={handleSaveProcess} processoParaEditar={processoParaEditar} />;
      case 'processos-andamento': {
        const processosEmAndamento = processosFiltrados.filter(p => p.status !== 'finalizado');
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Processos em Andamento</h2>
            <ProcessoListagem
              processes={processosEmAndamento}
              onEditProcess={handleEditProcess}
              onDeleteProcess={handleDeleteProcess}
              onUpdateProcess={handleUpdateProcess}
            />
          </div>
        );
      }
      case 'processos-concluidos': {
        const processosConcluidos = processosFiltrados.filter(p => p.status === 'finalizado');
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Processos Concluídos</h2>
            <ProcessoListagem
              processes={processosConcluidos}
              onEditProcess={handleEditProcess}
              onDeleteProcess={handleDeleteProcess}
              onUpdateProcess={handleUpdateProcess}
            />
          </div>
        );
      }
      case 'busca-avancada':
        return <BuscaAvancada />;
      case 'relatorios':
        return <Relatorios />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard {...dashboardProps} />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  const isRecoveryMode = window.location.hash.includes('type=recovery');

  if (!session) {
    if (isRecoveryMode) {
      return <NewPassword />;
    }
    return <Login onLogin={() => {}} />;
  }
  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={(section) => { if (section === 'novo-processo') { handleNewProcessClick(); } else { setActiveSection(section); } }}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          notifications={notifications}
          user={session.user}
          onLogout={async () => {
            await supabase.auth.signOut();
            setSession(null);
            window.location.href = '/';
          }}
        />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
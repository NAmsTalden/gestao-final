/* ARQUIVO: src/App.tsx (VERSÃO ATUALIZADA) */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { supabase } from './lib/supabase'; // <-- Importamos o cliente supabase
import type { Session } from '@supabase/supabase-js';
import type { Process } from './types';

// Não precisamos mais da API_URL, o Supabase cuida disso.
// const API_URL = 'http://localhost:3001/api/processes';

function App() {
  // Estado de autenticação (sem alterações)
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Outros estados da aplicação (sem alterações)
  const [processes, setProcesses] = useState<Process[]>([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [processoParaEditar, setProcessoParaEditar] = useState<Process | null>(null);

  // Verifica o estado da autenticação (sem alterações)
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

  // Não precisamos mais do getAuthHeader
  // const getAuthHeader = useCallback(async () => { ... }, []);

  // ==================================================================
  // MUDANÇA AQUI: Função para buscar (READ) os dados
  // ==================================================================
  const fetchProcesses = useCallback(async () => {
    try {
      // O cliente supabase já gerencia a autenticação
      const { data, error } = await supabase
        .from('processes') // O nome da sua tabela
        .select('*')
        .order('dataAbertura', { ascending: false }); // Igual ao seu 'ORDER BY' no backend

      if (error) throw error;

      if (data) {
        setProcesses(data as Process[]);
      }
    } catch (error) {
      console.error("Erro ao buscar processos no Supabase:", error);
      const typedError = error as Error;
      alert(`Não foi possível conectar ao Supabase. Verifique suas chaves .env e as políticas RLS. (Erro: ${typedError.message})`);
    }
  }, []); // O array vazio significa que esta função nunca muda.

  // Aqui eu chamo a função de busca assim que a SESSÃO for válida
  useEffect(() => {
    if (session) { // Só busca os processos se o usuário estiver logado
      fetchProcesses();
    }
  }, [session, fetchProcesses]); // Depende da sessão e da função

  // Lógica de notificações (sem alterações)
  const notifications = useMemo(() => {
    return processes
      .filter(p => p.status === 'aguardando-documento' || p.status === 'em-analise')
      .map(p => ({
        id: p.id,
        text: `Processo ${p.numero} (${p.objeto}) requer atenção.`,
        type: p.status === 'aguardando-documento' ? 'warning' as const : 'info' as const,
      }));
  }, [processes]);

  // ==================================================================
  // MUDANÇA AQUI: Função para Criar (CREATE) e Editar (UPDATE)
  // ==================================================================
  const handleSaveProcess = async (processData: Process) => {
    try {
      // O 'upsert' faz o 'PUT' ou 'POST' automaticamente.
      // Ele insere se for novo, ou atualiza se o 'id' já existir.
      const { error } = await supabase
        .from('processes')
        .upsert(processData);

      if (error) throw error;
      
      // Importante: depois de salvar, eu busco a lista inteira de novo
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

  // ==================================================================
  // MUDANÇA AQUI: Função para o 'DELETE'.
  // ==================================================================
  const handleDeleteProcess = async (processId: string) => {
    if (window.confirm("Tem a certeza que deseja apagar este processo? Esta ação não pode ser desfeita.")) {
      try {
        const { error } = await supabase
          .from('processes')
          .delete()
          .match({ id: processId }); // Equivalente a "WHERE id = processId"

        if (error) throw error;
        
        // Remove do estado local
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

  // ==================================================================
  // MUDANÇA AQUI: Função para a atualização do modal (o 'PATCH')
  // ==================================================================
  const handleUpdateProcess = async (processId: string, newStatus: Process['status'], newTimelineEvent: Process['timeline'][0]) => {
    try {
      // 1. Pega o processo atual do estado
      const processToUpdate = processes.find(p => p.id === processId);
      if (!processToUpdate) {
        throw new Error("Processo não encontrado no estado local.");
      }

      // 2. Cria a nova timeline (lógica que estava no seu backend)
      // Garantimos que a timeline exista antes de espalhar
      const currentTimeline = processToUpdate.timeline || [];
      const newTimeline = [...currentTimeline, newTimelineEvent];

      // 3. Envia a atualização para o Supabase
      const { data: updatedProcess, error } = await supabase
        .from('processes')
        .update({
          status: newStatus,
          timeline: newTimeline
        })
        .match({ id: processId })
        .select() // Pede ao Supabase para retornar o registro atualizado
        .single(); // Esperamos apenas um

      if (error) throw error;
      
      // 4. Atualiza o estado local com o registro que o Supabase retornou
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

  // Lógica de filtro (sem alterações)
  const processosFiltrados = useMemo(() => {
    return processes.filter(process =>
      process.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.secretaria.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processes, searchTerm]);

  // Lógica de renderização de conteúdo (sem alterações)
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard processes={processosFiltrados} searchTerm={searchTerm} activeFilter={activeFilter} setActiveFilter={setActiveFilter} onEditProcess={handleEditProcess} onDeleteProcess={handleDeleteProcess} onUpdateProcess={handleUpdateProcess} />;
      case 'novo-processo': return <ProcessoForm onSaveProcess={handleSaveProcess} processoParaEditar={processoParaEditar} />;
      case 'processos-andamento': const processosEmAndamento = processosFiltrados.filter(p => p.status !== 'finalizado'); return ( <div className="p-6"> <h2 className="text-2xl font-bold text-gray-900 mb-6">Processos em Andamento</h2> <ProcessoListagem processes={processosEmAndamento} onEditProcess={handleEditProcess} onDeleteProcess={handleDeleteProcess} onUpdateProcess={handleUpdateProcess} /> </div> );
      case 'processos-concluidos': const processosConcluidos = processosFiltrados.filter(p => p.status === 'finalizado'); return ( <div className="p-6"> <h2 className="text-2xl font-bold text-gray-900 mb-6">Processos Concluídos</h2> <ProcessoListagem processes={processosConcluidos} onEditProcess={handleEditProcess} onDeleteProcess={handleDeleteProcess} onUpdateProcess={handleUpdateProcess} /> </div> );
      case 'busca-avancada': return <BuscaAvancada />;
      case 'relatorios': return <Relatorios />;
      case 'configuracoes': return <Configuracoes />;
      default: return <Dashboard processes={processosFiltrados} searchTerm={searchTerm} activeFilter={activeFilter} setActiveFilter={setActiveFilter} onEditProcess={handleEditProcess} onDeleteProcess={handleDeleteProcess} onUpdateProcess={handleUpdateProcess} />;
    }
  };

  // Render condicional baseado no estado de autenticação (sem alterações)
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
    return <Login onLogin={() => {}} />; // onLogin agora não faz nada, pois o onAuthStateChange cuida de tudo
  }

  // Render principal quando autenticado (sem alterações)
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
          onLogout={() => supabase.auth.signOut()}
        />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
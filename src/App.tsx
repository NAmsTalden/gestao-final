// src/App.tsx

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
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Process } from './types';

// Aqui é a URL do meu backend. Por enquanto, vou deixar 'localhost' 
// para testar na minha máquina.
const API_URL = 'http://localhost:3001/api/processes';

function App() {
  // Estado de autenticação
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Outros estados da aplicação
  const [processes, setProcesses] = useState<Process[]>([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [processoParaEditar, setProcessoParaEditar] = useState<Process | null>(null);

  // Verifica o estado da autenticação quando o app inicia
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Pega o estado atual da sessão
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        // Verifica se há hash de recuperação de senha na URL
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
          setSession(null); // Força a exibição do componente NewPassword
          return;
        }
        
        setSession(currentSession);

        // Se inscreve para mudanças na autenticação
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

  // Função para obter o cabeçalho de autenticação
  const getAuthHeader = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    };
  }, []);

  // Função para buscar (READ) os dados da API.
  const fetchProcesses = useCallback(async () => {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(API_URL, { headers });
      if (!response.ok) {
        throw new Error('Falha ao buscar dados da API');
      }
      const data: Process[] = await response.json();
      setProcesses(data);
    } catch (error) {
      console.error("Erro ao buscar processos:", error);
      alert(`Não foi possível conectar ao servidor backend. Você lembrou de iniciá-lo? (Erro: ${error})`);
    }
  }, []); // O array vazio significa que esta função nunca muda.

  // Aqui eu chamo a função de busca assim que o componente (App) 
  // é carregado pela primeira vez.
  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  // Lógica de notificações (não mudei, já funcionava bem)
  const notifications = useMemo(() => {
    return processes
      .filter(p => p.status === 'aguardando-documento' || p.status === 'em-analise')
      .map(p => ({
        id: p.id,
        text: `Processo ${p.numero} (${p.objeto}) requer atenção.`,
        type: p.status === 'aguardando-documento' ? 'warning' as const : 'info' as const,
      }));
  }, [processes]);

  // Essa função vai cuidar tanto de Criar (CREATE) quanto de Editar (UPDATE)
  const handleSaveProcess = async (processData: Process) => {
    // Lógica simples: se o processo já existe no estado, é um 'PUT'. Se não, é um 'POST'.
    const existe = processes.find(p => p.id === processData.id);
    const method = existe ? 'PUT' : 'POST';
    const url = existe ? `${API_URL}/${processData.id}` : API_URL;

    try {
      const headers = await getAuthHeader();
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(processData),
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao ${existe ? 'atualizar' : 'criar'} processo`);
      }
      
      // Importante: depois de salvar, eu busco a lista inteira de novo 
      // para garantir que o front-end e o backend estão sincronizados.
      await fetchProcesses();
      
      setActiveSection('dashboard');
      setProcessoParaEditar(null);
    } catch (error) {
      console.error("Erro ao salvar processo:", error);
      alert(`Erro ao salvar processo. Tente novamente. (${error})`);
    }
  };

  const handleEditProcess = (processId: string) => {
    const processo = processes.find(p => p.id === processId);
    if (processo) {
      setProcessoParaEditar(processo);
      setActiveSection('novo-processo');
    }
  };

  // Aqui é o 'DELETE'. Eu passo o ID na URL.
  const handleDeleteProcess = async (processId: string) => {
    if (window.confirm("Tem a certeza que deseja apagar este processo? Esta ação não pode ser desfeita.")) {
      try {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_URL}/${processId}`, {
          method: 'DELETE',
          headers: headers,
        });

        if (!response.ok) {
          throw new Error('Falha ao deletar processo');
        }
        
        // Isso é 'UI Otimista'. Eu removo do estado local *antes* da resposta
        // da API, para a interface parecer mais rápida.
        setProcesses(prevProcesses => prevProcesses.filter(p => p.id !== processId));
      } catch (error) {
          console.error("Erro ao deletar processo:", error);
          alert(`Erro ao deletar processo. Tente novamente. (${error})`);
      }
    }
  };

  const handleNewProcessClick = () => {
    setProcessoParaEditar(null);
    setActiveSection('novo-processo');
  };

  // Essa é para a atualização do modal (mudar status). 
  // Vou usar 'PATCH' porque estou enviando só os dados parciais.
  const handleUpdateProcess = async (processId: string, newStatus: Process['status'], newTimelineEvent: Process['timeline'][0]) => {
    try {
      // O 'payload' é o que eu vou enviar para a API
      const payload = {
        status: newStatus,
        timelineEvent: newTimelineEvent
      };

      const headers = await getAuthHeader();
      const response = await fetch(`${API_URL}/${processId}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar status do processo');
      }
      
      // O backend vai me retornar o processo completo e atualizado
      const updatedProcess = await response.json(); 
      
      // Eu uso o processo retornado para atualizar o estado local
      setProcesses(prevProcesses => 
        prevProcesses.map(p => (p.id === processId ? updatedProcess : p))
      );

    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert(`Erro ao atualizar status. Tente novamente. (${error})`);
    }
  };

  // Lógica de filtro (não mudei)
  const processosFiltrados = useMemo(() => {
    return processes.filter(process =>
      process.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.secretaria.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processes, searchTerm]);

  // Lógica de renderização de conteúdo (não mudei)
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

  // Render condicional baseado no estado de autenticação
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  // Verifica se há hash de recuperação de senha na URL
  const isRecoveryMode = window.location.hash.includes('type=recovery');

  if (!session) {
    // Se estiver no modo de recuperação de senha, mostra o componente NewPassword
    if (isRecoveryMode) {
      return <NewPassword />;
    }
    // Caso contrário, mostra a tela de login normal
    return <Login onLogin={() => {}} />;
  }

  // Render principal quando autenticado
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
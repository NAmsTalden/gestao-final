import { 
  LayoutDashboard, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Search, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ 
  activeSection, 
  setActiveSection, 
  isCollapsed, 
  setIsCollapsed 
}: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'novo-processo', label: 'Novo Processo', icon: Plus },
    { id: 'processos-andamento', label: 'Processos em Andamento', icon: Clock },
    { id: 'processos-concluidos', label: 'Processos Concluídos', icon: CheckCircle2 },
    { id: 'busca-avancada', label: 'Busca Avançada', icon: Search },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className={`bg-slate-800 text-white transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold truncate">Menu Principal</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? <ChevronRight size={20} aria-hidden="true" /> : <ChevronLeft size={20} aria-hidden="true" />}
        </button>
      </div>

      <nav className="flex-1 py-4" aria-label="Navegação principal">
        <ul className="space-y-2" role="list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left transition-colors group ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" aria-hidden="true" />
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
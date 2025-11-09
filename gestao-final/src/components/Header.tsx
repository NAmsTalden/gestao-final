import { useState, useEffect, useRef } from 'react';
import { Search, Bell, LogOut, Settings, UserIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface Notification {
  id: string;
  text: string;
  type: 'warning' | 'info' | 'success';
}

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  notifications: Notification[];
  user?: User;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm, notifications, user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) { setShowUserMenu(false); }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) { setShowNotifications(false); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">NAA</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">N.A.A. - Gestão de Licitações</h1>
            <p className="text-sm text-gray-600">Sistema de Gestão de Processos de Licitação</p>
          </div>
        </div>
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Buscar por número do processo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" aria-label="Buscar processo" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-expanded={showNotifications}
              aria-label="Notificações"
            >
              <Bell size={20} />
              {notifications.length > 0 && ( <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifications.length}</span> )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200"><h3 className="font-semibold text-gray-900">Notificações</h3></div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => ( <div key={notification.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"> <div className={`flex items-start space-x-2 ${notification.type === 'warning' ? 'text-yellow-700' : notification.type === 'info' ? 'text-blue-700' : 'text-green-700'}`}> <div className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'warning' ? 'bg-yellow-500' : notification.type === 'info' ? 'bg-blue-500' : 'bg-green-500'}`}></div> <p className="text-sm">{notification.text}</p> </div> </div> ))
                  ) : (
                    <p className="p-4 text-sm text-gray-500">Nenhuma notificação nova.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-expanded={showUserMenu}
              aria-label="Menu do usuário"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"><UserIcon size={16} /></div>
              <span className="text-sm font-medium">{user?.email ?? 'Usuário'}</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <a href="#" className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"><UserIcon size={16} className="mr-2" />Perfil</a>
                  <a href="#" className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"><Settings size={16} className="mr-2" />Configurações</a>
                  <hr className="my-1" />
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
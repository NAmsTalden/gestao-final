import { useState, useEffect } from 'react';
import { Settings, User, Bell, Save, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ConfiguracoesProps {
  user?: SupabaseUser;
}

const Configuracoes = ({ user }: ConfiguracoesProps) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'notificacoes' | 'sistema'>('perfil');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    nome: '',
  });

  useEffect(() => {
    if (user?.email) {
      setProfileData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailProcessos: true,
    emailPrazos: true,
    emailAlteracoes: true,
    notificacoesPush: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    tema: 'claro',
    idioma: 'pt-BR',
    itensPorPagina: '10',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        email: profileData.email,
      });

      if (error) throw error;
      setMessage('Perfil atualizado com sucesso!');
    } catch (error) {
      const err = error as Error;
      setMessage(`Erro ao atualizar perfil: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newPassword = (form.querySelector('[name="newPassword"]') as HTMLInputElement)?.value;
    const confirmPassword = (form.querySelector('[name="confirmPassword"]') as HTMLInputElement)?.value;

    if (newPassword !== confirmPassword) {
      setMessage('As senhas não coincidem');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      setMessage('Senha atualizada com sucesso!');
      form.reset();
    } catch (error) {
      const err = error as Error;
      setMessage(`Erro ao atualizar senha: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    setMessage('Configurações de notificações salvas!');
  };

  const handleSaveSystem = () => {
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
    setMessage('Configurações do sistema salvas!');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do sistema e do seu perfil.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-2" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'perfil'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Aba de perfil"
            >
              <User size={18} />
              <span>Perfil</span>
            </button>
            <button
              onClick={() => setActiveTab('notificacoes')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'notificacoes'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Aba de notificações"
            >
              <Bell size={18} />
              <span>Notificações</span>
            </button>
            <button
              onClick={() => setActiveTab('sistema')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'sistema'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Aba de sistema"
            >
              <Settings size={18} />
              <span>Sistema</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.includes('sucesso') || message.includes('salvas')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Perfil</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      id="nome"
                      type="text"
                      value={profileData.nome}
                      onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
                  >
                    <Save size={18} />
                    <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
                  </button>
                </form>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h2>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Digite a senha novamente"
                      minLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
                  >
                    <Save size={18} />
                    <span>{loading ? 'Atualizando...' : 'Atualizar Senha'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferências de Notificações</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Notificações por Email - Novos Processos</p>
                    <p className="text-sm text-gray-500">Receba emails quando novos processos forem criados</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailProcessos}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailProcessos: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Notificações por Email - Prazos</p>
                    <p className="text-sm text-gray-500">Receba alertas sobre prazos próximos ao vencimento</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailPrazos}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailPrazos: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Notificações por Email - Alterações</p>
                    <p className="text-sm text-gray-500">Receba emails sobre alterações nos processos</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailAlteracoes}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailAlteracoes: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Notificações Push</p>
                    <p className="text-sm text-gray-500">Receba notificações no navegador</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.notificacoesPush}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, notificacoesPush: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
              <button
                onClick={handleSaveNotifications}
                className="mt-6 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <Save size={18} />
                <span>Salvar Configurações</span>
              </button>
            </div>
          )}

          {activeTab === 'sistema' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações do Sistema</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="tema" className="block text-sm font-medium text-gray-700 mb-1">
                    Tema
                  </label>
                  <select
                    id="tema"
                    value={systemSettings.tema}
                    onChange={(e) => setSystemSettings({ ...systemSettings, tema: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="claro">Claro</option>
                    <option value="escuro">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="idioma" className="block text-sm font-medium text-gray-700 mb-1">
                    Idioma
                  </label>
                  <select
                    id="idioma"
                    value={systemSettings.idioma}
                    onChange={(e) => setSystemSettings({ ...systemSettings, idioma: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="itensPorPagina" className="block text-sm font-medium text-gray-700 mb-1">
                    Itens por Página
                  </label>
                  <select
                    id="itensPorPagina"
                    value={systemSettings.itensPorPagina}
                    onChange={(e) => setSystemSettings({ ...systemSettings, itensPorPagina: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleSaveSystem}
                className="mt-6 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <Save size={18} />
                <span>Salvar Configurações</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;

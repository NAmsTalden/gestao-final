import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, CheckCircle } from 'lucide-react';

const NewPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkRecoveryMode = async () => {
      try {
        setChecking(true);
        const hash = window.location.hash;
        
        if (!hash || !hash.includes('type=recovery')) {
          setError('Link de recuperação inválido');
          setChecking(false);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError('Link de recuperação inválido ou expirado. Por favor, solicite um novo link.');
          setChecking(false);
          return;
        }
        
        if (!session) {
          setError('Link de recuperação expirado ou inválido. Por favor, solicite um novo link.');
          setChecking(false);
          return;
        }
        
        setChecking(false);
      } catch (err) {
        setError('Erro ao processar link de recuperação');
        setChecking(false);
      }
    };

    checkRecoveryMode();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage('Senha atualizada com sucesso! Redirecionando para login...');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Ocorreu um erro ao tentar atualizar sua senha');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" aria-hidden="true"></div>
              <p className="mt-4 text-gray-600" role="status" aria-live="polite">Verificando link de recuperação...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !message) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div role="alert" aria-live="assertive" className="text-red-600 text-center mb-4">{error}</div>
            <a
              href="/"
              className="block text-center text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Voltar para login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full shadow-lg mb-4" aria-hidden="true">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Definir Nova Senha
          </h1>
          <p className="mt-2 text-gray-600">
            Digite sua nova senha abaixo
          </p>
        </div>

        <div className="bg-white py-8 px-8 shadow-xl rounded-lg">
          {message ? (
            <div className="text-center" role="status" aria-live="polite">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" aria-hidden="true" />
              <div className="text-green-600 text-center mb-4">{message}</div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleUpdatePassword} aria-label="Formulário para definir nova senha">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-describedby="password-help password-error"
                    aria-invalid={error && error.includes("senha") ? "true" : "false"}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <p id="password-help" className="mt-1 text-xs text-gray-500">
                  Mínimo 6 caracteres
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-describedby="confirm-password-help confirm-password-error"
                    aria-invalid={error && error.includes("coincidem") ? "true" : "false"}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite a senha novamente"
                  />
                </div>
                <p id="confirm-password-help" className="mt-1 text-xs text-gray-500">
                  Digite a mesma senha novamente
                </p>
              </div>

              {error && (
                <div 
                  role="alert" 
                  aria-live="assertive"
                  id={error.includes("coincidem") ? "confirm-password-error" : "password-error"}
                  className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-md"
                >
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  aria-busy={loading}
                  aria-label={loading ? "Atualizando senha..." : "Atualizar senha"}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewPassword;
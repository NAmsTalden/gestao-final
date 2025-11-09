import { useState } from 'react';
import { supabase } from '../lib/supabase';
import ResetPassword from './ResetPassword';
import { FileText, Lock, AtSign } from 'lucide-react';
import bgImage from '../assets/piracicaba-bg.jpg';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pendingEmail, setPendingEmail] = useState(''); 

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}`
          }
        });
        if (error) throw error;
        setPendingEmail(email); 
        setMessage('Verifique seu email para confirmar o registro!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin(); 
      }
    } catch (err) {
      const error = err as Error;
      if (error.message === "Email not confirmed") {
        setError("Seu email ainda não foi confirmado. Por favor, verifique sua caixa de entrada.");
        setPendingEmail(email); 
      } else if (error.message === "Invalid login credentials") {
        setError("Email ou senha inválidos.");
      } else {
        setError(error.message || 'Ocorreu um erro durante a autenticação');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!pendingEmail) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: {
          emailRedirectTo: `${window.location.origin}`
        }
      });

      if (error) throw error;
      setMessage('Email de confirmação reenviado! Verifique sua caixa de entrada.');
    } catch (err) { // <-- AQUI ESTAVA O ERRO (ERA UM '=')
      const error = err as Error;
      setError(error.message || 'Erro ao reenviar email de confirmação');
    } finally {
      setLoading(false);
    }
  };

  if (isResettingPassword) {
    return <ResetPassword onCancel={() => setIsResettingPassword(false)} />;
  }

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-fixed flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full shadow-lg mb-4" aria-hidden="true">
            <FileText className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Sistema de Gerenciamento de Licitações
          </h1>
          <p className="mt-2 text-gray-200">
            {isRegistering ? 'Crie sua conta para começar' : 'Acesse sua conta para continuar'}
          </p>
        </div>

        <div className="bg-white py-8 px-8 shadow-xl rounded-lg">
          <form className="space-y-6" onSubmit={handleAuth} aria-label={isRegistering ? "Formulário de registro" : "Formulário de login"}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                  <AtSign className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={error && error.includes("email") ? "email-error" : undefined}
                  aria-invalid={error && error.includes("email") ? "true" : "false"}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="seu.email@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={error ? "password-error" : "password-help"}
                  aria-invalid={error ? "true" : "false"}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <p id="password-help" className="mt-1 text-xs text-gray-500" aria-live="polite">
                Mínimo 6 caracteres
              </p>
            </div>

            {error && (
              <div 
                role="alert" 
                aria-live="assertive"
                id={error.includes("email") ? "email-error" : "password-error"}
                className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-md"
              >
                <div>{error}</div>
                {error.includes("Email not confirmed") && pendingEmail && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={loading}
                    aria-label="Reenviar email de confirmação"
                    className="mt-2 text-blue-600 hover:text-blue-800 underline text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    Reenviar email de confirmação
                  </button>
                )}
              </div>
            )}
            {message && (
              <div 
                role="status" 
                aria-live="polite"
                className="text-green-600 text-sm text-center p-2 bg-green-50 rounded-md"
              >
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                aria-label={loading ? 'Processando...' : (isRegistering ? 'Registrar nova conta' : 'Fazer login')}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Carregando...' : (isRegistering ? 'Registrar' : 'Entrar')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                  setMessage('');
                }}
                aria-label={isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Registre-se'}
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                {isRegistering
                  ? 'Já tem uma conta? Entre aqui'
                  : 'Não tem uma conta? Registre-se'}
              </button>
            </div>
            {!isRegistering && (
              <div className="text-sm mt-2">
                <button
                  type="button"
                  onClick={() => setIsResettingPassword(true)}
                  aria-label="Esqueceu sua senha? Recuperar senha"
                  className="font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
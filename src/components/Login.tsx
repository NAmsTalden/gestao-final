import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import ResetPassword from './ResetPassword';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        // Registrar novo usuário
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        alert('Verifique seu email para confirmar o registro!');
      } else {
        // Login de usuário existente
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Ocorreu um erro durante a autenticação');
    } finally {
      setLoading(false);
    }
  };

  if (isResettingPassword) {
    return <ResetPassword onCancel={() => setIsResettingPassword(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isRegistering ? 'Criar nova conta' : 'Entrar no sistema'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Carregando...' : (isRegistering ? 'Registrar' : 'Entrar')}
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-4">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
            >
              {isRegistering
                ? 'Já tem uma conta? Entre aqui'
                : 'Não tem uma conta? Registre-se'}
            </button>

            {!isRegistering && (
              <button
                onClick={() => setIsResettingPassword(true)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-500"
              >
                Esqueceu sua senha?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
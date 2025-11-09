import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ResetPasswordProps {
  onCancel: () => void;
}

const ResetPassword = ({ onCancel }: ResetPasswordProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#type=recovery`
      });

      if (error) throw error;

      setMessage('Enviamos um email com instruções para redefinir sua senha. Por favor, verifique sua caixa de entrada.');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Ocorreu um erro ao tentar enviar o email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Recuperar Senha
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Digite seu email e enviaremos instruções para redefinir sua senha.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleResetPassword} aria-label="Formulário de recuperação de senha">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={error ? "reset-error" : "reset-help"}
                  aria-invalid={error ? "true" : "false"}
                  autoComplete="email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="seu.email@exemplo.com"
                />
              </div>
              <p id="reset-help" className="mt-1 text-xs text-gray-500">
                Enviaremos um link de recuperação para este email
              </p>
            </div>

            {error && (
              <div 
                role="alert" 
                aria-live="assertive"
                id="reset-error"
                className="text-red-600 text-sm"
              >
                {error}
              </div>
            )}

            {message && (
              <div 
                role="status" 
                aria-live="polite"
                className="text-green-600 text-sm"
              >
                {message}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                aria-label={loading ? "Enviando email de recuperação..." : "Enviar email de recuperação"}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Email'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Voltar para login"
                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Voltar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
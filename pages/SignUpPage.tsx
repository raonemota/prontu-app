import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Page } from '../types';

interface SignUpPageProps {
    setActivePage: (page: Page) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ setActivePage }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
       setError(error.message === "User already registered" ? "Usuário com este e-mail já existe." : error.message);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("Usuário com este e-mail já existe.");
    } else {
      setMessage("Cadastro realizado! Verifique seu e-mail para confirmação.");
    }
    setLoading(false);
  };

  const inputStyles = "mt-1 w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-dark-subtext";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-dark-subtext";

  return (
    <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark-bg">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-dark-card rounded-xl shadow-md">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">Crie sua Conta</h1>
            <p className="text-gray-500 dark:text-dark-subtext">É rápido e fácil.</p>
        </div>
        
        {error && <p className="text-center text-danger bg-red-100 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-lg">{error}</p>}
        {message && <p className="text-center text-green-800 bg-green-100 dark:bg-green-900/50 dark:text-green-300 p-3 rounded-lg">{message}</p>}

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className={labelStyles}>Nome Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={inputStyles}
            />
          </div>
          <div>
            <label className={labelStyles}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputStyles}
            />
          </div>
          <div>
            <label className={labelStyles}>Senha (mínimo 6 caracteres)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={inputStyles}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-primary rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Conta'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-dark-subtext">
            Já tem uma conta?{' '}
            <button onClick={() => setActivePage(Page.Login)} className="font-medium text-primary hover:underline">
                Faça login
            </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
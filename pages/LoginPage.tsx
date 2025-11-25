
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Page } from '../types';
import { StarIcon } from '../components/icons/StarIcon';

interface LoginPageProps {
    setActivePage: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setActivePage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === "Invalid login credentials" ? "E-mail ou senha inválidos." : error.message);
    }
    setLoading(false);
  };
  
  const inputStyles = "mt-1 w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-dark-subtext";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-dark-subtext";

  return (
    <div className="w-full max-w-md">
        <div className="p-8 space-y-6 bg-white dark:bg-dark-card rounded-xl shadow-md">
            <div className="text-center">
                <img src="https://mnlzeruerqwuhhgfaavy.supabase.co/storage/v1/object/public/files_config/image-removebg-preview%20(1).png" alt="Prontu Logo" className="mx-auto h-16 w-auto" />
                <p className="text-gray-500 dark:text-dark-subtext mt-4">Acesse sua conta</p>
            </div>
            
            {error && <p className="text-center text-danger bg-red-100 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-lg">{error}</p>}

            <form onSubmit={handleLogin} className="space-y-6">
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
                <label className={labelStyles}>Senha</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputStyles}
                />
                </div>
                <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 text-white bg-primary rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
                >
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
                </div>
            </form>
            <div className="text-center space-y-3">
                <p className="text-sm text-gray-600 dark:text-dark-subtext">
                    Não tem uma conta?{' '}
                    <button onClick={() => setActivePage(Page.SignUp)} className="font-medium text-primary hover:underline">
                        Cadastre-se
                    </button>
                </p>
            </div>
        </div>

        {/* Link para Landing Page */}
        <div className="mt-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-xl p-4 text-center">
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-primary mb-2">
                    <StarIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wide">Prontu Premium</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-dark-subtext mb-3">
                    Conheça nossos planos e funcionalidades exclusivas.
                </p>
                <button 
                    onClick={() => setActivePage(Page.Landing)}
                    className="text-sm font-semibold text-secondary hover:text-teal-700 hover:underline transition-colors"
                >
                    Ver Planos e Preços &rarr;
                </button>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;

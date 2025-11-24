
import React, { useState, useEffect } from 'react';
import { User, Page } from '../types';
import SubPageHeader from '../components/SubPageHeader';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { supabase } from '../supabaseClient';

interface AdminPageProps {
  setActivePage: (page: Page) => void;
  currentUser: User;
}

const AdminPage: React.FC<AdminPageProps> = ({ setActivePage, currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!currentUser.is_admin) {
        alert("Acesso negado. Esta área é restrita.");
        setActivePage(Page.Home);
        return;
      }

      setLoading(true);
      try {
        // Busca todos os usuários da tabela public.users
        // Requer política RLS configurada para admins
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (error: any) {
        console.error("Erro ao buscar usuários:", error.message);
        alert("Erro ao carregar lista de usuários. Verifique se você é um administrador.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [currentUser, setActivePage]);

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'ativo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'canceled':
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'past_due':
      case 'atrasado':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <SubPageHeader 
        title="Administração" 
        onBack={() => setActivePage(Page.Home)}
        icon={<ShieldCheckIcon className="w-6 h-6" />}
      />

      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md space-y-4">
        <input
          type="text"
          placeholder="Buscar usuário por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-dark-subtext"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 dark:text-dark-subtext uppercase bg-gray-50 dark:bg-dark-border">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Usuário</th>
                <th className="px-4 py-3">Plano / Tipo</th>
                <th className="px-4 py-3">Ciclo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expiração</th>
                <th className="px-4 py-3">V. Acumulado</th>
                <th className="px-4 py-3 rounded-tr-lg">Último Acesso</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-dark-subtext">
                    Carregando dados...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-dark-subtext">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="bg-white dark:bg-dark-card border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-dark dark:text-dark-text flex items-center gap-3 whitespace-nowrap">
                      <img 
                        src={user.profile_pic || 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/m9asaisyvrr2/001-woman.png'} 
                        alt="" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span>{user.full_name}</span>
                        <span className="text-xs text-gray-500 dark:text-dark-subtext font-normal">{user.email || 'Email oculto'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-purple-300">
                        {user.tipo_assinante || user.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-dark-text">
                      {user.ciclo_plano || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status_assinatura)}`}>
                        {user.status_assinatura || 'Sem Info'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-dark-text">
                      {formatDate(user.data_expiracao_acesso)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(user.valor_acumulado)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-dark-subtext text-xs">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('pt-BR') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

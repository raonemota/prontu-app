import React, { useState, useEffect } from 'react';
import { User, Page } from '../types';
import SubPageHeader from '../components/SubPageHeader';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { supabase } from '../supabaseClient';
import EditUserModal from '../components/EditUserModal';

interface AdminPageProps {
  setActivePage: (page: Page) => void;
  currentUser: User;
}

const AdminPage: React.FC<AdminPageProps> = ({ setActivePage, currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Estados para exclusão
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!currentUser.is_admin) {
        alert("Acesso negado. Esta área é restrita.");
        setActivePage(Page.Home);
        return;
      }

      setLoading(true);
      try {
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

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
      try {
          const { data, error } = await supabase
              .from('users')
              .update(updates)
              .eq('id', userId)
              .select()
              .single();
          
          if (error) throw error;

          setUsers(prev => prev.map(u => u.id === userId ? data : u));
          alert("Usuário atualizado com sucesso!");
      } catch (error: any) {
          console.error("Erro ao atualizar usuário:", error.message);
          alert("Falha ao atualizar usuário: " + error.message);
      }
  };

  const handleDeleteUser = async () => {
      if (!userToDelete) return;
      
      setIsDeleting(true);
      try {
          // Chama a função RPC segura no banco de dados
          const { error } = await supabase.rpc('delete_user_as_admin', {
              user_id_to_delete: userToDelete.id
          });

          if (error) throw error;

          setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
          alert(`Usuário ${userToDelete.full_name} excluído com sucesso.`);
          setUserToDelete(null);
      } catch (error: any) {
          console.error("Erro ao excluir usuário:", error.message);
          alert("Falha ao excluir usuário: " + error.message + "\n\nVerifique se a função 'delete_user_as_admin' existe no Supabase.");
      } finally {
          setIsDeleting(false);
      }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
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

  const getPlanBadgeColor = (plan?: string) => {
      switch (plan?.toLowerCase()) {
          case 'premium':
              return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800';
          case 'beta':
              return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800';
          case 'free':
          default:
              return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
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
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expiração</th>
                <th className="px-4 py-3">Último Acesso</th>
                <th className="px-4 py-3 rounded-tr-lg text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-dark-subtext">
                    Carregando dados...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-dark-subtext">
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
                        <div className="flex items-center gap-1">
                            <span>{user.full_name}</span>
                            {user.is_admin && (
                              <span title="Administrador">
                                <ShieldCheckIcon className="w-4 h-4 text-primary" />
                              </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-dark-subtext font-normal">{user.email || 'Email oculto'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col items-start">
                          <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md mb-1 ${getPlanBadgeColor(user.tipo_assinante || user.plan)}`}>
                            {user.tipo_assinante || user.plan || 'Free'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-dark-subtext">{user.ciclo_plano}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status_assinatura)}`}>
                        {user.status_assinatura || 'Sem Info'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-dark-text">
                      {formatDate(user.data_expiracao_acesso)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-dark-subtext text-xs">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('pt-BR') : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                            <button 
                                onClick={() => setEditingUser(user)}
                                className="text-gray-500 hover:text-primary hover:bg-primary/10 p-2 rounded-full transition-all"
                                title="Editar Usuário"
                            >
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setUserToDelete(user)}
                                className="text-gray-500 hover:text-danger hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded-full transition-all"
                                title="Excluir Usuário"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
          <EditUserModal 
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
            user={editingUser}
            onSave={handleUpdateUser}
          />
      )}

      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-danger">
                    <TrashIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-dark dark:text-dark-text mb-2">Excluir Usuário?</h3>
                <p className="text-sm text-gray-600 dark:text-dark-subtext mb-6">
                    Você está prestes a excluir <strong>{userToDelete.full_name}</strong>. 
                    <br/><br/>
                    <span className="text-danger font-semibold">Esta ação apagará todos os pacientes, agendamentos e dados financeiros deste usuário permanentemente.</span>
                </p>
                <div className="flex justify-center space-x-3">
                    <button 
                        onClick={() => setUserToDelete(null)} 
                        className="px-4 py-2 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-dark-text rounded-lg font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleDeleteUser} 
                        disabled={isDeleting}
                        className="px-4 py-2 bg-danger text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                        {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
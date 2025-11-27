
import React, { useState, useEffect } from 'react';
import { User, Page } from '../types';
import SubPageHeader from '../components/SubPageHeader';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { supabase } from '../supabaseClient';
import EditUserModal from '../components/EditUserModal';
import { CheckIcon } from '../components/icons/CheckIcon';
import { ChevronDoubleRightIcon } from '../components/icons/ChevronDoubleRightIcon';
import { CloseIcon } from '../components/icons/CloseIcon';

interface AdminPageProps {
  setActivePage: (page: Page) => void;
  currentUser: User;
}

// URL baseada no projeto configurado em supabaseClient.ts (mnlzeruerqwuhhgfaavy)
const DEFAULT_WEBHOOK_URL = "https://mnlzeruerqwuhhgfaavy.supabase.co/functions/v1/kiwify-webhook?token=345lgtcpney";

// Helper para extrair o ID do projeto da URL
const getProjectIdFromUrl = (url: string) => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.split('.')[0];
    } catch (e) {
        return '';
    }
};

const AdminPage: React.FC<AdminPageProps> = ({ setActivePage, currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Estados para exclusão
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Estados para Teste de Webhook
  const [webhookUrl, setWebhookUrl] = useState(DEFAULT_WEBHOOK_URL);
  const [webhookData, setWebhookData] = useState({
    email: '',
    status: 'paid',
    plan: 'Prontu Premium (Mensal)',
    fullName: 'Teste Kiwify'
  });
  const [webhookSending, setWebhookSending] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<string | null>(null);
  const [webhookResponseStatus, setWebhookResponseStatus] = useState<'success' | 'error' | 'warning' | null>(null);
  
  // Estado do Modal de Ajuda
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTab, setHelpTab] = useState<'steps' | 'sql' | 'function'>('steps');

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
  
  const getPayload = () => ({
      order_id: `test_${Math.floor(Math.random() * 100000)}`,
      order_status: webhookData.status,
      product_name: webhookData.plan,
      customer: {
        email: webhookData.email,
        full_name: webhookData.fullName,
        mobile: "+5511999999999"
      },
      subscription_id: `sub_${Math.floor(Math.random() * 100000)}`,
      created_at: new Date().toISOString()
  });

  const handleTestWebhookFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookSending(true);
    setWebhookResponse(null);
    setWebhookResponseStatus(null);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(getPayload()),
      });

      if (response.ok) {
        setWebhookResponse(`Sucesso (Fetch)! Status: ${response.status}`);
        setWebhookResponseStatus('success');
      } else {
        const text = await response.text();
        
        if (response.status === 401) {
            setWebhookResponse(`Erro 401 (Não Autorizado): A Edge Function está protegida.\n\nSOLUÇÃO: Você precisa fazer o deploy novamente com a flag de acesso público.\n\nComando:\nsupabase functions deploy kiwify-webhook --no-verify-jwt`);
            setWebhookResponseStatus('error');
        } else {
            setWebhookResponse(`Erro (Fetch): ${response.status} - ${text}`);
            setWebhookResponseStatus('error');
        }
      }
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
          setWebhookResponse("Erro CORS ('Failed to fetch').\n1. Verifique se o projeto na URL do webhook é o mesmo da aplicação.\n2. Verifique se a função foi deployada com --no-verify-jwt.\n\nO Kiwify não funcionará se este erro persistir.");
          setWebhookResponseStatus('error');
      } else {
          setWebhookResponse(`Erro na requisição: ${error.message}`);
          setWebhookResponseStatus('error');
      }
    } finally {
      setWebhookSending(false);
    }
  };
  
  const handleTestWebhookInvoke = async (e: React.MouseEvent) => {
      e.preventDefault();
      setWebhookSending(true);
      setWebhookResponse(null);
      setWebhookResponseStatus(null);
      
      try {
          // Extrai o nome da função e query params da URL fornecida
          const urlObj = new URL(webhookUrl);
          const pathParts = urlObj.pathname.split('/');
          const functionName = pathParts[pathParts.length - 1]; // ex: 'kiwify-webhook'
          const query = urlObj.search; // ex: '?token=...'
          
          // O método invoke utiliza o cliente autenticado do Supabase, o que evita muitos problemas de CORS
          // se a função estiver hospedada no MESMO projeto.
          const { data, error } = await supabase.functions.invoke(`${functionName}${query}`, {
              body: getPayload()
          });
          
          if (error) throw error;
          
          setWebhookResponse("Sucesso (Invoke): " + (JSON.stringify(data) || "OK"));
          setWebhookResponseStatus('success');
          
      } catch (error: any) {
          setWebhookResponse(`Erro (Invoke): ${error.message}. Verifique se a URL pertence ao projeto configurado na aplicação.`);
          setWebhookResponseStatus('error');
      } finally {
          setWebhookSending(false);
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
  
  const getResponseStyle = () => {
      switch (webhookResponseStatus) {
          case 'success': return 'bg-green-100 text-green-800 border-green-200';
          case 'error': return 'bg-red-100 text-red-800 border-red-200';
          case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
  };

  // Verificação de Projeto
  const currentProjectId = 'mnlzeruerqwuhhgfaavy'; // ID fixo do supabaseClient.ts
  const webhookProjectId = getProjectIdFromUrl(webhookUrl);
  const isDifferentProject = webhookProjectId && webhookProjectId !== currentProjectId;

  // Code Snippets for Help Modal
  const sqlCode = `
-- Execute isso no SQL Editor do Supabase para garantir que a tabela users tenha as colunas necessárias

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status_assinatura text DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS tipo_assinante text DEFAULT 'Free',
ADD COLUMN IF NOT EXISTS ciclo_plano text DEFAULT 'Mensal',
ADD COLUMN IF NOT EXISTS data_expiracao_acesso timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_id text,
ADD COLUMN IF NOT EXISTS customer_id text;

-- Garanta que a coluna phone existe na tabela patients
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS phone text;

-- Garanta que a função possa ser chamada
GRANT ALL ON TABLE public.users TO service_role;
`;

  const functionCode = `
// index.ts para Supabase Edge Function 'kiwify-webhook'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    // 1. Validação Simples de Token (Configure isso no Kiwify também)
    if (token !== '345lgtcpney') {
       return new Response(JSON.stringify({ error: 'Unauthorized token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const payload = await req.json();
    console.log("Webhook received:", payload);

    const { order_status, product_name, customer } = payload;
    const email = customer?.email;

    if (!email) {
       return new Response(JSON.stringify({ error: 'No email provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Inicializa Supabase Admin (Bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Lógica de Atualização
    let updateData: any = {};
    const now = new Date();

    if (order_status === 'paid') {
        updateData.status_assinatura = 'active';
        updateData.tipo_assinante = 'Premium';
        
        // Define expiração baseado no plano
        let monthsToAdd = 1;
        if (product_name.toLowerCase().includes('semestral')) monthsToAdd = 6;
        if (product_name.toLowerCase().includes('anual')) monthsToAdd = 12;

        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + monthsToAdd);
        updateData.data_expiracao_acesso = expirationDate.toISOString();
        updateData.ciclo_plano = product_name;
    
    } else if (order_status === 'refunded' || order_status === 'chargeback') {
        updateData.status_assinatura = 'canceled';
        updateData.tipo_assinante = 'Free';
        updateData.data_expiracao_acesso = now.toISOString();
    }

    // 3. Busca ou Cria Usuário
    // Verifica se usuário já existe
    let { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    // Se usuário não existe e o pagamento foi aprovado, CRIA a conta
    if (!user && order_status === 'paid') {
        console.log("Usuário não encontrado. Criando conta automática para:", email);
        
        // Gera uma senha temporária segura (O usuário deve usar "Esqueci a Senha" para acessar)
        const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true, // Auto confirma o email
            user_metadata: { full_name: customer.full_name || 'Cliente Kiwify' }
        });

        if (createError) {
             console.error("Erro ao criar usuário:", createError);
             throw createError;
        }

        user = { id: newUser.user.id };

        // Aguarda um momento para garantir que triggers de banco (public.users) tenham rodado
        await new Promise(r => setTimeout(r, 1000));
        
        // Garante que o registro na tabela public.users existe via Upsert
        // (Caso o trigger não tenha rodado a tempo ou não exista)
        const { error: upsertError } = await supabaseAdmin.from('users').upsert({
             id: user.id,
             email: email,
             full_name: customer.full_name || 'Cliente Kiwify',
             profile_pic: 'https://mnlzeruerqwuhhgfaavy.supabase.co/storage/v1/object/public/files_config/unknown.png',
             ...updateData // Já aplica o plano premium na criação
        });
        
        if (upsertError) console.error("Erro no upsert manual:", upsertError);
        
        return new Response(JSON.stringify({ 
            message: 'User created and updated successfully (Shadow Account)', 
            data: updateData,
            note: 'User must use Forgot Password to login first time' 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } 
    
    if (!user) {
         // Se não foi pago e não existe, apenas ignora
         return new Response(JSON.stringify({ message: 'User not found and not a paid order' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    // 4. Se usuário já existe, apenas atualiza
    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', user.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ message: 'User updated successfully', data: updateData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
`;

  return (
    <div className="space-y-6">
      <SubPageHeader 
        title="Administração" 
        onBack={() => setActivePage(Page.Home)}
        icon={<ShieldCheckIcon className="w-6 h-6" />}
      >
        <button 
            onClick={() => setShowHelpModal(true)}
            className="px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-blue-200 transition-colors"
        >
            <span>📚 Guia de Integração</span>
        </button>
      </SubPageHeader>
      
      {/* Seção de Teste de Webhook */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md space-y-4 border border-blue-200 dark:border-blue-900">
        <h3 className="text-lg font-bold text-dark dark:text-dark-text flex items-center gap-2">
          <span>⚡</span> Ambiente de Teste de Webhook (Kiwify)
        </h3>
        
        {isDifferentProject && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg text-xs border border-yellow-200 dark:border-yellow-800">
                <strong>Atenção:</strong> O projeto da URL do webhook (<code>{webhookProjectId}</code>) parece diferente do projeto configurado na aplicação (<code>{currentProjectId}</code>). Isso causará erros de CORS no teste via navegador e falhas no Invoke.
            </div>
        )}

        <form onSubmit={handleTestWebhookFetch} className="space-y-4 bg-gray-50 dark:bg-dark-bg p-4 rounded-lg">
          <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-subtext mb-1">URL da Edge Function (Webhook)</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-lg text-dark dark:text-dark-text text-sm font-mono text-xs"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                 Esta URL deve ser gerada pelo comando <code>supabase functions deploy</code>. Se você ainda não criou a função, clique em "Guia de Integração" acima.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-subtext mb-1">Email do Cliente (deve existir no banco)</label>
              <input
                type="email"
                value={webhookData.email}
                onChange={(e) => setWebhookData({...webhookData, email: e.target.value})}
                placeholder="ex: usuario@email.com"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-lg text-dark dark:text-dark-text text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-subtext mb-1">Nome do Cliente (Simulado)</label>
              <input
                type="text"
                value={webhookData.fullName}
                onChange={(e) => setWebhookData({...webhookData, fullName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-lg text-dark dark:text-dark-text text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-subtext mb-1">Status do Pedido</label>
              <select
                value={webhookData.status}
                onChange={(e) => setWebhookData({...webhookData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-lg text-dark dark:text-dark-text text-sm"
              >
                <option value="paid">Pago (paid)</option>
                <option value="refunded">Reembolsado (refunded)</option>
                <option value="chargeback">Chargeback</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-subtext mb-1">Produto / Plano</label>
              <select
                value={webhookData.plan}
                onChange={(e) => setWebhookData({...webhookData, plan: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-lg text-dark dark:text-dark-text text-sm"
              >
                <option value="Prontu Premium (Mensal)">Prontu Premium (Mensal)</option>
                <option value="Prontu Premium (Semestral)">Prontu Premium (Semestral)</option>
                <option value="Prontu Premium (Anual)">Prontu Premium (Anual)</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-end gap-3 pt-2">
             <button
              type="button"
              onClick={handleTestWebhookInvoke}
              disabled={webhookSending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              title="Usa o cliente Supabase. Evita problemas de CORS se o projeto for o mesmo."
            >
               <span>Testar via Supabase Client</span>
               <ChevronDoubleRightIcon className="w-4 h-4" />
            </button>

             <button
              type="submit"
              disabled={webhookSending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              title="Requisição HTTP direta. Pode falhar por CORS no navegador."
            >
              {webhookSending ? 'Enviando...' : (
                <>
                  <span>Testar via HTTP (Fetch)</span>
                  <CheckIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          
          {webhookResponse && (
            <div className={`mt-2 p-3 rounded-lg text-xs font-mono break-all whitespace-pre-wrap ${getResponseStyle()}`}>
              {webhookResponse}
            </div>
          )}
        </form>
      </div>

      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md space-y-4">
        <h3 className="text-lg font-bold text-dark dark:text-dark-text">Lista de Usuários</h3>
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

      {/* Modal de Guia de Integração */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[90] p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-dark-border">
                    <h3 className="text-xl font-bold text-dark dark:text-dark-text">Guia de Integração Kiwify & Supabase</h3>
                    <button onClick={() => setShowHelpModal(false)} className="text-gray-400 hover:text-gray-600">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex border-b border-gray-100 dark:border-dark-border px-6">
                    <button onClick={() => setHelpTab('steps')} className={`py-3 px-4 text-sm font-medium border-b-2 ${helpTab === 'steps' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>Passo a Passo</button>
                    <button onClick={() => setHelpTab('sql')} className={`py-3 px-4 text-sm font-medium border-b-2 ${helpTab === 'sql' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>1. Banco de Dados (SQL)</button>
                    <button onClick={() => setHelpTab('function')} className={`py-3 px-4 text-sm font-medium border-b-2 ${helpTab === 'function' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>2. Edge Function</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {helpTab === 'steps' && (
                        <div className="space-y-4 text-sm text-gray-600 dark:text-dark-subtext">
                            <p>Para o sistema receber pagamentos automaticamente, você precisa criar uma <strong>Supabase Edge Function</strong>. O código foi atualizado para <strong>criar contas automaticamente</strong> se o usuário comprar sem ter cadastro.</p>
                            
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg mb-4">
                                <strong>⚠️ Importante sobre Contas Automáticas:</strong><br/>
                                Quando um usuário compra sem cadastro, a função cria a conta mas ele não sabe a senha. 
                                Ele deve usar o botão <strong>"Esqueci minha senha"</strong> na tela de login para definir sua senha e acessar.
                            </div>

                            <ol className="list-decimal pl-5 space-y-3 mt-4">
                                <li>
                                    <strong>Prepare o Banco de Dados:</strong> Copie o código na aba "1. Banco de Dados (SQL)" e execute no SQL Editor do seu painel Supabase. Isso cria as colunas necessárias.
                                </li>
                                <li>
                                    <strong>Instale o Supabase CLI:</strong> No seu computador, você precisará ter o Supabase CLI instalado para criar e implantar a função.
                                </li>
                                <li>
                                    <strong>Crie a Função:</strong> No terminal do seu projeto, rode:
                                    <code className="block bg-gray-100 dark:bg-dark-bg p-2 rounded mt-1">supabase functions new kiwify-webhook</code>
                                </li>
                                <li>
                                    <strong>Adicione o Código:</strong> Copie o código da aba "2. Edge Function" e cole dentro do arquivo <code>supabase/functions/kiwify-webhook/index.ts</code> que foi criado.
                                </li>
                                <li>
                                    <strong>Faça o Deploy (CRÍTICO):</strong> Rode o comando abaixo. A flag em vermelho é obrigatória para webhooks públicos:
                                    <code className="block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 p-3 rounded mt-1 font-bold">
                                        supabase functions deploy kiwify-webhook --no-verify-jwt
                                    </code>
                                    <span className="text-xs text-orange-600 dark:text-orange-400">Sem o <code>--no-verify-jwt</code>, o Kiwify receberá erro 401 (Não autorizado).</span>
                                </li>
                                <li>
                                    <strong>Configure as Variáveis:</strong> No painel do Supabase (Edge Functions), adicione as secrets <code>SUPABASE_URL</code> e <code>SUPABASE_SERVICE_ROLE_KEY</code> se não estiverem automáticas.
                                </li>
                                <li>
                                    <strong>Pegue a URL Final:</strong> O terminal mostrará a URL final (ex: <code>https://mnlzeruerqwuhhgfaavy.supabase.co/functions/v1/kiwify-webhook</code>). Adicione o seu token no final: <code>?token=345lgtcpney</code> e configure no Kiwify.
                                </li>
                            </ol>
                        </div>
                    )}

                    {helpTab === 'sql' && (
                        <div>
                            <p className="text-sm mb-2">Execute este script no <strong>SQL Editor</strong> do seu painel Supabase:</p>
                            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto font-mono">
                                {sqlCode}
                            </pre>
                             <button 
                                onClick={() => navigator.clipboard.writeText(sqlCode)}
                                className="mt-2 text-primary text-xs font-bold hover:underline"
                            >
                                Copiar SQL
                            </button>
                        </div>
                    )}

                    {helpTab === 'function' && (
                        <div>
                            <p className="text-sm mb-2">Substitua o conteúdo de <code>supabase/functions/kiwify-webhook/index.ts</code> por este código:</p>
                            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto font-mono max-h-[400px]">
                                {functionCode}
                            </pre>
                            <button 
                                onClick={() => navigator.clipboard.writeText(functionCode)}
                                className="mt-2 text-primary text-xs font-bold hover:underline"
                            >
                                Copiar Código TypeScript
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg rounded-b-xl flex justify-end">
                    <button 
                        onClick={() => setShowHelpModal(false)}
                        className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-purple-700"
                    >
                        Entendi, vou configurar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

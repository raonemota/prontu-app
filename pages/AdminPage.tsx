
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
import { DocumentArrowDownIcon } from '../components/icons/DocumentArrowDownIcon';

interface AdminPageProps {
  setActivePage: (page: Page) => void;
  currentUser: User;
}

interface WebhookLog {
    id: number;
    created_at: string;
    payload: any;
    status: string;
    error_message?: string;
}

// URL baseada no projeto configurado em supabaseClient.ts
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
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  
  // States for Users
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // States for Logs
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [logsTableMissing, setLogsTableMissing] = useState(false);

  // States for Webhook Test
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
  
  // Help Modal State
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTab, setHelpTab] = useState<'steps' | 'sql' | 'function'>('steps');

  // Fetch Users
  useEffect(() => {
    if (activeTab === 'users') {
        fetchAllUsers();
    } else {
        fetchLogs();
    }
  }, [activeTab, currentUser]);

  const fetchAllUsers = async () => {
      if (!currentUser.is_admin) return;
      setLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (error: any) {
        console.error("Erro ao buscar usuários:", error.message);
      } finally {
        setLoadingUsers(false);
      }
  };

  const fetchLogs = async () => {
      if (!currentUser.is_admin) return;
      setLoadingLogs(true);
      setLogsTableMissing(false);
      try {
          const { data, error } = await supabase
              .from('webhook_logs')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(50); // Últimos 50 logs
          
          if (error) {
              // 42P01 is PostgreSQL error for undefined table.
              // Also checking message content for client-side schema cache errors
              if (error.code === '42P01' || error.message.includes('Could not find the table') || error.message.includes('schema cache')) {
                  console.warn("Tabela webhook_logs não existe ainda.");
                  setLogsTableMissing(true);
                  return; 
              } else {
                  throw error;
              }
          }
          setLogs(data || []);
      } catch (error: any) {
          console.error("Erro ao buscar logs:", error.message);
          if (error.message.includes('Could not find the table') || error.message.includes('schema cache')) {
             setLogsTableMissing(true);
          }
      } finally {
          setLoadingLogs(false);
      }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
      try {
          // 1. Se o email foi alterado, precisamos chamar a função RPC especial
          // porque a tabela 'users' pública não altera o login do Supabase Auth.
          const originalUser = users.find(u => u.id === userId);
          if (updates.email && originalUser && updates.email !== originalUser.email) {
             const { error: rpcError } = await supabase.rpc('update_user_email_as_admin', {
                 user_id: userId,
                 new_email: updates.email
             });
             
             if (rpcError) {
                 throw new Error(`Erro ao atualizar e-mail (RPC): ${rpcError.message}. Verifique se a função SQL foi criada.`);
             }
             // Não removemos o email do updates, pois queremos atualizar a tabela pública também (redundância segura)
          }

          // 2. Atualiza os dados restantes na tabela pública
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
      webhook_event_type: webhookData.status === 'paid' ? 'order_approved' : webhookData.status === 'refunded' ? 'order_refunded' : 'subscription_late',
      Product: {
          product_name: webhookData.plan
      },
      Customer: {
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

      const text = await response.text();
      let formattedText = text;
      try {
          // Tenta formatar JSON se possível
          formattedText = JSON.stringify(JSON.parse(text), null, 2);
      } catch (e) {}

      if (response.ok) {
        setWebhookResponse(`Sucesso (Fetch)! Status: ${response.status}\nRes: ${formattedText}`);
        setWebhookResponseStatus('success');
        if (activeTab === 'logs') fetchLogs();
      } else {
        if (response.status === 401) {
            setWebhookResponse(`Erro 401 (Auth): Provavelmente falta '--no-verify-jwt' no deploy.\nDetalhes: ${formattedText}`);
            setWebhookResponseStatus('error');
        } else {
            setWebhookResponse(`Erro (Fetch): ${response.status}\nDetalhes: ${formattedText}`);
            setWebhookResponseStatus('error');
        }
      }
    } catch (error: any) {
       setWebhookResponse(`Erro na requisição: ${error.message}`);
       setWebhookResponseStatus('error');
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
          const urlObj = new URL(webhookUrl);
          const pathParts = urlObj.pathname.split('/');
          const functionName = pathParts[pathParts.length - 1]; 
          const query = urlObj.search;
          
          const { data, error } = await supabase.functions.invoke(`${functionName}${query}`, {
              body: getPayload()
          });
          
          if (error) {
              // Supabase invoke retorna erro mesmo se for 400 do servidor
              // Tenta ler o contexto do erro se disponível
              let errorDetails = error.message;
              try {
                  if (error.context && typeof error.context.json === 'function') {
                      const jsonError = await error.context.json();
                      errorDetails = JSON.stringify(jsonError, null, 2);
                  }
              } catch(e) {}
              
              throw new Error(errorDetails);
          }
          
          setWebhookResponse("Sucesso (Invoke): " + (JSON.stringify(data, null, 2) || "OK"));
          setWebhookResponseStatus('success');
          if (activeTab === 'logs') fetchLogs();
          
      } catch (error: any) {
          setWebhookResponse(`Erro (Invoke): ${error.message}`);
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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };
  
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': case 'ativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'canceled': case 'cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'past_due': case 'atrasado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPlanBadgeColor = (plan?: string) => {
      switch (plan?.toLowerCase()) {
          case 'premium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800';
          case 'beta': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800';
          default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
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

  const currentProjectId = 'mnlzeruerqwuhhgfaavy'; 
  const webhookProjectId = getProjectIdFromUrl(webhookUrl);
  const isDifferentProject = webhookProjectId && webhookProjectId !== currentProjectId;

  const sqlCode = `
-- 1. Cria a tabela de Logs de Webhook (se não existir)
create table if not exists webhook_logs (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  payload jsonb,
  status text,
  error_message text
);
alter table webhook_logs enable row level security;

-- Política para Admin ver logs
create policy "Admins can view webhook logs" on webhook_logs for select to authenticated using (
  exists (select 1 from users where id = auth.uid() and is_admin = true)
);

-- 2. Permissões Críticas (Evita erro 400 se a tabela existir mas a function não tiver permissão)
create policy "Service role can insert webhook logs" on webhook_logs for insert to service_role with check (true);

grant all on table webhook_logs to service_role;
grant usage, select on sequence webhook_logs_id_seq to service_role; 

-- 3. Atualiza tabela Users (Campos necessários)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status_assinatura text DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS tipo_assinante text DEFAULT 'Free',
ADD COLUMN IF NOT EXISTS ciclo_plano text DEFAULT 'Mensal',
ADD COLUMN IF NOT EXISTS data_expiracao_acesso timestamp with time zone;

-- 4. Atualiza tabela Patients
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS phone text;

-- 5. Função para atualizar e-mail de usuário (Admin)
-- Permite que administradores alterem o e-mail de login de outros usuários
create or replace function update_user_email_as_admin(user_id uuid, new_email text)
returns void
language plpgsql
security definer
as $$
begin
  -- Verifica se quem chama é admin
  if not exists (select 1 from public.users where id = auth.uid() and is_admin = true) then
    raise exception 'Acesso negado: Apenas administradores podem realizar esta ação.';
  end if;

  -- Atualiza a tabela de autenticação (auth.users)
  -- Define email_confirmed_at para evitar envio de novo email de confirmação (Admin Action)
  update auth.users 
  set email = new_email, 
      email_confirmed_at = now(),
      updated_at = now()
  where id = user_id;

  -- Atualiza a tabela pública (public.users) caso não haja trigger automático
  update public.users 
  set email = new_email 
  where id = user_id;
end;
$$;

GRANT ALL ON TABLE public.users TO service_role;
`;

  const functionCode = `
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let payload;
  try {
    const textBody = await req.text();
    if (!textBody) throw new Error("Empty body");
    payload = JSON.parse(textBody);
    console.log("Webhook payload:", JSON.stringify(payload));
    
    // LOG DE ENTRADA
    try {
        await supabaseAdmin.from('webhook_logs').insert({
            payload: payload,
            status: 'received'
        });
    } catch (e) { console.error("Log error (ignored):", e); }

    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    // SECURITY CHECK
    if (token !== '345lgtcpney') {
       throw new Error('Unauthorized token');
    }

    // EXTRACTION
    const order_status = payload.order_status || '';
    const event_type = payload.webhook_event_type || '';
    
    const customer = payload.Customer || payload.customer;
    const product = payload.Product || payload.product;
    
    const email = customer?.email;
    const fullName = customer?.full_name || customer?.first_name;
    const productName = product?.product_name || payload.product_name || '';

    if (!email) throw new Error('No email provided');

    const now = new Date();
    let updateData: any = {};
    let shouldUpdate = false;

    // --- LÓGICA DE NEGÓCIO ---

    // 1. APROVAÇÃO / RENOVAÇÃO (Active)
    if (order_status === 'paid' || event_type === 'order_approved') {
        shouldUpdate = true;
        updateData.status_assinatura = 'active';
        updateData.tipo_assinante = 'Premium';
        
        let monthsToAdd = 1; // Default Mensal
        const pName = productName.toLowerCase();
        if (pName.includes('semestral')) monthsToAdd = 6;
        if (pName.includes('anual')) monthsToAdd = 12;
        if (pName.includes('trimestral')) monthsToAdd = 3;

        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + monthsToAdd);
        // Garante que pega o final do dia para evitar expiração prematura
        expirationDate.setHours(23, 59, 59, 999);
        
        updateData.data_expiracao_acesso = expirationDate.toISOString();
        updateData.ciclo_plano = productName;
    }
    // 2. REEMBOLSO / CHARGEBACK (Cancelamento Imediato)
    else if (order_status === 'refunded' || order_status === 'chargeback' || event_type === 'order_refunded') {
        shouldUpdate = true;
        updateData.status_assinatura = 'canceled';
        updateData.tipo_assinante = 'Free';
        updateData.data_expiracao_acesso = now.toISOString(); // Expira agora
    }
    // 3. FALHA DE PAGAMENTO / SUSPENSÃO (Perda de Acesso)
    else if (event_type === 'subscription_late' || event_type === 'subscription_suspended' || event_type === 'subscription_expired') {
        shouldUpdate = true;
        updateData.status_assinatura = 'past_due';
        updateData.tipo_assinante = 'Free'; 
        updateData.data_expiracao_acesso = now.toISOString();
    }
    // 4. CANCELAMENTO DE ASSINATURA PELO USUÁRIO (Mantém acesso até o fim do ciclo)
    else if (event_type === 'subscription_canceled') {
        shouldUpdate = true;
        updateData.status_assinatura = 'canceled';
        // NÃO altera para Free nem muda data de expiração.
        // O usuário pagou pelo período, então continua Premium até a data vencer.
    }
    
    if (!shouldUpdate) {
        return new Response(JSON.stringify({ message: 'Event ignored', type: event_type, status: order_status }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
        });
    }

    // BUSCA OU CRIA USUÁRIO
    let { data: user } = await supabaseAdmin.from('users').select('id').eq('email', email).single();

    // AUTO-SIGNUP (Conta Sombra) APENAS SE FOR PAGO
    if (!user && (order_status === 'paid' || event_type === 'order_approved')) {
        const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: fullName || 'Cliente Kiwify' }
        });

        if (createError) throw createError;
        user = { id: newUser.user.id };
        
        // Aguarda propagação
        await new Promise(r => setTimeout(r, 1000));
        
        await supabaseAdmin.from('users').upsert({
             id: user.id,
             email: email,
             full_name: fullName || 'Cliente Kiwify',
             profile_pic: 'https://mnlzeruerqwuhhgfaavy.supabase.co/storage/v1/object/public/files_config/unknown.png',
             ...updateData
        });
        
        await supabaseAdmin.from('webhook_logs').insert({ payload: { email, action: 'created_user' }, status: 'success' });

        return new Response(JSON.stringify({ message: 'User created (Shadow Account)' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
        });
    } 
    
    if (user) {
        await supabaseAdmin.from('users').update(updateData).eq('id', user.id);
        
        await supabaseAdmin.from('webhook_logs').insert({ 
            payload: { email, updateData, event: event_type || order_status }, 
            status: 'processed_update' 
        });

        return new Response(JSON.stringify({ message: 'User updated', data: updateData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
        });
    }

    return new Response(JSON.stringify({ message: 'User not found and not a payment event' }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
    });

  } catch (error) {
    console.error("Fatal Error:", error);
    
    try {
        if(supabaseAdmin) {
            await supabaseAdmin.from('webhook_logs').insert({
                payload: payload || { error: 'Payload parse failed' },
                status: 'error',
                error_message: error.message
            });
        }
    } catch(dbErr) {}

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
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
      
      {/* Teste de Webhook */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md space-y-4 border border-blue-200 dark:border-blue-900">
        <h3 className="text-lg font-bold text-dark dark:text-dark-text flex items-center gap-2">
          <span>⚡</span> Simulador de Webhook (Kiwify)
        </h3>
        
        {isDifferentProject && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg text-xs border border-yellow-200 dark:border-yellow-800">
                <strong>Atenção:</strong> URL do projeto diferente da aplicação atual.
            </div>
        )}

        <form onSubmit={handleTestWebhookFetch} className="space-y-4 bg-gray-50 dark:bg-dark-bg p-4 rounded-lg">
          <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-subtext mb-1">URL da Edge Function</label>
              <input type="text" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-lg text-xs font-mono" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-subtext mb-1">Email do Cliente</label>
              <input type="email" value={webhookData.email} onChange={(e) => setWebhookData({...webhookData, email: e.target.value})} placeholder="cliente@exemplo.com" required className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-subtext mb-1">Status do Evento</label>
              <select value={webhookData.status} onChange={(e) => setWebhookData({...webhookData, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-lg text-sm">
                <option value="paid">Pago / Renovado (Paid)</option>
                <option value="refunded">Reembolsado (Refunded)</option>
                <option value="late">Pagamento Atrasado (Subscription Late)</option>
                <option value="canceled">Assinatura Cancelada (Subscription Canceled)</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
             <button type="button" onClick={handleTestWebhookInvoke} disabled={webhookSending} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
               <span>Testar via Supabase Client</span>
               <ChevronDoubleRightIcon className="w-4 h-4" />
            </button>

             <button type="submit" disabled={webhookSending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
               {webhookSending ? 'Enviando...' : <><span>Testar via HTTP</span><CheckIcon className="w-4 h-4" /></>}
            </button>
          </div>
          
          {webhookResponse && (
            <div className={`mt-2 p-3 rounded-lg text-xs font-mono break-all whitespace-pre-wrap ${getResponseStyle()}`}>
              {webhookResponse}
            </div>
          )}
        </form>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex border-b border-gray-200 dark:border-dark-border">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              Gerenciar Usuários
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              Logs de Webhook
          </button>
      </div>

      {/* Tabela de Usuários */}
      {activeTab === 'users' && (
      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-dark dark:text-dark-text">Lista de Usuários</h3>
            <button onClick={fetchAllUsers} className="text-sm text-primary hover:underline">Atualizar</button>
        </div>
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-sm"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 dark:text-dark-subtext uppercase bg-gray-50 dark:bg-dark-border">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Usuário</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expiração</th>
                <th className="px-4 py-3 rounded-tr-lg text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Carregando...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhum usuário.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="bg-white dark:bg-dark-card border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg/50">
                    <td className="px-4 py-3 font-medium text-dark dark:text-dark-text flex items-center gap-3">
                      <img src={user.profile_pic || 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/m9asaisyvrr2/001-woman.png'} className="w-8 h-8 rounded-full object-cover" alt="" />
                      <div>
                        <div className="flex items-center gap-1">
                            <span>{user.full_name}</span>
                            {user.is_admin && <ShieldCheckIcon className="w-4 h-4 text-primary" />}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-dark-subtext font-normal">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-md ${getPlanBadgeColor(user.tipo_assinante || user.plan)}`}>
                            {user.tipo_assinante || user.plan || 'Free'}
                        </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status_assinatura)}`}>
                        {user.status_assinatura || 'Sem Info'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-dark-text">{formatDate(user.data_expiracao_acesso)}</td>
                    <td className="px-4 py-3 text-center flex justify-center space-x-2">
                        <button onClick={() => setEditingUser(user)} className="text-gray-500 hover:text-primary p-2"><PencilIcon className="w-5 h-5" /></button>
                        <button onClick={() => setUserToDelete(user)} className="text-gray-500 hover:text-danger p-2"><TrashIcon className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Tabela de Logs */}
      {activeTab === 'logs' && (
          <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-dark dark:text-dark-text">Logs de Webhook</h3>
                <button onClick={fetchLogs} className="text-sm text-primary hover:underline">Atualizar Logs</button>
              </div>
              
              {/* Alerta de Tabela Faltante */}
              {logsTableMissing && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-danger font-bold">
                          <span className="text-xl">⚠️</span>
                          <p>Configuração Pendente: Tabela de Logs não encontrada.</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-dark-subtext">
                          Para visualizar os logs, você precisa criar a tabela no banco de dados. 
                          Clique no botão abaixo para copiar o comando SQL e execute-o no <strong>SQL Editor</strong> do Supabase.
                      </p>
                      <div className="bg-gray-800 p-3 rounded-lg overflow-x-auto">
                          <code className="text-xs font-mono text-gray-300 whitespace-pre">
                              {sqlCode.split(';')[0] + '; ...'}
                          </code>
                      </div>
                      <button 
                        onClick={() => { setShowHelpModal(true); setHelpTab('sql'); }}
                        className="self-start px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-purple-700"
                      >
                          Ver SQL Completo e Corrigir
                      </button>
                  </div>
              )}
              
              {!logsTableMissing && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-dark-subtext uppercase bg-gray-50 dark:bg-dark-border">
                            <tr>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Info</th>
                                <th className="px-4 py-3 text-center">Payload</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingLogs ? (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Carregando logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Nenhum log encontrado.</td></tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="bg-white dark:bg-dark-card border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg/50">
                                        <td className="px-4 py-3 text-gray-600 dark:text-dark-text text-xs whitespace-nowrap">
                                            {formatDateTime(log.created_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                ${log.status === 'success' || log.status === 'processed_update' ? 'bg-green-100 text-green-800' : 
                                                log.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-dark-subtext truncate max-w-xs">
                                            {log.error_message ? <span className="text-red-500">{log.error_message}</span> : 
                                            log.payload?.Customer?.email || log.payload?.customer?.email || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => setSelectedLog(log)}
                                                className="text-primary hover:text-purple-700 text-xs font-bold"
                                            >
                                                Ver JSON
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
              )}
          </div>
      )}

      {/* Modais */}
      {editingUser && <EditUserModal isOpen={!!editingUser} onClose={() => setEditingUser(null)} user={editingUser} onSave={handleUpdateUser} />}
      
      {/* Modal de Detalhes do Log */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[80] p-4 backdrop-blur-sm">
             <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-dark-border">
                    <h3 className="font-bold text-dark dark:text-dark-text">Detalhes do Log #{selectedLog.id}</h3>
                    <button onClick={() => setSelectedLog(null)}><CloseIcon className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="p-4 overflow-auto flex-1 bg-gray-900 text-gray-100 font-mono text-xs rounded-b-xl">
                    <pre>{JSON.stringify(selectedLog.payload, null, 2)}</pre>
                </div>
             </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-danger"><TrashIcon className="w-6 h-6" /></div>
                <h3 className="text-lg font-bold text-dark dark:text-dark-text mb-2">Excluir Usuário?</h3>
                <p className="text-sm text-gray-600 dark:text-dark-subtext mb-6">Você está prestes a excluir <strong>{userToDelete.full_name}</strong>. Esta ação é irreversível.</p>
                <div className="flex justify-center space-x-3">
                    <button onClick={() => setUserToDelete(null)} className="px-4 py-2 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-dark-text rounded-lg font-medium">Cancelar</button>
                    <button onClick={handleDeleteUser} disabled={isDeleting} className="px-4 py-2 bg-danger text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">{isDeleting ? 'Excluindo...' : 'Sim, Excluir'}</button>
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
                    <button onClick={() => setHelpTab('sql')} className={`py-3 px-4 text-sm font-medium border-b-2 ${helpTab === 'sql' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>1. Banco (SQL)</button>
                    <button onClick={() => setHelpTab('function')} className={`py-3 px-4 text-sm font-medium border-b-2 ${helpTab === 'function' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>2. Edge Function</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {helpTab === 'steps' && (
                        <div className="space-y-4 text-sm text-gray-600 dark:text-dark-subtext">
                            <p>Agora o sistema conta com <strong>Logs de Webhook</strong> e <strong>Auto-Signup</strong> (Criação de conta automática para quem não tem cadastro).</p>
                            <ol className="list-decimal pl-5 space-y-3 mt-4">
                                <li>
                                    <strong>Atualize o Banco (SQL):</strong> Copie o código da aba "1. Banco (SQL)" e execute no SQL Editor do Supabase. Isso cria a tabela <code>webhook_logs</code> e dá permissões corretas.
                                </li>
                                <li>
                                    <strong>Atualize a Função (Deploy):</strong> Copie o código da aba "2. Edge Function". Ele foi corrigido para tratar erros de log de forma não-fatal e retornar detalhes do erro no response.
                                </li>
                                <li>
                                    <strong>Deploy Obrigatório:</strong> Use o comando:
                                    <code className="block bg-gray-100 dark:bg-dark-bg p-2 rounded mt-1 font-mono">
                                        supabase functions deploy kiwify-webhook --no-verify-jwt
                                    </code>
                                </li>
                            </ol>
                        </div>
                    )}
                    {helpTab === 'sql' && (
                        <div>
                            <p className="text-sm mb-2">Execute no SQL Editor para criar a tabela de logs e corrigir permissões:</p>
                            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto font-mono">{sqlCode}</pre>
                            <button onClick={() => navigator.clipboard.writeText(sqlCode)} className="mt-2 text-primary text-xs font-bold hover:underline">Copiar SQL</button>
                        </div>
                    )}
                    {helpTab === 'function' && (
                        <div>
                            <p className="text-sm mb-2">Substitua o código em <code>supabase/functions/kiwify-webhook/index.ts</code>:</p>
                            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto font-mono max-h-[400px]">{functionCode}</pre>
                            <button onClick={() => navigator.clipboard.writeText(functionCode)} className="mt-2 text-primary text-xs font-bold hover:underline">Copiar TypeScript</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

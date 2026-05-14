import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Referral, User } from '../types';
import { ShareIcon } from '../components/icons/ShareIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { CopyIcon } from '../components/icons/CopyIcon';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';

interface ReferralPageProps {
  currentUser: User | null;
  onBack?: () => void;
}

const ReferralPage: React.FC<ReferralPageProps> = ({ currentUser, onBack }) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Helper para buscar nome do usuário referenciado
  const fetchReferralDetails = async (referralsData: Referral[]) => {
      const enhancedReferrals = await Promise.all(referralsData.map(async (ref) => {
          const { data: userData } = await supabase
              .from('users')
              .select('full_name, email')
              .eq('id', ref.referred_id)
              .single();
          
          return {
              ...ref,
              referred_user: userData || { full_name: 'Usuário Desconhecido' }
          };
      }));
      return enhancedReferrals;
  };

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!currentUser) return;
      try {
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
            const enhanced = await fetchReferralDetails(data);
            setReferrals(enhanced);
        }
      } catch (err) {
        console.error('Erro ao buscar indicações:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [currentUser]);

  const referralLink = currentUser ? `https://app.prontu.ia.br/?ref=${currentUser.id}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
      if (navigator.share) {
          navigator.share({
              title: 'Prontu - Sistema Médico',
              text: 'Cadastre-se pelo meu link e ganhe dias grátis no Prontu, o melhor sistema para clínicas!',
              url: referralLink,
          }).catch((error) => console.log('Erro ao compartilhar', error));
      } else {
          handleCopy();
      }
  };

  return (
    <div className="bg-white dark:bg-dark-bg min-h-screen font-sans text-dark dark:text-dark-text pb-12">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-bg/90 backdrop-blur-md border-b border-gray-100 dark:border-dark-border">
        <div className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
                <img src="https://mnlzeruerqwuhhgfaavy.supabase.co/storage/v1/object/public/files_config/image-removebg-preview%20(1).png" alt="Prontu" className="h-8 md:h-10 w-auto" />
            </div>
            {onBack && (
                <button 
                    onClick={onBack}
                    className="text-sm font-medium text-primary hover:text-purple-700 transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-dark-card"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Voltar
                </button>
            )}
        </div>
      </nav>

      <main className="w-full max-w-4xl mx-auto space-y-6 px-6 pt-8">
        <div className="bg-white dark:bg-dark-card rounded-xl p-8 shadow-sm border border-gray-100 dark:border-dark-border text-center">
          <h2 className="text-2xl font-bold text-dark dark:text-dark-text mb-2">Indique e Ganhe 🎁</h2>
          <p className="text-gray-600 dark:text-dark-subtext mb-6">
            Convide colegas para usarem o Prontu. Se eles assinarem um plano premium, você ganha <b>1 mês grátis!</b>
          </p>

          <div className="max-w-xl mx-auto bg-gray-50 dark:bg-dark-bg rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4">
              <input 
                  type="text" 
                  readOnly 
                  value={referralLink} 
                  className="w-full bg-transparent border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-0 text-center sm:text-left"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors text-dark dark:text-white"
                  >
                      {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                      {copied ? 'Copiado' : 'Copiar'}
                  </button>
                  <button 
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-primary text-white hover:bg-primary-dark rounded-lg text-sm font-medium shadow-md shadow-primary/20 transition-all"
                  >
                      <ShareIcon className="w-4 h-4" />
                      Compartilhar
                  </button>
              </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-dark dark:text-dark-text mb-4">Minhas Indicações</h3>
          
          {loading ? (
              <p className="text-gray-500 text-sm text-center py-4">Carregando indicações...</p>
          ) : referrals.length === 0 ? (
              <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-dark-subtext">Você ainda não indicou ninguém.</p>
                  <p className="text-xs text-gray-400 mt-2">Compartilhe seu link acima para começar a ganhar bônus!</p>
              </div>
          ) : (
              <div className="overflow-x-auto">
                  <table className="w-full">
                      <thead>
                          <tr className="border-b border-gray-100 dark:border-dark-border">
                              <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                              <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                              <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                          {referrals.map((ref) => (
                              <tr key={ref.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                                  <td className="py-3 text-sm text-dark dark:text-dark-text">
                                      <div className="font-medium">{ref.referred_user?.full_name}</div>
                                      <div className="text-xs text-gray-500">{ref.referred_user?.email}</div>
                                  </td>
                                  <td className="py-3 text-sm text-gray-500 dark:text-dark-subtext">
                                      {new Date(ref.created_at).toLocaleDateString('pt-BR')}
                                  </td>
                                  <td className="py-3">
                                      {ref.status === 'recompensado' ? (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                              <CheckIcon className="w-3 h-3" /> Recompensado
                                          </span>
                                      ) : (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                              Pendente
                                          </span>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReferralPage;

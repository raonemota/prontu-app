
import React from 'react';
import { Page } from '../types';
import { CheckIcon } from '../components/icons/CheckIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { ChartIcon } from '../components/icons/ChartIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { StarIcon } from '../components/icons/StarIcon';

interface LandingPageProps {
  setActivePage: (page: Page) => void;
  isLoggedIn: boolean;
}

const APP_URL = "https://app.prontu.ia.br";

const LandingPage: React.FC<LandingPageProps> = ({ setActivePage, isLoggedIn }) => {

  const handleSubscribe = (plan: 'Mensal' | 'Semestral' | 'Anual') => {
    const links = {
        'Mensal': 'https://pay.kiwify.com.br/sBnlFQM',
        'Semestral': 'https://pay.kiwify.com.br/Ghj8s5D',
        'Anual': 'https://pay.kiwify.com.br/bmxvXLR'
    };

    const url = links[plan];
    if (url) {
        window.open(url, '_blank');
    }
  };

  const navigateToApp = () => {
      // Se estiver rodando em localhost, usa o setActivePage para teste
      if (window.location.hostname.includes('localhost')) {
          setActivePage(isLoggedIn ? Page.Home : Page.Login);
      } else {
          // Em produção, redireciona para o subdomínio
          window.location.href = APP_URL;
      }
  };

  return (
    <div className="bg-white dark:bg-dark-bg min-h-screen font-sans text-dark dark:text-dark-text overflow-x-hidden">
      {/* Header / Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-bg/90 backdrop-blur-md border-b border-gray-100 dark:border-dark-border">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
                <img src="https://mnlzeruerqwuhhgfaavy.supabase.co/storage/v1/object/public/files_config/image-removebg-preview%20(1).png" alt="Prontu" className="h-8 md:h-10 w-auto" />
            </div>
            <button 
                onClick={navigateToApp}
                className="text-sm font-medium text-gray-600 dark:text-dark-subtext hover:text-primary transition-colors flex items-center gap-2 border border-gray-200 dark:border-dark-border px-4 py-2 rounded-full hover:bg-gray-50 dark:hover:bg-dark-card"
            >
                {isLoggedIn ? 'Ir para o App' : 'Fazer Login'}
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 py-16 md:py-24 text-center max-w-5xl mx-auto relative overflow-hidden">
        {/* Background Blob Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-xs font-bold uppercase tracking-wider animate-fade-in shadow-sm">
          <StarIcon className="w-4 h-4" />
          <span>Oferta Especial de Lançamento</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8 bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white bg-clip-text text-transparent pb-2">
          Seus atendimentos organizado.<br /> 
          <span className="text-primary">Sua mente tranquila.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-dark-subtext mb-12 max-w-2xl mx-auto leading-relaxed">
          Abandone as planilhas complexas. Tenha controle total de pacientes, agendamentos e finanças na palma da sua mão com o Prontu Premium.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl shadow-primary/30 hover:scale-105 hover:bg-purple-700 transition-all w-full sm:w-auto transform"
            >
                Quero ser Premium
            </button>
            <button 
                onClick={navigateToApp}
                className="px-10 py-4 bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text border border-gray-200 dark:border-dark-border rounded-full font-bold text-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-all w-full sm:w-auto"
            >
                Entrar Grátis
            </button>
        </div>
        <p className="text-xs text-gray-400 mt-4">Cancele quando quiser. Sem taxas ocultas.</p>
      </header>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-gray-50 dark:bg-dark-card/50">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-dark dark:text-dark-text">
                Por que profissionais de saúde <br className="hidden md:block" /> escolhem o <span className="text-primary">Prontu Premium</span>?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-10">
                {/* Benefit 1 */}
                <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-dark-border group">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <UsersIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Cadastro Ilimitado</h3>
                    <p className="text-gray-600 dark:text-dark-subtext leading-relaxed">
                        O plano gratuito limita seus pacientes. No Premium, o céu é o limite. Cadastre e gerencie sua base completa sem preocupações.
                    </p>
                </div>

                {/* Benefit 2 */}
                <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-dark-border group">
                    <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <ChartIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Relatórios Inteligentes</h3>
                    <p className="text-gray-600 dark:text-dark-subtext leading-relaxed">
                        Transforme dados em decisões. Exporte relatórios financeiros detalhados em PDF e Excel para sua contabilidade ou controle pessoal.
                    </p>
                </div>

                {/* Benefit 3 */}
                <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-dark-border group">
                    <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <ShieldCheckIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Segurança Total</h3>
                    <p className="text-gray-600 dark:text-dark-subtext leading-relaxed">
                        Seus dados são criptografados com padrões bancários. Backup automático na nuvem para você nunca perder uma anotação sequer.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-24 bg-white dark:bg-dark-bg relative">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Investimento que se paga</h2>
                <p className="text-lg text-gray-500 dark:text-dark-subtext">Escolha o plano ideal para o seu momento profissional.</p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto">
                
                {/* Free Plan */}
                <div className="order-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-6 hover:border-gray-300 transition-colors h-full flex flex-col">
                    <h3 className="text-xl font-bold text-gray-500 dark:text-dark-subtext mb-2">Gratuito</h3>
                    <div className="flex items-baseline mb-6">
                        <span className="text-4xl font-extrabold text-dark dark:text-dark-text">R$ 0,00</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 dark:border-dark-border pb-8">
                        Para quem está começando a organizar seus atendimentos.
                    </p>
                    <ul className="space-y-4 mb-8 flex-1">
                         <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-dark-subtext">
                            <CheckIcon className="w-4 h-4 text-green-500" /> Até 5 pacientes
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-dark-subtext">
                            <CheckIcon className="w-4 h-4 text-green-500" /> Agenda básica
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-dark-subtext">
                            <CheckIcon className="w-4 h-4 text-green-500" /> Acesso ao app
                        </li>
                    </ul>
                    <button 
                        onClick={navigateToApp}
                        className="w-full py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Criar Conta Grátis
                    </button>
                    <div className="mt-3 h-4"></div> {/* Spacer to align with guarantee text */}
                </div>

                {/* Monthly Plan */}
                <div className="order-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-6 hover:border-gray-300 transition-colors h-full flex flex-col">
                    <h3 className="text-xl font-bold text-gray-500 dark:text-dark-subtext mb-2">Mensal</h3>
                    <div className="flex items-baseline mb-6">
                        <span className="text-4xl font-extrabold text-dark dark:text-dark-text">R$ 9,90</span>
                        <span className="text-gray-400 ml-2">/mês</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 dark:border-dark-border pb-8">
                        Para quem quer flexibilidade total sem compromisso.
                    </p>
                    <ul className="space-y-4 mb-8 flex-1">
                         <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-dark-subtext">
                            <CheckIcon className="w-4 h-4 text-green-500" /> Pacientes ilimitados
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-dark-subtext">
                            <CheckIcon className="w-4 h-4 text-green-500" /> Exportação de relatórios
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-dark-subtext">
                            <CheckIcon className="w-4 h-4 text-green-500" /> Backup na nuvem
                        </li>
                    </ul>
                    <button 
                        onClick={() => handleSubscribe('Mensal')}
                        className="w-full py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors"
                    >
                        Assinar Mensal
                    </button>
                    <p className="text-[10px] text-center mt-3 text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-1">
                        <ShieldCheckIcon className="w-3 h-3" /> 7 dias de garantia grátis
                    </p>
                </div>

                {/* Semiannual Plan (Best Value) */}
                <div className="order-3 bg-gradient-to-br from-primary to-purple-900 text-white rounded-3xl p-6 shadow-2xl transform md:scale-105 relative z-10 border border-purple-500/30 h-full flex flex-col">
                    <div className="absolute top-0 right-0 left-0 -mt-4 flex justify-center">
                         <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-sm">
                            Mais Popular
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white/90 mb-2">Semestral</h3>
                    <div className="flex items-baseline mb-1">
                        <span className="text-5xl font-extrabold">R$ 49,90</span>
                    </div>
                    <p className="text-white/70 text-sm font-medium mb-6">cobrado a cada 6 meses</p>
                    
                    <div className="bg-white/10 rounded-xl p-3 mb-8 backdrop-blur-sm">
                        <p className="text-xs text-center text-white/80">Equivalente a <strong className="text-white text-base">R$ 8,31</strong> / mês</p>
                    </div>
                    
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3">
                            <div className="bg-white p-0.5 rounded-full"><CheckIcon className="w-3 h-3 text-primary" /></div>
                            <span className="text-sm font-medium">Economia de 16%</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="bg-white/20 p-0.5 rounded-full"><CheckIcon className="w-3 h-3 text-white" /></div>
                            <span className="text-sm font-medium">Todas as features Premium</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="bg-white/20 p-0.5 rounded-full"><CheckIcon className="w-3 h-3 text-white" /></div>
                            <span className="text-sm font-medium">Suporte prioritário</span>
                        </li>
                    </ul>

                    <button 
                        onClick={() => handleSubscribe('Semestral')}
                        className="w-full py-4 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-colors transform hover:-translate-y-1"
                    >
                        Quero Economizar Agora
                    </button>
                    <p className="text-[10px] text-center mt-3 text-white/90 font-bold flex items-center justify-center gap-1">
                        <ShieldCheckIcon className="w-3 h-3" /> 7 dias de garantia grátis
                    </p>
                </div>

                {/* Annual Plan */}
                <div className="order-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-6 hover:border-gray-300 transition-colors h-full flex flex-col">
                    <h3 className="text-xl font-bold text-gray-500 dark:text-dark-subtext mb-2">Anual</h3>
                    <div className="flex items-baseline mb-6">
                        <span className="text-4xl font-extrabold text-dark dark:text-dark-text">R$ 109,90</span>
                        <span className="text-gray-400 ml-2">/ano</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 dark:border-dark-border pb-8">
                        Pague uma única vez e garanta um ano inteiro.
                    </p>
                     <ul className="space-y-4 mb-8 flex-1">
                         <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-dark-subtext">
                            <CheckIcon className="w-4 h-4 text-green-500" /> Acesso vitalício aos dados
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-dark-subtext">
                            <CheckIcon className="w-4 h-4 text-green-500" /> Renovação automática
                        </li>
                         <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-dark-subtext">
                            <CheckIcon className="w-4 h-4 text-green-500" /> Menor valor mensal
                        </li>
                    </ul>
                    <button 
                         onClick={() => handleSubscribe('Anual')}
                        className="w-full py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors"
                    >
                        Assinar Anual
                    </button>
                    <p className="text-[10px] text-center mt-3 text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-1">
                        <ShieldCheckIcon className="w-3 h-3" /> 7 dias de garantia grátis
                    </p>
                </div>

            </div>
            
            <div className="mt-16 text-center bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl max-w-3xl mx-auto border border-green-100 dark:border-green-900/30">
                 <p className="text-sm text-green-800 dark:text-green-300 flex items-center justify-center gap-3 font-medium">
                    <ShieldCheckIcon className="w-6 h-6" />
                    <span>Garantia de Satisfação: Teste o plano Premium por 7 dias. Se não gostar, devolvemos seu dinheiro.</span>
                 </p>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-card py-12 border-t border-gray-100 dark:border-dark-border mt-12">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-dark-subtext">
              <div className="mb-4 md:mb-0 text-center md:text-left">
                  <img src="https://mnlzeruerqwuhhgfaavy.supabase.co/storage/v1/object/public/files_config/image-removebg-preview%20(1).png" alt="Prontu" className="h-6 w-auto mb-2 opacity-70 mx-auto md:mx-0" />
                  <p>&copy; {new Date().getFullYear()} Prontu Gestão. Todos os direitos reservados.</p>
              </div>
              <div className="flex gap-6">
                  <button className="hover:text-primary transition-colors">Termos de Uso</button>
                  <button className="hover:text-primary transition-colors">Política de Privacidade</button>
                  <button onClick={() => window.open('mailto:suporte@prontu.com')} className="hover:text-primary transition-colors">Suporte</button>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;


import React from 'react';
import { Page } from '../types';
import { CheckIcon } from '../components/icons/CheckIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { ChartIcon } from '../components/icons/ChartIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { ClockIcon } from '../components/icons/ClockIcon';

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
      if (window.location.hostname.includes('localhost')) {
          setActivePage(isLoggedIn ? Page.Home : Page.Login);
      } else {
          window.location.href = APP_URL;
      }
  };

  return (
    <div className="bg-white dark:bg-dark-bg min-h-screen font-sans text-dark dark:text-dark-text overflow-x-hidden">
      
      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-delayed {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out 2s infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Header / Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-bg/90 backdrop-blur-md border-b border-gray-100 dark:border-dark-border">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
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
      <header className="px-6 py-12 md:py-20 max-w-7xl mx-auto relative overflow-hidden">
        {/* Background Blob Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left z-10 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-xs font-bold uppercase tracking-wider shadow-sm mx-auto lg:mx-0">
                    <StarIcon className="w-4 h-4" />
                    <span>Oferta Especial de Lançamento</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white bg-clip-text text-transparent pb-2">
                    Seus atendimentos organizados.<br /> 
                    <span className="text-primary">Sua mente tranquila.</span>
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-dark-subtext mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Abandone as planilhas complexas. Tenha controle total de pacientes, agendamentos e finanças na palma da sua mão com o Prontu Premium.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    <button 
                        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl shadow-primary/30 hover:scale-105 hover:bg-purple-700 transition-all w-full sm:w-auto transform"
                    >
                        Quero ser Premium
                    </button>
                    <button 
                        onClick={navigateToApp}
                        className="px-8 py-4 bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text border border-gray-200 dark:border-dark-border rounded-full font-bold text-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-all w-full sm:w-auto"
                    >
                        Entrar Grátis
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-4">Cancele quando quiser. Sem taxas ocultas.</p>
            </div>

            {/* Right Visuals (Mockups) */}
            <div className="flex-1 relative w-full flex justify-center lg:justify-end min-h-[550px] lg:min-h-[650px] select-none pointer-events-none perspective-1000">
                
                {/* Phone Mockup - Agenda */}
                <div className="relative z-20 animate-float transform transition-transform hover:scale-[1.02] duration-500">
                    <div className="relative mx-auto border-gray-900 dark:border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20">
                         {/* Notch / Dynamic Island */}
                         <div className="w-[100px] h-[24px] bg-black top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-30 flex justify-center items-center">
                            <div className="w-16 h-4 bg-gray-800/50 rounded-full mt-1"></div>
                         </div>

                         {/* Side Buttons */}
                         <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                         <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                         <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                         <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                         
                         {/* Screen Content */}
                         <div className="flex-1 bg-gray-50 dark:bg-black pt-10 px-4 relative overflow-hidden flex flex-col">
                            {/* App Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Olá, Doutora!</h2>
                                    <p className="text-xs text-gray-500">3 agendamentos hoje</p>
                                </div>
                                <div className="w-10 h-10 rounded-full ring-2 ring-primary p-0.5">
                                    <img src="https://i.pravatar.cc/150?img=5" alt="Profile" className="w-full h-full rounded-full object-cover" />
                                </div>
                            </div>

                            {/* Calendar Strip */}
                            <div className="flex justify-between mb-6 text-center bg-white dark:bg-gray-900 p-2 rounded-xl shadow-sm">
                                <div className="p-2 bg-primary text-white rounded-lg shadow-lg transform scale-105">
                                    <p className="text-[10px] uppercase">Seg</p>
                                    <p className="font-bold text-sm">12</p>
                                </div>
                                {['Ter', 'Qua', 'Qui', 'Sex'].map((d, i) => (
                                    <div key={d} className="p-2 text-gray-400 flex flex-col items-center justify-center">
                                        <p className="text-[10px] uppercase">{d}</p>
                                        <p className="font-bold text-sm">{13 + i}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Appointments List */}
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-2 px-1">
                                    <span>AGENDAMENTOS</span>
                                    <span>Ver tudo</span>
                                </div>
                                
                                {/* Card 1 */}
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                    <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden">
                                        <img src="https://i.pravatar.cc/150?img=12" className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800 dark:text-white truncate">João Silva</p>
                                        <p className="text-[10px] text-gray-500 truncate">Psicoterapia Individual</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                        <ClockIcon className="w-3 h-3" />
                                        <span>09:00</span>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                    <div className="w-1 h-8 bg-yellow-500 rounded-full"></div>
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex-shrink-0 overflow-hidden">
                                        <img src="https://i.pravatar.cc/150?img=9" className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800 dark:text-white truncate">Maria Souza</p>
                                        <p className="text-[10px] text-gray-500 truncate">Avaliação Neuropsicológica</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                        <ClockIcon className="w-3 h-3" />
                                        <span>10:30</span>
                                    </div>
                                </div>

                                 {/* Card 3 */}
                                 <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 opacity-75">
                                    <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex-shrink-0 overflow-hidden">
                                        <img src="https://i.pravatar.cc/150?img=3" className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800 dark:text-white truncate">Pedro Santos</p>
                                        <p className="text-[10px] text-gray-500 truncate">Sessão Infantil</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                        <ClockIcon className="w-3 h-3" />
                                        <span>14:00</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Tab Bar Mock */}
                            <div className="h-14 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-around items-center px-2">
                                <div className="p-2 text-primary"><div className="w-6 h-6 bg-primary/20 rounded-md"></div></div>
                                <div className="p-2 text-gray-300"><div className="w-6 h-6 bg-gray-200 rounded-md"></div></div>
                                <div className="p-2 text-gray-300"><div className="w-6 h-6 bg-gray-200 rounded-md"></div></div>
                                <div className="p-2 text-gray-300"><div className="w-6 h-6 bg-gray-200 rounded-md"></div></div>
                            </div>

                            {/* Floating Action Button */}
                            <div className="absolute bottom-20 right-4 w-12 h-12 bg-primary rounded-full shadow-lg shadow-primary/40 flex items-center justify-center text-white text-2xl font-light hover:scale-110 transition-transform">
                                +
                            </div>
                         </div>
                    </div>
                </div>

                {/* Floating Finance Card Mockup - Glassmorphism */}
                <div className="absolute top-[40%] -right-4 lg:-right-12 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 z-30 animate-float-delayed w-72 hidden sm:block">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 bg-green-100 text-green-600 rounded-xl">
                            <ChartIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Faturamento Mensal</p>
                            <p className="text-xl font-black text-gray-800 dark:text-white tracking-tight">R$ 12.450</p>
                        </div>
                    </div>
                    {/* Mock Graph */}
                    <div className="flex items-end justify-between h-32 gap-3 px-1">
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-md h-[40%] relative group overflow-hidden">
                             <div className="w-full h-full bg-primary/30"></div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-md h-[60%] overflow-hidden">
                             <div className="w-full h-full bg-primary/50"></div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-md h-[50%] overflow-hidden">
                             <div className="w-full h-full bg-primary/40"></div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-md h-[75%] overflow-hidden">
                             <div className="w-full h-full bg-primary/70"></div>
                        </div>
                        <div className="w-full bg-primary rounded-t-md h-[90%] relative shadow-lg shadow-primary/30">
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex justify-between mt-3 text-[10px] font-semibold text-gray-400 uppercase">
                        <span>Jan</span>
                        <span>Fev</span>
                        <span>Mar</span>
                        <span>Abr</span>
                        <span>Mai</span>
                    </div>
                </div>

            </div>
        </div>
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

      {/* Testimonials Section */}
      <section className="px-6 py-24 bg-white dark:bg-dark-bg relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute top-1/2 right-0 transform translate-x-1/3 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    Depoimentos Reais
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark dark:text-white">Quem usa, recomenda</h2>
                <p className="text-lg text-gray-500 dark:text-dark-subtext max-w-2xl mx-auto">
                    Junte-se a centenas de profissionais que transformaram a gestão de seus consultórios.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Testimonial 1 */}
                <div className="bg-white dark:bg-dark-card p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-border flex flex-col h-full hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex items-center gap-1 text-yellow-400 mb-6">
                        {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <div className="relative mb-6 flex-1">
                        <span className="absolute -top-4 -left-2 text-6xl text-gray-200 dark:text-gray-700 font-serif opacity-50">"</span>
                        <p className="text-gray-600 dark:text-gray-300 italic relative z-10 leading-relaxed">
                            Antes do Prontu, eu perdia horas com planilhas e muitas vezes esquecia de cobrar sessões desmarcadas. Agora tenho controle total do financeiro e da agenda em um só lugar. Mudou minha rotina!
                        </p>
                    </div>
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <img src="https://i.pravatar.cc/150?img=5" alt="Usuário" className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
                        <div>
                            <h4 className="font-bold text-dark dark:text-white text-sm">Dra. Ana Clara</h4>
                            <p className="text-xs text-gray-500 font-medium">Psicóloga Clínica</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-white dark:bg-dark-card p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-border flex flex-col h-full hover:-translate-y-2 transition-transform duration-300 relative">
                     {/* Destaque */}
                     <div className="absolute -top-3 right-6 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                        Cliente Premium
                     </div>
                     <div className="flex items-center gap-1 text-yellow-400 mb-6">
                        {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <div className="relative mb-6 flex-1">
                        <span className="absolute -top-4 -left-2 text-6xl text-gray-200 dark:text-gray-700 font-serif opacity-50">"</span>
                        <p className="text-gray-600 dark:text-gray-300 italic relative z-10 leading-relaxed">
                            A funcionalidade de relatórios foi decisiva pra mim. Consigo enviar tudo para minha contabilidade em segundos. O suporte também é excelente, sempre resolvem minhas dúvidas rápido.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <img src="https://i.pravatar.cc/150?img=11" alt="Usuário" className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
                        <div>
                            <h4 className="font-bold text-dark dark:text-white text-sm">Dr. Carlos Eduardo</h4>
                            <p className="text-xs text-gray-500 font-medium">Nutricionista</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 3 */}
                <div className="bg-white dark:bg-dark-card p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-border flex flex-col h-full hover:-translate-y-2 transition-transform duration-300">
                     <div className="flex items-center gap-1 text-yellow-400 mb-6">
                        {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <div className="relative mb-6 flex-1">
                         <span className="absolute -top-4 -left-2 text-6xl text-gray-200 dark:text-gray-700 font-serif opacity-50">"</span>
                        <p className="text-gray-600 dark:text-gray-300 italic relative z-10 leading-relaxed">
                            Simples, bonito e funcional. É exatamente o que eu precisava. Não tem mil botões inúteis, vai direto ao ponto. O cadastro de pacientes ilimitado do plano Premium vale cada centavo.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <img src="https://i.pravatar.cc/150?img=9" alt="Usuário" className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
                        <div>
                            <h4 className="font-bold text-dark dark:text-white text-sm">Mariana Costa</h4>
                            <p className="text-xs text-gray-500 font-medium">Fonoaudióloga</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-24 bg-gray-50 dark:bg-dark-bg/50 relative">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-dark dark:text-text">Investimento que se paga</h2>
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

import React, { useEffect, useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone; 

    // Função para mostrar o prompt
    const showPrompt = () => {
        if (isIosDevice && !isStandalone) {
            setIsIOS(true);
            setIsVisible(true);
        } else if ((window as any).deferredPrompt) {
            setDeferredPrompt((window as any).deferredPrompt);
            setIsVisible(true);
        }
    };

    // Listener para eventos futuros (caso o evento dispare DEPOIS do componente montar)
    const handler = (e: Event) => {
      e.preventDefault();
      console.log("Evento beforeinstallprompt disparado no componente");
      setDeferredPrompt(e);
      // Pequeno delay para não ser intrusivo imediatamente
      setTimeout(() => setIsVisible(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Verifica se o evento já aconteceu (capturado pelo index.html)
    // Adiciona um delay de 3 segundos para garantir que o usuário já viu a tela inicial após o login
    const timer = setTimeout(() => {
        showPrompt();
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;

    if (!promptEvent) {
        return;
    }

    promptEvent.prompt();

    const { outcome } = await promptEvent.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuário aceitou a instalação');
    }
    
    setDeferredPrompt(null);
    (window as any).deferredPrompt = null; 
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 md:left-1/2 md:transform md:-translate-x-1/2 md:w-full md:max-w-[800px] animate-fade-in-up">
      <div className="bg-primary text-white p-4 rounded-xl shadow-lg shadow-primary/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        <div className="flex-1">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <img 
                src="https://mnlzeruerqwuhhgfaavy.supabase.co/storage/v1/object/public/files_config/image-removebg-preview%20(1).png" 
                alt="App Icon" 
                className="w-6 h-6 rounded bg-white object-contain" 
            />
            Instalar App Prontu
          </h3>
          <p className="text-xs opacity-95 mt-1 leading-relaxed">
            {isIOS 
              ? "Para instalar no iPhone: Toque no botão de Compartilhar abaixo e depois em 'Adicionar à Tela de Início'."
              : "Instale o aplicativo para acesso rápido e melhor experiência."}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
            {!isIOS && (
                <button 
                    onClick={handleInstallClick}
                    className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm whitespace-nowrap"
                >
                    Instalar Agora
                </button>
            )}
            <button 
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                aria-label="Fechar"
            >
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
      
      {isIOS && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-primary animate-bounce hidden md:hidden">
           ▼
        </div>
      )}
    </div>
  );
};

export default InstallPrompt;
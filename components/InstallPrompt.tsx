import React, { useEffect, useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Previne o mini-infobar padrão do Chrome
      e.preventDefault();
      // Guarda o evento para disparar mais tarde
      setDeferredPrompt(e);
      // Mostra o banner
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostra o prompt nativo de instalação
    deferredPrompt.prompt();

    // Espera pela escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuário aceitou a instalação');
    } else {
      console.log('Usuário recusou a instalação');
    }

    // Limpa o evento, pois ele não pode ser usado duas vezes
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 md:left-1/2 md:transform md:-translate-x-1/2 md:w-full md:max-w-[800px]">
      <div className="bg-primary text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-fade-in-up">
        <div className="flex-1 pr-4">
          <h3 className="font-bold text-sm">Instalar App Prontu</h3>
          <p className="text-xs opacity-90 mt-1">Instale o aplicativo para acesso rápido e melhor experiência.</p>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={handleInstallClick}
                className="bg-white text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
            >
                Instalar
            </button>
            <button 
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
                <CloseIcon className="w-5 h-5 text-white" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
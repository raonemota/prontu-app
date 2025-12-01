import React, { useState, useEffect } from 'react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('prontu_cookie_consent');
    if (!consent) {
      // Pequeno delay para animação de entrada
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('prontu_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-fade-in-up">
      <div className="max-w-4xl mx-auto bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-2xl rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-dark-text leading-relaxed">
            <span className="font-bold text-primary">🍪 Privacidade & Dados:</span> Utilizamos cookies essenciais e tecnologias semelhantes para garantir o funcionamento adequado da plataforma e melhorar sua experiência (LGPD). Ao continuar navegando, você concorda com o uso de dados.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors text-sm whitespace-nowrap"
          >
            Aceitar e Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckIcon } from './icons/CheckIcon';

const FeatureAnnouncementModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já viu a novidade
    const hasSeenAnnouncement = localStorage.getItem('has_seen_specific_time_feature_v1');
    
    // Pequeno delay para não aparecer imediatamente na renderização
    if (!hasSeenAnnouncement) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // Salva no localStorage para não mostrar novamente
    localStorage.setItem('has_seen_specific_time_feature_v1', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
        
        {/* Badge de Novidade */}
        <div className="absolute top-0 left-0 bg-gradient-to-r from-secondary to-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-br-xl shadow-md z-10">
          NOVIDADE
        </div>

        <button 
            onClick={handleClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-dark-subtext dark:hover:text-dark-text bg-white/50 dark:bg-black/20 rounded-full p-1 transition-colors z-10"
        >
            <CloseIcon className="w-5 h-5" />
        </button>

        {/* Imagem / Visual da Funcionalidade */}
        <div className="bg-gradient-to-br from-primary/5 to-purple-100 dark:from-primary/10 dark:to-dark-bg pt-12 pb-6 px-6 flex justify-center">
            {/* Mockup da UI */}
            <div className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl shadow-lg p-3 w-full max-w-[240px] transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex space-x-2 mb-3 border-b border-gray-100 dark:border-dark-border pb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">Seg</div>
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-400 flex items-center justify-center text-xs font-bold">Ter</div>
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">Qua</div>
                </div>
                
                <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-dark-card p-2 rounded border border-gray-100 dark:border-dark-border">
                        <span className="text-xs font-semibold text-gray-600 dark:text-dark-text ml-1">Segunda-feira</span>
                        <div className="flex items-center bg-white dark:bg-dark-bg px-2 py-0.5 rounded border border-gray-200 dark:border-dark-border shadow-sm">
                            <ClockIcon className="w-3 h-3 text-primary mr-1" />
                            <span className="text-xs font-bold text-primary">09:00</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-dark-card p-2 rounded border border-gray-100 dark:border-dark-border">
                        <span className="text-xs font-semibold text-gray-600 dark:text-dark-text ml-1">Quarta-feira</span>
                        <div className="flex items-center bg-white dark:bg-dark-bg px-2 py-0.5 rounded border border-gray-200 dark:border-dark-border shadow-sm">
                            <ClockIcon className="w-3 h-3 text-primary mr-1" />
                            <span className="text-xs font-bold text-primary">10:30</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6 text-center">
            <h3 className="text-xl font-bold text-dark dark:text-dark-text mb-2">
                Horários Personalizados!
            </h3>
            
            <p className="text-gray-500 dark:text-dark-subtext text-sm leading-relaxed mb-6">
                Agora você pode definir um <strong>horário diferente para cada dia da semana</strong> no cadastro do paciente. 
                <br/><br/>
                Ideal para pacientes que atendem Segunda às 09:00 e Quarta às 10:30, por exemplo.
            </p>

            <button 
                onClick={handleClose}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
                <CheckIcon className="w-5 h-5" />
                Legal, entendi!
            </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureAnnouncementModal;

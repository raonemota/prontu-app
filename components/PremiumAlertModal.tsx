
import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { Page } from '../types';

interface PremiumAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  navigateTo?: (page: Page) => void;
}

const LANDING_URL = "https://www.prontu.ia.br";

const PremiumAlertModal: React.FC<PremiumAlertModalProps> = ({ isOpen, onClose, title, message, navigateTo }) => {
  if (!isOpen) return null;
  
  const handleNavigate = () => {
      if (window.location.hostname.includes('localhost') && navigateTo) {
          onClose();
          navigateTo(Page.Landing);
      } else {
          // Em produção, vai para a Landing Page externa
          window.location.href = `${LANDING_URL}#pricing`;
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[80] p-6 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative transform transition-all scale-100">
        
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-dark-subtext dark:hover:text-dark-text transition-colors z-10"
        >
            <CloseIcon className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center p-8">
            <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary">
                <LockClosedIcon className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-dark dark:text-dark-text mb-3">
                {title}
            </h3>
            
            <p className="text-gray-500 dark:text-dark-subtext text-sm leading-relaxed mb-8">
                {message}
            </p>

            <button 
                onClick={navigateTo ? handleNavigate : onClose}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-transform active:scale-95"
            >
                {navigateTo ? 'Ver Planos Premium' : 'Entendi'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumAlertModal;

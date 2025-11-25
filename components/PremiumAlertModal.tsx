
import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';

interface PremiumAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const PremiumAlertModal: React.FC<PremiumAlertModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

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
                onClick={onClose}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:bg-purple-700 transition-transform active:scale-95"
            >
                Entendi
            </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumAlertModal;

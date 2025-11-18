import React from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface SubPageHeaderProps {
  title: string;
  onBack: () => void;
  children?: React.ReactNode;
}

const SubPageHeader: React.FC<SubPageHeaderProps> = ({ title, onBack, children }) => {
  return (
    <header className="flex items-center justify-between bg-white dark:bg-dark-card shadow-md -mx-4 -mt-4 mb-6 p-4">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onBack} 
          className="p-2 rounded-full text-gray-600 dark:text-dark-subtext hover:bg-gray-100 dark:hover:bg-dark-border"
          aria-label="Voltar"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-dark dark:text-dark-text">{title}</h1>
      </div>
      <div className="flex items-center space-x-2">
        {children}
      </div>
    </header>
  );
};

export default SubPageHeader;

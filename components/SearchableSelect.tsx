
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CloseIcon } from './icons/CloseIcon';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  className = '',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal search term with external value changes
  useEffect(() => {
    const selectedOption = options.find(opt => String(opt.value) === String(value));
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    } else {
      setSearchTerm('');
    }
  }, [value, options]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If closed and no valid option selected matching text, reset text to selected value
        const selectedOption = options.find(opt => String(opt.value) === String(value));
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        } else if (!value) {
            setSearchTerm('');
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, value, options]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    // If user clears input, clear selection
    if (e.target.value === '') {
        onChange('');
    }
  };
  
  const clearSelection = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setSearchTerm('');
      setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div 
        className="relative cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <input
          type="text"
          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-dark-subtext"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          required={required && !value} // Only required if no value selected
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-400">
            {value && (
                <button 
                    type="button" 
                    onClick={clearSelection}
                    className="mr-1 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
            )}
            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 cursor-pointer text-sm hover:bg-primary/10 dark:hover:bg-primary/20 text-dark dark:text-dark-text
                    ${String(value) === String(option.value) ? 'bg-primary/5 dark:bg-primary/10 font-medium text-primary' : ''}
                `}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-dark-subtext cursor-default">
              Nenhum resultado encontrado
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

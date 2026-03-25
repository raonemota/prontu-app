
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { supabase } from '../supabaseClient';

interface ClinicProposalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicProposalForm: React.FC<ClinicProposalFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    teamSize: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Chama a Edge Function do Supabase
      const { error } = await supabase.functions.invoke('send-clinic-proposal', {
        body: formData,
      });

      if (error) throw error;
      
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error sending proposal:', err);
      // Fallback amigável caso a função não esteja implantada ainda
      alert('Ocorreu um erro ao enviar sua proposta via sistema. Por favor, tente novamente ou entre em contato via e-mail.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        {!isSuccess ? (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-2 text-dark dark:text-white">Plano para Clínicas</h2>
            <p className="text-gray-500 dark:text-dark-subtext mb-6">
              Preencha os dados abaixo e entraremos em contato com uma proposta personalizada para sua equipe.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-1">
                  Nome do Responsável
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-1">
                  E-mail Corporativo
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="exemplo@clinica.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-1">
                  Qual o tamanho da equipe?
                </label>
                <select
                  required
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="2-5">2 a 5 profissionais</option>
                  <option value="6-10">6 a 10 profissionais</option>
                  <option value="11-20">11 a 20 profissionais</option>
                  <option value="20+">Mais de 20 profissionais</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isSubmitting ? 'Enviando...' : 'Quero uma proposta personalizada'}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-dark dark:text-white">Solicitação Enviada!</h2>
            <p className="text-gray-600 dark:text-dark-subtext mb-8">
              Recebemos seu interesse. Nossa equipe entrará em contato em breve através do e-mail ou WhatsApp informado.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useState, useMemo, useRef } from 'react';
import { Patient, Category, Clinic, Page, User } from '../types';
import PatientListItem from '../components/PatientListItem';
import AddPatientModal from '../components/AddPatientModal';
import { PlusIcon } from '../components/icons/PlusIcon';
import { ArchiveBoxIcon } from '../components/icons/ArchiveBoxIcon';
import { SearchIcon } from '../components/icons/SearchIcon';
import { CloseIcon } from '../components/icons/CloseIcon';
import SubPageHeader from '../components/SubPageHeader';
import { UsersIcon } from '../components/icons/UsersIcon';
import { ClinicIcon } from '../components/icons/ClinicIcon';
import PremiumAlertModal from '../components/PremiumAlertModal';

interface PatientsPageProps {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'profile_pic' | 'user_id' | 'clinics'>) => void;
  updatePatient: (patientId: number, patient: Omit<Patient, 'id' | 'profile_pic' | 'user_id' | 'clinics'>) => void;
  deactivatePatient: (patientId: number) => Promise<boolean>;
  clinics: Clinic[];
  setActivePage: (page: Page) => void;
  user: User;
}

const PatientsPage: React.FC<PatientsPageProps> = ({ patients, addPatient, updatePatient, deactivatePatient, clinics, setActivePage, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para o Modal Premium
  const [isPremiumAlertOpen, setIsPremiumAlertOpen] = useState(false);
  const [premiumAlertInfo, setPremiumAlertInfo] = useState({ title: '', message: '' });

  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = (patient.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || patient.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [patients, searchTerm, categoryFilter]);

  const handleOpenEditModal = (patient: Patient) => {
    setPatientToEdit(patient);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    // Lógica de Controle de Acesso
    const plan = (user.tipo_assinante || user.plan || 'Free').toLowerCase();
    const isPremiumOrBeta = plan === 'premium' || plan === 'beta';
    
    // Verificar Trial
    let isTrialActive = false;
    if (user.data_expiracao_acesso) {
        const expirationDate = new Date(user.data_expiracao_acesso);
        const today = new Date();
        // A comparação today <= expirationDate garante que o dia da expiração ainda conta
        if (today <= expirationDate) {
            isTrialActive = true;
        }
    }

    const hasPremiumAccess = isPremiumOrBeta || isTrialActive;

    // Regra 1: Usuários Free (sem trial ativo ou expirado) só podem ter até 5 pacientes ativos
    if (!hasPremiumAccess && patients.length >= 5) {
        setPremiumAlertInfo({
            title: "Limite do Plano Free",
            message: "Você atingiu o limite de 5 pacientes. Seu período de teste expirou ou você está no plano gratuito. Faça um upgrade para continuar."
        });
        setIsPremiumAlertOpen(true);
        return;
    }

    // Regra 2: Usuários Premium (ou em trial) devem estar com a assinatura/prazo em dia
    // Se hasPremiumAccess é true, significa que ou é Premium ou é Trial válido.
    // Mas se o usuário for Premium (ex: status cancelado/past_due) e a data passou, hasPremiumAccess seria falso se baseasse apenas em data?
    // Não, isPremiumOrBeta é baseado no texto.
    // Então precisamos checar a validade se o usuário FOR Premium também.
    
    if (isPremiumOrBeta && user.data_expiracao_acesso) {
         const expirationDate = new Date(user.data_expiracao_acesso);
         const today = new Date();
         if (today > expirationDate) {
            setPremiumAlertInfo({
                title: "Assinatura Expirada",
                message: "Sua assinatura Premium expirou. Por favor, renove seu plano para continuar adicionando novos pacientes."
            });
            setIsPremiumAlertOpen(true);
            return;
         }
    }

    setPatientToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setPatientToEdit(null);
    setIsModalOpen(false);
  };
  
  const toggleSearch = () => {
      if (isSearchVisible) {
          setIsSearchVisible(false);
          setSearchTerm(''); // Limpa a busca ao fechar
      } else {
          setIsSearchVisible(true);
          // Pequeno timeout para garantir que o elemento foi renderizado antes de focar
          setTimeout(() => {
              searchInputRef.current?.focus();
              window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
      }
  };

  return (
    <div className="space-y-4 pb-20 relative min-h-screen">
      <SubPageHeader 
        title="Pacientes" 
        onBack={() => setActivePage(Page.Home)}
        icon={<UsersIcon className="w-6 h-6" />}
      >
        <button 
          onClick={() => setActivePage(Page.Clinics)} 
          className="p-2 bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-subtext rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" 
          aria-label="Gerenciar Clínicas"
          title="Gerenciar Clínicas"
        >
          <ClinicIcon className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setActivePage(Page.DeactivatedPatients)} 
          className="p-2 bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-subtext rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" 
          aria-label="Ver Pacientes Desativados"
          title="Pacientes Desativados"
        >
          <ArchiveBoxIcon className="w-5 h-5" />
        </button>
        <button onClick={handleOpenAddModal} className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors" aria-label="Adicionar Paciente">
          <PlusIcon className="w-5 h-5" />
        </button>
      </SubPageHeader>

      <div className={`bg-white dark:bg-dark-card p-3 rounded-xl shadow-sm space-y-3 transition-all duration-300 ${isSearchVisible ? 'opacity-100 block' : 'opacity-0 hidden md:opacity-100 md:block'}`}>
        <div className="relative">
            <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-dark-subtext"
            />
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${categoryFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-subtext'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setCategoryFilter(Category.Adult)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${categoryFilter === Category.Adult ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-subtext'}`}
          >
            Adultos
          </button>
          <button
            onClick={() => setCategoryFilter(Category.Child)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${categoryFilter === Category.Child ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-subtext'}`}
          >
            Crianças
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredPatients.map(patient => (
          <PatientListItem 
            key={patient.id} 
            patient={patient} 
            onEdit={() => handleOpenEditModal(patient)}
          />
        ))}
        {filteredPatients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="bg-gray-100 dark:bg-dark-card p-4 rounded-full mb-3">
                    <UsersIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-dark-subtext text-sm">Nenhum paciente encontrado.</p>
                <button onClick={handleOpenAddModal} className="mt-2 text-primary text-sm font-medium hover:underline">
                    Adicionar novo paciente
                </button>
            </div>
        )}
      </div>
      
      {/* Botão Flutuante de Pesquisa (FAB) - Sempre visível */}
      <button 
        onClick={toggleSearch}
        className="fixed bottom-24 right-6 w-12 h-12 bg-white dark:bg-dark-card text-primary rounded-full shadow-lg border border-gray-100 dark:border-dark-border flex items-center justify-center md:hidden z-40 hover:scale-105 transition-transform"
        aria-label={isSearchVisible ? "Fechar busca" : "Pesquisar"}
      >
          {isSearchVisible ? <CloseIcon className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
      </button>

      {isModalOpen && (
        <AddPatientModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          addPatient={addPatient}
          updatePatient={updatePatient}
          patientToEdit={patientToEdit}
          clinics={clinics}
          onDeactivate={deactivatePatient}
          navigateTo={setActivePage}
        />
      )}

      <PremiumAlertModal 
        isOpen={isPremiumAlertOpen}
        onClose={() => setIsPremiumAlertOpen(false)}
        title={premiumAlertInfo.title}
        message={premiumAlertInfo.message}
        navigateTo={setActivePage}
      />
    </div>
  );
};

export default PatientsPage;

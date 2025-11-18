
import React, { useState, useMemo } from 'react';
import { Patient, Category, Clinic, Page } from '../types';
import PatientListItem from '../components/PatientListItem';
import AddPatientModal from '../components/AddPatientModal';
import { PlusIcon } from '../components/icons/PlusIcon';
import { ArchiveBoxIcon } from '../components/icons/ArchiveBoxIcon';
import SubPageHeader from '../components/SubPageHeader';

interface PatientsPageProps {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'profile_pic' | 'user_id' | 'clinics'>) => void;
  updatePatient: (patientId: number, patient: Omit<Patient, 'id' | 'profile_pic' | 'user_id' | 'clinics'>) => void;
  deactivatePatient: (patientId: number) => Promise<boolean>;
  clinics: Clinic[];
  setActivePage: (page: Page) => void;
}

const PatientsPage: React.FC<PatientsPageProps> = ({ patients, addPatient, updatePatient, deactivatePatient, clinics, setActivePage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

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
    setPatientToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setPatientToEdit(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <SubPageHeader 
        title="Pacientes" 
        onBack={() => setActivePage(Page.Home)}
      >
        <button 
          onClick={() => setActivePage(Page.DeactivatedPatients)} 
          className="p-2 bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-subtext rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" 
          aria-label="Ver Pacientes Desativados"
          title="Pacientes Desativados"
        >
          <ArchiveBoxIcon className="w-6 h-6" />
        </button>
        <button onClick={handleOpenAddModal} className="p-2 bg-primary/10 text-primary rounded-full" aria-label="Adicionar Paciente">
          <PlusIcon className="w-6 h-6" />
        </button>
      </SubPageHeader>

      <div className="space-y-4 bg-white dark:bg-dark-card p-4 rounded-xl shadow-md">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-dark-subtext"
        />
        <div className="flex space-x-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-dark-text'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setCategoryFilter(Category.Adult)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === Category.Adult ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-dark-text'}`}
          >
            Adultos
          </button>
          <button
            onClick={() => setCategoryFilter(Category.Child)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === Category.Child ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-dark-text'}`}
          >
            Crianças
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredPatients.map(patient => (
          <PatientListItem 
            key={patient.id} 
            patient={patient} 
            onEdit={() => handleOpenEditModal(patient)}
          />
        ))}
        {filteredPatients.length === 0 && (
            <p className="text-center text-gray-500 dark:text-dark-subtext py-4">Nenhum paciente encontrado. Adicione um novo paciente para começar.</p>
        )}
      </div>

      {isModalOpen && (
        <AddPatientModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          addPatient={addPatient}
          updatePatient={updatePatient}
          patientToEdit={patientToEdit}
          clinics={clinics}
          onDeactivate={deactivatePatient}
        />
      )}
    </div>
  );
};

export default PatientsPage;

import React, { useState } from 'react';
import { Clinic } from '../types';
import AddClinicModal from '../components/AddClinicModal';
import { PlusIcon } from '../components/icons/PlusIcon';

interface ClinicsPageProps {
  clinics: Clinic[];
  addClinic: (clinic: Omit<Clinic, 'id' | 'user_id'>) => void;
  updateClinic: (clinicId: number, clinic: Omit<Clinic, 'id' | 'user_id'>) => void;
  deleteClinic: (clinicId: number) => void;
}

const ClinicsPage: React.FC<ClinicsPageProps> = ({ clinics, addClinic, updateClinic, deleteClinic }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clinicToEdit, setClinicToEdit] = useState<Clinic | null>(null);

  const handleOpenModal = (clinic: Clinic | null = null) => {
    setClinicToEdit(clinic);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setClinicToEdit(null);
    setIsModalOpen(false);
  };

  const handleDelete = (clinicId: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta clínica? Esta ação não pode ser desfeita.")) {
      deleteClinic(clinicId);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Minhas Clínicas</h1>
      
      <div className="space-y-3">
        {clinics.map(clinic => (
          <div key={clinic.id} className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <p className="font-semibold text-dark dark:text-dark-text">{clinic.name}</p>
              <p className="text-sm text-gray-500 dark:text-dark-subtext">{clinic.address}</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleOpenModal(clinic)} className="text-primary hover:underline text-sm font-medium">Editar</button>
              <button onClick={() => handleDelete(clinic.id)} className="text-danger hover:underline text-sm font-medium">Excluir</button>
            </div>
          </div>
        ))}
        {clinics.length === 0 && (
          <p className="text-center text-gray-500 dark:text-dark-subtext py-8">Nenhuma clínica cadastrada. Adicione sua primeira clínica para começar.</p>
        )}
      </div>

      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-24 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        aria-label="Nova Clínica"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <AddClinicModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          addClinic={addClinic}
          updateClinic={updateClinic}
          clinicToEdit={clinicToEdit}
        />
      )}
    </div>
  );
};

export default ClinicsPage;

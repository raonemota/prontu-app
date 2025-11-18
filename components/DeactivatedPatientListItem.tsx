import React, { useState } from 'react';
import { Patient } from '../types';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';

interface DeactivatedPatientListItemProps {
  patient: Patient;
  onReactivate: () => void;
}

const DeactivatedPatientListItem: React.FC<DeactivatedPatientListItemProps> = ({ patient, onReactivate }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const patientName = patient.name || 'Nome não informado';
  const patientProfilePic = patient.profile_pic || 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/m9asaisyvrr2/001-woman.png';
  const healthPlan = patient.health_plan || 'N/A';
  const category = patient.category || 'N/A';

  const handleReactivateClick = () => {
    setIsConfirming(true);
  };

  const handleConfirm = () => {
    onReactivate();
    setIsConfirming(false);
  };

  const handleCancel = () => {
    setIsConfirming(false);
  };

  return (
    <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md flex items-center space-x-4 opacity-70">
      <img src={patientProfilePic} alt={patientName} className="w-14 h-14 rounded-full object-cover grayscale" />
      <div className="flex-grow space-y-1">
        <p className="font-semibold text-dark dark:text-dark-text">{patientName}</p>
        <p className="text-sm text-gray-500 dark:text-dark-subtext">{healthPlan} - {category}</p>
        <p className="text-sm text-gray-500 dark:text-dark-subtext">{patient.clinics?.name || 'Sem clínica'}</p>
      </div>
      
      {isConfirming ? (
        <div className="flex flex-col items-end space-y-2">
            <p className="text-xs text-gray-600 dark:text-dark-subtext">Tem certeza?</p>
            <div className="flex space-x-2">
                <button onClick={handleCancel} className="text-xs font-semibold text-gray-500 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-dark-border">Não</button>
                <button onClick={handleConfirm} className="text-xs font-semibold text-white bg-secondary px-2 py-1 rounded-md hover:bg-teal-600">Sim</button>
            </div>
        </div>
      ) : (
        <button
          onClick={handleReactivateClick}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-secondary bg-secondary/10 dark:bg-secondary/20 dark:text-teal-300 rounded-full hover:bg-secondary/20 dark:hover:bg-secondary/30 transition-colors"
          aria-label="Reativar Paciente"
        >
          <ArrowUturnLeftIcon className="w-4 h-4" />
          <span>Reativar</span>
        </button>
      )}
    </div>
  );
};

export default DeactivatedPatientListItem;

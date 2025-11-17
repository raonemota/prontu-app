import React from 'react';
import { Patient } from '../types';
import { PencilIcon } from './icons/PencilIcon';

interface PatientListItemProps {
  patient: Patient;
  onEdit: () => void;
}

const weekDaysShort = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const PatientListItem: React.FC<PatientListItemProps> = ({ patient, onEdit }) => {
  const appointmentDaysString = patient.appointment_days
    .sort()
    .map(dayIndex => weekDaysShort[dayIndex])
    .join(', ');

  return (
    <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md flex items-center space-x-4">
      <img src={patient.profile_pic} alt={patient.name} className="w-14 h-14 rounded-full object-cover" />
      <div className="flex-grow">
        <p className="font-semibold text-dark dark:text-dark-text">{patient.name}</p>
        <p className="text-sm text-gray-500 dark:text-dark-subtext">{patient.health_plan} - {patient.category}</p>
        <p className="text-sm text-gray-500 dark:text-dark-subtext">{patient.clinics?.name || 'Sem clínica'}</p>
        <p className="text-sm text-gray-500 dark:text-dark-subtext">{appointmentDaysString}</p>
      </div>
      <div className="text-right space-y-1">
        <p className="font-semibold text-primary">
          {patient.session_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        <button 
          onClick={onEdit}
          className="flex items-center space-x-1 text-sm font-medium text-secondary hover:underline"
        >
          <PencilIcon className="w-4 h-4" />
          <span>Editar</span>
        </button>
      </div>
    </div>
  );
};

export default PatientListItem;
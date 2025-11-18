import React from 'react';
import { Patient } from '../types';
import { PencilIcon } from './icons/PencilIcon';

interface PatientListItemProps {
  patient: Patient;
  onEdit: () => void;
}

const weekDaysShort = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const PatientListItem: React.FC<PatientListItemProps> = ({ patient, onEdit }) => {
  const patientName = patient.name || 'Nome não informado';
  const patientProfilePic = patient.profile_pic || 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/m9asaisyvrr2/001-woman.png';
  const healthPlan = patient.health_plan || 'N/A';
  const category = patient.category || 'N/A';
  const appointmentDays = Array.isArray(patient.appointment_days) ? patient.appointment_days : [];

  return (
    <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md flex items-start space-x-4">
      <img src={patientProfilePic} alt={patientName} className="w-14 h-14 rounded-full object-cover" />
      <div className="flex-grow space-y-1">
        <p className="font-semibold text-dark dark:text-dark-text">{patientName}</p>
        <p className="text-sm text-gray-500 dark:text-dark-subtext">{healthPlan} - {category}</p>
        <p className="text-sm text-gray-500 dark:text-dark-subtext">{patient.clinics?.name || 'Sem clínica'}</p>
        <div className="flex flex-wrap gap-1 pt-1">
          {appointmentDays
            .sort()
            .map(dayIndex => (
              <span key={dayIndex} className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-purple-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {weekDaysShort[dayIndex]}
              </span>
            ))
          }
        </div>
      </div>
      <div className="text-right flex flex-col items-end space-y-2 flex-shrink-0">
        <p className="font-semibold text-primary">
          {(patient.session_value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        <button
          onClick={onEdit}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-secondary bg-secondary/10 dark:bg-secondary/20 dark:text-teal-300 rounded-full hover:bg-secondary/20 dark:hover:bg-secondary/30 transition-colors"
          aria-label="Editar Paciente"
        >
          <PencilIcon className="w-4 h-4" />
          <span>Editar</span>
        </button>
      </div>
    </div>
  );
};

export default PatientListItem;
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
    <div className="bg-white dark:bg-dark-card p-3 rounded-xl shadow-sm flex items-start space-x-3 border border-gray-100 dark:border-dark-border">
      <img src={patientProfilePic} alt={patientName} className="w-10 h-10 rounded-full object-cover" />
      <div className="flex-grow space-y-0.5 min-w-0">
        <p className="font-semibold text-sm text-dark dark:text-dark-text truncate">{patientName}</p>
        <div className="flex items-center text-xs text-gray-500 dark:text-dark-subtext space-x-1 truncate">
            <span>{healthPlan}</span>
            <span>•</span>
            <span>{category}</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 truncate">{patient.clinics?.name || 'Sem clínica'}</p>
        
        <div className="flex flex-wrap gap-1 pt-1">
          {appointmentDays
            .sort()
            .map(dayIndex => (
              <span key={dayIndex} className="bg-primary/5 text-primary dark:bg-primary/20 dark:text-purple-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                {weekDaysShort[dayIndex]}
              </span>
            ))
          }
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end justify-between space-y-2 flex-shrink-0 h-full">
        <p className="font-bold text-sm text-primary">
          {(patient.session_value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        <button
          onClick={onEdit}
          className="p-1.5 text-secondary bg-secondary/10 dark:bg-secondary/20 dark:text-teal-300 rounded-full hover:bg-secondary/20 transition-colors"
          aria-label="Editar Paciente"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PatientListItem;
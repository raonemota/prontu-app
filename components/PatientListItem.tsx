
import React from 'react';
import { Patient } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

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

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.slice(0, 5);
  };

  const getDayLabel = (dayIndex: number) => {
      const dayName = weekDaysShort[dayIndex];
      // Verifica se existe um horário específico para este dia
      const specificTime = patient.appointment_times?.[String(dayIndex)];
      
      if (specificTime) {
          return `${dayName} ${formatTime(specificTime)}`;
      }
      
      // Fallback para o horário geral se não houver específico
      if (patient.appointment_time) {
         return `${dayName} ${formatTime(patient.appointment_time)}`;
      }

      return dayName;
  };
  
  const cleanPhone = patient.phone ? patient.phone.replace(/[^\d]/g, '') : '';
  const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

  return (
    <div className="bg-white dark:bg-dark-card p-3 rounded-xl shadow-sm flex items-start space-x-3 border border-gray-100 dark:border-dark-border">
      <img src={patientProfilePic} alt={patientName} className="w-10 h-10 rounded-full object-cover" />
      <div className="flex-grow space-y-1 min-w-0">
        <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-dark dark:text-dark-text truncate">{patientName}</p>
            <span className="text-xs text-gray-500 dark:text-dark-subtext font-medium">• {category}</span>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-dark-subtext space-x-1 truncate">
            <span>{healthPlan}</span>
            <span>-</span>
            <span>{patient.clinics?.name || 'Sem clínica'}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 pt-1">
          {appointmentDays
            .sort()
            .map(dayIndex => (
              <span key={dayIndex} className="bg-primary/5 text-primary dark:bg-primary/20 dark:text-purple-300 text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap">
                {getDayLabel(dayIndex)}
              </span>
            ))
          }
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end justify-between space-y-2 flex-shrink-0 h-full pt-1">
        <p className="font-bold text-sm text-primary">
          {(patient.session_value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        <div className="flex items-center space-x-2">
            {whatsappUrl && (
                <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-1.5 text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full hover:bg-green-200 transition-colors" 
                    aria-label="WhatsApp"
                >
                    <WhatsAppIcon className="w-4 h-4" />
                </a>
            )}
            <button
            onClick={onEdit}
            className="p-1.5 text-secondary bg-secondary/10 dark:bg-secondary/20 dark:text-teal-300 rounded-full hover:bg-secondary/20 transition-colors"
            aria-label="Editar Paciente"
            >
            <PencilIcon className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default PatientListItem;

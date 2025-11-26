import React from 'react';
import { Appointment, Patient, AppointmentStatus } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { ClinicIcon } from './icons/ClinicIcon';

interface AppointmentCardProps {
  appointment: Appointment;
  patient: Patient;
  onStatusChange: (status: AppointmentStatus) => void;
  onClick: () => void;
}

const statusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.NoStatus]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  [AppointmentStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [AppointmentStatus.NoShow]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [AppointmentStatus.Canceled]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

// List of valid status values to prevent crashes from bad data
const validStatuses = Object.values(AppointmentStatus);

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, patient, onStatusChange, onClick }) => {
  // Ensure status is always a valid value, defaulting to 'NoStatus'
  const currentStatus = (appointment.status && validStatuses.includes(appointment.status))
    ? appointment.status
    : AppointmentStatus.NoStatus;

  // Provide fallbacks for potentially null patient data
  const patientName = patient.name || 'Nome não informado';
  const patientProfilePic = patient.profile_pic || 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/m9asaisyvrr2/001-woman.png';
  
  // Format time to HH:MM (remove seconds if present)
  const formattedTime = appointment.time ? appointment.time.slice(0, 5) : '';

  return (
    <div 
      className="flex items-center space-x-3 p-3 bg-white dark:bg-dark-card rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <img src={patientProfilePic} alt={patientName} className="w-8 h-8 rounded-full object-cover" />
      <div className="flex-grow min-w-0"> {/* min-w-0 helps text truncate correctly */}
        <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-sm text-dark dark:text-dark-text truncate">{patientName}</p>
        </div>
        <div className="flex items-center flex-wrap text-xs text-gray-500 dark:text-dark-subtext gap-x-2 gap-y-1">
            {formattedTime && (
                <div className="flex items-center text-xs font-normal text-gray-500 dark:text-dark-subtext bg-gray-100 dark:bg-dark-border px-1.5 py-0.5 rounded-md">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    <span>{formattedTime}</span>
                </div>
            )}
            {patient.clinics?.name && (
                <div className="flex items-center">
                    <ClinicIcon className="w-3 h-3 mr-1 text-gray-400" />
                    <span className="truncate max-w-[120px]">{patient.clinics.name}</span>
                </div>
            )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <select
          value={currentStatus}
          onChange={(e) => onStatusChange(e.target.value as AppointmentStatus)}
          onClick={(e) => e.stopPropagation()}
          className={`text-xs font-medium border-none rounded-lg focus:ring-2 focus:ring-primary py-1 px-2 appearance-none cursor-pointer ${statusColors[currentStatus] || statusColors[AppointmentStatus.NoStatus]}`}
        >
          {validStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AppointmentCard;
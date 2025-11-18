import React from 'react';
import { Appointment, Patient, AppointmentStatus } from '../types';

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
  const patientHealthPlan = patient.health_plan || 'N/A';

  return (
    <div 
      className="flex items-center space-x-3 p-3 bg-white dark:bg-dark-card rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <img src={patientProfilePic} alt={patientName} className="w-10 h-10 rounded-full object-cover" />
      <div className="flex-grow">
        <p className="font-semibold text-sm text-dark dark:text-dark-text">{patientName}</p>
        <div className="flex items-center text-xs text-gray-500 dark:text-dark-subtext space-x-2">
            <span>{patientHealthPlan}</span>
            {patient.clinics?.name && (
                <>
                    <span className="text-gray-300 dark:text-dark-border">•</span>
                    <span>{patient.clinics.name}</span>
                </>
            )}
        </div>
      </div>
      <div>
        <select
          value={currentStatus}
          onChange={(e) => onStatusChange(e.target.value as AppointmentStatus)}
          onClick={(e) => e.stopPropagation()}
          className={`text-xs font-medium border-none rounded-lg focus:ring-2 focus:ring-primary py-1 px-2 appearance-none ${statusColors[currentStatus] || statusColors[AppointmentStatus.NoStatus]}`}
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
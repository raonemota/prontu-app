import React from 'react';
import { Appointment, Patient, AppointmentStatus } from '../types';

interface AppointmentCardProps {
  appointment: Appointment;
  patient: Patient;
  onStatusChange: (status: AppointmentStatus) => void;
}

const statusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.NoStatus]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  [AppointmentStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [AppointmentStatus.NoShow]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [AppointmentStatus.Canceled]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, patient, onStatusChange }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-dark-card rounded-xl shadow-md">
      <img src={patient.profile_pic} alt={patient.name} className="w-10 h-10 rounded-full object-cover" />
      <div className="flex-grow">
        <p className="font-semibold text-sm text-dark dark:text-dark-text">{patient.name}</p>
        <div className="flex items-center text-xs text-gray-500 dark:text-dark-subtext space-x-2">
            <span>{appointment.time}</span>
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
          value={appointment.status}
          onChange={(e) => onStatusChange(e.target.value as AppointmentStatus)}
          className={`text-xs font-medium border-none rounded-lg focus:ring-2 focus:ring-primary py-1 px-2 appearance-none ${statusColors[appointment.status]}`}
        >
          {Object.values(AppointmentStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AppointmentCard;

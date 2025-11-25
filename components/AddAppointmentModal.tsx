
import React, { useState, useMemo } from 'react';
import { Patient, Appointment, AppointmentStatus } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { SearchableSelect } from './SearchableSelect';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'user_id'>) => void;
  selectedDate: string;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ isOpen, onClose, patients, addAppointment, selectedDate }) => {
  const [patient_id, setPatientId] = useState<string>('');
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState('09:00');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient_id) {
        alert("Por favor, selecione um paciente.");
        return;
    }
    addAppointment({
        patient_id: parseInt(patient_id),
        date,
        time,
        status: AppointmentStatus.NoStatus
    });
    onClose();
  };

  const patientOptions = useMemo(() => {
      return patients.map(p => ({
          value: p.id,
          label: p.name
      }));
  }, [patients]);

  const inputStyles = "mt-1 w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-dark-subtext";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-dark-subtext";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-dark dark:text-dark-text">Novo Agendamento</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-dark-subtext dark:hover:text-dark-text">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelStyles}>Paciente</label>
              <div className="mt-1">
                <SearchableSelect 
                    options={patientOptions}
                    value={patient_id}
                    onChange={(val) => setPatientId(String(val))}
                    placeholder="Busque ou selecione um paciente..."
                    required={true}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>Data</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Hora</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={inputStyles} />
              </div>
            </div>
            <div className="pt-4 flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-dark-text rounded-lg font-medium">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-medium">Agendar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAppointmentModal;

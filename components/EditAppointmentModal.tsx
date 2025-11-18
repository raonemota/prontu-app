import React, { useState, useEffect } from 'react';
import { Appointment, Patient, AppointmentStatus } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  patient: Patient;
  updateAppointment: (appointmentId: number, updatedDetails: { date: string, time: string, status: AppointmentStatus, observation: string | null }) => void;
  deleteAppointment: (appointmentId: number) => Promise<boolean>;
}

const validStatuses = Object.values(AppointmentStatus);

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  patient,
  updateAppointment,
  deleteAppointment,
}) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    status: AppointmentStatus.NoStatus,
    observation: '',
  });
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (appointment) {
        const currentStatus = (appointment.status && validStatuses.includes(appointment.status))
            ? appointment.status
            : AppointmentStatus.NoStatus;

        setFormData({
            date: appointment.date || '',
            time: appointment.time || '',
            status: currentStatus,
            observation: appointment.observation || '',
        });
    }
    // Reset confirmation state when modal opens/changes appointment
    setIsConfirmingDelete(false);
  }, [appointment, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppointment(appointment.id, {
      ...formData,
      observation: formData.observation || null,
    });
    onClose();
  };

  const handleDeleteClick = () => {
    console.log(`[EditAppointmentModal] Botão Excluir clicado para agendamento ID: ${appointment.id}`);
    setIsConfirmingDelete(true);
  };
  
  const handleConfirmDelete = async () => {
    console.log(`[EditAppointmentModal] Usuário confirmou a exclusão. Chamando deleteAppointment...`);
    const success = await deleteAppointment(appointment.id);
    if (success) {
      console.log(`[EditAppointmentModal] deleteAppointment retornou sucesso. Fechando o modal.`);
      setIsConfirmingDelete(false);
      onClose();
    } else {
      console.error(`[EditAppointmentModal] deleteAppointment retornou falha. O modal de confirmação será fechado, mas o principal permanecerá aberto.`);
      setIsConfirmingDelete(false);
    }
  };

  const inputStyles = "mt-1 w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-dark-subtext";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-dark-subtext";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        
        {isConfirmingDelete && (
          <div className="absolute inset-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl p-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-dark dark:text-dark-text">Confirmar Exclusão</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-dark-subtext">
                Tem certeza que deseja excluir este agendamento?
              </p>
              <p className="mt-1 text-xs text-gray-500">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="mt-6 flex w-full justify-center space-x-4">
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-dark-text rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2 bg-danger text-white rounded-lg font-medium"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-dark dark:text-dark-text">Editar Agendamento</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-dark-subtext dark:hover:text-dark-text">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="mb-4">
            <p className="font-semibold text-lg text-primary">{patient.name || 'Nome não informado'}</p>
            <p className="text-sm text-gray-500 dark:text-dark-subtext">{patient.health_plan || 'N/A'} - {patient.clinics?.name || 'Sem clínica'}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelStyles}>Data</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inputStyles} />
            </div>
            <div>
                <label className={labelStyles}>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className={inputStyles}>
                    {validStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
              <label className={labelStyles}>Observações</label>
              <textarea name="observation" value={formData.observation} onChange={handleChange} rows={3} className={inputStyles} placeholder="Adicione uma observação sobre a sessão..."></textarea>
            </div>
            <div className="pt-4 flex justify-between items-center">
              <button type="button" onClick={handleDeleteClick} className="px-4 py-2 bg-red-100 text-danger rounded-lg font-medium hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/80 transition-colors">Excluir</button>
              <div className="flex space-x-3">
                 <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-dark-text rounded-lg font-medium">Cancelar</button>
                 <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-medium">Salvar</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
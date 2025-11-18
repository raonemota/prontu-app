import React, { useState, useEffect } from 'react';
import { Patient, Gender, Category, Clinic } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';


interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  addPatient: (patient: Omit<Patient, 'id' | 'profile_pic' | 'user_id' | 'clinics'>) => void;
  updatePatient: (patientId: number, patient: Omit<Patient, 'id' | 'profile_pic' | 'user_id' | 'clinics'>) => void;
  patientToEdit: Patient | null;
  clinics: Clinic[];
  onDelete: (patientId: number) => Promise<boolean>;
}

const weekDays = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 },
];

const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, addPatient, updatePatient, patientToEdit, clinics, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: Gender.Female,
    health_plan: '',
    category: Category.Adult,
    session_value: '',
    appointment_time: '09:00',
    clinic_id: null as number | null,
  });
  const [appointment_days, setAppointmentDays] = useState<number[]>([]);

  useEffect(() => {
    if (patientToEdit) {
      setFormData({
        name: patientToEdit.name,
        gender: patientToEdit.gender,
        health_plan: patientToEdit.health_plan,
        category: patientToEdit.category,
        session_value: String(patientToEdit.session_value),
        appointment_time: patientToEdit.appointment_time,
        clinic_id: patientToEdit.clinic_id,
      });
      setAppointmentDays(patientToEdit.appointment_days);
    } else {
      // Reset form for "add new" mode
      setFormData({
        name: '',
        gender: Gender.Female,
        health_plan: '',
        category: Category.Adult,
        session_value: '',
        appointment_time: '09:00',
        clinic_id: null,
      });
      setAppointmentDays([]);
    }
  }, [patientToEdit]);

  const handleDayToggle = (dayValue: number) => {
    setAppointmentDays(prev =>
      prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]
    );
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appointment_days.length === 0) {
        alert("Por favor, selecione pelo menos um dia de atendimento.");
        return;
    }
    const submissionData = {
        ...formData,
        session_value: parseFloat(formData.session_value) || 0,
        appointment_days,
        clinic_id: formData.clinic_id ? parseInt(String(formData.clinic_id)) : null
    };

    if (patientToEdit) {
      updatePatient(patientToEdit.id, submissionData);
    } else {
      addPatient(submissionData);
    }
    onClose();
  };
  
  const handleDelete = async () => {
    if (patientToEdit && window.confirm("Tem certeza que deseja excluir este paciente? Ele será removido da lista ativa, mas seu histórico de atendimentos será mantido.")) {
      const success = await onDelete(patientToEdit.id);
      if (success) {
        onClose();
      }
    }
  };

  const inputStyles = "mt-1 w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-dark-subtext";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-dark-subtext";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-dark dark:text-dark-text">{patientToEdit ? 'Editar Paciente' : 'Novo Paciente'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-dark-subtext dark:hover:text-dark-text">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelStyles}>Nome Completo</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputStyles} />
            </div>
             <div>
                <label className={labelStyles}>Clínica/Local</label>
                <select name="clinic_id" value={formData.clinic_id || ''} onChange={handleChange} className={inputStyles}>
                    <option value="">Sem clínica</option>
                    {clinics.map(clinic => (
                        <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelStyles}>Sexo</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={inputStyles}>
                        <option value={Gender.Female}>Feminino</option>
                        <option value={Gender.Male}>Masculino</option>
                    </select>
                </div>
                <div>
                    <label className={labelStyles}>Categoria</label>
                    <select name="category" value={formData.category} onChange={handleChange} className={inputStyles}>
                        <option value={Category.Adult}>Adulto</option>
                        <option value={Category.Child}>Criança</option>
                    </select>
                </div>
            </div>
            <div>
                <label className={labelStyles}>Plano de Saúde</label>
                <input type="text" name="health_plan" value={formData.health_plan} onChange={handleChange} required className={inputStyles} />
            </div>
            <div>
                <label className={labelStyles}>Valor da Sessão (R$)</label>
                <input type="number" step="0.01" name="session_value" value={formData.session_value} onChange={handleChange} required className={inputStyles} />
            </div>
            <div>
              <label className={`${labelStyles} mb-2`}>Dias de Atendimento</label>
              <div className="flex space-x-2">
                {weekDays.map(day => (
                  <button type="button" key={day.value} onClick={() => handleDayToggle(day.value)} className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors ${appointment_days.includes(day.value) ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-dark-text'}`}>
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-4 flex justify-between items-center">
              <div>
                {patientToEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-100 text-danger rounded-lg font-medium flex items-center space-x-2 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/80 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                    <span>Excluir</span>
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-dark-text rounded-lg font-medium flex items-center space-x-2">
                  <CloseIcon className="w-5 h-5" />
                  <span>Cancelar</span>
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-medium flex items-center space-x-2">
                  <CheckIcon className="w-5 h-5" />
                  <span>{patientToEdit ? 'Salvar' : 'Adicionar'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModal;
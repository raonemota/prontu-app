
import React, { useState, useEffect } from 'react';
import { Clinic } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface AddClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  addClinic: (clinic: Omit<Clinic, 'id' | 'user_id'>) => void;
  updateClinic: (clinicId: number, clinic: Omit<Clinic, 'id' | 'user_id'>) => void;
  clinicToEdit: Clinic | null;
}

const AddClinicModal: React.FC<AddClinicModalProps> = ({ isOpen, onClose, addClinic, updateClinic, clinicToEdit }) => {
  const [formData, setFormData] = useState({ name: '', address: '' });

  useEffect(() => {
    if (clinicToEdit) {
      setFormData({ name: clinicToEdit.name, address: clinicToEdit.address || '' });
    } else {
      setFormData({ name: '', address: '' });
    }
  }, [clinicToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clinicToEdit) {
      updateClinic(clinicToEdit.id, formData);
    } else {
      addClinic(formData);
    }
    onClose();
  };
  
  const inputStyles = "mt-1 w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-dark-subtext";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-dark-subtext";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-dark dark:text-dark-text">{clinicToEdit ? 'Editar Clínica' : 'Nova Clínica'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-dark-subtext dark:hover:text-dark-text">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelStyles}>Nome da Clínica</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>Endereço (Opcional)</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputStyles} />
            </div>
            <div className="pt-4 flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-dark-text rounded-lg font-medium">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-medium">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClinicModal;

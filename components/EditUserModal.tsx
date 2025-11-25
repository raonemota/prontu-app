import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { CheckIcon } from './icons/CheckIcon';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (userId: string, updates: Partial<User>) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    tipo_assinante: 'Free',
    ciclo_plano: 'Mensal',
    status_assinatura: 'active',
    data_expiracao_acesso: '',
    is_admin: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        tipo_assinante: user.tipo_assinante || 'Free',
        ciclo_plano: user.ciclo_plano || 'Mensal',
        status_assinatura: user.status_assinatura || 'active',
        // Format date for input type="date" (YYYY-MM-DD)
        data_expiracao_acesso: user.data_expiracao_acesso ? new Date(user.data_expiracao_acesso).toISOString().split('T')[0] : '',
        is_admin: user.is_admin || false,
      });
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        // Convert empty date string to null if cleared or keep format
        const updates: Partial<User> = {
            ...formData,
            data_expiracao_acesso: formData.data_expiracao_acesso ? new Date(formData.data_expiracao_acesso).toISOString() : undefined
        };
        
        await onSave(user.id, updates);
        onClose();
    } catch (error) {
        console.error("Error updating user:", error);
    } finally {
        setSaving(false);
    }
  };

  const inputStyles = "mt-1 w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-dark-subtext";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-dark-subtext";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-dark dark:text-dark-text">Editar Usuário</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-dark-subtext dark:hover:text-dark-text">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-6 flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
             <img 
                src={user.profile_pic || 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/m9asaisyvrr2/001-woman.png'} 
                alt="" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                  <p className="font-semibold text-dark dark:text-dark-text">{user.full_name}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-subtext">{user.email}</p>
              </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelStyles}>Tipo de Assinante</label>
                    <select name="tipo_assinante" value={formData.tipo_assinante} onChange={handleChange} className={inputStyles}>
                        <option value="Free">Free</option>
                        <option value="Beta">Beta</option>
                        <option value="Premium">Premium</option>
                    </select>
                </div>
                <div>
                    <label className={labelStyles}>Ciclo do Plano</label>
                    <select name="ciclo_plano" value={formData.ciclo_plano} onChange={handleChange} className={inputStyles}>
                        <option value="Mensal">Mensal</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                        <option value="Vitalício">Vitalício</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={labelStyles}>Status da Assinatura</label>
                <select name="status_assinatura" value={formData.status_assinatura} onChange={handleChange} className={inputStyles}>
                    <option value="active">Ativo</option>
                    <option value="canceled">Cancelado</option>
                    <option value="past_due">Atrasado</option>
                    <option value="trialing">Em Teste</option>
                </select>
            </div>

            <div>
                <label className={labelStyles}>Data de Expiração do Acesso</label>
                <input type="date" name="data_expiracao_acesso" value={formData.data_expiracao_acesso} onChange={handleChange} className={inputStyles} />
            </div>

            <div className="flex items-center space-x-3 py-2">
                <input 
                    type="checkbox" 
                    id="isAdminCheckbox" 
                    name="is_admin" 
                    checked={formData.is_admin} 
                    onChange={handleChange}
                    className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300 dark:border-dark-border" 
                />
                <label htmlFor="isAdminCheckbox" className="text-sm font-medium text-dark dark:text-dark-text">
                    Permissões de Administrador
                </label>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-dark-text rounded-lg font-medium">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-70">
                {saving ? 'Salvando...' : (
                    <>
                        <CheckIcon className="w-5 h-5" />
                        <span>Salvar Alterações</span>
                    </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
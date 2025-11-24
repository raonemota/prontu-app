import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { supabase } from '../supabaseClient';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (user: Omit<User, 'id' | 'plan'>) => void;
  theme: string;
  toggleTheme: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onSave, theme, toggleTheme }) => {
  const [formData, setFormData] = useState({ full_name: '', role: '', profile_pic: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
        setFormData({
            full_name: user.full_name || '',
            role: user.role || '',
            profile_pic: user.profile_pic || ''
        });
    }
    
    // Verifica se é possível instalar (evento capturado)
    if ((window as any).deferredPrompt) {
        setCanInstall(true);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    onSave(formData);

    if (newPassword) {
        if (newPassword !== confirmPassword) {
          alert("As senhas não coincidem.");
          return;
        }
        if (newPassword.length < 6) {
            alert("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            alert("Erro ao alterar a senha: " + error.message);
        } else {
            setMessage("Perfil e senha atualizados com sucesso!");
            setNewPassword('');
            setConfirmPassword('');
        }
    } else {
        setMessage("Perfil atualizado com sucesso!");
    }
    
    setTimeout(() => {
        setMessage('');
        onClose();
    }, 2000);
  };
  
  const handleLogoff = async () => {
      await supabase.auth.signOut();
      onClose();
  };

  const handleInstallApp = async () => {
      const promptEvent = (window as any).deferredPrompt;
      if (promptEvent) {
          promptEvent.prompt();
          const { outcome } = await promptEvent.userChoice;
          if (outcome === 'accepted') {
              setCanInstall(false);
              (window as any).deferredPrompt = null;
          }
      } else {
          alert("A instalação não está disponível neste dispositivo ou navegador no momento.");
      }
  };
  
  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newAvatarUrl = `${data.publicUrl}?t=${new Date().getTime()}`;
      setFormData(prev => ({...prev, profile_pic: newAvatarUrl }));

    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setUploading(false);
    }
  };
  
  const inputStyles = "mt-1 w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-dark-subtext";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-dark-subtext";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-dark dark:text-dark-text">Gerenciar Perfil</h2>
            <div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border">
                {theme === 'light' ? 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  :
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                }
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-dark-subtext dark:hover:text-dark-text">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-4 mb-6">
            <img src={formData.profile_pic} alt="User" className="w-24 h-24 rounded-full bg-gray-200 object-cover" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-sm font-medium text-primary hover:underline disabled:opacity-50">
              {uploading ? 'Enviando...' : 'Trocar foto'}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadAvatar} />
          </div>
          
          {canInstall && (
              <button 
                type="button" 
                onClick={handleInstallApp}
                className="w-full mb-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Instalar Aplicativo
              </button>
          )}
          
          {message && <p className="text-center text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-900 p-3 rounded-lg mb-4">{message}</p>}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className={labelStyles}>Nome</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>Cargo</label>
              <input type="text" name="role" value={formData.role} onChange={handleChange} className={inputStyles} />
            </div>
            
            <div className="border-t dark:border-dark-border pt-4 mt-4">
                <h3 className="text-lg font-semibold text-dark dark:text-dark-text mb-2">Alterar Senha</h3>
                <div>
                    <label className={labelStyles}>Nova Senha</label>
                    <input type="password" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Deixe em branco para não alterar" className={inputStyles} />
                </div>
                 <div>
                    <label className={labelStyles}>Confirmar Nova Senha</label>
                    <input type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Deixe em branco para não alterar" className={inputStyles} />
                </div>
            </div>

            <div className="pt-6 flex justify-between items-center">
                <button type="button" onClick={handleLogoff} className="px-4 py-2 bg-red-100 text-danger rounded-lg font-medium hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/80 transition-colors">Sair</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import { Appointment, Patient, AppointmentStatus, User } from '../types';
import AppointmentCard from '../components/AppointmentCard';
import AddAppointmentModal from '../components/AddAppointmentModal';
import { ProfileModal } from '../components/ProfileModal';
import { PlusIcon } from '../components/icons/PlusIcon';

interface HomePageProps {
  patients: Patient[];
  appointments: Appointment[];
  updateAppointmentStatus: (appointmentId: number, status: AppointmentStatus) => void;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'user_id'>) => void;
  user: User;
  updateUser: (user: Omit<User, 'id' | 'plan'>) => void;
  theme: string;
  toggleTheme: () => void;
}

const DayNavigator: React.FC<{ selectedDate: Date; setSelectedDate: (date: Date) => void }> = ({ selectedDate, setSelectedDate }) => {
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

    const changeDay = (amount: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + amount);
        setSelectedDate(newDate);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    return (
        <div className="bg-white dark:bg-dark-card p-4 rounded-b-3xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border">&lt;</button>
                <h2 className="font-bold text-lg text-dark dark:text-dark-text capitalize">
                    {monthNames[selectedDate.getMonth()]} de {selectedDate.getFullYear()}
                </h2>
                <button onClick={() => changeDay(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border">&gt;</button>
            </div>
            <div className="flex justify-around items-center">
                {Array.from({ length: 7 }).map((_, i) => {
                    const day = new Date(selectedDate);
                    day.setDate(selectedDate.getDate() - selectedDate.getDay() + i);
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    return (
                        <div key={i} onClick={() => setSelectedDate(day)} className="cursor-pointer text-center space-y-2">
                            <p className="text-xs text-gray-500 dark:text-dark-subtext">{weekDays[day.getDay()].toUpperCase()}</p>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200
                                ${isSelected ? 'bg-primary text-white scale-110' : 'bg-transparent text-dark dark:text-dark-text'}
                                ${isToday(day) && !isSelected ? 'ring-2 ring-primary' : ''}`}>
                                {day.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const HomePage: React.FC<HomePageProps> = ({ patients, appointments, updateAppointmentStatus, addAppointment, user, updateUser, theme, toggleTheme }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const selectedDateString = selectedDate.toISOString().split('T')[0];

  const dailyAppointments = useMemo(() => {
    return appointments
      .filter(app => app.date === selectedDateString)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDateString]);
  
  const handleSaveProfile = (updatedUser: Omit<User, 'id' | 'plan'>) => {
    updateUser(updatedUser);
  };

  return (
    <div className="space-y-6">
      <header 
        className="bg-primary text-white p-4 rounded-b-3xl -mx-4 -mt-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
            <img src="https://jqvtlpuzkjqliwobiruc.supabase.co/storage/v1/object/public/midias/logos/Untitled_Project-removebg-preview.png" alt="Prontu" className="h-12"/>
            <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => setIsProfileModalOpen(true)}
                role="button"
                aria-label="Abrir perfil do usuário"
            >
                <div>
                  <h1 className="text-md font-semibold text-right">Olá, {user.full_name?.split(' ')[0]}!</h1>
                  <p className="text-xs text-right opacity-80">Seja bem vindo(a)</p>
                </div>
                <img src={user.profile_pic} alt="User" className="w-12 h-12 rounded-full bg-gray-200 object-cover ring-2 ring-white" />
            </div>
        </div>
      </header>
      
      <DayNavigator selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      <div className="p-1">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-dark dark:text-dark-text">Agendamentos</h2>
            <button
                onClick={() => setIsAppointmentModalOpen(true)}
                className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2"
                aria-label="Novo agendamento"
            >
                <PlusIcon className="w-4 h-4" />
                <span>Novo</span>
            </button>
        </div>
        
        {dailyAppointments.length > 0 ? (
          <div className="space-y-3">
            {dailyAppointments.map(app => {
              const patient = patients.find(p => p.id === app.patient_id);
              return patient ? (
                <AppointmentCard 
                  key={app.id} 
                  appointment={app} 
                  patient={patient}
                  onStatusChange={(status) => updateAppointmentStatus(app.id, status)}
                />
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-dark-subtext py-8">Nenhum atendimento para hoje.</p>
        )}
      </div>


      {isAppointmentModalOpen && (
        <AddAppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          patients={patients}
          addAppointment={addAppointment}
          selectedDate={selectedDateString}
        />
      )}
      
      {isProfileModalOpen && (
        <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={user}
            onSave={handleSaveProfile}
            theme={theme}
            toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
};

export default HomePage;
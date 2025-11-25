
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Appointment, Patient, AppointmentStatus, User, Page } from '../types';
import AppointmentCard from '../components/AppointmentCard';
import AddAppointmentModal from '../components/AddAppointmentModal';
import EditAppointmentModal from '../components/EditAppointmentModal';
import { ProfileModal } from '../components/ProfileModal';
import { PlusIcon } from '../components/icons/PlusIcon';
import { CalendarTodayIcon } from '../components/icons/CalendarTodayIcon';
import { ChevronDoubleLeftIcon } from '../components/icons/ChevronDoubleLeftIcon';
import { ChevronDoubleRightIcon } from '../components/icons/ChevronDoubleRightIcon';

// Add setActivePage to interface to allow navigation from profile modal
interface HomePageProps {
  patients: Patient[];
  allPatients: Patient[];
  appointments: Appointment[];
  updateAppointmentStatus: (appointmentId: number, status: AppointmentStatus) => void;
  updateAppointmentDetails: (appointmentId: number, updatedDetails: { date: string, time: string, status: AppointmentStatus, observation: string | null }) => void;
  deleteAppointment: (appointmentId: number) => void;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'user_id'>) => void;
  user: User;
  updateUser: (user: Omit<User, 'id' | 'plan'>) => void;
  theme: string;
  toggleTheme: () => void;
  ensureAppointmentsForDate: (date: Date) => Promise<void>;
  setActivePage?: (page: Page) => void; // Added optional prop for navigation
}

const DayNavigator: React.FC<{ selectedDate: Date; setSelectedDate: (date: Date) => void }> = ({ selectedDate, setSelectedDate }) => {
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const shortMonthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const scrollRef = useRef<HTMLDivElement>(null);

    // Efeito para centralizar ou focar no dia selecionado quando ele mudar
    useEffect(() => {
        if (scrollRef.current) {
            // Encontra o elemento do dia selecionado (assumindo que ele tem a classe ring-2)
            const selectedEl = scrollRef.current.querySelector('.ring-primary') || scrollRef.current.querySelector('.bg-primary');
            if (selectedEl) {
                selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [selectedDate]);

    const changeDay = (amount: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + amount);
        setSelectedDate(newDate);
    };

    const changeWeek = (amount: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + (amount * 7));
        setSelectedDate(newDate);
    };

    const changeMonth = (amount: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(selectedDate.getMonth() + amount);
        setSelectedDate(newDate);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    // Calcula o início da visualização (Domingo da semana atual)
    const startViewDate = new Date(selectedDate);
    startViewDate.setDate(selectedDate.getDate() - selectedDate.getDay());

    return (
        <div className="bg-white dark:bg-dark-card pb-4 pt-2">
            <div className="flex justify-between items-center mb-4 px-4">
                <div className="flex items-center space-x-1">
                    <button onClick={() => changeWeek(-1)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border" title="Voltar uma semana">
                        <ChevronDoubleLeftIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border font-bold text-gray-600 dark:text-gray-400" title="Dia anterior">&lt;</button>
                </div>
                
                <div className="flex items-center space-x-2">
                    <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border text-gray-500" title="Mês anterior">&lt;</button>
                    <h2 className="font-bold text-lg text-dark dark:text-dark-text capitalize whitespace-nowrap">
                        {shortMonthNames[selectedDate.getMonth()]}. {selectedDate.getFullYear()}
                    </h2>
                    <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border text-gray-500" title="Próximo mês">&gt;</button>
                    
                    <button 
                        onClick={() => setSelectedDate(new Date())} 
                        className="p-1 text-primary hover:bg-primary/10 rounded-full transition-colors ml-2"
                        aria-label="Ir para hoje"
                        title="Ir para hoje"
                    >
                        <CalendarTodayIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center space-x-1">
                    <button onClick={() => changeDay(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border font-bold text-gray-600 dark:text-gray-400" title="Próximo dia">&gt;</button>
                    <button onClick={() => changeWeek(1)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border" title="Avançar uma semana">
                        <ChevronDoubleRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            {/* Scrollable Days Container */}
            <div 
                ref={scrollRef}
                className="flex overflow-x-auto space-x-3 px-4 pb-2 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar Firefox/IE
            >
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                {Array.from({ length: 14 }).map((_, i) => {
                    const day = new Date(startViewDate);
                    day.setDate(startViewDate.getDate() + i);
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    const dayIsToday = isToday(day);
                    
                    return (
                        <div 
                            key={i} 
                            onClick={() => setSelectedDate(day)} 
                            className="flex-shrink-0 cursor-pointer text-center space-y-2 snap-start min-w-[3.5rem]"
                        >
                            <p className={`text-xs ${isSelected ? 'text-primary font-bold' : 'text-gray-500 dark:text-dark-subtext'}`}>
                                {weekDays[day.getDay()].toUpperCase()}
                            </p>
                            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200
                                ${isSelected ? 'bg-primary text-white shadow-lg scale-110 ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-dark-card' : 'bg-gray-50 dark:bg-dark-border text-dark dark:text-dark-text'}
                                ${dayIsToday && !isSelected ? 'ring-1 ring-primary text-primary' : ''}`}>
                                {day.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const HomePage: React.FC<HomePageProps> = ({ patients, allPatients, appointments, updateAppointmentStatus, updateAppointmentDetails, deleteAppointment, addAppointment, user, updateUser, theme, toggleTheme, ensureAppointmentsForDate, setActivePage }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const selectedDateString = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    ensureAppointmentsForDate(selectedDate);
  }, [selectedDate, patients, ensureAppointmentsForDate]);

  const dailyAppointments = useMemo(() => {
    return appointments
      .filter(app => app.date === selectedDateString)
      .sort((a, b) => {
        // Find corresponding patients
        const patientA = allPatients.find(p => p.id === a.patient_id);
        const patientB = allPatients.find(p => p.id === b.patient_id);
        
        const nameA = patientA?.name || '';
        const nameB = patientB?.name || '';

        // Sort alphabetically by name first
        const nameComparison = nameA.localeCompare(nameB);
        
        // If names are identical, fallback to sorting by time
        if (nameComparison !== 0) {
            return nameComparison;
        }
        
        return (a.time || '').localeCompare(b.time || '');
      });
  }, [appointments, selectedDateString, allPatients]);
  
  const handleSaveProfile = (updatedUser: Omit<User, 'id' | 'plan'>) => {
    updateUser(updatedUser);
  };
  
  const editingAppointmentPatient = useMemo(() => {
    if (!editingAppointment) return null;
    return allPatients.find(p => p.id === editingAppointment.patient_id) || null;
  }, [editingAppointment, allPatients]);
  
  const userFirstName = (user.full_name || 'Usuário').split(' ')[0];
  const userProfilePic = user.profile_pic || 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/m9asaisyvrr2/001-woman.png';

  return (
    <div className="space-y-2">
      <div className="sticky top-0 z-40 -mx-4 -mt-4 shadow-lg rounded-b-3xl overflow-hidden">
        <header 
          className="bg-white dark:bg-dark-card p-4"
        >
          <div className="flex items-center justify-between">
              <img src="https://mnlzeruerqwuhhgfaavy.supabase.co/storage/v1/object/public/files_config/image-removebg-preview%20(1).png" alt="Prontu" className="h-8 w-auto"/>
              <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => setIsProfileModalOpen(true)}
                  role="button"
                  aria-label="Abrir perfil do usuário"
              >
                  <div>
                    <h1 className="text-md font-semibold text-right text-dark dark:text-dark-text">Olá, {userFirstName}!</h1>
                    <p className="text-xs text-right text-gray-500 dark:text-dark-subtext">Seja bem vindo(a)</p>
                  </div>
                  <img src={userProfilePic} alt="User" className="w-12 h-12 rounded-full bg-gray-200 object-cover ring-2 ring-primary" />
              </div>
          </div>
        </header>
        
        <DayNavigator selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      </div>
      
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
              const patient = allPatients.find(p => p.id === app.patient_id);
              return patient ? (
                <AppointmentCard 
                  key={app.id} 
                  appointment={app} 
                  patient={patient}
                  onStatusChange={(status) => updateAppointmentStatus(app.id, status)}
                  onClick={() => setEditingAppointment(app)}
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

      {editingAppointment && editingAppointmentPatient && (
        <EditAppointmentModal
            isOpen={!!editingAppointment}
            onClose={() => setEditingAppointment(null)}
            appointment={editingAppointment}
            patient={editingAppointmentPatient}
            updateAppointment={updateAppointmentDetails}
            deleteAppointment={deleteAppointment}
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
            navigateTo={setActivePage}
        />
      )}
    </div>
  );
};

export default HomePage;

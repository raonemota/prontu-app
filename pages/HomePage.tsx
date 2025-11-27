
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Appointment, Patient, AppointmentStatus, User, Page } from '../types';
import AppointmentCard from '../components/AppointmentCard';
import AddAppointmentModal from '../components/AddAppointmentModal';
import EditAppointmentModal from '../components/EditAppointmentModal';
import { ProfileModal } from '../components/ProfileModal';
import { PlusIcon } from '../components/icons/PlusIcon';
import { CalendarTodayIcon } from '../components/icons/CalendarTodayIcon';
import { ChevronDoubleLeftIcon } from '../components/icons/ChevronDoubleLeftIcon';
import { ChevronDoubleRightIcon } from '../components/icons/ChevronDoubleRightIcon';
import FeatureAnnouncementModal from '../components/FeatureAnnouncementModal';
import { StarIcon } from '../components/icons/StarIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';

// Add setActivePage to interface to allow navigation from profile modal
interface HomePageProps {
  patients: Patient[];
  allPatients: Patient[];
  appointments: Appointment[];
  updateAppointmentStatus: (appointmentId: number, status: AppointmentStatus) => void;
  updateAppointmentDetails: (appointmentId: number, updatedDetails: { date: string, time: string, status: AppointmentStatus, observation: string | null }) => void;
  deleteAppointment: (appointmentId: number) => Promise<boolean>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'user_id'>) => void;
  user: User;
  updateUser: (user: Omit<User, 'id' | 'plan'>) => void;
  theme: string;
  toggleTheme: () => void;
  ensureAppointmentsForDate: (date: Date) => Promise<void>;
  setActivePage?: (page: Page) => void;
}

const LANDING_URL = "https://www.prontu.ia.br";

const DayNavigator: React.FC<{ selectedDate: Date; setSelectedDate: (date: Date) => void }> = ({ selectedDate, setSelectedDate }) => {
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const shortMonthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const scrollRef = useRef<HTMLDivElement>(null);
    const [visibleDays, setVisibleDays] = useState<Date[]>([]);
    const isDragging = useRef(false);

    // Helper to generate a range of dates
    const generateDays = useCallback((centerDate: Date, daysBefore: number, daysAfter: number) => {
        const days = [];
        for (let i = -daysBefore; i <= daysAfter; i++) {
            const d = new Date(centerDate);
            d.setDate(centerDate.getDate() + i);
            days.push(d);
        }
        return days;
    }, []);

    // Initial load and Reset when selectedDate changes significantly (e.g. month jump)
    // We check if selectedDate is already in visibleDays to avoid unnecessary resets on simple clicks
    useEffect(() => {
        const isSelectedVisible = visibleDays.some(d => d.toDateString() === selectedDate.toDateString());
        
        // If the date is not visible (or it's the first load), regenerate the list centered on selectedDate
        if (!isSelectedVisible) {
            const newDays = generateDays(selectedDate, 15, 15); // 31 days total buffer
            setVisibleDays(newDays);
            
            // Scroll to center after render
            setTimeout(() => {
                if (scrollRef.current) {
                    const container = scrollRef.current;
                    const centerElement = container.children[15] as HTMLElement; // Center index
                    if (centerElement) {
                        const scrollLeft = centerElement.offsetLeft - (container.clientWidth / 2) + (centerElement.clientWidth / 2);
                        container.scrollTo({ left: scrollLeft, behavior: 'auto' });
                    }
                }
            }, 50);
        } else {
             // Just scroll to it smoothly if it is visible
             setTimeout(() => {
                if (scrollRef.current) {
                    const selectedEl = scrollRef.current.querySelector('.ring-primary') || scrollRef.current.querySelector('.bg-primary');
                    if (selectedEl) {
                        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }
            }, 100);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]); // Removed visibleDays dependency to avoid loops

    const handleScroll = () => {
        if (!scrollRef.current) return;
        
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const threshold = 100; // px from edge to trigger load

        // Load Future (Right)
        if (scrollLeft + clientWidth >= scrollWidth - threshold) {
            const lastDay = visibleDays[visibleDays.length - 1];
            const newDays = [];
            for (let i = 1; i <= 14; i++) {
                const d = new Date(lastDay);
                d.setDate(lastDay.getDate() + i);
                newDays.push(d);
            }
            setVisibleDays(prev => [...prev, ...newDays]);
        }

        // Load Past (Left)
        if (scrollLeft <= threshold) {
            // Prevent multiple triggers while adjusting scroll
            if (isDragging.current) return;
            isDragging.current = true;

            const firstDay = visibleDays[0];
            const newDays = [];
            for (let i = 14; i > 0; i--) {
                const d = new Date(firstDay);
                d.setDate(firstDay.getDate() - i);
                newDays.push(d);
            }

            // Calculate current width before update to adjust scroll later
            const oldScrollWidth = scrollRef.current.scrollWidth;

            setVisibleDays(prev => [...newDays, ...prev]);

            // Adjust scroll position after render to prevent jump
            // We use requestAnimationFrame/setTimeout to wait for React render
            setTimeout(() => {
                if (scrollRef.current) {
                    const newScrollWidth = scrollRef.current.scrollWidth;
                    const widthDiff = newScrollWidth - oldScrollWidth;
                    scrollRef.current.scrollLeft += widthDiff;
                    isDragging.current = false;
                }
            }, 0);
        }
    };

    const changeDay = (amount: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + amount);
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

    return (
        <div className="bg-white dark:bg-dark-card pb-4 pt-2">
            <div className="flex justify-between items-center mb-4 px-4">
                <div className="flex items-center">
                    <button 
                        onClick={() => changeDay(-1)} 
                        className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border font-bold text-xl text-gray-600 dark:text-gray-400" 
                        title="Dia anterior"
                    >
                        &lt;
                    </button>
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

                <div className="flex items-center">
                    <button 
                        onClick={() => changeDay(1)} 
                        className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border font-bold text-xl text-gray-600 dark:text-gray-400" 
                        title="Próximo dia"
                    >
                        &gt;
                    </button>
                </div>
            </div>
            
            {/* Scrollable Days Container */}
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto pb-2 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar Firefox/IE
            >
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                {visibleDays.map((day, i) => {
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    const dayIsToday = isToday(day);
                    
                    return (
                        <div 
                            key={day.toISOString()} // Use ISO string for unique key
                            onClick={() => setSelectedDate(day)} 
                            className="flex-shrink-0 cursor-pointer text-center space-y-2 snap-start min-w-[14.28%] w-[14.28%] p-1"
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

  // Lógica de Trial/Premium
  const { isTrial, daysLeft, isExpired, isPremiumOrBeta } = useMemo(() => {
    const plan = (user.tipo_assinante || user.plan || 'Free').toLowerCase();
    const isPremiumOrBeta = plan === 'premium' || plan === 'beta';
    
    let isTrial = false;
    let daysLeft = 0;
    let isExpired = false;

    if (!isPremiumOrBeta && user.data_expiracao_acesso) {
        const expiration = new Date(user.data_expiracao_acesso);
        const now = new Date();
        const diffTime = expiration.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            isTrial = true;
            daysLeft = diffDays;
        } else {
            isExpired = true;
        }
    }

    return { isTrial, daysLeft, isExpired, isPremiumOrBeta };
  }, [user]);

  // FIX: Build date string locally (YYYY-MM-DD) to avoid UTC timezone shifts
  const selectedDateString = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

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

  const handleUpgradeClick = () => {
    if (window.location.hostname.includes('localhost') && setActivePage) {
        setActivePage(Page.Landing);
    } else {
        window.location.href = `${LANDING_URL}#pricing`;
    }
  };
  
  const editingAppointmentPatient = useMemo(() => {
    if (!editingAppointment) return null;
    return allPatients.find(p => p.id === editingAppointment.patient_id) || null;
  }, [editingAppointment, allPatients]);
  
  const userFirstName = (user.full_name || 'Usuário').split(' ')[0];
  const userProfilePic = user.profile_pic || 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/m9asaisyvrr2/001-woman.png';

  // Format expiration date for display
  const formattedExpiration = user.data_expiracao_acesso 
    ? new Date(user.data_expiracao_acesso).toLocaleDateString('pt-BR') 
    : '';

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

      {/* Trial / Expired Banner */}
      {!isPremiumOrBeta && (
        <div className="mx-1 mt-2 mb-2">
            {isTrial ? (
                <div 
                    onClick={handleUpgradeClick}
                    className="bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 p-3 rounded-xl border border-yellow-300 dark:border-yellow-700 cursor-pointer shadow-sm hover:scale-[1.01] transition-transform"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <StarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            <div>
                                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200 leading-tight">Período de Teste Ativo</p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                    Válido até <strong>{formattedExpiration}</strong>.
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-bold bg-yellow-400 text-yellow-900 px-2 py-1 rounded shadow-sm">Ver Planos</span>
                    </div>
                </div>
            ) : isExpired ? (
                <div 
                    onClick={handleUpgradeClick}
                    className="bg-white dark:bg-dark-card p-3 rounded-xl border border-red-200 dark:border-red-900 cursor-pointer shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                    <div className="absolute right-0 top-0 p-2 opacity-5">
                        <ShieldCheckIcon className="w-16 h-16" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                         <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Seu teste Premium expirou</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Faça o upgrade para remover os limites.</p>
                         </div>
                         <button className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md animate-pulse">
                            Virar Premium
                         </button>
                    </div>
                </div>
            ) : (
                // Caso seja usuário Free antigo sem data de expiração (raro com o novo fluxo, mas possível)
                 <div 
                    onClick={handleUpgradeClick}
                    className="bg-gradient-to-r from-primary/5 to-secondary/5 p-3 rounded-xl border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-primary">Tenha acesso ilimitado</p>
                        <span className="text-xs font-bold text-secondary">Ver Premium &rarr;</span>
                    </div>
                </div>
            )}
        </div>
      )}
      
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
              
              // Verificar se o dia do agendamento faz parte dos dias habituais do paciente
              let isOffSchedule = false;
              if (patient && app.date) {
                  // Usar meio-dia para garantir que o dia da semana seja calculado corretamente (evita problemas de fuso horário)
                  const appDate = new Date(app.date + 'T12:00:00');
                  const appDay = appDate.getDay();
                  
                  // Se o paciente tem dias configurados e o dia atual não está neles
                  if (patient.appointment_days && Array.isArray(patient.appointment_days) && !patient.appointment_days.includes(appDay)) {
                      isOffSchedule = true;
                  }
              }

              return patient ? (
                <AppointmentCard 
                  key={app.id} 
                  appointment={app} 
                  patient={patient}
                  onStatusChange={(status) => updateAppointmentStatus(app.id, status)}
                  onClick={() => setEditingAppointment(app)}
                  isOffSchedule={isOffSchedule}
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

      {/* Feature Announcement Modal */}
      <FeatureAnnouncementModal />
    </div>
  );
};

export default HomePage;

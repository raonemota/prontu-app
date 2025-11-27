import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Page, Patient, Appointment, AppointmentStatus, User, Clinic, Gender } from './types';
import HomePage from './pages/HomePage';
import PatientsPage from './pages/PatientsPage';
import ReportsPage from './pages/ReportsPage';
import ClinicsPage from './pages/ClinicsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import BottomNav from './components/BottomNav';
import { supabase } from './supabaseClient';
import { Session, RealtimeChannel } from '@supabase/supabase-js';
import DeactivatedPatientsPage from './pages/DeactivatedPatientsPage';
import InstallPrompt from './components/InstallPrompt';
import AdminPage from './pages/AdminPage';
import LandingPage from './pages/LandingPage';
import AgendaPage from './pages/AgendaPage';

// Configuração dos Domínios
const APP_DOMAIN = 'app.prontu.ia.br';
const LANDING_DOMAIN = 'www.prontu.ia.br';

// Helper function to extract a readable error message
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message;
  }
  if (typeof error === 'string') {
    return error;
  }
  console.error("Unknown error format:", error);
  return 'Ocorreu um erro desconhecido. Verifique o console para mais detalhes.';
};

// Helper function to safely get a sortable date
const getSortableDate = (dateStr: string | null | undefined): number => {
    if (!dateStr) return Infinity; // Put items with no date at the end
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? Infinity : date.getTime();
}

const App: React.FC = () => {
  // Verificação de Domínio
  const isLandingDomain = useMemo(() => {
    const hostname = window.location.hostname;
    // Considera landing se for o domínio principal ou www
    // Se for localhost, consideramos 'app' para facilitar desenvolvimento, a menos que especificado
    return hostname === 'prontu.ia.br' || hostname === 'www.prontu.ia.br';
  }, []);

  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  
  // Se for domínio de Landing, inicia na Landing. Se for App, inicia no Login/Home
  const [activePage, setActivePage] = useState<Page>(isLandingDomain ? Page.Landing : Page.Login);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [deactivatedPatients, setDeactivatedPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  // Use refs to track state in async functions to avoid closure staleness
  const userProfileRef = useRef<User | null>(null);
  // Ref para activePage para usar dentro do listener de auth sem recriar o efeito
  const activePageRef = useRef<Page>(activePage);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('theme');
      if (typeof storedPrefs === 'string') {
        return storedPrefs;
      }
    }
    return 'light'; // Default to light theme
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Update ref whenever userProfile changes
    userProfileRef.current = userProfile;
  }, [userProfile]);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  // Safety Timeout for Loading
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (loading && !isLandingDomain) {
        console.warn("Loading timed out - safety fallback triggered");
        setLoading(false);
        if (!session && !userProfile) {
            // Se demorou demais e não tem nada, assume que não logou ou falhou rede
            // Não faz nada drástico, apenas libera a tela, o renderPage vai decidir o que mostrar
        }
      }
    }, 15000); // 15 seconds max load time

    return () => clearTimeout(safetyTimer);
  }, [loading, session, userProfile, isLandingDomain]);

  // Realtime Subscription for User Profile Updates (Plan changes, etc.)
  useEffect(() => {
    let channel: RealtimeChannel;

    if (session?.user?.id) {
      // Subscribe to changes in the 'users' table for the current user
      channel = supabase
        .channel('public:users')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${session.user.id}`,
          },
          (payload) => {
            console.log('Perfil atualizado em tempo real:', payload.new);
            // Update local state immediately with the new data from DB
            setUserProfile(prev => ({ ...prev, ...payload.new } as User));
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [session]);

  useEffect(() => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            throw error;
        }

        setSession(session);
        if (session) {
          // Permite que o usuário logado visualize a Landing Page sem redirect automático
          // O renderPage cuidará de exibir a LandingPage se isLandingDomain for true

          // Apenas define para Home na carga inicial se NÃO estivermos na Landing
          if (!isLandingDomain) {
             setActivePage(Page.Home);
          }
          fetchData(session.user.id);
        } else {
          setLoading(false);
          // Se não houver sessão:
          // isLandingDomain = true -> Fica na Landing Page
          // isLandingDomain = false -> Fica no Login (definido no useState inicial)
        }
      } catch (error) {
        console.error("Error getting session:", getErrorMessage(error));
        await supabase.auth.signOut();
        setSession(null);
        setLoading(false);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const eventType = event as string;

      if (eventType === 'SIGNED_OUT' || eventType === 'USER_DELETED') {
        setSession(null);
        setPatients([]);
        setDeactivatedPatients([]);
        setAppointments([]);
        setUserProfile(null);
        setClinics([]);
        setLoading(false);
        setErrorState(null);
        
        // Se sair no domínio do App, vai para Login
        // Se sair no domínio da Landing (raro, mas possível), fica na Landing
        if (!isLandingDomain) {
            setActivePage(Page.Login);
        }
        return;
      }
      
      if (eventType === 'TOKEN_REFRESH_REVOKED') {
          console.warn("Token refresh revoked.");
          setSession(null);
          setLoading(false);
          setActivePage(isLandingDomain ? Page.Landing : Page.Login);
          return;
      }

      setSession(session);
      if (session) {
        // Usa o Ref para verificar a página atual sem causar re-render ou re-execução do efeito
        // Se estiver na Landing, não forçamos Home
        if (!isLandingDomain && (activePageRef.current === Page.Login || activePageRef.current === Page.SignUp)) {
            setActivePage(Page.Home);
        }
        fetchData(session.user.id);
      } else {
        setPatients([]);
        setDeactivatedPatients([]);
        setAppointments([]);
        setUserProfile(null);
        setClinics([]);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
    // Removido activePage das dependências para evitar reset de navegação
  }, [isLandingDomain]); 
  
  const fetchData = async (userId: string) => {
      // Only show full screen loading if we don't have a profile loaded yet.
      if (!userProfileRef.current) {
          setLoading(true);
      }
      setErrorState(null);
      
      try {
          // Update last sign in time
          await supabase
            .from('users')
            .update({ last_sign_in_at: new Date().toISOString() })
            .eq('id', userId);

          const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();
          
          if (profileError || !profileData) {
              if (!userProfileRef.current) {
                  const errorMessage = profileError ? getErrorMessage(profileError) : 'Perfil do usuário não encontrado.';
                  console.error("Erro crítico ao buscar perfil do usuário:", errorMessage);
                  throw new Error(errorMessage);
              }
          }
          
          if (profileData) {
              setUserProfile(profileData);
          }

          const { data: clinicsData, error: clinicsError } = await supabase
              .from('clinics')
              .select('*')
              .eq('user_id', userId)
              .order('name');
          if (clinicsError) throw clinicsError;
          setClinics(clinicsData || []);

          const { data: patientsData, error: patientsError } = await supabase
              .from('patients')
              .select('*, clinics(name)')
              .eq('user_id', userId)
              .eq('is_active', true) 
              .order('name');
          if (patientsError) throw patientsError;
          setPatients(patientsData as Patient[] || []);

          const { data: deactivatedPatientsData, error: deactivatedPatientsError } = await supabase
              .from('patients')
              .select('*, clinics(name)')
              .eq('user_id', userId)
              .eq('is_active', false)
              .order('name');
          if (deactivatedPatientsError) throw deactivatedPatientsError;
          setDeactivatedPatients(deactivatedPatientsData as Patient[] || []);

          const { data: appointmentsData, error: appointmentsError } = await supabase
              .from('appointments')
              .select('*')
              .eq('user_id', userId)
              .order('date', { ascending: true });
          if (appointmentsError) throw appointmentsError;
          setAppointments(appointmentsData || []);

      } catch (error: unknown) {
          const errorMessage = getErrorMessage(error);
          console.error("Erro ao buscar dados:", errorMessage);
          if (!userProfileRef.current) {
              setErrorState(errorMessage);
          } else {
              // Se já temos perfil carregado, mostramos alert, mas não travamos a app
               alert(`Não foi possível atualizar alguns dados: ${errorMessage}\nVerifique sua conexão.`);
          }
      } finally {
          setLoading(false);
      }
  };

  const updateUserProfile = async (updatedProfile: Omit<User, 'id' | 'plan'>) => {
    if (!userProfile) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updatedProfile)
        .eq('id', userProfile.id)
        .select()
        .single();
      if (error) throw error;
      if(data) {
        setUserProfile(data);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error("Erro ao atualizar perfil:", errorMessage);
      alert(`Erro ao atualizar perfil: ${errorMessage}`);
    }
  };

  const addPatient = async (patient: Omit<Patient, 'id' | 'profile_pic' | 'user_id' | 'clinics'>) => {
    if (!session) return;
    const avatarUrl = patient.gender === Gender.Male 
        ? 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/7r32xseg58k9/002-young-boy.png' 
        : 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/m9asaisyvrr2/001-woman.png';
    
    const newPatientData = {
      ...patient,
      user_id: session.user.id,
      profile_pic: avatarUrl
    };

    const { data, error } = await supabase.from('patients').insert(newPatientData).select('*, clinics(name)').single();
    if (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Erro ao adicionar paciente:", errorMessage);
      alert(`Erro ao adicionar paciente: ${errorMessage}`);
    } else if (data) {
      setPatients(prev => [...prev, data as Patient]);
    }
  };

  const updatePatient = async (patientId: number, updatedData: Omit<Patient, 'id' | 'profile_pic' | 'user_id' | 'clinics'>) => {
    const { data, error } = await supabase
        .from('patients')
        .update(updatedData)
        .eq('id', patientId)
        .select('*, clinics(name)')
        .single();
    
    if (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Erro ao atualizar paciente:", errorMessage);
        alert(`Erro ao atualizar paciente: ${errorMessage}`);
    } else if (data) {
      setPatients(prev => prev.map(p => p.id === patientId ? data as Patient : p));
    }
  };

  const deactivatePatient = async (patientId: number): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc('deactivate_patient_for_user', {
        patient_id_to_deactivate: patientId
      });
      if (error) throw error;
      
      const patientToMove = patients.find(p => p.id === patientId);
      if (patientToMove) {
        setPatients(prev => prev.filter(p => p.id !== patientId));
        setDeactivatedPatients(prev => [...prev, patientToMove].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      }
      
      alert("Paciente desativado com sucesso!");
      return true;

    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      alert(`Falha ao desativar o paciente: ${errorMessage}`);
      return false;
    }
  };
  
  const activatePatient = async (patientId: number): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc('activate_patient_for_user', {
        patient_id_to_activate: patientId
      });
      if (error) throw error;

      const patientToMove = deactivatedPatients.find(p => p.id === patientId);
      if (patientToMove) {
        setDeactivatedPatients(prev => prev.filter(p => p.id !== patientId));
        setPatients(prev => [...prev, patientToMove].sort((a,b) => (a.name || '').localeCompare(b.name || '')));
        alert("Paciente reativado com sucesso!");
        return true;
      }
      return false;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      alert(`Falha ao reativar o paciente: ${errorMessage}\n\nVerifique se a função 'activate_patient_for_user' foi criada no editor SQL do Supabase.`);
      return false;
    }
  };
  
  const ensureAppointmentsForDate = async (date: Date) => {
      if (!session) return;
      
      // FIX: Noon Strategy (Estratégia do Meio-Dia)
      const safeDate = new Date(date);
      safeDate.setHours(12, 0, 0, 0);

      const year = safeDate.getFullYear();
      const month = String(safeDate.getMonth() + 1).padStart(2, '0');
      const day = String(safeDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const dayOfWeek = safeDate.getDay(); // 0 (Dom) a 6 (Sab)

      const newAppointments: Omit<Appointment, 'id'>[] = [];

      const relevantPatients = patients.filter(p =>
        Array.isArray(p.appointment_days) && p.appointment_days.includes(dayOfWeek)
      );

      for (const patient of relevantPatients) {
        const exists = appointments.some(a => a.patient_id === patient.id && a.date === dateString);
        if (!exists) {
           // Verifica se existe um horário específico para este dia
           const specificTime = patient.appointment_times ? patient.appointment_times[dayOfWeek.toString()] : null;
           
           // Se existir horário específico usa ele, caso contrário usa o fallback appointment_time
           const timeToUse = specificTime || patient.appointment_time || '09:00';

           newAppointments.push({
              patient_id: patient.id,
              user_id: session.user.id,
              date: dateString,
              time: timeToUse,
              status: AppointmentStatus.NoStatus,
          });
        }
      }

      if (newAppointments.length > 0) {
          const { data, error } = await supabase.from('appointments').insert(newAppointments).select();
          if (error) {
             console.error("Error ensuring appointments:", error);
          } else if (data) {
             setAppointments(prev => [...prev, ...data].sort((a, b) => getSortableDate(a.date) - getSortableDate(b.date) || (a.time || '').localeCompare(b.time || '')));
          }
      }
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'user_id'>) => {
    if (!session) return;
    if (appointments.some(a => a.patient_id === appointment.patient_id && a.date === appointment.date)) {
        alert("Paciente já possui um atendimento neste dia."); return;
    }
    if (appointments.some(a => a.date === appointment.date && a.time === appointment.time)) {
        alert("Já existe um atendimento neste horário."); return;
    }

    const newAppointment = { ...appointment, user_id: session.user.id };
    const { data, error } = await supabase.from('appointments').insert(newAppointment).select().single();
    if (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Erro ao adicionar agendamento:", errorMessage);
      alert(`Erro ao adicionar agendamento: ${errorMessage}`);
    } else if (data) {
      setAppointments(prev => [...prev, data].sort((a, b) => getSortableDate(a.date) - getSortableDate(b.date) || (a.time || '').localeCompare(b.time || '')));
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, status: AppointmentStatus) => {
    const { data, error } = await supabase.from('appointments').update({ status }).eq('id', appointmentId).select().single();
    if (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Erro ao atualizar status:", errorMessage);
      alert(`Erro ao atualizar status: ${errorMessage}`);
    } else if (data) {
      setAppointments(prev => prev.map(app => (app.id === appointmentId ? data : app)));
    }
  };

  const updateAppointmentDetails = async (appointmentId: number, updatedDetails: { date: string, time: string, status: AppointmentStatus, observation: string | null }) => {
    const { data, error } = await supabase.from('appointments').update(updatedDetails).eq('id', appointmentId).select().single();
    if (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Erro ao atualizar agendamento:", errorMessage);
      alert(`Erro ao atualizar agendamento: ${errorMessage}`);
    } else if (data) {
      setAppointments(prev => prev.map(app => (app.id === appointmentId ? data : app)).sort((a, b) => getSortableDate(a.date) - getSortableDate(b.date) || (a.time || '').localeCompare(b.time || '')));
    }
  };

  const deleteAppointment = async (appointmentId: number): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc('delete_appointment_for_user', { 
        appointment_id_to_delete: appointmentId 
      });

      if (error) throw error;
      
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
      alert('Agendamento excluído com sucesso!');
      return true;

    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error(`Falha na exclusão. Erro: ${errorMessage}`);
      alert(`Erro ao deletar agendamento: ${errorMessage}`);
      return false;
    }
  };

  const addClinic = async (clinic: Omit<Clinic, 'id' | 'user_id'>) => {
    if (!session) return;
    const { data, error } = await supabase.from('clinics').insert({ ...clinic, user_id: session.user.id }).select().single();
    if (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Erro ao adicionar clínica:", errorMessage);
      alert(`Erro ao adicionar clínica: ${errorMessage}`);
    }
    else if (data) setClinics(prev => [...prev, data]);
  };

  const updateClinic = async (clinicId: number, updatedClinic: Omit<Clinic, 'id' | 'user_id'>) => {
    const { data, error } = await supabase.from('clinics').update(updatedClinic).eq('id', clinicId).select().single();
    if (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Erro ao atualizar clínica:", errorMessage);
      alert(`Erro ao atualizar clínica: ${errorMessage}`);
    }
    else if (data) setClinics(prev => prev.map(c => c.id === clinicId ? data : c));
  };

  const deleteClinic = async (clinicId: number) => {
    const { error } = await supabase.from('clinics').delete().eq('id', clinicId);
    if (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Erro ao deletar clínica:", errorMessage);
      alert(`Erro ao deletar clínica: ${errorMessage}`);
    }
    else setClinics(prev => prev.filter(c => c.id !== clinicId));
  };
  
  const allPatients = useMemo(() => [...patients, ...deactivatedPatients], [patients, deactivatedPatients]);
  
  const handleRetryFetch = () => {
      if (session?.user?.id) {
          fetchData(session.user.id);
      } else {
          window.location.reload();
      }
  };

  const renderPage = () => {
    // Se estiver no domínio da Landing Page, força a renderização dela
    // a menos que esteja em localhost (dev) e force a navegação
    if (isLandingDomain) {
        return <LandingPage setActivePage={setActivePage} isLoggedIn={!!session} />;
    }
    
    // Tratamento de Erro de Carregamento
    if (errorState && session) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 px-6 text-center" style={{height: 'calc(100vh - 5rem)'}}>
                <div className="text-danger text-5xl mb-2">⚠️</div>
                <h3 className="text-lg font-bold text-dark dark:text-dark-text">Ops! Algo deu errado.</h3>
                <p className="text-sm text-gray-500 dark:text-dark-subtext">
                    {errorState}
                </p>
                <button 
                    onClick={handleRetryFetch}
                    className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-semibold shadow-md active:scale-95 transition-transform"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (loading || (!userProfile && session)) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4" style={{height: 'calc(100vh - 5rem)'}}>
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-medium text-primary animate-pulse">Carregando...</p>
            </div>
        );
    }

    switch (activePage) {
      case Page.Home:
        return <HomePage 
          patients={patients} 
          allPatients={allPatients}
          appointments={appointments} 
          updateAppointmentStatus={updateAppointmentStatus}
          updateAppointmentDetails={updateAppointmentDetails}
          deleteAppointment={deleteAppointment}
          addAppointment={addAppointment}
          user={userProfile!}
          updateUser={updateUserProfile}
          theme={theme}
          toggleTheme={toggleTheme}
          ensureAppointmentsForDate={ensureAppointmentsForDate}
          setActivePage={setActivePage}
        />;
      case Page.Agenda:
        return <AgendaPage 
          patients={patients}
          allPatients={allPatients}
          appointments={appointments}
          setActivePage={setActivePage}
        />;
      case Page.Patients:
        return <PatientsPage 
        patients={patients} 
        addPatient={addPatient} 
        updatePatient={updatePatient} 
        deactivatePatient={deactivatePatient} 
        clinics={clinics} 
        setActivePage={setActivePage} 
        user={userProfile!}
      />;
      case Page.Reports:
        return <ReportsPage 
          allPatients={allPatients}
          appointments={appointments} 
          clinics={clinics}
          user={userProfile!}
          setActivePage={setActivePage} 
        />;
      case Page.Clinics:
        return <ClinicsPage clinics={clinics} addClinic={addClinic} updateClinic={updateClinic} deleteClinic={deleteClinic} setActivePage={setActivePage} />;
      case Page.DeactivatedPatients:
        return <DeactivatedPatientsPage
          deactivatedPatients={deactivatedPatients}
          activatePatient={activatePatient}
          setActivePage={setActivePage}
        />;
      case Page.Admin:
        return <AdminPage setActivePage={setActivePage} currentUser={userProfile!} />;
      // Caso esteja no domínio do App mas tente acessar landing, redireciona para home ou login
      case Page.Landing:
         return session ? <HomePage 
            patients={patients} 
            allPatients={allPatients}
            appointments={appointments} 
            updateAppointmentStatus={updateAppointmentStatus}
            updateAppointmentDetails={updateAppointmentDetails}
            deleteAppointment={deleteAppointment}
            addAppointment={addAppointment}
            user={userProfile!}
            updateUser={updateUserProfile}
            theme={theme}
            toggleTheme={toggleTheme}
            ensureAppointmentsForDate={ensureAppointmentsForDate}
            setActivePage={setActivePage}
         /> : <LoginPage setActivePage={setActivePage} />;
      default:
        return <HomePage 
          patients={patients} 
          allPatients={allPatients}
          appointments={appointments} 
          updateAppointmentStatus={updateAppointmentStatus}
          updateAppointmentDetails={updateAppointmentDetails}
          deleteAppointment={deleteAppointment}
          addAppointment={addAppointment}
          user={userProfile!}
          updateUser={updateUserProfile}
          theme={theme}
          toggleTheme={toggleTheme}
          ensureAppointmentsForDate={ensureAppointmentsForDate}
          setActivePage={setActivePage}
        />;
    }
  };

  // Se estiver carregando, mostra tela de loading genérica
  if (loading && !session && !isLandingDomain) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-light dark:bg-dark-bg">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-semibold text-primary">Iniciando Prontu...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black">
      {/* Se for landing domain, usa width full, se não, limita a 800px (app mobile view) */}
      <div className={`w-full ${isLandingDomain ? '' : 'max-w-[800px]'} mx-auto relative min-h-screen shadow-lg bg-light dark:bg-dark-bg text-dark dark:text-dark-text`}>
        {!session && !isLandingDomain ? (
            <div className="flex items-center justify-center min-h-screen px-4">
              {activePage === Page.SignUp ? (
                <SignUpPage setActivePage={setActivePage} />
              ) : (
                <LoginPage setActivePage={setActivePage} />
              )}
            </div>
          ) : (
            <>
              {isLandingDomain ? (
                 <main className="p-0 pb-0">
                    {renderPage()}
                 </main>
              ) : (
                 <main className="p-4 pb-24">
                    {renderPage()}
                 </main>
              )}
              {/* Só mostra a BottomNav se NÃO for Landing Domain */}
              {!isLandingDomain && session && (
                <BottomNav activePage={activePage} setActivePage={setActivePage} />
              )}
              {!isLandingDomain && <InstallPrompt />}
            </>
          )}
      </div>
    </div>
  );
};

export default App;
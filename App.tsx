
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
import CookieConsent from './components/CookieConsent';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

// Helper function to extract a readable error message
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Ocorreu um erro desconhecido.';
};

// Helper function to safely get a sortable date
const getSortableDate = (dateStr: string | null | undefined): number => {
    if (!dateStr) return Infinity; 
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? Infinity : date.getTime();
}

const App: React.FC = () => {
  const isLandingDomain = useMemo(() => {
    const hostname = window.location.hostname;
    return hostname === 'prontu.ia.br' || hostname === 'www.prontu.ia.br' || hostname.includes('localhost') || hostname.includes('run.app');
  }, []);

  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<Page>(isLandingDomain ? Page.Landing : Page.Login);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [deactivatedPatients, setDeactivatedPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [recoveryMode, setRecoveryMode] = useState(false);
  
  const userProfileRef = useRef<User | null>(null);
  const activePageRef = useRef<Page>(activePage);
  const ensuringAppointmentsRef = useRef<Set<string>>(new Set());

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  // Realtime Subscription
  useEffect(() => {
    let channel: RealtimeChannel;
    if (session?.user?.id) {
      channel = supabase
        .channel(`public:users:id=eq.${session.user.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${session.user.id}` }, (payload) => {
            setUserProfile(prev => ({ ...prev, ...payload.new } as User));
        })
        .subscribe();
    }
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [session]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
    
    if (isLandingDomain) {
        const path = window.location.pathname;
        if (path === '/termos') setActivePage(Page.Terms);
        else if (path === '/privacidade') setActivePage(Page.Privacy);
    }

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        if (session) {
          if (!isLandingDomain && activePageRef.current === Page.Login) {
             setActivePage(Page.Home);
          }
          await fetchData(session.user.id);
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    };
    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setSession(null);
        setPatients([]);
        setAppointments([]);
        setUserProfile(null);
        if (!isLandingDomain) setActivePage(Page.Login);
        setLoading(false);
        return;
      }
      
      if (event === 'PASSWORD_RECOVERY') {
          setRecoveryMode(true);
      }

      setSession(session);
      if (session) {
        if (!isLandingDomain && (activePageRef.current === Page.Login || activePageRef.current === Page.SignUp)) {
            setActivePage(Page.Home);
        }
        fetchData(session.user.id);
      }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, [isLandingDomain]); 
  
  const fetchData = async (userId: string) => {
      try {
          const { data: profileData } = await supabase.from('users').select('*').eq('id', userId).single();
          if (profileData) setUserProfile(profileData);

          const [clinicsRes, activePatientsRes, inactivePatientsRes, appointmentsRes] = await Promise.all([
              supabase.from('clinics').select('*').eq('user_id', userId).order('name'),
              supabase.from('patients').select('*, clinics(name)').eq('user_id', userId).eq('is_active', true).order('name'),
              supabase.from('patients').select('*, clinics(name)').eq('user_id', userId).eq('is_active', false).order('name'),
              supabase.from('appointments').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(2000)
          ]);

          if (clinicsRes.data) setClinics(clinicsRes.data);
          if (activePatientsRes.data) setPatients(activePatientsRes.data as Patient[]);
          if (inactivePatientsRes.data) setDeactivatedPatients(inactivePatientsRes.data as Patient[]);
          if (appointmentsRes.data) setAppointments(appointmentsRes.data);

      } catch (error) {
          console.error("Fetch error:", error);
      }
  };

  const updateUserProfile = async (updatedProfile: Omit<User, 'id' | 'plan'>) => {
    if (!userProfile) return;
    const { data, error } = await supabase.from('users').update(updatedProfile).eq('id', userProfile.id).select().single();
    if (!error && data) setUserProfile(data);
  };

  const addPatient = async (patient: Omit<Patient, 'id' | 'profile_pic' | 'user_id' | 'clinics'>) => {
    if (!session) return;
    const avatarUrl = patient.gender === Gender.Male 
        ? 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/7r32xseg58k9/002-young-boy.png' 
        : 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/m9asaisyvrr2/001-woman.png';
    const { data, error } = await supabase.from('patients').insert({ ...patient, user_id: session.user.id, profile_pic: avatarUrl }).select('*, clinics(name)').single();
    if (data) setPatients(prev => [...prev, data as Patient]);
  };

  const updatePatient = async (patientId: number, updatedData: Omit<Patient, 'id' | 'profile_pic' | 'user_id' | 'clinics'>) => {
    const { data } = await supabase.from('patients').update(updatedData).eq('id', patientId).select('*, clinics(name)').single();
    if (data) setPatients(prev => prev.map(p => p.id === patientId ? data as Patient : p));
  };

  const deactivatePatient = async (patientId: number): Promise<boolean> => {
    const { error } = await supabase.rpc('deactivate_patient_for_user', { patient_id_to_deactivate: patientId });
    if (!error) {
        const patientToMove = patients.find(p => p.id === patientId);
        if (patientToMove) {
            setPatients(prev => prev.filter(p => p.id !== patientId));
            setDeactivatedPatients(prev => [...prev, patientToMove].sort((a,b) => (a.name || '').localeCompare(b.name || '')));
        }
        return true;
    }
    return false;
  };
  
  const activatePatient = async (patientId: number): Promise<boolean> => {
    const { error } = await supabase.rpc('activate_patient_for_user', { patient_id_to_activate: patientId });
    if (!error) {
        const patientToMove = deactivatedPatients.find(p => p.id === patientId);
        if (patientToMove) {
            setDeactivatedPatients(prev => prev.filter(p => p.id !== patientId));
            setPatients(prev => [...prev, patientToMove].sort((a,b) => (a.name || '').localeCompare(b.name || '')));
        }
        return true;
    }
    return false;
  };
  
  const ensureAppointmentsForDate = async (date: Date) => {
      if (!session) return;
      const safeDate = new Date(date);
      safeDate.setHours(12, 0, 0, 0);
      const year = safeDate.getFullYear();
      const month = String(safeDate.getMonth() + 1).padStart(2, '0');
      const day = String(safeDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      if (ensuringAppointmentsRef.current.has(dateString)) return;
      ensuringAppointmentsRef.current.add(dateString);

      try {
        const { data: existingDbApps } = await supabase.from('appointments').select('*').eq('date', dateString).eq('user_id', session.user.id);
        if (existingDbApps && existingDbApps.length > 0) {
            setAppointments(prev => {
                const currentIds = new Set(prev.map(a => a.id));
                const missingInState = existingDbApps.filter(a => !currentIds.has(a.id));
                if (missingInState.length === 0) return prev;
                return [...prev, ...missingInState].sort((a, b) => getSortableDate(a.date) - getSortableDate(b.date));
            });
        }

        const existingPatientIds = new Set(existingDbApps?.map(a => a.patient_id) || []);
        const dayOfWeek = safeDate.getDay(); 
        const newAppointments: Omit<Appointment, 'id'>[] = [];

        patients.filter(p => Array.isArray(p.appointment_days) && p.appointment_days.includes(dayOfWeek)).forEach(patient => {
            if (!existingPatientIds.has(patient.id)) {
                const timeToUse = (patient.appointment_times && patient.appointment_times[dayOfWeek.toString()]) || patient.appointment_time || '09:00';
                newAppointments.push({ patient_id: patient.id, user_id: session.user.id, date: dateString, time: timeToUse, status: AppointmentStatus.NoStatus });
            }
        });

        if (newAppointments.length > 0) {
            const { data } = await supabase.from('appointments').insert(newAppointments).select();
            if (data) setAppointments(prev => [...prev, ...data].sort((a, b) => getSortableDate(a.date) - getSortableDate(b.date)));
        }
      } finally {
        ensuringAppointmentsRef.current.delete(dateString);
      }
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'user_id'>) => {
    if (!session) return;
    const { data } = await supabase.from('appointments').insert({ ...appointment, user_id: session.user.id }).select().single();
    if (data) setAppointments(prev => [...prev, data].sort((a, b) => getSortableDate(a.date) - getSortableDate(b.date)));
  };

  const updateAppointmentStatus = async (appointmentId: number, status: AppointmentStatus) => {
    const { data } = await supabase.from('appointments').update({ status }).eq('id', appointmentId).select().single();
    if (data) setAppointments(prev => prev.map(app => (app.id === appointmentId ? data : app)));
  };

  const updateAppointmentDetails = async (appointmentId: number, updatedDetails: any) => {
    const { data } = await supabase.from('appointments').update(updatedDetails).eq('id', appointmentId).select().single();
    if (data) setAppointments(prev => prev.map(app => (app.id === appointmentId ? data : app)).sort((a, b) => getSortableDate(a.date) - getSortableDate(b.date)));
  };

  const deleteAppointment = async (appointmentId: number): Promise<boolean> => {
    const { error } = await supabase.rpc('delete_appointment_for_user', { appointment_id_to_delete: appointmentId });
    if (!error) {
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
      return true;
    }
    return false;
  };

  const addClinic = async (clinic: Omit<Clinic, 'id' | 'user_id'>) => {
    if (!session) return;
    const { data } = await supabase.from('clinics').insert({ ...clinic, user_id: session.user.id }).select().single();
    if (data) setClinics(prev => [...prev, data]);
  };

  const updateClinic = async (clinicId: number, updatedClinic: any) => {
    const { data } = await supabase.from('clinics').update(updatedClinic).eq('id', clinicId).select().single();
    if (data) setClinics(prev => prev.map(c => c.id === clinicId ? data : c));
  };

  const deleteClinic = async (clinicId: number) => {
    const { error } = await supabase.from('clinics').delete().eq('id', clinicId);
    if (!error) setClinics(prev => prev.filter(c => c.id !== clinicId));
  };
  
  const allPatients = useMemo(() => [...patients, ...deactivatedPatients], [patients, deactivatedPatients]);

  const renderPage = () => {
    if (isLandingDomain && (activePage === Page.Landing || activePage === Page.Terms || activePage === Page.Privacy)) {
        if (activePage === Page.Terms) return <TermsPage onBack={() => setActivePage(Page.Landing)} />;
        if (activePage === Page.Privacy) return <PrivacyPage onBack={() => setActivePage(Page.Landing)} />;
        return <LandingPage setActivePage={setActivePage} isLoggedIn={!!session} />;
    }
    
    // Check loading OR if session exists but profile isn't ready
    if (loading || (session && !userProfile)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-primary font-medium">Carregando...</p>
            </div>
        );
    }

    switch (activePage) {
      case Page.Home: return <HomePage patients={patients} allPatients={allPatients} appointments={appointments} updateAppointmentStatus={updateAppointmentStatus} updateAppointmentDetails={updateAppointmentDetails} deleteAppointment={deleteAppointment} addAppointment={addAppointment} user={userProfile!} updateUser={updateUserProfile} theme={theme} toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} ensureAppointmentsForDate={ensureAppointmentsForDate} setActivePage={setActivePage} recoveryMode={recoveryMode} />;
      case Page.Agenda: return <AgendaPage patients={patients} allPatients={allPatients} appointments={appointments} setActivePage={setActivePage} ensureAppointmentsForDate={ensureAppointmentsForDate} />;
      case Page.Patients: return <PatientsPage patients={patients} addPatient={addPatient} updatePatient={updatePatient} deactivatePatient={deactivatePatient} clinics={clinics} setActivePage={setActivePage} user={userProfile!} />;
      case Page.Reports: return <ReportsPage allPatients={allPatients} appointments={appointments} clinics={clinics} user={userProfile!} setActivePage={setActivePage} />;
      case Page.Clinics: return <ClinicsPage clinics={clinics} addClinic={addClinic} updateClinic={updateClinic} deleteClinic={deleteClinic} setActivePage={setActivePage} />;
      case Page.DeactivatedPatients: return <DeactivatedPatientsPage deactivatedPatients={deactivatedPatients} activatePatient={activatePatient} setActivePage={setActivePage} />;
      case Page.Admin: return <AdminPage setActivePage={setActivePage} currentUser={userProfile!} />;
      case Page.Terms: return <TermsPage onBack={() => setActivePage(Page.Home)} />;
      case Page.Privacy: return <PrivacyPage onBack={() => setActivePage(Page.Home)} />;
      case Page.Landing: return <LandingPage setActivePage={setActivePage} isLoggedIn={!!session} />;
      default: return <LoginPage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black">
      <div className={`w-full ${isLandingDomain ? '' : 'max-w-[800px]'} mx-auto relative min-h-screen shadow-lg bg-light dark:bg-dark-bg text-dark dark:text-dark-text`}>
        {!session && (!isLandingDomain || activePage === Page.Login || activePage === Page.SignUp) ? (
            <div className="flex items-center justify-center min-h-screen px-4">
              {activePage === Page.SignUp ? <SignUpPage setActivePage={setActivePage} /> : <LoginPage setActivePage={setActivePage} />}
            </div>
          ) : (
            <>
              <main className={`${(activePage === Page.Landing || isLandingDomain) ? 'p-0' : 'p-4 pb-24'}`}>
                {renderPage()}
              </main>
              {!isLandingDomain && session && <BottomNav activePage={activePage} setActivePage={setActivePage} />}
              {!isLandingDomain && <InstallPrompt />}
            </>
          )}
      </div>
      {isLandingDomain && <CookieConsent />}
    </div>
  );
};

export default App;

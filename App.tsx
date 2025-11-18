import React, { useState, useEffect } from 'react';
import { Page, Patient, Appointment, AppointmentStatus, User, Clinic, Gender } from './types';
import HomePage from './pages/HomePage';
import PatientsPage from './pages/PatientsPage';
import ReportsPage from './pages/ReportsPage';
import ClinicsPage from './pages/ClinicsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import BottomNav from './components/BottomNav';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

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

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<Page>(Page.Home);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

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
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        fetchData(session.user.id);
      } else {
        setLoading(false);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchData(session.user.id);
      } else {
        setPatients([]);
        setAppointments([]);
        setUserProfile(null);
        setClinics([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const fetchData = async (userId: string) => {
      setLoading(true);
      try {
          const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();
          
          if (profileError || !profileData) {
              const errorMessage = profileError ? getErrorMessage(profileError) : 'Perfil do usuário não encontrado.';
              console.error("Erro crítico ao buscar perfil do usuário:", errorMessage);
              alert(`Não foi possível carregar os dados do seu perfil: ${errorMessage}\n\nIsso pode ser um problema com as permissões de segurança (RLS). Você será desconectado.`);
              await supabase.auth.signOut();
              return;
          }
          setUserProfile(profileData);

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
              .eq('is_active', true) // Only fetch active patients
              .order('name');
          if (patientsError) throw patientsError;
          setPatients(patientsData as Patient[] || []);

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
          alert(`Não foi possível carregar os dados: ${errorMessage}\n\nPor favor, verifique sua conexão e se as políticas de segurança (RLS) estão configuradas corretamente no seu painel Supabase.`);
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
      generateAppointmentsForPatient(data as Patient, session.user.id);
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
      const { data, error } = await supabase
        .from('patients')
        .update({ is_active: false })
        .eq('id', patientId)
        .select(); // Use .select() to get a confirmation and trigger RLS errors reliably.

      if (error) {
        // Handle errors returned by the Supabase API (e.g., RLS violations)
        throw error;
      }

      // Handle cases where RLS might prevent the update silently (no error, but no data returned)
      if (!data || data.length === 0) {
        throw new Error("A operação falhou. O paciente não foi encontrado ou as permissões de segurança (RLS) impediram a atualização.");
      }
      
      // If successful, update local state and notify the user
      setPatients(prev => prev.filter(p => p.id !== patientId));
      alert("Paciente excluído com sucesso!");
      return true;

    } catch (error: unknown) {
      // Catch both thrown Supabase errors and other exceptions
      const errorMessage = getErrorMessage(error);
      console.error("Erro detalhado ao desativar paciente:", errorMessage);
      alert(`Falha ao excluir o paciente: ${errorMessage}\n\nPor favor, verifique as permissões de segurança (RLS) na sua tabela 'patients' no Supabase.`);
      return false;
    }
  };
  
  const generateAppointmentsForPatient = (patient: Patient, userId: string) => {
      const newAppointments: Omit<Appointment, 'id'>[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 90; i++) { // Generate for the next 3 months
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dayOfWeek = date.getDay();
          
          if (patient.appointment_days.includes(dayOfWeek)) {
              const dateString = date.toISOString().split('T')[0];
               newAppointments.push({
                  patient_id: patient.id,
                  user_id: userId,
                  date: dateString,
                  time: patient.appointment_time,
                  status: AppointmentStatus.NoStatus,
              });
          }
      }
      
      const saveNewAppointments = async () => {
        if (newAppointments.length === 0) return;
        const { data, error } = await supabase.from('appointments').insert(newAppointments).select();
        if (error) {
          const errorMessage = getErrorMessage(error);
          console.error("Erro ao gerar agendamentos:", errorMessage);
          alert(`Erro ao gerar agendamentos: ${errorMessage}`);
        } else if (data) {
          setAppointments(prev => [...prev, ...data]);
        }
      }
      saveNewAppointments();
  }

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
      setAppointments(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)));
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
      setAppointments(prev => prev.map(app => (app.id === appointmentId ? data : app)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)));
    }
  };

  const deleteAppointment = async (appointmentId: number) => {
    const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
    if (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Erro ao deletar agendamento:", errorMessage);
      alert(`Erro ao deletar agendamento: ${errorMessage}`);
    } else {
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    }
  };

  // Clinic CRUD Functions
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
  
  if (loading && !session) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark-bg">
            <p className="text-xl font-semibold text-primary">Carregando...</p>
        </div>
    );
  }
  
  if (!session) {
      switch (activePage) {
          case Page.SignUp:
              return <SignUpPage setActivePage={setActivePage} />;
          default:
              return <LoginPage setActivePage={setActivePage} />;
      }
  }

  const renderPage = () => {
    if (loading || !userProfile) {
        return (
            <div className="flex items-center justify-center" style={{height: 'calc(100vh - 5rem)'}}>
                <p className="text-xl font-semibold text-primary">Carregando dados do usuário...</p>
            </div>
        );
    }

    switch (activePage) {
      case Page.Home:
        return <HomePage 
          patients={patients} 
          appointments={appointments} 
          updateAppointmentStatus={updateAppointmentStatus}
          updateAppointmentDetails={updateAppointmentDetails}
          deleteAppointment={deleteAppointment}
          addAppointment={addAppointment}
          user={userProfile}
          updateUser={updateUserProfile}
          theme={theme}
          toggleTheme={toggleTheme}
        />;
      case Page.Patients:
        return <PatientsPage patients={patients} addPatient={addPatient} updatePatient={updatePatient} deactivatePatient={deactivatePatient} clinics={clinics} setActivePage={setActivePage} />;
      case Page.Reports:
        return <ReportsPage 
          patients={patients} 
          appointments={appointments} 
          clinics={clinics}
          user={userProfile}
          setActivePage={setActivePage} 
        />;
      case Page.Clinics:
        return <ClinicsPage clinics={clinics} addClinic={addClinic} updateClinic={updateClinic} deleteClinic={deleteClinic} setActivePage={setActivePage} />;
      default:
        return <HomePage 
          patients={patients} 
          appointments={appointments} 
          updateAppointmentStatus={updateAppointmentStatus}
          updateAppointmentDetails={updateAppointmentDetails}
          deleteAppointment={deleteAppointment}
          addAppointment={addAppointment}
          user={userProfile}
          updateUser={updateUserProfile}
          theme={theme}
          toggleTheme={toggleTheme}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black">
      <div className="w-full max-w-[800px] mx-auto relative min-h-screen shadow-lg bg-light dark:bg-dark-bg text-dark dark:text-dark-text">
        <main className="p-4 pb-24">
          {renderPage()}
        </main>
        <BottomNav activePage={activePage} setActivePage={setActivePage} />
      </div>
    </div>
  );
};

export default App;
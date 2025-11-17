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
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }
    return 'light';
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
          if (profileError) throw profileError;
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

      } catch (error) {
          console.error("Erro ao buscar dados:", error);
          alert("Não foi possível carregar os dados. Verifique sua conexão e as políticas RLS no Supabase.");
      } finally {
          setLoading(false);
      }
  };

  const updateUserProfile = async (updatedProfile: Omit<User, 'id' | 'plan'>) => {
    if (!userProfile) return;
    const { data, error } = await supabase
      .from('users')
      .update(updatedProfile)
      .eq('id', userProfile.id)
      .select()
      .single();
    if (error) {
      console.error("Erro ao atualizar perfil:", error);
    } else if(data) {
      setUserProfile(data);
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
      console.error("Erro ao adicionar paciente:", error);
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
        console.error("Erro ao atualizar paciente:", error);
    } else if (data) {
        setPatients(prev => prev.map(p => p.id === patientId ? data as Patient : p));
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
          console.error("Erro ao gerar agendamentos:", error);
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
      console.error("Erro ao adicionar agendamento:", error);
    } else if (data) {
      setAppointments(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)));
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, status: AppointmentStatus) => {
    const { data, error } = await supabase.from('appointments').update({ status }).eq('id', appointmentId).select().single();
    if (error) {
      console.error("Erro ao atualizar status:", error);
    } else if (data) {
      setAppointments(prev => prev.map(app => (app.id === appointmentId ? data : app)));
    }
  };

  // Clinic CRUD Functions
  const addClinic = async (clinic: Omit<Clinic, 'id' | 'user_id'>) => {
    if (!session) return;
    const { data, error } = await supabase.from('clinics').insert({ ...clinic, user_id: session.user.id }).select().single();
    if (error) console.error("Erro ao adicionar clínica:", error);
    else if (data) setClinics(prev => [...prev, data]);
  };

  const updateClinic = async (clinicId: number, updatedClinic: Omit<Clinic, 'id' | 'user_id'>) => {
    const { data, error } = await supabase.from('clinics').update(updatedClinic).eq('id', clinicId).select().single();
    if (error) console.error("Erro ao atualizar clínica:", error);
    else if (data) setClinics(prev => prev.map(c => c.id === clinicId ? data : c));
  };

  const deleteClinic = async (clinicId: number) => {
    const { error } = await supabase.from('clinics').delete().eq('id', clinicId);
    if (error) console.error("Erro ao deletar clínica:", error);
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
          addAppointment={addAppointment}
          user={userProfile}
          updateUser={updateUserProfile}
          theme={theme}
          toggleTheme={toggleTheme}
        />;
      case Page.Patients:
        return <PatientsPage patients={patients} addPatient={addPatient} updatePatient={updatePatient} clinics={clinics} />;
      case Page.Reports:
        return <ReportsPage patients={patients} appointments={appointments} />;
      case Page.Clinics:
        return <ClinicsPage clinics={clinics} addClinic={addClinic} updateClinic={updateClinic} deleteClinic={deleteClinic} />;
      default:
        return <HomePage 
          patients={patients} 
          appointments={appointments} 
          updateAppointmentStatus={updateAppointmentStatus}
          addAppointment={addAppointment}
          user={userProfile}
          updateUser={updateUserProfile}
          theme={theme}
          toggleTheme={toggleTheme}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg text-dark dark:text-dark-text pb-24">
      <main className="p-4">
        {renderPage()}
      </main>
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default App;
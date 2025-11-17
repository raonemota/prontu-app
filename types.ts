export enum Page {
  Login = 'Login',
  SignUp = 'SignUp',
  Home = 'Home',
  Patients = 'Patients',
  Reports = 'Reports',
  Clinics = 'Clinics',
}

export enum AppointmentStatus {
  NoStatus = 'Sem Status',
  Completed = 'Concluído',
  NoShow = 'Não Compareceu',
  Canceled = 'Cancelou',
}

export enum Gender {
  Male = 'Masculino',
  Female = 'Feminino',
}

export enum Category {
  Adult = 'Adulto',
  Child = 'Criança',
}

export interface User {
  id: string;
  full_name: string;
  role: string;
  profile_pic: string;
  plan: 'free' | 'pro';
}

export interface Clinic {
    id: number;
    user_id: string;
    name: string;
    address: string;
}

export interface Patient {
  id: number;
  user_id?: string;
  name: string;
  gender: Gender;
  health_plan: string;
  category: Category;
  session_value: number;
  appointment_days: number[]; // 0 for Sunday, 1 for Monday, etc.
  appointment_time: string; // "HH:MM"
  profile_pic: string;
  clinic_id: number | null;
  clinics: { name: string } | null; // From Supabase join
}

export interface Appointment {
  id: number;
  user_id?: string;
  patient_id: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  status: AppointmentStatus;
}

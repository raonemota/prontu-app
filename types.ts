
export enum Page {
  Login = 'Login',
  SignUp = 'SignUp',
  Home = 'Home',
  Agenda = 'Agenda',
  Patients = 'Patients',
  Reports = 'Reports',
  Clinics = 'Clinics',
  DeactivatedPatients = 'DeactivatedPatients',
  Admin = 'Admin',
  Landing = 'Landing',
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
  email?: string; // Adicionado para exibição no admin
  role: string;
  profile_pic: string;
  plan: 'free' | 'pro';
  // Campos Administrativos
  is_admin?: boolean;
  status_assinatura?: string; // ex: 'active', 'canceled', 'past_due'
  data_expiracao_acesso?: string;
  tipo_assinante?: string; // ex: 'Free', 'Beta', 'Premium'
  ciclo_plano?: string; // ex: 'Mensal', 'Semestral', 'Anual'
  valor_acumulado?: number; // Valor total pago pelo usuário (LTV)
  last_sign_in_at?: string;
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
  appointment_time: string; // "HH:MM" (Mantido como fallback ou horário principal)
  appointment_times?: Record<string, string>; // Novo campo: Mapa de dia (string "0"-"6") para horário ("HH:MM")
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
  observation?: string | null;
}

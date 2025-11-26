
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Appointment, Patient, AppointmentStatus, Page } from '../types';
import SubPageHeader from '../components/SubPageHeader';
import { CalendarDaysIcon } from '../components/icons/CalendarDaysIcon';
import { ChevronDoubleLeftIcon } from '../components/icons/ChevronDoubleLeftIcon';
import { ChevronDoubleRightIcon } from '../components/icons/ChevronDoubleRightIcon';
import { ClinicIcon } from '../components/icons/ClinicIcon';
import { ClockIcon } from '../components/icons/ClockIcon';

interface AgendaPageProps {
  patients: Patient[];
  allPatients: Patient[];
  appointments: Appointment[];
  setActivePage: (page: Page) => void;
}

const statusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.NoStatus]: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  [AppointmentStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [AppointmentStatus.NoShow]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [AppointmentStatus.Canceled]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const AgendaPage: React.FC<AgendaPageProps> = ({ patients, allPatients, appointments, setActivePage }) => {
  // Inicializa com o domingo da semana atual
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0 (Domingo) - 6 (Sábado)
    d.setDate(d.getDate() - day);
    return d;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRef = useRef<HTMLDivElement>(null);

  // Scroll para o dia atual quando a página monta
  useEffect(() => {
    // Pequeno timeout para garantir que o render ocorreu
    const timer = setTimeout(() => {
        if (todayRef.current) {
            todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 300);
    return () => clearTimeout(timer);
  }, [weekStart]);

  const changeWeek = (weeks: number) => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() + (weeks * 7));
    setWeekStart(newStart);
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const weekMonthYear = `${weekStart.toLocaleDateString('pt-BR', { month: 'long' })} ${weekStart.getFullYear()}`;
  const endOfWeek = new Date(weekStart);
  endOfWeek.setDate(weekStart.getDate() + 6);
  // Se a semana vira o mês, ajusta o título
  const title = weekStart.getMonth() === endOfWeek.getMonth() 
    ? weekMonthYear 
    : `${weekStart.toLocaleDateString('pt-BR', { month: 'short' })} - ${endOfWeek.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`;


  // Lógica para montar os slots do dia
  const getSlotsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const slots: { time: string; patient: Patient; appointment?: Appointment; type: 'recurring' | 'confirmed' | 'extra' }[] = [];
    const processedPatientIds = new Set<number>();

    // 1. Verificar agendamentos REAIS no banco para este dia
    const apps = appointments.filter(a => a.date === dateStr);
    
    apps.forEach(app => {
        const patient = allPatients.find(p => p.id === app.patient_id);
        if (patient) {
            slots.push({
                time: app.time,
                patient,
                appointment: app,
                type: 'confirmed'
            });
            processedPatientIds.add(patient.id);
        }
    });

    // 2. Verificar agendamentos RECORRENTES (que não têm agendamento real ainda)
    // Usamos a lista 'patients' (apenas ativos) para recorrência
    patients.forEach(p => {
        // Se o paciente já tem um agendamento real (confirmado) hoje, pulamos (já está em slots)
        if (processedPatientIds.has(p.id)) return;

        // Se o paciente tem atendimento neste dia da semana
        if (Array.isArray(p.appointment_days) && p.appointment_days.includes(dayOfWeek)) {
            // Define o horário: Prioridade para horário específico do dia > horário geral > '09:00'
            let time = p.appointment_time || '09:00';
            if (p.appointment_times && p.appointment_times[dayOfWeek.toString()]) {
                time = p.appointment_times[dayOfWeek.toString()];
            }

            slots.push({
                time,
                patient: p,
                type: 'recurring'
            });
        }
    });

    // Ordenar por horário e depois por nome
    return slots.sort((a, b) => {
        const timeDiff = a.time.localeCompare(b.time);
        if (timeDiff !== 0) return timeDiff;
        return (a.patient.name || '').localeCompare(b.patient.name || '');
    });
  };

  // Helper para agrupar slots por horário
  const groupSlotsByTime = (slots: ReturnType<typeof getSlotsForDay>) => {
      const grouped: Record<string, typeof slots> = {};
      slots.forEach(slot => {
          if (!grouped[slot.time]) grouped[slot.time] = [];
          grouped[slot.time].push(slot);
      });
      return grouped;
  };

  return (
    <div className="space-y-4 pb-20">
      <SubPageHeader 
        title="Agenda Semanal" 
        onBack={() => setActivePage(Page.Home)}
        icon={<CalendarDaysIcon className="w-6 h-6" />}
      />

      {/* Navegação da Semana */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4 flex items-center justify-between sticky top-16 z-30 mb-4">
          <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full">
            <ChevronDoubleLeftIcon className="w-5 h-5 text-gray-500 dark:text-dark-subtext" />
          </button>
          
          <div className="text-center">
              <h2 className="text-sm font-bold text-dark dark:text-dark-text capitalize">{title}</h2>
              <button 
                onClick={() => setWeekStart(() => {
                    const d = new Date();
                    d.setHours(0,0,0,0);
                    d.setDate(d.getDate() - d.getDay());
                    return d;
                })}
                className="text-xs text-primary font-medium mt-1 hover:underline"
              >
                  Voltar para Hoje
              </button>
          </div>

          <button onClick={() => changeWeek(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full">
            <ChevronDoubleRightIcon className="w-5 h-5 text-gray-500 dark:text-dark-subtext" />
          </button>
      </div>

      <div className="space-y-6">
          {weekDays.map(day => {
              const dateStr = day.toISOString().split('T')[0];
              const isToday = dateStr === todayStr;
              const slots = getSlotsForDay(day);
              const groupedSlots = groupSlotsByTime(slots);
              const sortedTimes = Object.keys(groupedSlots).sort();
              
              return (
                  <div 
                    key={dateStr} 
                    ref={isToday ? todayRef : null}
                    className={`rounded-xl overflow-hidden transition-all ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-gray-100 dark:ring-offset-dark-bg' : ''}`}
                  >
                      {/* Cabeçalho do Dia */}
                      <div className={`px-4 py-2 flex items-center justify-between ${isToday ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-dark-text'}`}>
                          <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">{day.getDate()}</span>
                              <span className="text-sm font-medium uppercase opacity-90">
                                {day.toLocaleDateString('pt-BR', { weekday: 'long' })}
                              </span>
                          </div>
                          {isToday && <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">HOJE</span>}
                      </div>

                      {/* Corpo do Dia */}
                      <div className="bg-white dark:bg-dark-card p-3 min-h-[80px]">
                          {sortedTimes.length > 0 ? (
                              <div className="space-y-3">
                                  {sortedTimes.map(time => {
                                      const timeSlots = groupedSlots[time];
                                      const isCollision = timeSlots.length > 1;
                                      
                                      return (
                                          <div key={time} className="flex">
                                              {/* Coluna Horário */}
                                              <div className="w-14 pt-3 flex-shrink-0">
                                                  <span className="text-sm font-bold text-gray-500 dark:text-dark-subtext">{time.slice(0, 5)}</span>
                                              </div>
                                              
                                              {/* Coluna Cards */}
                                              <div className={`flex-1 space-y-2 ${isCollision ? 'p-2 border-l-4 border-primary/40 bg-gray-50 dark:bg-dark-bg/50 rounded-r-lg' : ''}`}>
                                                  {timeSlots.map((slot, idx) => (
                                                      <div 
                                                        key={idx}
                                                        className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                                                            slot.type === 'recurring' 
                                                                ? 'bg-white border-dashed border-gray-300 dark:bg-dark-card dark:border-dark-border opacity-80' 
                                                                : 'bg-white border-gray-100 dark:bg-dark-card dark:border-dark-border shadow-sm'
                                                        }`}
                                                      >
                                                          <img 
                                                            src={slot.patient.profile_pic || 'https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/prontu-3qf08b/assets/m9asaisyvrr2/001-woman.png'} 
                                                            alt="" 
                                                            className="w-10 h-10 rounded-full object-cover"
                                                          />
                                                          
                                                          <div className="flex-1 min-w-0">
                                                              <p className="font-semibold text-sm text-dark dark:text-dark-text truncate">
                                                                  {slot.patient.name}
                                                              </p>
                                                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-subtext">
                                                                  {slot.patient.clinics?.name && (
                                                                      <span className="flex items-center gap-1 truncate">
                                                                          <ClinicIcon className="w-3 h-3" />
                                                                          {slot.patient.clinics.name}
                                                                      </span>
                                                                  )}
                                                              </div>
                                                          </div>

                                                          <div className="flex flex-col items-end gap-1">
                                                              {slot.type === 'confirmed' && slot.appointment ? (
                                                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[slot.appointment.status || AppointmentStatus.NoStatus]}`}>
                                                                      {slot.appointment.status || 'Agendado'}
                                                                  </span>
                                                              ) : (
                                                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                                      Recorrente
                                                                  </span>
                                                              )}
                                                          </div>
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          ) : (
                              <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-600">
                                  <ClockIcon className="w-8 h-8 mb-2 opacity-50" />
                                  <p className="text-sm">Nenhum agendamento</p>
                              </div>
                          )}
                      </div>
                  </div>
              );
          })}
      </div>
    </div>
  );
};

export default AgendaPage;

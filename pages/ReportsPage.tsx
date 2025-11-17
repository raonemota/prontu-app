import React, { useState, useMemo } from 'react';
import { Appointment, Patient, AppointmentStatus } from '../types';
import { CalendarIcon } from '../components/icons/CalendarIcon';

declare const jspdf: any;

interface ReportsPageProps {
  patients: Patient[];
  appointments: Appointment[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ patients, appointments }) => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const filteredData = useMemo(() => {
    const filteredAppointments = appointments.filter(app => {
      const appDate = new Date(app.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      return appDate >= start && appDate <= end;
    });

    const patientReport: { [key: string]: { patient: Patient; attendedDays: number; totalValue: number, clinicName: string } } = {};

    filteredAppointments.forEach(app => {
      if (app.status === AppointmentStatus.Completed || app.status === AppointmentStatus.NoShow) {
        const patient = patients.find(p => p.id === app.patient_id);
        if (patient) {
          const reportKey = `${patient.id}-${patient.clinic_id}`;
          if (!patientReport[reportKey]) {
            patientReport[reportKey] = { patient, attendedDays: 0, totalValue: 0, clinicName: patient.clinics?.name || 'N/A' };
          }
          patientReport[reportKey].attendedDays += 1;
          patientReport[reportKey].totalValue += patient.session_value;
        }
      }
    });

    return Object.values(patientReport).sort((a, b) => a.patient.name.localeCompare(b.patient.name) || a.clinicName.localeCompare(b.clinicName));
  }, [startDate, endDate, appointments, patients]);

  const summary = useMemo(() => {
    let totalAppointments = 0;
    let totalToReceive = 0;

    filteredData.forEach(item => {
      totalAppointments += item.attendedDays;
      totalToReceive += item.totalValue;
    });

    return { totalAppointments, totalToReceive };
  }, [filteredData]);
  
  const exportToPDF = () => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Atendimentos", 14, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const formattedStartDate = new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR');
    const formattedEndDate = new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR');
    doc.text(`Período: ${formattedStartDate} a ${formattedEndDate}`, 14, 28);

    doc.autoTable({
        startY: 35,
        head: [['Paciente', 'Clínica', 'Dias Atendidos', 'Valor Total (R$)']],
        body: filteredData.map(item => [
            item.patient.name,
            item.clinicName,
            item.attendedDays,
            item.totalValue.toFixed(2).replace('.', ',')
        ]),
        theme: 'striped',
        headStyles: { fillColor: [122, 58, 255], fontSize: 9 },
        styles: { fontSize: 8 },
        columnStyles: {
            2: { cellWidth: 30 },
            3: { cellWidth: 40 }
        }
    });
    
    doc.save(`relatorio_${startDate}_${endDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Relatórios</h1>

      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md space-y-4">
        <h2 className="font-semibold text-dark dark:text-dark-text">Filtrar por Período</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-dark-subtext">Data Inicial</label>
            <div className="relative mt-1">
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-dark-subtext">Data Final</label>
            <div className="relative mt-1">
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md">
          <h3 className="text-sm text-gray-500 dark:text-dark-subtext">Total de Atendimentos</h3>
          <p className="text-2xl font-bold text-primary">{summary.totalAppointments}</p>
        </div>
        <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md">
          <h3 className="text-sm text-gray-500 dark:text-dark-subtext">Total a Receber</h3>
          <p className="text-2xl font-bold text-secondary">
            {summary.totalToReceive.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-dark dark:text-dark-text">Resumo por Paciente</h2>
            <button
                onClick={exportToPDF}
                className="bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
            >
                Exportar PDF
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-border">
                <th className="p-2 text-dark dark:text-dark-text">Paciente</th>
                <th className="p-2 text-dark dark:text-dark-text">Clínica</th>
                <th className="p-2 text-dark dark:text-dark-text">Atendidos</th>
                <th className="p-2 text-dark dark:text-dark-text">Total (R$)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={`${item.patient.id}-${item.patient.clinic_id}`} className="border-b border-gray-200 dark:border-dark-border">
                  <td className="p-2 font-medium text-dark dark:text-dark-text">{item.patient.name}</td>
                  <td className="p-2 text-gray-600 dark:text-dark-subtext">{item.clinicName}</td>
                  <td className="p-2 text-gray-600 dark:text-dark-subtext">{item.attendedDays}</td>
                  <td className="p-2 font-medium text-secondary">{item.totalValue.toFixed(2).replace('.', ',')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <p className="text-center text-gray-500 dark:text-dark-subtext py-4">Nenhum atendimento concluído no período selecionado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
import React, { useState, useMemo } from 'react';
import { Appointment, Patient, AppointmentStatus, Page, Clinic, User } from '../types';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import SubPageHeader from '../components/SubPageHeader';
import { DocumentArrowDownIcon } from '../components/icons/DocumentArrowDownIcon';

declare const jspdf: any;

interface ReportsPageProps {
  patients: Patient[];
  appointments: Appointment[];
  clinics: Clinic[];
  user: User;
  setActivePage: (page: Page) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ patients, appointments, clinics, user, setActivePage }) => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<number | 'all'>('all');

  const filteredData = useMemo(() => {
    const filteredAppointments = appointments.filter(app => {
      const appDate = new Date(app.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      return appDate >= start && appDate <= end;
    });

    const patientReport: { [key: string]: { patient: Patient; attendedDates: string[]; totalValue: number, clinicName: string } } = {};

    filteredAppointments.forEach(app => {
      if (app.status === AppointmentStatus.Completed || app.status === AppointmentStatus.NoShow) {
        const patient = patients.find(p => p.id === app.patient_id);
        if (patient) {
          const reportKey = `${patient.id}-${patient.clinic_id}`;
          if (!patientReport[reportKey]) {
            patientReport[reportKey] = { patient, attendedDates: [], totalValue: 0, clinicName: patient.clinics?.name || 'N/A' };
          }
          patientReport[reportKey].attendedDates.push(app.date);
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
      totalAppointments += item.attendedDates.length;
      totalToReceive += item.totalValue;
    });

    return { totalAppointments, totalToReceive };
  }, [filteredData]);
  
  const handleGeneratePdf = () => {
    exportToPDF(selectedClinicId);
    setIsExportModalOpen(false);
  };
  
  const exportToPDF = (clinicId: number | 'all') => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    const dataForPdf = clinicId === 'all'
      ? filteredData
      : filteredData.filter(item => item.patient.clinic_id === clinicId);
    
    const clinicName = clinicId === 'all'
      ? 'Todas as Clínicas'
      : clinics.find(c => c.id === clinicId)?.name || 'N/A';

    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Atendimentos", 14, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Profissional: ${user.full_name}`, 14, 28);
    doc.text(`Clínica: ${clinicName}`, 14, 36);

    const formattedStartDate = new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR');
    const formattedEndDate = new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR');
    doc.text(`Período: ${formattedStartDate} a ${formattedEndDate}`, 14, 44);

    doc.autoTable({
        startY: 50,
        head: [['Paciente', 'Datas de Atendimento']],
        body: dataForPdf.map(item => [
            item.patient.name,
            item.attendedDates.map(d => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')).join(' | ')
        ]),
        theme: 'striped',
        headStyles: { fillColor: [122, 58, 255], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 'auto' }
        }
    });
    
    doc.save(`relatorio_${startDate}_${endDate}_${clinicName.replace(/\s+/g, '_')}.pdf`);
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <SubPageHeader
        title="Relatórios"
        onBack={() => setActivePage(Page.Home)}
      >
        <button onClick={() => setIsExportModalOpen(true)} className="p-2 bg-secondary/10 text-secondary rounded-full" aria-label="Exportar PDF">
            <DocumentArrowDownIcon className="w-6 h-6" />
        </button>
      </SubPageHeader>

      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md space-y-4">
        <h2 className="font-semibold text-dark dark:text-dark-text">Filtrar por Período</h2>
        <div className="flex flex-wrap justify-center items-start gap-4">
          
          <div className="flex-shrink-0">
            <label htmlFor="startDateInput" className="block text-center text-xs font-medium text-gray-500 dark:text-dark-subtext mb-1">DATA INICIAL</label>
            <div className="relative w-40">
              <div className="flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text">
                  <span>{formatDateForDisplay(startDate)}</span>
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="startDateInput"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Data Inicial"
              />
            </div>
          </div>

          <div className="flex-shrink-0">
            <label htmlFor="endDateInput" className="block text-center text-xs font-medium text-gray-500 dark:text-dark-subtext mb-1">DATA FINAL</label>
            <div className="relative w-40">
              <div className="flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text">
                  <span>{formatDateForDisplay(endDate)}</span>
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="endDateInput"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Data Final"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary p-4 rounded-xl shadow-md text-white">
          <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">Atendimentos</span>
              <span className="font-medium">{summary.totalAppointments} Atendimentos</span>
          </div>
          <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Valores à receber</span>
              <span className="font-medium">
                  {summary.totalToReceive.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
          </div>
      </div>
      
      <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-md">
        <h2 className="font-semibold text-dark dark:text-dark-text mb-4">Resumo por Paciente</h2>
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
                  <td className="p-2 text-gray-600 dark:text-dark-subtext">{item.attendedDates.length}</td>
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

      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-sm">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-dark dark:text-dark-text mb-4">Exportar Relatório</h3>
                    <div>
                        <label htmlFor="clinicSelect" className="block text-sm font-medium text-gray-700 dark:text-dark-subtext">Selecione a Clínica</label>
                        <select
                            id="clinicSelect"
                            value={selectedClinicId}
                            onChange={(e) => setSelectedClinicId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">Todas as Clínicas</option>
                            {clinics.map(clinic => (
                                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-dark-text rounded-lg font-medium">Cancelar</button>
                        <button type="button" onClick={handleGeneratePdf} className="px-4 py-2 bg-primary text-white rounded-lg font-medium">Gerar PDF</button>
                    </div>
                </div>
            </div>
        </div>
    )}
    </div>
  );
};

export default ReportsPage;
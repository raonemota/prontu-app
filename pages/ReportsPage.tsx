
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Appointment, Patient, AppointmentStatus, Page, Clinic, User } from '../types';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import SubPageHeader from '../components/SubPageHeader';
import { DocumentArrowDownIcon } from '../components/icons/DocumentArrowDownIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { EyeSlashIcon } from '../components/icons/EyeSlashIcon';
import { ChartIcon } from '../components/icons/ChartIcon';

declare const jspdf: any;

interface ReportsPageProps {
  allPatients: Patient[];
  appointments: Appointment[];
  clinics: Clinic[];
  user: User;
  setActivePage: (page: Page) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ allPatients, appointments, clinics, user, setActivePage }) => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  
  // Filtros da Página Principal
  const [selectedClinicId, setSelectedClinicId] = useState<number | 'all'>('all');
  const [showValues, setShowValues] = useState(true);
  
  // Estados do Modal de Exportação
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportClinicId, setExportClinicId] = useState<number | ''>('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  
  // Infinite Scroll State
  const [displayCount, setDisplayCount] = useState(10);
  const observerTarget = useRef<HTMLDivElement>(null);

  // --- Processamento de Dados para a TELA (Visualização Diária) ---
  const groupedReport = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    const filteredApps = appointments.filter(app => {
        if (!app.date) return false;
        const appDate = new Date(app.date);
        if (isNaN(appDate.getTime())) return false;
        
        // Filter by Date Range
        if (appDate < start || appDate > end) return false;

        // Filter by Status (Only Completed or NoShow)
        if (app.status !== AppointmentStatus.Completed && app.status !== AppointmentStatus.NoShow) return false;

        // Filter by Clinic (Main Page Filter)
        if (selectedClinicId !== 'all') {
            const patient = allPatients.find(p => p.id === app.patient_id);
            if (!patient || patient.clinic_id !== selectedClinicId) return false;
        }

        return true;
    });

    // Group by Date
    const groups: { [date: string]: { date: string, totalValue: number, items: { patient: Patient, app: Appointment, clinicName: string }[] } } = {};

    filteredApps.forEach(app => {
        const patient = allPatients.find(p => p.id === app.patient_id);
        if (patient) {
            const dateKey = app.date;
            if (!groups[dateKey]) {
                groups[dateKey] = { date: dateKey, totalValue: 0, items: [] };
            }
            
            const clinicName = patient.clinics?.name || 'N/A';
            groups[dateKey].items.push({ patient, app, clinicName });
            groups[dateKey].totalValue += patient.session_value || 0;
        }
    });

    const result = Object.values(groups);

    // Sort items inside each day group alphabetically by patient name
    result.forEach(group => {
        group.items.sort((a, b) => {
            const nameA = (a.patient.name || '').toLowerCase();
            const nameB = (b.patient.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
    });

    // Sort days chronologically DESCENDING (Newest first)
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [startDate, endDate, appointments, allPatients, selectedClinicId]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(10);
  }, [groupedReport]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => prev + 10);
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget]);

  // Quando abrir o modal, define a clínica de exportação padrão
  const handleOpenExportModal = () => {
      if (clinics.length > 0) {
          // Se já tem uma clínica selecionada na tela principal, usa ela. Se for 'all', pega a primeira da lista.
          setExportClinicId(selectedClinicId !== 'all' ? selectedClinicId : clinics[0].id);
      } else {
          setExportClinicId('');
      }
      setExportFormat('pdf'); // Reset format to PDF
      setIsExportModalOpen(true);
  };

  // Slice data for display
  const visibleGroups = groupedReport.slice(0, displayCount);

  const summary = useMemo(() => {
    let totalAppointments = 0;
    let totalToReceive = 0;

    groupedReport.forEach(group => {
      totalAppointments += group.items.length;
      totalToReceive += group.totalValue;
    });

    return { totalAppointments, totalToReceive };
  }, [groupedReport]);
  
  // --- Lógica de Exportação (PDF e CSV) ---
  const handleExport = () => {
      if (!exportClinicId) {
          alert("Por favor, selecione uma clínica para exportar.");
          return;
      }

      // 1. Filtrar dados especificamente para a exportação (independente da visualização da tela)
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);

      const exportData = appointments.filter(app => {
          if (!app.date) return false;
          const appDate = new Date(app.date);
          if (isNaN(appDate.getTime())) return false;
          
          // Filter by Date Range
          if (appDate < start || appDate > end) return false;

          // Filter by Status
          if (app.status !== AppointmentStatus.Completed && app.status !== AppointmentStatus.NoShow) return false;

          // Filter by Export Specific Clinic
          const patient = allPatients.find(p => p.id === app.patient_id);
          if (!patient || patient.clinic_id !== exportClinicId) return false;

          return true;
      });

      // Calcular total para o relatório
      let totalExportValue = 0;
      exportData.forEach(app => {
          const patient = allPatients.find(p => p.id === app.patient_id);
          if(patient) totalExportValue += (patient.session_value || 0);
      });

      const clinicName = clinics.find(c => c.id === exportClinicId)?.name || 'N/A';

      if (exportFormat === 'pdf') {
          // --- GERAÇÃO DE PDF ---
          const { jsPDF } = jspdf;
          const doc = new jsPDF();

          doc.setFont("helvetica", "bold");
          doc.text("Relatório de Atendimentos", 14, 20);
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          
          doc.text(`Profissional: ${user.full_name || 'Nome não informado'}`, 14, 28);
          doc.text(`Clínica: ${clinicName}`, 14, 36);

          const formattedStartDate = new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR');
          const formattedEndDate = new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR');
          doc.text(`Período: ${formattedStartDate} a ${formattedEndDate}`, 14, 44);
          doc.text(`Total a Receber: ${totalExportValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, 52);

          // Aggregate by Patient for PDF
          const patientsMap: { [key: number]: { name: string, clinic: string, dates: string[], total: number } } = {};

          exportData.forEach(app => {
              const patient = allPatients.find(p => p.id === app.patient_id);
              if (patient) {
                  if (!patientsMap[patient.id]) {
                      patientsMap[patient.id] = {
                          name: patient.name || 'Nome não informado',
                          clinic: clinicName,
                          dates: [],
                          total: 0
                      };
                  }
                  const fullFormattedDate = new Date(app.date + 'T00:00:00').toLocaleDateString('pt-BR');
                  if (!patientsMap[patient.id].dates.includes(fullFormattedDate)) {
                      patientsMap[patient.id].dates.push(fullFormattedDate);
                  }
                  patientsMap[patient.id].total += (patient.session_value || 0);
              }
          });

          const tableBody = Object.values(patientsMap)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(p => [
                  p.name,
                  p.clinic,
                  p.dates.sort((a,b) => {
                      const [d1, m1, y1] = a.split('/').map(Number);
                      const [d2, m2, y2] = b.split('/').map(Number);
                      return new Date(y1, m1-1, d1).getTime() - new Date(y2, m2-1, d2).getTime();
                  }).join(' | '),
                  p.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              ]);

          doc.autoTable({
              startY: 60,
              head: [['Paciente', 'Clínica', 'Datas dos Atendimentos', 'Valor Total']],
              body: tableBody,
              theme: 'striped',
              headStyles: { fillColor: [122, 58, 255], fontSize: 10 },
              styles: { fontSize: 9, cellPadding: 3 },
              columnStyles: {
                  0: { cellWidth: 40 },
                  1: { cellWidth: 30 },
                  2: { cellWidth: 'auto' },
                  3: { cellWidth: 30, halign: 'right' }
              }
          });
          
          doc.save(`relatorio_${clinicName}_${startDate}_${endDate}.pdf`);

      } else {
          // --- GERAÇÃO DE CSV (EXCEL) ---
          const csvRows = [];
          // Headers
          csvRows.push(['Data', 'Paciente', 'Categoria', 'Status', 'Valor'].join(';'));

          // Sort by date descending for CSV
          exportData.sort((a, b) => b.date.localeCompare(a.date));

          exportData.forEach(app => {
              const patient = allPatients.find(p => p.id === app.patient_id);
              if (patient) {
                  const formattedDate = new Date(app.date + 'T00:00:00').toLocaleDateString('pt-BR');
                  const value = (patient.session_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                  
                  csvRows.push([
                      formattedDate,
                      `"${patient.name || ''}"`, // Quote names to handle commas
                      patient.category,
                      app.status,
                      value
                  ].join(';'));
              }
          });

          // Add Total Row
          csvRows.push(['', '', '', 'TOTAL', totalExportValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })].join(';'));

          const csvString = "\uFEFF" + csvRows.join('\n'); // Add BOM for Excel UTF-8 compatibility
          const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `relatorio_${clinicName}_${startDate}_${endDate}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }

      setIsExportModalOpen(false);
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const formatDayOfWeek = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[date.getDay()];
  };
  
  const formatCurrency = (value: number) => {
    if (!showValues) return 'R$ ****';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-3">
      <SubPageHeader
        title="Relatórios"
        onBack={() => setActivePage(Page.Home)}
        icon={<ChartIcon className="w-6 h-6" />}
      >
        <button 
            onClick={() => setShowValues(!showValues)} 
            className="p-2 bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-subtext rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
        >
            {showValues ? <EyeIcon className="w-6 h-6" /> : <EyeSlashIcon className="w-6 h-6" />}
        </button>
        <button onClick={handleOpenExportModal} className="p-2 bg-secondary/10 text-secondary rounded-full" aria-label="Exportar Relatório">
            <DocumentArrowDownIcon className="w-6 h-6" />
        </button>
      </SubPageHeader>

      <div className="bg-white dark:bg-dark-card p-3 rounded-xl shadow-md space-y-2">
        <div className="flex flex-wrap justify-center items-start gap-4">
          
          <div className="flex-shrink-0">
            <label htmlFor="startDateInput" className="block text-center text-xs font-medium text-gray-500 dark:text-dark-subtext mb-1">DATA INICIAL</label>
            <div className="relative w-40">
              <div className="flex items-center justify-between px-3 py-1.5 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text text-sm">
                  <span>{formatDateForDisplay(startDate)}</span>
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
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
              <div className="flex items-center justify-between px-3 py-1.5 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text text-sm">
                  <span>{formatDateForDisplay(endDate)}</span>
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
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

      {/* Filtro de Clínica para a Tela */}
      <div className="bg-white dark:bg-dark-card p-3 rounded-xl shadow-md">
          <label htmlFor="screenClinicSelect" className="block text-xs font-medium text-gray-500 dark:text-dark-subtext mb-1">FILTRAR TELA POR CLÍNICA</label>
          <select
              id="screenClinicSelect"
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
              <option value="all">Todas as Clínicas</option>
              {clinics.map(clinic => (
                  <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
          </select>
      </div>

      <div className="bg-primary p-3 rounded-xl shadow-md text-white">
          <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-base">Atendimentos</span>
              <span className="font-medium text-sm">{summary.totalAppointments} Atendimentos</span>
          </div>
          <div className="flex justify-between items-center">
              <span className="font-bold text-base">Valores à receber</span>
              <span className="font-medium text-base">
                  {formatCurrency(summary.totalToReceive)}
              </span>
          </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="font-semibold text-lg text-dark dark:text-dark-text px-1">Relatório Diário</h2>
        
        {visibleGroups.map((group) => (
            <div key={group.date} className="bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden">
                <div className="bg-gray-100 dark:bg-dark-border px-4 py-1.5 flex justify-between items-center border-b border-gray-200 dark:border-dark-border">
                    <div>
                        <p className="font-bold text-dark dark:text-dark-text text-sm">{formatDateForDisplay(group.date)}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-subtext capitalize">{formatDayOfWeek(group.date)}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-[10px] text-gray-500 dark:text-dark-subtext uppercase tracking-wide">Total do dia</p>
                         <p className="font-bold text-secondary text-sm">
                            {formatCurrency(group.totalValue)}
                         </p>
                    </div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-dark-border">
                    {group.items.map((item, index) => (
                        <div key={index} className="px-4 py-1 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-colors">
                            <div>
                                <p className="font-medium text-dark dark:text-dark-text text-sm">{item.patient.name || 'Nome não informado'}</p>
                                <p className="text-xs text-gray-500 dark:text-dark-subtext">{item.clinicName}</p>
                            </div>
                            <p className="font-semibold text-dark dark:text-dark-text text-sm">
                                {formatCurrency(item.patient.session_value || 0)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        ))}

        {/* Sentinel element for Infinite Scroll */}
        {visibleGroups.length < groupedReport.length && (
            <div ref={observerTarget} className="py-4 text-center">
                 <p className="text-gray-500 dark:text-dark-subtext text-sm">Carregando mais dias...</p>
            </div>
        )}

        {groupedReport.length === 0 && (
            <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-md text-center">
                <p className="text-gray-500 dark:text-dark-subtext">Nenhum atendimento concluído no período selecionado.</p>
            </div>
        )}
      </div>

      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-sm">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-dark dark:text-dark-text mb-4">Exportar Relatório</h3>
                    
                    <div className="mb-4">
                        <label htmlFor="exportClinicSelect" className="block text-sm font-medium text-gray-700 dark:text-dark-subtext mb-1">Clínica para Exportação (Obrigatório)</label>
                        <select
                            id="exportClinicSelect"
                            value={exportClinicId}
                            onChange={(e) => setExportClinicId(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg rounded-lg text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {clinics.map(clinic => (
                                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                            ))}
                            {clinics.length === 0 && <option value="" disabled>Nenhuma clínica cadastrada</option>}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-subtext mb-2">Formato do Arquivo</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="exportFormat" 
                                    value="pdf" 
                                    checked={exportFormat === 'pdf'} 
                                    onChange={() => setExportFormat('pdf')}
                                    className="form-radio text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="ml-2 text-dark dark:text-dark-text text-sm">PDF</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="exportFormat" 
                                    value="csv" 
                                    checked={exportFormat === 'csv'} 
                                    onChange={() => setExportFormat('csv')}
                                    className="form-radio text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="ml-2 text-dark dark:text-dark-text text-sm">Excel (CSV)</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-dark-text rounded-lg font-medium">Cancelar</button>
                        <button type="button" onClick={handleExport} className="px-4 py-2 bg-primary text-white rounded-lg font-medium">Exportar</button>
                    </div>
                </div>
            </div>
        </div>
    )}
    </div>
  );
};

export default ReportsPage;

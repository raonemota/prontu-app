
import React, { useMemo, useState } from 'react';
import { Appointment, Patient, AppointmentStatus } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ReportsChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  allPatients: Patient[];
}

const ReportsChartModal: React.FC<ReportsChartModalProps> = ({ isOpen, onClose, appointments, allPatients }) => {
  const [showValues, setShowValues] = useState(false);
  
  const data = useMemo(() => {
    // 1. Filter valid appointments (Completed or NoShow)
    const validAppointments = appointments.filter(app => 
        app.status === AppointmentStatus.Completed || 
        app.status === AppointmentStatus.NoShow
    );

    // 2. Aggregate by Month
    // Key format: "YYYY-MM"
    const monthlyTotals: Record<string, number> = {};

    validAppointments.forEach(app => {
        if (!app.date) return;
        // app.date is usually YYYY-MM-DD
        const monthKey = app.date.substring(0, 7); // YYYY-MM
        
        const patient = allPatients.find(p => p.id === app.patient_id);
        
        // Verifica se o paciente existe e se NÃO está desativado
        if (patient && patient.is_active !== false) {
            const value = patient.session_value || 0;

            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = 0;
            }
            monthlyTotals[monthKey] += value;
        }
    });

    // 3. Convert to Array and Sort
    const sortedKeys = Object.keys(monthlyTotals).sort();
    
    // Take the last 12 active months to avoid overcrowding, or just show all if fewer
    // const displayKeys = sortedKeys.slice(-12); 
    
    const chartData = sortedKeys.map(key => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        
        // Format: "Jan/23"
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        const shortYear = year.slice(2);
        
        return {
            name: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${shortYear}`,
            fullDate: key,
            value: monthlyTotals[key]
        };
    });

    return chartData;
  }, [appointments, allPatients]);

  const totalRevenue = useMemo(() => {
      return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-dark dark:text-dark-text">{label}</p>
          <p className="text-sm font-bold text-primary">
            {showValues 
                ? payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                : 'R$ ****'
            }
          </p>
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-4 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-bg/50">
            <div>
                <h3 className="text-lg font-bold text-dark dark:text-dark-text">Faturamento Mensal</h3>
                <p className="text-xs text-gray-500 dark:text-dark-subtext">Histórico acumulado de atendimentos realizados</p>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowValues(!showValues)} 
                    className="text-gray-500 hover:text-gray-700 dark:text-dark-subtext dark:hover:text-dark-text p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                    title={showValues ? "Ocultar valores" : "Mostrar valores"}
                >
                    {showValues ? <EyeIcon className="w-6 h-6" /> : <EyeSlashIcon className="w-6 h-6" />}
                </button>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600 dark:text-dark-subtext dark:hover:text-dark-text p-1 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
            
            {/* Summary Card inside Modal */}
            <div className="bg-primary/10 rounded-xl p-4 mb-6 flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Total Acumulado (Período)</span>
                <span className="text-xl font-bold text-primary">
                    {showValues 
                        ? totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : 'R$ ****'
                    }
                </span>
            </div>

            <div className="h-[300px] w-full">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 10,
                                left: 10,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#888' }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fill: '#888' }} 
                                tickFormatter={(value) => showValues ? `R$ ${value}` : '****'}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#7A3AFF" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-dark-subtext flex-col gap-2">
                        <p>Nenhum dado financeiro disponível para gerar o gráfico.</p>
                    </div>
                )}
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-4">
                * Considera apenas atendimentos marcados como "Concluído" ou "Não Compareceu" (se cobrado).
            </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsChartModal;

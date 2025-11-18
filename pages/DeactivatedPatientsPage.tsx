import React from 'react';
import { Patient, Page } from '../types';
import SubPageHeader from '../components/SubPageHeader';
import DeactivatedPatientListItem from '../components/DeactivatedPatientListItem';

interface DeactivatedPatientsPageProps {
  deactivatedPatients: Patient[];
  activatePatient: (patientId: number) => Promise<boolean>;
  setActivePage: (page: Page) => void;
}

const DeactivatedPatientsPage: React.FC<DeactivatedPatientsPageProps> = ({ deactivatedPatients, activatePatient, setActivePage }) => {
  return (
    <div className="space-y-6">
      <SubPageHeader 
        title="Pacientes Desativados" 
        onBack={() => setActivePage(Page.Patients)}
      />

      <div className="space-y-3">
        {deactivatedPatients.map(patient => (
          <DeactivatedPatientListItem 
            key={patient.id} 
            patient={patient} 
            onReactivate={() => activatePatient(patient.id)}
          />
        ))}
        {deactivatedPatients.length === 0 && (
            <p className="text-center text-gray-500 dark:text-dark-subtext py-8">Não há pacientes desativados.</p>
        )}
      </div>
    </div>
  );
};

export default DeactivatedPatientsPage;
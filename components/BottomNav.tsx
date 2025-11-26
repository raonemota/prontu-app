
import React from 'react';
import { Page } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ChartIcon } from './icons/ChartIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';

interface BottomNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? 'text-primary' : 'text-gray-400 dark:text-dark-subtext'}`}>
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[800px] h-20 bg-white dark:bg-dark-card shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)] flex justify-around items-center border-t border-gray-200 dark:border-dark-border z-50">
      <NavItem
        icon={<HomeIcon className="w-6 h-6 mb-1" />}
        label="Home"
        isActive={activePage === Page.Home}
        onClick={() => setActivePage(Page.Home)}
      />
      <NavItem
        icon={<CalendarDaysIcon className="w-6 h-6 mb-1" />}
        label="Agenda"
        isActive={activePage === Page.Agenda}
        onClick={() => setActivePage(Page.Agenda)}
      />
      <NavItem
        icon={<UsersIcon className="w-6 h-6 mb-1" />}
        label="Pacientes"
        isActive={activePage === Page.Patients}
        onClick={() => setActivePage(Page.Patients)}
      />
      <NavItem
        icon={<ChartIcon className="w-6 h-6 mb-1" />}
        label="Relatórios"
        isActive={activePage === Page.Reports}
        onClick={() => setActivePage(Page.Reports)}
      />
    </nav>
  );
};

export default BottomNav;

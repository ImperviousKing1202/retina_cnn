'use client';

import { useState } from 'react';
import AppLayout from '@/components/app-layout';
import DashboardView from '@/views/dashboard-view';
import DetectionView from '@/views/detection-view';
import TrainingView from '@/views/training-view';
import StorageView from '@/views/storage-view';
import PatientsView from '@/views/patients-view';
import HistoryView from '@/views/history-view';
import ReportsView from '@/views/reports-view';
import SettingsView from '@/views/settings-view';
import PWAInstallPrompt from '@/components/pwa-install';

export default function HomeClient() {
  const [currentView, setCurrentView] = useState('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <DashboardView onViewChange={setCurrentView} />;
      case 'detection':
        return <DetectionView />;
      case 'training':
        return <TrainingView />;
      case 'storage':
        return <StorageView />;
      case 'patients':
        return <PatientsView />;
      case 'history':
        return <HistoryView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onViewChange={setCurrentView} />;
    }
  };

  return (
    <>
      <PWAInstallPrompt />
      <AppLayout currentView={currentView} onViewChange={setCurrentView}>
        {renderView()}
      </AppLayout>
    </>
  );
}

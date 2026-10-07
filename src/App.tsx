import React from 'react';
import { ParkingProvider, useParking } from './context/ParkingContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TopHeader } from './components/TopHeader.tsx';
import { PanelOperativo } from './components/PanelOperativo.tsx';
import { RegistroEntrada } from './components/RegistroEntrada.tsx';
import { SalidaCobro } from './components/SalidaCobro.tsx';
import { TarifasCeldas } from './components/TarifasCeldas.tsx';
import { ReportesAuditoria } from './components/ReportesAuditoria.tsx';
import { TicketDetailModal } from './components/TicketDetailModal.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';

const AppContent: React.FC = () => {
  const { activeView } = useParking();

  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface selection:bg-secondary/20 selection:text-primary">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Fixed Top Header */}
      <TopHeader />

      {/* Main App Content Body (offset by sidebar w-64 and header h-16) */}
      <main className="ml-64 pt-16 flex-1 flex flex-col min-h-screen">
        {activeView === 'panel-operativo' && <PanelOperativo />}
        {activeView === 'registro-de-entrada' && <RegistroEntrada />}
        {activeView === 'salida-y-cobro' && <SalidaCobro />}
        {activeView === 'tarifas-y-celdas' && <TarifasCeldas />}
        {activeView === 'reportes-y-auditoria' && <ReportesAuditoria />}
      </main>

      {/* Modals & Global Overlays */}
      <TicketDetailModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ParkingProvider>
      <AppContent />
    </ParkingProvider>
  );
}

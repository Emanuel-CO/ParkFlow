import React from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { ActiveView } from '../types/parking.ts';

const LOGO_URL = "https://lh3.googleusercontent.com/aida/AEtjO1UTmHa9BmyIdpsw77V-o0vBaPgnciUuQWDlAxrDchqq8n3E9O3SuGIx2ksKkFZenkIgj7f6z7e9JuCB0uk1_JK2zQTKmiwXOzOrn6GgJorRyBHHqv5wwFDodC4uaU9l6XIKpwxhq1_LpPtXNsPnxoualHA6EcyS3-58NHWURqjd2eem6J2HavMyUf3Q2VybDPj9T6EJcmUoa5HGAScJqC3_c_dvEzKPNCoQh3jp3KC-aGaZLv2Pqa1mcwg";

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    occupancyPercent,
    totalOccupied,
    totalCapacity,
    isCapacityCritical,
    isCapacityWarning,
  } = useParking();

  const navItems: { id: ActiveView; label: string; icon: string }[] = [
    { id: 'panel-operativo', label: 'Panel Operativo', icon: 'grid_view' },
    { id: 'registro-de-entrada', label: 'Registro de Entrada', icon: 'login' },
    { id: 'salida-y-cobro', label: 'Salida y Cobro', icon: 'point_of_sale' },
    { id: 'tarifas-y-celdas', label: 'Tarifas y Celdas', icon: 'tune' },
    { id: 'reportes-y-auditoria', label: 'Reportes y Auditoría', icon: 'analytics' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-surface-border shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between py-4">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-4 pb-5">
          <img
            alt="ParkFlow Logo"
            className="h-8 w-auto object-contain"
            src={LOGO_URL}
            onError={(e) => {
              // Fallback if logo fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <span className="font-sans text-[18px] font-bold text-primary tracking-tight leading-tight">
              ParkFlow
            </span>
            <span className="font-sans text-[11px] font-medium text-on-surface-variant">
              Smart Parking OS
            </span>
          </div>
        </div>

        {/* Live Facility Occupancy Card */}
        <div className="px-4 mb-4">
          <div className={`p-3 rounded-xl border transition-all ${
            isCapacityCritical
              ? 'bg-red-50/80 border-red-300 shadow-sm'
              : isCapacityWarning
              ? 'bg-amber-50/80 border-amber-300 shadow-xs'
              : 'bg-surface-card border-surface-border shadow-[0_1px_3px_0_rgba(15,23,42,0.06)]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  isCapacityCritical ? 'bg-red-600 animate-ping' : isCapacityWarning ? 'bg-amber-500 animate-pulse' : 'bg-status-available animate-pulse'
                }`}></span>
                <span className={`font-sans text-[12px] font-semibold ${
                  isCapacityCritical ? 'text-red-700' : isCapacityWarning ? 'text-amber-700' : 'text-status-available'
                }`}>
                  {isCapacityCritical ? 'Aforo Crítico (90%+)' : isCapacityWarning ? 'Aforo Alto' : 'En servicio'}
                </span>
              </div>
              <span className="font-label-code text-[11px] text-on-surface-variant">
                Sede Central
              </span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant mb-1.5 text-[12px]">
              <span className="text-text-secondary">Aforo General</span>
              <span className={`font-label-code font-bold ${
                isCapacityCritical ? 'text-red-600' : isCapacityWarning ? 'text-amber-600' : 'text-primary'
              }`}>
                {occupancyPercent}%
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isCapacityCritical ? 'bg-red-600 animate-pulse' : isCapacityWarning ? 'bg-amber-500' : 'bg-secondary'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-text-secondary font-label-code">
              <span>{totalOccupied} ocupadas</span>
              <span>{totalCapacity - totalOccupied} libres</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-on-primary-container' : 'text-secondary'}`}>
                  {item.icon}
                </span>
                <span className="font-sans text-[13px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info: Station Terminal ID */}
      <div className="px-4 pt-4 border-t border-surface-border">
        <div className="bg-surface-container p-2.5 rounded-lg flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-text-secondary">Estación</span>
            <span className="font-label-code text-[12px] text-primary font-bold">Terminal T-01</span>
          </div>
          <span className="material-symbols-outlined text-secondary text-[22px]">local_parking</span>
        </div>
      </div>
    </aside>
  );
};

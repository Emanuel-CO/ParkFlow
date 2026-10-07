import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.tsx';

const AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCijgGK2QtYq_WOVxZCWaFsn1oiN6qHvACwXXS0BugCm_IXg9YX864zD6jBQPGtx1Zodj8dgtkyMAAyqEQJRbYvzSyESpPSD5Y0e3DO4NAqJbfQeNK8h2ypg0eilj6b9GAwWg1kTTg6UuGsb-oVCbyAk1QUqDKXuwV78hlny1oY5bDRk_qKSs1gxXzRUkhLjR0rruQae6qO0vkmoX8KPfA3quiJsfERyZ5UOa5fQaKbxpU4OIysssS0";

export const TopHeader: React.FC = () => {
  const {
    currentTimeString,
    showToast,
    isCapacityCritical,
    isCapacityWarning,
    occupancyPercent,
    thresholdSettings,
    setActiveView,
  } = useParking();
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-border shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-6">
      {/* Left items: Live status & Clock */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${
          isCapacityCritical
            ? 'bg-red-100 text-red-700 animate-pulse'
            : isCapacityWarning
            ? 'bg-amber-100 text-amber-800'
            : 'bg-status-available-bg text-status-available'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isCapacityCritical ? 'bg-red-600 animate-ping' : isCapacityWarning ? 'bg-amber-500' : 'bg-status-available animate-pulse'
          }`}></span>
          <span>
            {isCapacityCritical
              ? `🚨 Aforo Crítico (${occupancyPercent}%)`
              : isCapacityWarning
              ? `⚠️ Aforo Alto (${occupancyPercent}%)`
              : 'Sistema Operativo'}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 font-label-code text-[12px] text-on-surface-variant bg-surface-canvas px-2.5 py-1 rounded-md border border-surface-border/50">
          <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
          <span>{currentTimeString || '14:32:45 - 24 Oct 2024'}</span>
        </div>
      </div>

      {/* Right items: Operator badge, Notifications, Profile avatar */}
      <div className="flex items-center gap-3 relative">
        <div className="flex items-center bg-surface-container-low px-3 py-1 rounded-lg gap-2 border border-surface-border/60">
          <span className="material-symbols-outlined text-secondary text-[18px]">badge</span>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-primary leading-tight">Operador de Turno</span>
            <span className="text-[11px] text-text-secondary leading-tight">Administrador</span>
          </div>
        </div>

        {/* Notifications button with flyout */}
        <div className="relative">
          <button
            aria-label="Notificaciones"
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"></span>
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-card rounded-xl shadow-xl border border-surface-border p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border mb-2">
                <span className="text-xs font-bold text-text-primary">Notificaciones Operativas</span>
                <span className="text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-secondary font-bold">2 nuevas</span>
              </div>
              <div className="flex flex-col gap-2">
                {isCapacityCritical && (
                  <div
                    onClick={() => {
                      setActiveView('tarifas-y-celdas');
                      setShowNotificationMenu(false);
                    }}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer transition-colors text-left"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-700">
                      <span className="material-symbols-outlined text-[16px] animate-pulse">error</span>
                      <span>Alerta de Aforo al {occupancyPercent}%</span>
                    </div>
                    <p className="text-[11px] text-red-900 mt-0.5">
                      Superó umbral crítico de {thresholdSettings.criticalThreshold}%. Clic para ajustar configuración.
                    </p>
                  </div>
                )}
                <div
                  onClick={() => {
                    showToast('Sensor en celda A-05 reporta mantenimiento en curso');
                    setShowNotificationMenu(false);
                  }}
                  className="p-2 rounded-lg bg-surface-canvas hover:bg-surface-container-low cursor-pointer transition-colors text-left"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-status-warning">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    <span>Alerta de Bahía A-05</span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-0.5">Sensor en calibración de piso. Bahía bloqueada.</p>
                </div>
                <div
                  onClick={() => {
                    showToast('Impresora térmica T-01 al 78% de papel');
                    setShowNotificationMenu(false);
                  }}
                  className="p-2 rounded-lg bg-surface-canvas hover:bg-surface-container-low cursor-pointer transition-colors text-left"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-status-available">
                    <span className="material-symbols-outlined text-[14px]">print</span>
                    <span>Impresora Térmica T-01</span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-0.5">Rollo 80mm al 78% de capacidad.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Picture */}
        <div className="flex items-center pl-1">
          <img
            alt="Profile Avatar"
            className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-secondary/20"
            src={AVATAR_URL}
          />
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { playCyberFeedback } from '../utils/audioAlert.ts';


export const TopHeader: React.FC = () => {
  const {
    currentTimeString,
    showToast,
    isCapacityCritical,
    isCapacityWarning,
    occupancyPercent,
    thresholdSettings,
    setActiveView,
    isDbConnected,
    isDbSyncing,
    setIsXamppModalOpen,
    userRole,
    setShowRoleModal,
    currentUser,
    handleLogout,
  } = useParking();

  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setUptime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 z-40 flex items-center justify-between px-5" style={{
      background: 'linear-gradient(90deg, rgba(2,5,16,0.96) 0%, rgba(4,8,24,0.97) 100%)',
      borderBottom: '1px solid rgba(0,240,255,0.12)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.5), 0 1px 0 rgba(0,240,255,0.05)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      {/* ── LEFT SECTION ── */}
      <div className="flex items-center gap-3">
        
        {userRole === 'cliente' ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(0,255,157,0.2)]">
            <span className="material-symbols-outlined text-[15px]">verified_user</span>
            <span>ZONA CLIENTE SEGURA // AISLADA</span>
          </div>
        ) : (
          <>
            {/* System Status Pill */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
              isCapacityCritical
                ? 'bg-red-500/12 border-red-500/45 text-red-400 shadow-[0_0_20px_rgba(255,42,109,0.25)]'
                : isCapacityWarning
                ? 'bg-amber-500/12 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(255,183,3,0.2)]'
                : 'bg-emerald-500/8 border-emerald-500/25 text-emerald-400 shadow-[0_0_12px_rgba(0,255,157,0.15)]'
            }`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                isCapacityCritical ? 'bg-red-500 animate-ping' : isCapacityWarning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-ping'
              }`} />
              <span className="font-hud tracking-wide text-[10px] whitespace-nowrap">
                {isCapacityCritical
                  ? `⚠ AFORO CRÍTICO ${occupancyPercent}%`
                  : isCapacityWarning
                  ? `△ AFORO ELEVADO ${occupancyPercent}%`
                  : 'SISTEMA OPERATIVO'}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent hidden lg:block" />

            {/* Quantum Clock */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-[11px] text-cyan-300" style={{
              background: 'rgba(0,240,255,0.05)',
              border: '1px solid rgba(0,240,255,0.18)',
              boxShadow: '0 0 12px rgba(0,240,255,0.08)',
            }}>
              <span className="material-symbols-outlined text-[14px] text-cyan-400 animate-pulse-subtle">schedule</span>
              <span className="font-bold tabular-nums tracking-wider">{currentTimeString || '00:00:00'}</span>
            </div>

            {/* Uptime */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-[10px] text-slate-400" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span className="material-symbols-outlined text-[13px] text-slate-500">memory</span>
              <span>UP: <span className="text-violet-400 font-bold tabular-nums">{formatUptime(uptime)}</span></span>
            </div>

            {/* MySQL / XAMPP Status */}
            <button
              onClick={() => {
                playCyberFeedback('click', 0.2);
                setIsXamppModalOpen(true);
              }}
              type="button"
              title="Ver telemetría de MySQL en XAMPP"
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-mono border transition-all ${
                isDbConnected
                  ? 'text-cyan-300 hover:text-cyan-200'
                  : 'text-amber-300 hover:text-amber-200'
              }`}
              style={{
                background: isDbConnected ? 'rgba(0,240,255,0.06)' : 'rgba(255,183,3,0.06)',
                border: isDbConnected ? '1px solid rgba(0,240,255,0.25)' : '1px solid rgba(255,183,3,0.25)',
                boxShadow: isDbConnected ? '0 0 15px rgba(0,240,255,0.1)' : '0 0 15px rgba(255,183,3,0.1)',
              }}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                isDbSyncing ? 'bg-amber-400' : isDbConnected ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'
              }`} style={isDbSyncing ? { animation: 'spin 1s linear infinite' } : {}} />
              <span className="font-hud font-bold text-[9px]">MySQL</span>
              <span className="hidden sm:inline">
                {isDbSyncing ? 'SYNCING...' : isDbConnected ? ':3306' : 'OFFLINE'}
              </span>
              <span className="material-symbols-outlined text-[13px] opacity-60 group-hover:opacity-100 transition-opacity">open_in_new</span>
            </button>
          </>
        )}
      </div>

      {/* ── RIGHT SECTION ── */}
      <div className="flex items-center gap-3 relative">
        
        {/* User Identity Chip */}
        {currentUser ? (
          <div className={`hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border font-mono text-xs ${
            userRole === 'cliente' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
            userRole === 'operador' ? 'bg-violet-500/10 border-violet-500/30 text-violet-300' :
            'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {userRole === 'cliente' ? 'directions_car' : userRole === 'operador' ? 'badge' : 'admin_panel_settings'}
            </span>
            <div className="flex flex-col text-left leading-tight">
              <span className="font-hud text-[11px] font-bold text-white">{currentUser.name}</span>
              <span className="text-[9px] opacity-80">
                {userRole === 'cliente' ? `CC: ${currentUser.id} · ${currentUser.plate}` :
                 userRole === 'operador' ? `${currentUser.badge} · ${currentUser.shift?.split(' ')[1] || 'Turno'}` :
                 'ROOT // MASTER'}
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{
            background: 'rgba(0,240,255,0.04)',
            border: '1px solid rgba(0,240,255,0.15)',
          }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-cyan-300" style={{
              background: 'rgba(0,240,255,0.1)',
              border: '1px solid rgba(0,240,255,0.3)',
            }}>
              <span className="material-symbols-outlined text-[14px]">shield</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-hud text-[10px] font-black text-white tracking-wider">INVITADO</span>
              <span className="font-mono text-[8px] text-cyan-400/80 mt-0.5">SIN IDENTIFICAR</span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent" />

        {/* Notifications (Hidden for clients to isolate internal alerts) */}
        {userRole !== 'cliente' && (
          <div className="relative">
            <button
              aria-label="Notificaciones"
              onClick={() => {
                playCyberFeedback('click', 0.15);
                setShowNotificationMenu(!showNotificationMenu);
              }}
              className="relative p-2 rounded-xl text-slate-400 hover:text-cyan-300 transition-all"
              style={{
                background: showNotificationMenu ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.04)',
                border: showNotificationMenu ? '1px solid rgba(0,240,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping opacity-75 absolute" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" style={{ boxShadow: '0 0 8px #ff2a6d' }} />
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl p-3.5 z-50" style={{
                background: 'rgba(3,6,18,0.97)',
                border: '1px solid rgba(0,240,255,0.25)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,240,255,0.05)',
                backdropFilter: 'blur(24px)',
              }}>
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5" style={{ borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
                  <span className="font-hud text-[11px] font-bold text-white tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-cyan-400">notification_important</span>
                    ALERTAS DEL SISTEMA
                  </span>
                  <span className="cyber-tag text-rose-400 border-rose-400/40 bg-rose-500/10">2 ACTIVAS</span>
                </div>

                <div className="flex flex-col gap-2">
                  {isCapacityCritical && (
                    <div
                      onClick={() => { setActiveView('tarifas-y-celdas'); setShowNotificationMenu(false); }}
                      className="p-2.5 rounded-xl cursor-pointer transition-all text-left"
                      style={{
                        background: 'rgba(60,0,20,0.6)',
                        border: '1px solid rgba(255,42,109,0.4)',
                      }}
                    >
                      <div className="flex items-center gap-1.5 font-hud text-[10px] font-bold text-red-400">
                        <span className="material-symbols-outlined text-[14px] animate-pulse">error</span>
                        CRITICAL // AFORO {occupancyPercent}%
                      </div>
                      <p className="text-[10px] text-red-200/80 mt-1 font-mono">
                        Umbral {thresholdSettings.criticalThreshold}% superado. Considere desvío de tráfico.
                      </p>
                    </div>
                  )}
                  <div
                    onClick={() => { showToast('Sensor A-05: Mantenimiento en progreso'); setShowNotificationMenu(false); }}
                    className="p-2.5 rounded-xl cursor-pointer transition-all text-left group"
                    style={{
                      background: 'rgba(20,15,0,0.5)',
                      border: '1px solid rgba(255,183,3,0.25)',
                    }}
                  >
                    <div className="flex items-center gap-1.5 font-hud text-[10px] font-bold text-amber-400">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      SENSOR // CELDA A-05
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Mantenimiento preventivo activo.</p>
                  </div>
                  <div
                    onClick={() => { showToast('Impresora T-01: 78% de papel disponible'); setShowNotificationMenu(false); }}
                    className="p-2.5 rounded-xl cursor-pointer transition-all text-left"
                    style={{
                      background: 'rgba(0,15,30,0.5)',
                      border: '1px solid rgba(0,240,255,0.2)',
                    }}
                  >
                    <div className="flex items-center gap-1.5 font-hud text-[10px] font-bold text-cyan-400">
                      <span className="material-symbols-outlined text-[14px]">print</span>
                      HARDWARE // IMPRESORA T-01
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Bobina 80mm al 78% de reserva.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Role Switcher Button */}
        <button
          type="button"
          onClick={() => {
            playCyberFeedback('click', 0.2);
            setShowRoleModal(true);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
            userRole === 'cliente'
              ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(0,255,157,0.25)]'
              : userRole === 'operador'
              ? 'bg-violet-500/15 border-violet-400 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.25)]'
              : 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
          }`}
          title="Haz clic para cambiar de rol"
        >
          <span className="material-symbols-outlined text-[16px]">
            {userRole === 'cliente' ? 'directions_car' : userRole === 'operador' ? 'badge' : 'admin_panel_settings'}
          </span>
          <div className="flex flex-col text-left leading-none">
            <span className="font-hud text-[10px] font-black tracking-wider">
              {userRole ? userRole.toUpperCase() : 'SELECCIONAR'}
            </span>
            <span className="text-[8px] font-mono opacity-70">Cambiar Rol</span>
          </div>
        </button>

        {/* Logout Button */}
        {currentUser && (
          <button
            type="button"
            onClick={() => {
              playCyberFeedback('click', 0.2);
              handleLogout();
            }}
            className="px-3 py-1.5 rounded-xl font-hud text-[10px] font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(255,42,109,0.2)]"
            title="Cerrar Sesión Segura"
          >
            <span className="material-symbols-outlined text-[15px] text-rose-400">logout</span>
            <span className="hidden sm:inline">SALIR</span>
          </button>
        )}

        {/* Profile Avatar */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full animate-spin-slow" style={{
            background: 'conic-gradient(from 0deg, #00f0ff, #8b5cf6, #00f0ff)',
            padding: '1.5px',
            borderRadius: '50%',
          }} />
          <div className="relative w-9 h-9 rounded-full overflow-hidden" style={{
            border: '2px solid rgba(0,240,255,0.6)',
            boxShadow: '0 0 16px rgba(0,240,255,0.4)',
          }}>
            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-violet-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-white">person</span>
            </div>
          </div>
        </div>
      </div>

      {/* Click-outside overlay for notifications */}
      {showNotificationMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotificationMenu(false)} />
      )}
    </header>
  );
};

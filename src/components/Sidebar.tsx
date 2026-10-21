import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { ActiveView } from '../types/parking.ts';
import { playCyberFeedback } from '../utils/audioAlert.ts';


export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    occupancyPercent,
    totalOccupied,
    totalCapacity,
    isCapacityCritical,
    isCapacityWarning,
    isDbConnected,
    userRole,
    setShowRoleModal,
    currentUser,
    handleLogout,
  } = useParking();

  const [time, setTime] = useState(new Date());
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const b = setTimeout(() => setBootDone(true), 600);
    return () => { clearInterval(t); clearTimeout(b); };
  }, []);

  const allNavItems: { id: ActiveView; label: string; sub: string; icon: string; color: string }[] = [
    { id: 'panel-operativo',       label: 'Panel Operativo',     sub: 'HUD Telemetría 3D',       icon: 'grid_view',      color: 'cyan'   },
    { id: 'portal-cliente',        label: 'Elegir Mi Puesto',    sub: 'Mapa & Auto-Ticket',      icon: 'local_parking',  color: 'emerald'},
    { id: 'mi-perfil-cliente',     label: 'Mi Perfil Conductor', sub: 'Billetera & Estado',      icon: 'account_circle', color: 'emerald'},
    { id: 'registro-de-entrada',   label: 'Registro Entrada',    sub: 'Escáner Óptico LPR',      icon: 'login',          color: 'emerald'},
    { id: 'salida-y-cobro',        label: 'Salida y Cobro',      sub: 'Liquidación Quantum',     icon: 'point_of_sale',  color: 'violet' },
    { id: 'tarifas-y-celdas',      label: 'Tarifas y Celdas',    sub: 'Matrices de Control',     icon: 'tune',           color: 'amber'  },
    { id: 'reportes-y-auditoria',  label: 'Reportes',            sub: 'Ledger Blockchain',       icon: 'analytics',      color: 'cyan'   },
  ];

  const navItems = allNavItems.filter(item => {
    if (userRole === 'cliente') {
      return ['portal-cliente', 'mi-perfil-cliente'].includes(item.id);
    }
    if (userRole === 'operador') {
      return ['panel-operativo', 'registro-de-entrada', 'salida-y-cobro'].includes(item.id);
    }
    // Administrador has all
    return true;
  });

  const colorMap: Record<string, { text: string; border: string; bg: string; glow: string; shadow: string }> = {
    cyan:    { text: 'text-cyan-300',    border: 'border-cyan-400/40',    bg: 'bg-cyan-500/15',    glow: 'text-cyan-400',    shadow: 'shadow-[0_0_15px_rgba(0,240,255,0.3)]'   },
    emerald: { text: 'text-emerald-300', border: 'border-emerald-400/40', bg: 'bg-emerald-500/15', glow: 'text-emerald-400', shadow: 'shadow-[0_0_15px_rgba(0,255,157,0.3)]'   },
    violet:  { text: 'text-violet-300',  border: 'border-violet-400/40',  bg: 'bg-violet-500/15',  glow: 'text-violet-400',  shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.3)]'  },
    amber:   { text: 'text-amber-300',   border: 'border-amber-400/40',   bg: 'bg-amber-500/15',   glow: 'text-amber-400',   shadow: 'shadow-[0_0_15px_rgba(255,183,3,0.3)]'   },
  };

  const statusColor = isCapacityCritical ? 'red' : isCapacityWarning ? 'amber' : 'emerald';
  const statusLabel = isCapacityCritical ? 'AFORO CRÍTICO' : isCapacityWarning ? 'ALERTA AFORO' : 'SISTEMA OK';

  const padTime = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${padTime(time.getHours())}:${padTime(time.getMinutes())}:${padTime(time.getSeconds())}`;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, rgba(2,5,16,0.97) 0%, rgba(4,8,24,0.98) 100%)' }}>
      
      {/* Neon left edge glow */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-transparent pointer-events-none" style={{ filter: 'blur(8px)', background: 'linear-gradient(to right, transparent, rgba(0,240,255,0.04))' }} />

      {/* Ambient orbs */}
      <div className="absolute top-20 -left-10 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)' }} />
      <div className="absolute bottom-40 -left-10 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)' }} />

      {/* ── BRAND HEADER ── */}
      <div className="px-5 pt-4 pb-4" style={{ borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="relative w-11 h-11 shrink-0">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 animate-spin-slow opacity-70 blur-[2px]" />
            <div className="relative w-full h-full rounded-xl bg-gradient-to-tr from-cyan-600 to-violet-700 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)]">
              <span className="material-symbols-outlined text-[22px] text-black font-black">electric_bolt</span>
            </div>
            {/* Live dot */}
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff9d] flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-hud text-[16px] font-black tracking-wider text-holographic">PARKFLOW</span>
              <span className="cyber-tag text-cyan-400 border-cyan-400/40 bg-cyan-500/10">2099</span>
            </div>
            <span className="font-mono text-[9px] tracking-widest text-slate-500 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle inline-block" />
              TELEMETRY OS · v3.4.1
            </span>
          </div>
        </div>
      </div>

      {/* ── LIVE CLOCK & DB STATUS ── */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,240,255,0.07)' }}>
        <div className="font-mono text-[14px] font-bold text-cyan-300 glow-text-cyan tracking-widest tabular-nums">
          {timeStr}
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${isDbConnected ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isDbConnected ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
          {isDbConnected ? 'SQL LIVE' : 'OFFLINE'}
        </div>
      </div>

      {/* ── ROLE INDICATOR BANNER ── */}
      <div className="px-4 py-2 flex items-center justify-between font-mono text-xs" style={{ borderBottom: '1px solid rgba(0,240,255,0.07)', background: 'rgba(0,240,255,0.02)' }}>
        <span className="text-slate-400 text-[10px] uppercase">Rol Activo:</span>
        <button
          onClick={() => { playCyberFeedback('click', 0.15); setShowRoleModal(true); }}
          className={`px-2 py-0.5 rounded text-[10px] font-hud font-bold border cursor-pointer transition-all hover:scale-105 ${
            userRole === 'cliente' ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300' :
            userRole === 'operador' ? 'bg-violet-500/15 border-violet-400 text-violet-300' :
            'bg-cyan-500/15 border-cyan-400 text-cyan-300'
          }`}
          title="Cambiar de rol"
        >
          {userRole ? userRole.toUpperCase() : 'SELECCIONAR'}
        </button>
      </div>

      {/* ── OCCUPANCY RADAR MODULE ── */}
      <div className="px-4 py-3">
        <div className={`relative rounded-xl p-3.5 overflow-hidden hud-corners ${
          isCapacityCritical ? 'hud-corners-red' : isCapacityWarning ? 'hud-corners-amber' : ''
        }`} style={{
          background: isCapacityCritical 
            ? 'linear-gradient(135deg, rgba(60,0,20,0.6) 0%, rgba(20,0,10,0.8) 100%)'
            : isCapacityWarning
            ? 'linear-gradient(135deg, rgba(50,30,0,0.6) 0%, rgba(20,12,0,0.8) 100%)'
            : 'linear-gradient(135deg, rgba(0,20,40,0.6) 0%, rgba(0,8,20,0.8) 100%)',
          border: `1px solid ${isCapacityCritical ? 'rgba(255,42,109,0.35)' : isCapacityWarning ? 'rgba(255,183,3,0.35)' : 'rgba(0,240,255,0.2)'}`,
          boxShadow: isCapacityCritical ? '0 0 25px rgba(255,42,109,0.2)' : isCapacityWarning ? '0 0 25px rgba(255,183,3,0.15)' : '0 0 15px rgba(0,240,255,0.08)',
        }}>
          {/* Ambient glow */}
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full pointer-events-none" style={{
            background: `radial-gradient(circle, ${isCapacityCritical ? 'rgba(255,42,109,0.12)' : isCapacityWarning ? 'rgba(255,183,3,0.12)' : 'rgba(0,240,255,0.10)'} 0%, transparent 70%)`,
            filter: 'blur(10px)',
          }} />
          
          {/* Status header */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="relative flex items-center justify-center w-4 h-4">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isCapacityCritical ? 'bg-red-500' : isCapacityWarning ? 'bg-amber-400' : 'bg-emerald-400'
                } ${isCapacityCritical ? 'animate-ping' : 'animate-pulse'} absolute opacity-70`} />
                <span className={`w-2 h-2 rounded-full ${
                  isCapacityCritical ? 'bg-red-500' : isCapacityWarning ? 'bg-amber-400' : 'bg-emerald-400'
                } relative`} />
              </div>
              <span className={`font-hud text-[10px] font-bold tracking-wider ${
                isCapacityCritical ? 'text-red-400' : isCapacityWarning ? 'text-amber-400' : 'text-cyan-300'
              }`}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Occupancy value */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`font-hud text-4xl font-black tabular-nums leading-none ${
              isCapacityCritical ? 'text-red-400' : isCapacityWarning ? 'text-amber-400' : 'text-cyan-300'
            }`} style={{
              textShadow: isCapacityCritical 
                ? '0 0 20px rgba(255,42,109,0.8)' 
                : isCapacityWarning 
                ? '0 0 20px rgba(255,183,3,0.8)'
                : '0 0 20px rgba(0,240,255,0.8)',
            }}>
              {occupancyPercent}
            </span>
            <span className={`font-hud text-lg font-bold ${
              isCapacityCritical ? 'text-red-500' : isCapacityWarning ? 'text-amber-500' : 'text-cyan-500'
            }`}>%</span>
            <span className="font-mono text-[10px] text-slate-500 ml-auto">
              {totalOccupied}/{totalCapacity}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full rounded-full overflow-hidden p-px" style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div
              className="h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${occupancyPercent}%`,
                background: isCapacityCritical
                  ? 'linear-gradient(90deg, #ff2a6d, #ff6b9d)'
                  : isCapacityWarning
                  ? 'linear-gradient(90deg, #ffb703, #ffd60a)'
                  : 'linear-gradient(90deg, #00f0ff, #38bdf8, #00ff9d)',
                boxShadow: isCapacityCritical
                  ? '0 0 12px rgba(255,42,109,0.8)'
                  : isCapacityWarning
                  ? '0 0 12px rgba(255,183,3,0.8)'
                  : '0 0 12px rgba(0,240,255,0.7)',
              }}
            />
          </div>

          {/* Stats row */}
          <div className="flex justify-between mt-2 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {totalOccupied} ocupados
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {totalCapacity - totalOccupied} libres
            </span>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="flex flex-col gap-1 px-3 flex-1 overflow-y-auto mt-1" style={{ scrollbarWidth: 'none' }}>
        {navItems.map((item, idx) => {
          const isActive = activeView === item.id;
          const c = colorMap[item.color];
          return (
            <button
              key={item.id}
              onClick={() => {
                playCyberFeedback('click', 0.15);
                setActiveView(item.id);
              }}
              className={`sidebar-nav-item relative group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 overflow-hidden ${
                isActive
                  ? `${c.bg} ${c.border} border ${c.shadow}`
                  : 'border border-transparent hover:border-white/8 text-slate-400 hover:text-slate-200'
              }`}
              style={{
                animationDelay: `${idx * 80}ms`,
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/4 rounded-r ${
                  item.color === 'cyan' ? 'bg-cyan-400' :
                  item.color === 'emerald' ? 'bg-emerald-400' :
                  item.color === 'violet' ? 'bg-violet-400' :
                  item.color === 'amber' ? 'bg-amber-400' : 'bg-cyan-400'
                }`} style={{
                  boxShadow: item.color === 'cyan' ? '0 0 10px rgba(0,240,255,0.8)' :
                             item.color === 'emerald' ? '0 0 10px rgba(0,255,157,0.8)' :
                             item.color === 'violet' ? '0 0 10px rgba(139,92,246,0.8)' :
                             item.color === 'amber' ? '0 0 10px rgba(255,183,3,0.8)' : '',
                }} />
              )}

              {/* Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                isActive
                  ? `${c.bg} ${c.border} border ${c.glow}`
                  : 'bg-white/4 text-slate-500 group-hover:bg-white/8 group-hover:text-slate-300'
              }`}>
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              </div>

              {/* Label */}
              <div className="flex flex-col min-w-0">
                <span className={`font-hud text-[11px] font-bold leading-tight truncate ${
                  isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                }`}>
                  {item.label}
                </span>
                <span className={`text-[9px] font-mono truncate mt-0.5 ${
                  isActive ? c.glow : 'text-slate-600 group-hover:text-slate-500'
                }`}>
                  {item.sub}
                </span>
              </div>

              {/* Active arrow */}
              {isActive && (
                <span className={`ml-auto material-symbols-outlined text-[14px] ${c.glow}`}>
                  chevron_right
                </span>
              )}
            </button>
          );
        })}

        {/* Client Isolation & Security Banner */}
        {userRole === 'cliente' && (
          <div className="mt-3 mx-1 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/25 text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
              <span className="material-symbols-outlined text-[15px]">verified_user</span>
              <span>PERFIL PROTEGIDO</span>
            </div>
            <p className="text-[9px] text-slate-400 leading-tight">
              Acceso de conductor aislado de la red interna de taquillas, cobros y servidores.
            </p>
          </div>
        )}
      </nav>

      {/* ── ROLE SWITCH & LOGOUT BUTTONS ── */}
      <div className="px-4 py-2 flex flex-col gap-1.5" style={{ borderTop: '1px solid rgba(0,240,255,0.08)' }}>
        <button
          onClick={() => {
            playCyberFeedback('click', 0.2);
            setShowRoleModal(true);
          }}
          className="w-full py-2 px-3 rounded-xl font-hud text-[10px] font-black tracking-wider text-slate-200 hover:text-white bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]"
        >
          <span className="material-symbols-outlined text-[16px] text-cyan-400">switch_account</span>
          <span>CAMBIAR DE ROL</span>
        </button>

        {currentUser && (
          <button
            onClick={() => {
              playCyberFeedback('click', 0.2);
              handleLogout();
            }}
            className="w-full py-2 px-3 rounded-xl font-hud text-[10px] font-bold tracking-wider text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 hover:border-rose-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-rose-400">logout</span>
            <span>CERRAR SESIÓN</span>
          </button>
        )}
      </div>

      {/* ── TERMINAL FOOTER ── */}
      <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid rgba(0,240,255,0.08)' }}>
        <div className="rounded-xl p-3 flex items-center justify-between" style={{
          background: 'linear-gradient(135deg, rgba(0,20,40,0.7) 0%, rgba(0,8,20,0.9) 100%)',
          border: '1px solid rgba(0,240,255,0.15)',
        }}>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#00ff9d]" />
              <span className="font-mono text-[9px] text-emerald-400 font-bold tracking-widest">NODE ONLINE</span>
            </div>
            <span className="font-hud text-[11px] text-white font-black tracking-wider">TERMINAL-T01</span>
            <span className="font-mono text-[8px] text-slate-600 mt-0.5">SN: PF-{String(2099).padStart(4,'0')}-0001</span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-cyan-400" style={{
            background: 'rgba(0,240,255,0.08)',
            border: '1px solid rgba(0,240,255,0.25)',
            boxShadow: '0 0 12px rgba(0,240,255,0.15)',
          }}>
            <span className="material-symbols-outlined text-[18px] animate-pulse-subtle">sensors</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

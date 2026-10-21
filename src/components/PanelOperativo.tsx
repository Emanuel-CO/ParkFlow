import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { ParkingCell, VehicleType } from '../types/parking.ts';
import { playCyberFeedback } from '../utils/audioAlert.ts';


/* ── Mini animated ring chart ── */
const RingChart: React.FC<{ percent: number; color: string; size?: number }> = ({ percent, color, size = 64 }) => {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 0.7s ease-out' }}
      />
    </svg>
  );
};

/* ── Cell card ── */
const CellCard: React.FC<{ cell: ParkingCell; onClick: () => void }> = ({ cell, onClick }) => {
  const isFree = cell.status === 'free';
  const isOcc = cell.status === 'occupied';
  const isBlk = cell.status === 'blocked';

  if (isBlk) return (
    <button onClick={onClick} className="cell-card group relative rounded-xl overflow-hidden cursor-pointer text-left w-full" style={{
      background: 'linear-gradient(160deg, rgba(40,25,0,0.8) 0%, rgba(15,10,0,0.9) 100%)',
      border: '1px solid rgba(255,183,3,0.3)',
      minHeight: '110px',
    }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      <div className="p-3 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <span className="font-hud text-[11px] font-bold text-amber-300">{cell.id}</span>
          <span className="material-symbols-outlined text-amber-500 text-[14px]">lock</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-amber-400 text-[22px] group-hover:rotate-12 transition-transform">construction</span>
          <span className="font-mono text-[8px] text-amber-400/80 font-bold mt-1 text-center">
            {cell.maintenanceReason || 'MANT.'}
          </span>
        </div>
      </div>
    </button>
  );

  if (isOcc) return (
    <button onClick={onClick} className="cell-card group relative rounded-xl overflow-hidden cursor-pointer text-left w-full transition-all" style={{
      background: cell.isClientAutoOccupied
        ? 'linear-gradient(160deg, rgba(6,30,20,0.9) 0%, rgba(20,5,15,0.95) 100%)'
        : 'linear-gradient(160deg, rgba(50,0,20,0.85) 0%, rgba(15,0,8,0.95) 100%)',
      border: cell.isClientAutoOccupied ? '2px solid rgba(0,255,157,0.7)' : '1px solid rgba(255,42,109,0.35)',
      boxShadow: cell.isClientAutoOccupied ? '0 0 25px rgba(0,255,157,0.45)' : '0 0 15px rgba(255,42,109,0.12)',
      minHeight: '110px',
    }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
      <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity" style={{
        background: 'linear-gradient(160deg, rgba(80,0,30,0.4) 0%, transparent 60%)',
      }} />
      <div className="p-3 flex flex-col h-full gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-hud text-[10px] font-bold text-rose-300">{cell.id}</span>
            {cell.isClientAutoOccupied && (
              <span className="px-1.5 py-0.2 rounded text-[7px] font-mono font-black bg-emerald-500/25 text-emerald-300 border border-emerald-400">
                NUEVO
              </span>
            )}
          </div>
          <span className={`w-2 h-2 rounded-full ${cell.isClientAutoOccupied ? 'bg-emerald-400 animate-ping' : 'bg-rose-500 animate-pulse'}`} style={{ boxShadow: cell.isClientAutoOccupied ? '0 0 10px #00ff9d' : '0 0 8px rgba(255,42,109,0.8)' }} />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="px-2 py-1 rounded-lg text-center" style={{
            background: 'rgba(0,0,0,0.6)',
            border: cell.isClientAutoOccupied ? '1px solid rgba(0,255,157,0.5)' : '1px solid rgba(255,42,109,0.3)',
          }}>
            <span className="font-label-plate text-[13px] text-yellow-300 font-black tracking-widest block">{cell.plate}</span>
          </div>
          {cell.driverName ? (
            <span className="text-[9px] font-mono text-emerald-300 truncate text-center mt-1 block">👤 {cell.driverName.split(' ')[0]}</span>
          ) : (
            <span className="text-[9px] font-mono text-slate-500 text-center mt-1">In: {cell.entryTime}</span>
          )}
        </div>
        <div className="flex items-center justify-between font-mono text-[9px] text-rose-400 font-bold pt-1" style={{ borderTop: '1px solid rgba(255,42,109,0.15)' }}>
          <span className="flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[11px]">timer</span>
            {cell.duration}
          </span>
          <span>${cell.currentTotal?.toLocaleString('es-CO') || '0'}</span>
        </div>
      </div>
    </button>
  );

  return (
    <button onClick={onClick} className="cell-card group relative rounded-xl overflow-hidden cursor-pointer text-left w-full" style={{
      background: 'linear-gradient(160deg, rgba(0,20,10,0.6) 0%, rgba(0,5,15,0.8) 100%)',
      border: '1px solid rgba(0,255,157,0.2)',
      minHeight: '110px',
    }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity" style={{
        background: 'linear-gradient(160deg, rgba(0,40,20,0.3) 0%, transparent 60%)',
      }} />
      <div className="p-3 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <span className="font-hud text-[10px] font-bold text-emerald-300 group-hover:text-cyan-300 transition-colors">{cell.id}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(0,255,157,0.7)' }} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <span className="material-symbols-outlined text-emerald-400 group-hover:text-cyan-300 text-[24px] group-hover:scale-110 transition-all">
            add_circle
          </span>
          <span className="font-hud text-[9px] text-emerald-400 group-hover:text-cyan-300 font-bold tracking-wider transition-colors">LIBRE</span>
        </div>
        <div className="text-center font-mono text-[8px] text-slate-600 group-hover:text-cyan-500 transition-colors">ASIGNAR</div>
      </div>
    </button>
  );
};

/* ── KPI Card ── */
const KpiCard: React.FC<{
  label: string; value: string | number; sub?: string;
  icon: string; accent?: string; ring?: number; ringColor?: string;
}> = ({ label, value, sub, icon, accent = 'cyan', ring, ringColor = '#00f0ff' }) => {
  const accentStyles: Record<string, { text: string; icon: string; border: string; glow: string }> = {
    cyan:    { text: 'text-cyan-300',    icon: 'text-cyan-400',    border: 'rgba(0,240,255,0.2)',    glow: 'rgba(0,240,255,0.08)' },
    emerald: { text: 'text-emerald-300', icon: 'text-emerald-400', border: 'rgba(0,255,157,0.2)',    glow: 'rgba(0,255,157,0.06)' },
    violet:  { text: 'text-violet-300',  icon: 'text-violet-400',  border: 'rgba(139,92,246,0.2)',   glow: 'rgba(139,92,246,0.06)' },
    amber:   { text: 'text-amber-300',   icon: 'text-amber-400',   border: 'rgba(255,183,3,0.2)',    glow: 'rgba(255,183,3,0.06)' },
    red:     { text: 'text-red-300',     icon: 'text-red-400',     border: 'rgba(255,42,109,0.25)',  glow: 'rgba(255,42,109,0.08)' },
  };
  const s = accentStyles[accent] || accentStyles.cyan;

  return (
    <div className="relative rounded-2xl overflow-hidden hud-corners" style={{
      background: 'linear-gradient(160deg, rgba(6,12,32,0.9) 0%, rgba(2,5,16,0.95) 100%)',
      border: `1px solid ${s.border}`,
      boxShadow: `0 0 20px ${s.glow}`,
    }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.border.replace('0.2', '0.5')}, transparent)` }} />
      <div className="p-4.5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className={`font-mono text-[9px] font-bold tracking-widest ${s.icon} uppercase`}>{label}</span>
            <span className={`font-hud text-3xl font-black leading-none ${s.text}`} style={{
              textShadow: `0 0 20px ${ringColor}60`,
            }}>{value}</span>
            {sub && <span className="font-mono text-[10px] text-slate-500 mt-1">{sub}</span>}
          </div>
          <div className="shrink-0">
            {ring !== undefined ? (
              <div className="relative flex items-center justify-center">
                <RingChart percent={ring} color={ringColor} size={52} />
                <span className={`absolute font-mono text-[9px] font-bold ${s.icon}`}>{ring}%</span>
              </div>
            ) : (
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.icon}`} style={{
                background: `${s.border.replace('0.2', '0.08')}`,
                border: `1px solid ${s.border}`,
                boxShadow: `0 0 12px ${s.glow}`,
              }}>
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ── */
export const PanelOperativo: React.FC = () => {
  const {
    cells, movements, totalOccupied, totalCapacity, occupancyPercent,
    freeCarsCount, occupiedCarsCount, freeMotosCount, occupiedMotosCount,
    todayRevenue, todayEntriesCount, setActiveView, setSelectedCellForModal,
    registerEntry, showToast, thresholdSettings, isCapacityCritical,
    isCapacityWarning, isAlertDismissed, dismissAlert, userRole, lastLiveEvent,
  } = useParking();

  const [activeFilter, setActiveFilter] = useState<'all' | 'free' | 'occupied' | 'blocked'>('all');
  const [selectedLevel, setSelectedLevel] = useState('lvl-1');
  const [quickPlate, setQuickPlate] = useState('');
  const [quickVehicleType, setQuickVehicleType] = useState<VehicleType>('Carro');
  const [quickTargetSlot, setQuickTargetSlot] = useState('A-02');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const [salesChartTab, setSalesChartTab] = useState<'daily' | 'monthly'>('daily');
  const [chartHoverInfo, setChartHoverInfo] = useState<string | null>(null);

  const filterCell = (cell: ParkingCell) => {
    if (activeFilter === 'all') return true;
    return cell.status === activeFilter;
  };

  const carsCells = cells.filter((c) => c.zone === 'Zona A').filter(filterCell);
  const motosCells = cells.filter((c) => c.zone === 'Zona B').filter(filterCell);
  const freeSlots = cells.filter((c) => c.status === 'free');

  const handleRefresh = () => {
    playCyberFeedback('laser', 0.25);
    setIsRefreshing(true);
    setScanActive(true);
    setTimeout(() => { setIsRefreshing(false); setScanActive(false); showToast('Telemetría cuántica sincronizada', 'info'); }, 900);
  };

  const handleQuickEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPlate || quickPlate.length < 3) {
      playCyberFeedback('click', 0.2);
      showToast('Ingrese un número de placa válido', 'warning');
      return;
    }
    const res = registerEntry(quickPlate, quickVehicleType, quickTargetSlot);
    if (res.success) {
      playCyberFeedback('checkout', 0.35);
      setQuickPlate('');
    }
  };

  const handleCellClick = (cell: ParkingCell) => {
    playCyberFeedback('click', 0.15);
    if (cell.status === 'occupied') {
      setSelectedCellForModal(cell);
    } else if (cell.status === 'free') {
      setQuickTargetSlot(cell.id);
      setQuickVehicleType(cell.category);
      showToast(`Bahía ${cell.id} seleccionada`, 'info');
      document.getElementById('qp-input')?.focus();
    } else {
      showToast(`Bahía ${cell.id}: ${cell.maintenanceReason || 'En mantenimiento'}`, 'warning');
    }
  };

  return (
    <div className="p-5 flex flex-col gap-5 max-w-[1800px] mx-auto w-full">

      {/* ── CRITICAL ALERT BANNER ── */}
      {isCapacityCritical && thresholdSettings.enableVisualAlert && !isAlertDismissed && (
        <div className="relative rounded-2xl overflow-hidden p-4 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{
          background: 'linear-gradient(135deg, rgba(60,0,20,0.9) 0%, rgba(30,0,10,0.95) 100%)',
          border: '2px solid rgba(255,42,109,0.6)',
          boxShadow: '0 0 40px rgba(255,42,109,0.3), inset 0 0 40px rgba(255,42,109,0.05)',
          animation: 'neon-border-pulse 1.5s ease-in-out infinite',
        }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 animate-pulse" style={{
              background: 'rgba(255,42,109,0.2)',
              border: '1px solid rgba(255,42,109,0.5)',
              boxShadow: '0 0 20px rgba(255,42,109,0.5)',
            }}>
              <span className="material-symbols-outlined text-[28px] text-red-400">warning</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-hud text-[14px] font-black text-red-200 tracking-wider">LOCKDOWN ALARM // AFORO {occupancyPercent}%</span>
                <span className="cyber-tag text-red-400 border-red-400/40 bg-red-500/15">UMBRAL: {thresholdSettings.criticalThreshold}%</span>
              </div>
              <p className="text-[11px] text-red-300/80 mt-1 font-mono">
                {totalOccupied} de {totalCapacity} bahías ocupadas — {totalCapacity - totalOccupied} libres restantes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={dismissAlert} type="button" className="px-3.5 py-2 rounded-xl font-mono text-xs text-red-300 transition-all flex items-center gap-1.5" style={{
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,42,109,0.3)',
            }}>
              <span className="material-symbols-outlined text-[16px]">volume_off</span> Silenciar
            </button>
            <button onClick={() => setActiveView('tarifas-y-celdas')} type="button" className="px-4 py-2 rounded-xl font-hud text-xs font-black text-white transition-all flex items-center gap-1.5" style={{
              background: 'linear-gradient(135deg, rgba(255,42,109,0.8), rgba(200,0,60,0.9))',
              boxShadow: '0 0 20px rgba(255,42,109,0.5)',
            }}>
              <span className="material-symbols-outlined text-[16px]">tune</span> Ajustar Umbrales
            </button>
          </div>
        </div>
      )}

      {/* ── REAL-TIME CLIENT AUTO-OCCUPY TELEMETRY BANNER ── */}
      {lastLiveEvent && (
        <div
          className="p-3.5 rounded-xl border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse"
          style={{
            background: 'linear-gradient(90deg, rgba(0,255,157,0.12) 0%, rgba(2,15,25,0.92) 100%)',
            boxShadow: '0 0 25px rgba(0,255,157,0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <div>
              <div className="font-mono text-xs font-black text-emerald-300 flex items-center gap-2">
                <span>📡 TELEMETRÍA EN TIEMPO REAL // AUTOGESTIÓN CLIENTE</span>
                <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-200">
                  EN VIVO
                </span>
              </div>
              <p className="font-mono text-[11px] text-slate-300 mt-0.5">
                El conductor <strong className="text-white">{lastLiveEvent.driver}</strong> ha ocupado la bahía <strong className="text-emerald-400 font-bold">{lastLiveEvent.cellId}</strong> con vehículo <span className="text-yellow-300 font-bold font-mono">[{lastLiveEvent.plate}]</span> ({lastLiveEvent.time}).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const target = cells.find((c) => c.id === lastLiveEvent.cellId);
                if (target) setSelectedCellForModal(target);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-hud text-[10px] font-bold hover:bg-emerald-500/30 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,157,0.2)]"
            >
              [ VER DETALLES CELDA ]
            </button>
          </div>
        </div>
      )}

      {/* ── COMMAND HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl p-4" style={{
        background: 'linear-gradient(160deg, rgba(6,12,32,0.9) 0%, rgba(2,5,16,0.95) 100%)',
        border: '1px solid rgba(0,240,255,0.18)',
        boxShadow: '0 0 20px rgba(0,240,255,0.06)',
      }}>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-cyan-300" style={{
              background: 'rgba(0,240,255,0.08)',
              border: '1px solid rgba(0,240,255,0.25)',
              boxShadow: '0 0 20px rgba(0,240,255,0.15)',
            }}>
              <span className="material-symbols-outlined text-[26px]">grid_view</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-hud text-[17px] font-black text-white tracking-wide">PANEL OPERATIVO</h1>
                <span className="cyber-tag text-emerald-400 border-emerald-500/30 bg-emerald-500/8 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />EN VIVO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">HUD Telemetría 3D · Monitoreo de bahías en tiempo real</p>
            </div>
          </div>

          {/* Level selector */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,240,255,0.2)',
          }}>
            <span className="material-symbols-outlined text-cyan-400 text-[17px]">layers</span>
            <select
              value={selectedLevel}
              onChange={(e) => { setSelectedLevel(e.target.value); showToast(`Nivel: ${e.target.options[e.target.selectedIndex].text}`, 'info'); }}
              className="bg-transparent font-mono text-[11px] font-semibold text-cyan-200 focus:outline-none cursor-pointer"
            >
              <option value="lvl-1" className="bg-slate-900">Nivel 1 – Principal (50)</option>
              <option value="lvl-2" className="bg-slate-900">Nivel 2 – Subsuelo (40)</option>
              <option value="lvl-vip" className="bg-slate-900">VIP – Zona Eléctrica</option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={handleRefresh} type="button" className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all" style={{
            background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.2)',
            color: isRefreshing ? '#00f0ff' : '#94a3b8',
          }}>
            <span className={`material-symbols-outlined text-[17px] transition-transform duration-500 ${isRefreshing ? 'rotate-180 text-cyan-400' : ''}`}>autorenew</span>
            SINCRONIZAR
          </button>
          <button onClick={() => setActiveView('registro-de-entrada')} type="button" className="btn-neon flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-hud text-[11px] font-black text-slate-950 transition-all" style={{
            background: 'linear-gradient(135deg, #00f0ff, #0080ff)',
            boxShadow: '0 0 20px rgba(0,240,255,0.4)',
          }}>
            <span className="material-symbols-outlined text-[17px]">directions_car</span>
            NUEVO INGRESO
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/25">F1</span>
          </button>
          <button onClick={() => setActiveView('salida-y-cobro')} type="button" className="btn-neon flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-hud text-[11px] font-black text-slate-950 transition-all" style={{
            background: 'linear-gradient(135deg, #00ff9d, #00c870)',
            boxShadow: '0 0 20px rgba(0,255,157,0.4)',
          }}>
            <span className="material-symbols-outlined text-[17px]">point_of_sale</span>
            COBRO Y SALIDA
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/25">F2</span>
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="AFORO GENERAL // TELEMETRÍA"
          value={`${occupancyPercent}%`}
          sub={`${totalOccupied} de ${totalCapacity} bahías`}
          icon="donut_large"
          accent={isCapacityCritical ? 'red' : isCapacityWarning ? 'amber' : 'cyan'}
          ring={occupancyPercent}
          ringColor={isCapacityCritical ? '#ff2a6d' : isCapacityWarning ? '#ffb703' : '#00f0ff'}
        />
        <KpiCard
          label="ZONA A // CARROS"
          value={occupiedCarsCount}
          sub={`${freeCarsCount} bahías libres`}
          icon="directions_car"
          accent="cyan"
          ring={Math.round((occupiedCarsCount / 30) * 100)}
          ringColor="#00f0ff"
        />
        <KpiCard
          label="ZONA B // MOTOS"
          value={occupiedMotosCount}
          sub={`${freeMotosCount} bahías libres`}
          icon="two_wheeler"
          accent="violet"
          ring={Math.round((occupiedMotosCount / 20) * 100)}
          ringColor="#8b5cf6"
        />
        <KpiCard
          label="RECAUDO TURNO // COP"
          value={`$${todayRevenue.toLocaleString('es-CO')}`}
          sub={`${todayEntriesCount} ingresos hoy`}
          icon="payments"
          accent="emerald"
        />
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

        {/* ── LEFT: BAY GRID ── */}
        <div className="xl:col-span-8 flex flex-col gap-4">

          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl" style={{
            background: 'rgba(3,6,18,0.9)', border: '1px solid rgba(0,240,255,0.12)',
          }}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-cyan-400/60 font-bold tracking-wider hidden md:inline">FILTRO:</span>
              <div className="inline-flex p-1 rounded-xl gap-1" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,240,255,0.1)' }}>
                {[
                  { id: 'all',      label: `Todas (${totalCapacity})` },
                  { id: 'free',     label: `Libres (${totalCapacity - totalOccupied - 2})` },
                  { id: 'occupied', label: `Ocupadas (${totalOccupied})` },
                  { id: 'blocked',  label: 'Mant. (2)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all ${
                      activeFilter === tab.id
                        ? 'text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    style={activeFilter === tab.id ? {
                      background: 'linear-gradient(135deg, #00f0ff, #0080ff)',
                      boxShadow: '0 0 12px rgba(0,240,255,0.4)',
                    } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px] text-slate-500">
              {[
                { color: '#00ff9d', label: 'Libre' },
                { color: '#ff2a6d', label: 'Ocupada' },
                { color: '#ffb703', label: 'Mantenimiento' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Zone A - Cars */}
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(160deg, rgba(6,12,32,0.92) 0%, rgba(2,5,16,0.96) 100%)',
            border: '1px solid rgba(0,240,255,0.18)',
          }}>
            <div className="relative p-4 flex items-center justify-between" style={{
              borderBottom: '1px solid rgba(0,240,255,0.1)',
            }}>
              {/* Scan line effect */}
              {scanActive && (
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-laser pointer-events-none" />
              )}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-cyan-300" style={{
                  background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)',
                  boxShadow: '0 0 12px rgba(0,240,255,0.15)',
                }}>
                  <span className="material-symbols-outlined text-[20px]">directions_car</span>
                </div>
                <div>
                  <h2 className="font-hud text-[13px] font-bold text-white tracking-wider">ZONA A // CARROS Y CAMIONETAS</h2>
                  <span className="font-mono text-[9px] text-cyan-400/70">30 BAHÍAS · A-01 AL A-30</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="cyber-tag text-emerald-400 border-emerald-500/30">{freeCarsCount} LIBRES</span>
                <span className="cyber-tag text-rose-400 border-rose-500/30">{occupiedCarsCount} OCUPADAS</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                {carsCells.map((cell) => (
                  <CellCard key={cell.id} cell={cell} onClick={() => handleCellClick(cell)} />
                ))}
              </div>
            </div>
          </div>

          {/* Zone B - Motos */}
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(160deg, rgba(8,5,24,0.92) 0%, rgba(2,2,16,0.96) 100%)',
            border: '1px solid rgba(139,92,246,0.2)',
          }}>
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-violet-300" style={{
                  background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                  boxShadow: '0 0 12px rgba(139,92,246,0.15)',
                }}>
                  <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
                </div>
                <div>
                  <h2 className="font-hud text-[13px] font-bold text-white tracking-wider">ZONA B // MOTOCICLETAS</h2>
                  <span className="font-mono text-[9px] text-violet-400/70">20 BAHÍAS · B-01 AL B-20</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="cyber-tag text-emerald-400 border-emerald-500/30">{freeMotosCount} LIBRES</span>
                <span className="cyber-tag text-rose-400 border-rose-500/30">{occupiedMotosCount} OCUPADAS</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                {motosCells.map((cell) => (
                  <CellCard key={cell.id} cell={cell} onClick={() => handleCellClick(cell)} />
                ))}
              </div>
            </div>
          </div>

          {/* 📊 ADMINISTRATOR LIVE SALES & ANALYTICS CHARTS (DÍA & MES) */}
          <div
            className="p-5 rounded-2xl border border-cyan-500/25 flex flex-col gap-5 mt-4"
            style={{
              background: 'linear-gradient(160deg, rgba(6,12,32,0.95) 0%, rgba(2,5,18,0.98) 100%)',
              boxShadow: '0 0 30px rgba(0,240,255,0.06)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                  <span className="material-symbols-outlined text-[20px]">insights</span>
                </div>
                <div>
                  <div className="font-hud text-sm font-black text-white flex items-center gap-2">
                    <span>ESTADÍSTICAS & VENTAS EN VIVO</span>
                    <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">ADMIN DASHBOARD</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-400">Telemetría financiera en tiempo real, curva horaria del día y facturación mensual consolidada.</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center p-1 rounded-xl bg-black/60 border border-cyan-500/30">
                <button
                  type="button"
                  onClick={() => { playCyberFeedback('click', 0.2); setSalesChartTab('daily'); }}
                  className={`px-3.5 py-1.5 rounded-lg font-hud text-[10px] font-black transition-all cursor-pointer ${
                    salesChartTab === 'daily'
                      ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📊 VENTAS HOY (EN VIVO)
                </button>
                <button
                  type="button"
                  onClick={() => { playCyberFeedback('click', 0.2); setSalesChartTab('monthly'); }}
                  className={`px-3.5 py-1.5 rounded-lg font-hud text-[10px] font-black transition-all cursor-pointer ${
                    salesChartTab === 'monthly'
                      ? 'bg-violet-500/25 border border-violet-400 text-violet-200 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📈 VENTAS DEL MES (30 DÍAS)
                </button>
              </div>
            </div>

            {/* TAB 1: DAILY LIVE SALES */}
            {salesChartTab === 'daily' && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                {/* 4 Daily Bento Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
                    <div className="font-mono text-[10px] text-slate-400 uppercase">Recaudo Total Hoy</div>
                    <div className="font-mono text-2xl font-black text-emerald-300 mt-0.5">$4.722.000 COP</div>
                    <div className="font-mono text-[9px] text-emerald-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">trending_up</span>
                      <span>+18.5% vs día promedio</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
                    <div className="font-mono text-[10px] text-slate-400 uppercase">Tickets Procesados</div>
                    <div className="font-mono text-2xl font-black text-cyan-300 mt-0.5">142 tickets</div>
                    <div className="font-mono text-[9px] text-cyan-400 mt-1">98 salidas liquidadas · 44 en patio</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-950/20">
                    <div className="font-mono text-[10px] text-slate-400 uppercase">Hora Pico de Recaudo</div>
                    <div className="font-mono text-xl font-black text-violet-300 mt-0.5">12:00 - 14:00 PM</div>
                    <div className="font-mono text-[9px] text-violet-400 mt-1">$980.000 COP liquidados en pico</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20">
                    <div className="font-mono text-[10px] text-slate-400 uppercase">Ticket Promedio</div>
                    <div className="font-mono text-2xl font-black text-amber-300 mt-0.5">$14.750 COP</div>
                    <div className="font-mono text-[9px] text-amber-400 mt-1">Permanencia prom: 2h 45m</div>
                  </div>
                </div>

                {/* Daily Chart + Vehicle Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* SVG Hourly Bar & Spline Chart */}
                  <div className="lg:col-span-8 p-4 rounded-xl border border-cyan-500/20 bg-black/60 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-hud text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        CURVA DE INGRESOS POR HORA (HOY)
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">Actualizado en vivo</span>
                    </div>

                    <div className="h-56 w-full relative">
                      <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="cyanBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#005577" stopOpacity="0.2" />
                          </linearGradient>
                          <linearGradient id="peakBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00ff9d" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="#007744" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="40" y1="30" x2="580" y2="30" stroke="rgba(0,240,255,0.1)" strokeDasharray="3" />
                        <line x1="40" y1="75" x2="580" y2="75" stroke="rgba(0,240,255,0.1)" strokeDasharray="3" />
                        <line x1="40" y1="120" x2="580" y2="120" stroke="rgba(0,240,255,0.1)" strokeDasharray="3" />
                        <line x1="40" y1="165" x2="580" y2="165" stroke="rgba(0,240,255,0.2)" />

                        {/* Y Axis Labels */}
                        <text x="35" y="34" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">$1.0M</text>
                        <text x="35" y="79" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">$700K</text>
                        <text x="35" y="124" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">$350K</text>
                        <text x="35" y="168" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">$0</text>

                        {/* Bars */}
                        {[
                          { x: 55,  h: 24,  val: '$140.000', hr: '06:00', n: 12 },
                          { x: 115, h: 72,  val: '$480.000', hr: '08:00', n: 34 },
                          { x: 175, h: 104, val: '$690.000', hr: '10:00', n: 48 },
                          { x: 235, h: 148, val: '$980.000', hr: '12:00', n: 68, peak: true },
                          { x: 295, h: 118, val: '$780.000', hr: '14:00', n: 52 },
                          { x: 355, h: 94,  val: '$620.000', hr: '16:00', n: 42 },
                          { x: 415, h: 76,  val: '$510.000', hr: '18:00', n: 35 },
                          { x: 475, h: 52,  val: '$340.000', hr: '20:00', n: 24 },
                          { x: 535, h: 28,  val: '$182.000', hr: '22:00', n: 14 },
                        ].map((b, i) => (
                          <g key={i} className="cursor-pointer group" onMouseEnter={() => setChartHoverInfo(`${b.hr} -> ${b.val} COP (${b.n} vehículos)`)} onMouseLeave={() => setChartHoverInfo(null)}>
                            <rect
                              x={b.x}
                              y={165 - b.h}
                              width="32"
                              height={b.h}
                              rx="4"
                              fill={b.peak ? 'url(#peakBarGrad)' : 'url(#cyanBarGrad)'}
                              stroke={b.peak ? '#00ff9d' : '#00f0ff'}
                              strokeWidth="1"
                              className="transition-all hover:opacity-100 opacity-80"
                            />
                            {b.peak && (
                              <text x={b.x + 16} y={165 - b.h - 6} fill="#00ff9d" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">PICO</text>
                            )}
                            <text x={b.x + 16} y="180" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">{b.hr}</text>
                          </g>
                        ))}

                        {/* Spline Line */}
                        <polyline
                          fill="none"
                          stroke="#00f0ff"
                          strokeWidth="2.5"
                          points="71,141 131,93 191,61 251,17 311,47 371,71 431,89 491,113 551,137"
                          style={{ filter: 'drop-shadow(0 0 6px rgba(0,240,255,0.7))' }}
                        />
                        {/* Nodes */}
                        {[[71,141], [131,93], [191,61], [251,17], [311,47], [371,71], [431,89], [491,113], [551,137]].map(([px, py], idx) => (
                          <circle key={idx} cx={px} cy={py} r={idx === 3 ? "5" : "3.5"} fill={idx === 3 ? "#00ff9d" : "#00f0ff"} stroke="#020510" strokeWidth="2" />
                        ))}
                      </svg>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[11px]">
                      <span className="text-slate-400">Detalle interactivo:</span>
                      <span className="text-cyan-300 font-bold">{chartHoverInfo || 'Pasa el cursor sobre las barras para ver recaudos por hora'}</span>
                    </div>
                  </div>

                  {/* Vehicle Category Breakdown */}
                  <div className="lg:col-span-4 p-4 rounded-xl border border-cyan-500/20 bg-black/60 flex flex-col justify-between gap-4">
                    <div className="font-hud text-xs font-bold text-white pb-2 border-b border-cyan-500/20">
                      VENTAS POR TIPO DE VEHÍCULO
                    </div>

                    <div className="flex flex-col gap-3 font-mono text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                            <span className="material-symbols-outlined text-[15px]">directions_car</span>
                            Carros (62%)
                          </span>
                          <span className="text-white font-bold">$2.927.640 COP</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" style={{ width: '62%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                            <span className="material-symbols-outlined text-[15px]">two_wheeler</span>
                            Motos (26%)
                          </span>
                          <span className="text-white font-bold">$1.227.720 COP</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-emerald-400 shadow-[0_0_8px_#00ff9d]" style={{ width: '26%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-1.5 text-violet-300 font-bold">
                            <span className="material-symbols-outlined text-[15px]">airport_shuttle</span>
                            Camionetas / SUV (12%)
                          </span>
                          <span className="text-white font-bold">$566.640 COP</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-violet-400 shadow-[0_0_8px_#8b5cf6]" style={{ width: '12%' }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                      <span>Rotación por bahía:</span>
                      <strong className="font-hud text-white">4.8 rotaciones/día</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MONTHLY ACCUMULATED SALES */}
            {salesChartTab === 'monthly' && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                {/* 4 Monthly Bento Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-950/20">
                    <div className="font-mono text-[10px] text-slate-400 uppercase">Recaudo Acumulado Mes</div>
                    <div className="font-mono text-2xl font-black text-violet-300 mt-0.5">$28.450.000 COP</div>
                    <div className="font-mono text-[9px] text-violet-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">trending_up</span>
                      <span>+18.4% vs mes anterior</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20">
                    <div className="font-mono text-[10px] text-slate-400 uppercase">Meta Mensual Proyectada</div>
                    <div className="font-mono text-2xl font-black text-amber-300 mt-0.5">$34.000.000 COP</div>
                    <div className="font-mono text-[9px] text-amber-400 mt-1">83.6% alcanzado a la fecha</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
                    <div className="font-mono text-[10px] text-slate-400 uppercase">Proyección Cierre Mes</div>
                    <div className="font-mono text-2xl font-black text-emerald-300 mt-0.5">$34.800.000 COP</div>
                    <div className="font-mono text-[9px] text-emerald-400 mt-1">Superávit proyectado: +$800.000</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
                    <div className="font-mono text-[10px] text-slate-400 uppercase">Días Mayor Afluencia</div>
                    <div className="font-mono text-xl font-black text-cyan-300 mt-0.5">Viernes & Sábados</div>
                    <div className="font-mono text-[9px] text-cyan-400 mt-1">Promedio: $1.420.000 / día</div>
                  </div>
                </div>

                {/* Monthly Chart + Payment Method Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-8 p-4 rounded-xl border border-violet-500/20 bg-black/60 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-hud text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                        RECAUDO ACUMULADO POR SEMANAS (MES EN CURSO)
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">Meta: $34M COP</span>
                    </div>

                    <div className="h-56 w-full relative">
                      <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="violetBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#3b0764" stopOpacity="0.2" />
                          </linearGradient>
                          <linearGradient id="activeMonthGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>

                        <line x1="50" y1="30" x2="570" y2="30" stroke="rgba(139,92,246,0.15)" strokeDasharray="3" />
                        <line x1="50" y1="75" x2="570" y2="75" stroke="rgba(139,92,246,0.15)" strokeDasharray="3" />
                        <line x1="50" y1="120" x2="570" y2="120" stroke="rgba(139,92,246,0.15)" strokeDasharray="3" />
                        <line x1="50" y1="165" x2="570" y2="165" stroke="rgba(139,92,246,0.3)" />

                        <text x="45" y="34" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">$10M</text>
                        <text x="45" y="79" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">$7.5M</text>
                        <text x="45" y="124" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">$5.0M</text>
                        <text x="45" y="168" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">$0</text>

                        {[
                          { x: 80,  w: 80, h: 102, val: '$6.850.000', label: 'Semana 1 (Días 1-7)', target: '$6.2M' },
                          { x: 210, w: 80, h: 111, val: '$7.420.000', label: 'Semana 2 (Días 8-14)', target: '$6.8M' },
                          { x: 340, w: 80, h: 122, val: '$8.150.000', label: 'Semana 3 (Días 15-21)', target: '$7.5M' },
                          { x: 470, w: 80, h: 90,  val: '$6.030.000', label: 'Semana 4 (Días 22-30)', inProgress: true, target: '$8.2M' },
                        ].map((m, idx) => (
                          <g key={idx} className="cursor-pointer group" onMouseEnter={() => setChartHoverInfo(`${m.label} -> ${m.val} COP (Meta: ${m.target})`)} onMouseLeave={() => setChartHoverInfo(null)}>
                            <rect
                              x={m.x}
                              y={165 - m.h}
                              width={m.w}
                              height={m.h}
                              rx="6"
                              fill={m.inProgress ? 'url(#activeMonthGrad)' : 'url(#violetBarGrad)'}
                              stroke={m.inProgress ? '#00f0ff' : '#8b5cf6'}
                              strokeWidth="1.5"
                              className="transition-all opacity-85 hover:opacity-100"
                            />
                            <text x={m.x + m.w / 2} y={165 - m.h - 8} fill={m.inProgress ? '#00f0ff' : '#c084fc'} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{m.val}</text>
                            <text x={m.x + m.w / 2} y="182" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">Sem {idx + 1}</text>
                          </g>
                        ))}

                        {/* Target Line */}
                        <line x1="50" y1="52" x2="570" y2="52" stroke="#ffb703" strokeWidth="2" strokeDasharray="5" style={{ filter: 'drop-shadow(0 0 5px #ffb703)' }} />
                        <text x="565" y="48" fill="#ffb703" fontSize="9" fontFamily="monospace" textAnchor="end">Meta Promedio Semanal ($7.5M)</text>
                      </svg>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[11px]">
                      <span className="text-slate-400">Detalle interactivo:</span>
                      <span className="text-violet-300 font-bold">{chartHoverInfo || 'Pasa el cursor sobre las barras de las semanas'}</span>
                    </div>
                  </div>

                  {/* Payment Methods Breakdown */}
                  <div className="lg:col-span-4 p-4 rounded-xl border border-violet-500/20 bg-black/60 flex flex-col justify-between gap-4">
                    <div className="font-hud text-xs font-bold text-white pb-2 border-b border-violet-500/20">
                      VENTAS POR MEDIO DE PAGO (MES)
                    </div>

                    <div className="flex flex-col gap-3 font-mono text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-emerald-300 font-bold">Billetera Conductor (34%)</span>
                          <span className="text-white font-bold">$9.673.000 COP</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-emerald-400 shadow-[0_0_8px_#00ff9d]" style={{ width: '34%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-cyan-300 font-bold">QR Nequi / Daviplata (31%)</span>
                          <span className="text-white font-bold">$8.819.500 COP</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" style={{ width: '31%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-violet-300 font-bold">Datáfono / Tarjetas (22%)</span>
                          <span className="text-white font-bold">$6.259.000 COP</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-violet-400 shadow-[0_0_8px_#8b5cf6]" style={{ width: '22%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-amber-300 font-bold">Efectivo en Taquilla (13%)</span>
                          <span className="text-white font-bold">$3.698.500 COP</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-amber-400 shadow-[0_0_8px_#ffb703]" style={{ width: '13%' }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[10px] font-mono text-violet-300 flex items-center justify-between">
                      <span>Cumplimiento del objetivo:</span>
                      <strong className="font-hud text-emerald-400">83.6% alcanzado</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: EXPRESS ENTRY + MOVEMENTS ── */}
        <div className="xl:col-span-4 flex flex-col gap-4">

          {/* Quick Entry Form */}
          <div className="relative rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(160deg, rgba(0,18,36,0.9) 0%, rgba(0,5,16,0.96) 100%)',
            border: '1px solid rgba(0,240,255,0.25)',
            boxShadow: '0 0 30px rgba(0,240,255,0.08)',
          }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{
              background: 'radial-gradient(circle at top right, rgba(0,240,255,0.08) 0%, transparent 70%)',
            }} />

            <div className="p-4 flex flex-col gap-3.5">
              <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(0,240,255,0.12)' }}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-[20px]">qr_code_scanner</span>
                  <span className="font-hud text-[12px] font-bold text-cyan-200 tracking-wider">INGRESO EXPRESS</span>
                </div>
                <span className="cyber-tag text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />LPR ON
                </span>
              </div>

              <form onSubmit={handleQuickEntrySubmit} className="flex flex-col gap-3">
                {/* Plate input */}
                <div>
                  <label className="font-mono text-[10px] text-slate-400 block mb-1.5 font-semibold tracking-wider">MATRÍCULA DEL VEHÍCULO</label>
                  <div className="relative">
                    <input
                      id="qp-input"
                      maxLength={7}
                      placeholder="ABC-123"
                      value={quickPlate}
                      onChange={(e) => setQuickPlate(e.target.value.toUpperCase())}
                      required type="text"
                      className="w-full rounded-xl px-4 py-3 font-label-plate text-[22px] text-center uppercase tracking-widest text-cyan-200 placeholder:text-slate-700 outline-none transition-all input-neon"
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(0,240,255,0.3)',
                        boxShadow: '0 0 15px rgba(0,240,255,0.08)',
                      }}
                    />
                    <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-cyan-500/60 pointer-events-none text-[20px]">camera</span>
                  </div>
                </div>

                {/* Vehicle type */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'Carro' as VehicleType, icon: 'directions_car', color: 'cyan' },
                    { val: 'Moto' as VehicleType,  icon: 'two_wheeler',    color: 'violet' },
                  ].map(({ val, icon, color }) => (
                    <label key={val} className={`flex items-center justify-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all border font-hud text-xs font-bold ${
                      quickVehicleType === val
                        ? color === 'cyan'
                          ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                          : 'bg-violet-500/15 border-violet-400/50 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                        : 'border-white/8 text-slate-500 hover:text-slate-300'
                    }`} style={quickVehicleType === val ? {} : { background: 'rgba(255,255,255,0.03)' }}>
                      <input type="radio" name="vt" value={val} checked={quickVehicleType === val} onChange={() => setQuickVehicleType(val)} className="hidden" />
                      <span className="material-symbols-outlined text-[17px]">{icon}</span>
                      {val}
                    </label>
                  ))}
                </div>

                {/* Slot + Submit */}
                <div className="flex gap-2">
                  <select
                    value={quickTargetSlot}
                    onChange={(e) => setQuickTargetSlot(e.target.value)}
                    className="w-1/2 rounded-xl px-3 py-2.5 font-mono text-[11px] text-cyan-200 outline-none transition-all"
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,240,255,0.2)', color: '#a5f3fc' }}
                  >
                    {freeSlots.slice(0, 12).map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900">Celda {s.id}</option>
                    ))}
                    {freeSlots.length === 0 && <option value="">Sin celdas</option>}
                  </select>
                  <button type="submit" className="btn-neon w-1/2 py-2.5 rounded-xl font-hud text-[11px] font-black text-slate-950 flex items-center justify-center gap-1.5 transition-all" style={{
                    background: 'linear-gradient(135deg, #00f0ff, #0080ff)',
                    boxShadow: '0 0 20px rgba(0,240,255,0.4)',
                  }}>
                    <span className="material-symbols-outlined text-[17px]">electric_bolt</span>
                    REGISTRAR
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Live Movements */}
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(160deg, rgba(6,12,32,0.9) 0%, rgba(2,5,16,0.95) 100%)',
            border: '1px solid rgba(0,240,255,0.15)',
          }}>
            <div className="p-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-[18px]">swap_vert</span>
                <h2 className="font-hud text-[11px] font-bold text-white tracking-wider">MOVIMIENTOS EN VIVO</h2>
              </div>
              <span className="font-mono text-[9px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />STREAM
              </span>
            </div>
            <div className="p-3 flex flex-col gap-1.5 max-h-72 overflow-y-auto">
              {movements.slice(0, 7).map((mov) => {
                const isEntry = mov.type === 'Entrada';
                return (
                  <div key={mov.id} className="data-row px-3 py-2.5 rounded-xl flex items-center justify-between transition-all" style={{
                    background: 'rgba(0,240,255,0.02)',
                    border: '1px solid rgba(0,240,255,0.06)',
                  }}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center`} style={{
                        background: isEntry ? 'rgba(0,255,157,0.1)' : 'rgba(255,42,109,0.1)',
                        border: `1px solid ${isEntry ? 'rgba(0,255,157,0.3)' : 'rgba(255,42,109,0.3)'}`,
                      }}>
                        <span className={`material-symbols-outlined text-[14px] ${isEntry ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isEntry ? 'login' : 'logout'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-plate text-[11px] text-white font-bold tracking-wider">{mov.plate}</span>
                        <span className="text-[9px] font-mono text-slate-500">{mov.vehicleType} · {mov.cellId}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {isEntry ? (
                        <span className="font-mono text-[10px] text-emerald-400 font-bold">ENTRADA</span>
                      ) : (
                        <span className="font-mono text-[10px] text-cyan-300 font-bold">${mov.amount?.toLocaleString('es-CO')}</span>
                      )}
                      <span className="text-[9px] font-mono text-slate-600">{mov.time}</span>
                    </div>
                  </div>
                );
              })}
              {movements.length === 0 && (
                <div className="text-center py-6 font-mono text-[10px] text-slate-600">SIN MOVIMIENTOS REGISTRADOS</div>
              )}
            </div>
          </div>

          {/* Hardware Status */}
          <div className="rounded-xl p-3.5 flex items-center justify-between" style={{
            background: 'rgba(3,6,18,0.85)',
            border: '1px solid rgba(0,240,255,0.1)',
          }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-cyan-400" style={{
                background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.2)',
              }}>
                <span className="material-symbols-outlined text-[18px]">print</span>
              </div>
              <div>
                <span className="font-hud text-[10px] font-bold text-white block">IMPRESORA TÉRMICA T-01</span>
                <span className="text-[9px] font-mono text-slate-500">Bobina 80mm: <span className="text-emerald-400">78%</span> disponible</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px #00ff9d' }} />
              <span className="font-mono text-[9px] text-emerald-400 font-bold">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

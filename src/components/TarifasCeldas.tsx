import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { VehicleType, ParkingCell, AlertSoundType } from '../types/parking.ts';
import { playCyberFeedback } from '../utils/audioAlert.ts';

export const TarifasCeldas: React.FC = () => {
  const {
    cells,
    tariffs,
    updateTariff,
    toggleCellMaintenance,
    totalOccupied,
    totalCapacity,
    occupancyPercent,
    occupiedCarsCount,
    occupiedMotosCount,
    thresholdSettings,
    updateThresholdSettings,
    isCapacityCritical,
    isCapacityWarning,
    playTestAlertSound,
    simulateCapacity,
    resetSimulatedCapacity,
    isSimulatedCapacity,
    showToast,
  } = useParking();

  // Active sub-view tab inside configuration
  const [activeConfigTab, setActiveConfigTab] = useState<'infrastructure' | 'thresholds'>('thresholds');

  // Cell management state
  const [selectedZone, setSelectedZone] = useState<'all' | 'Zona A' | 'Zona B'>('all');
  const [selectedCellToManage, setSelectedCellToManage] = useState<ParkingCell | null>(null);
  const [blockReason, setBlockReason] = useState('Mantenimiento Preventivo de Sensor');

  // Local state for thresholds
  const [localCritical, setLocalCritical] = useState<number>(thresholdSettings.criticalThreshold);
  const [localWarning, setLocalWarning] = useState<number>(thresholdSettings.warningThreshold);
  const [localVisualAlert, setLocalVisualAlert] = useState<boolean>(thresholdSettings.enableVisualAlert);
  const [localSoundAlert, setLocalSoundAlert] = useState<boolean>(thresholdSettings.enableSoundAlert);
  const [localSoundType, setLocalSoundType] = useState<AlertSoundType>(thresholdSettings.soundType);
  const [localVolume, setLocalVolume] = useState<number>(thresholdSettings.soundVolume);
  const [localRepeat, setLocalRepeat] = useState<number>(thresholdSettings.soundRepeatInterval);
  const [localAutoBlock, setLocalAutoBlock] = useState<boolean>(thresholdSettings.autoBlockOnMax);
  const [localZoneAlert, setLocalZoneAlert] = useState<boolean>(thresholdSettings.alertOnZoneCritical);
  const [isTestingSound, setIsTestingSound] = useState<boolean>(false);

  const filteredCells = cells.filter((c) => {
    if (selectedZone === 'all') return true;
    return c.zone === selectedZone;
  });

  const handleSaveThresholds = () => {
    playCyberFeedback('checkout', 0.25);
    updateThresholdSettings({
      criticalThreshold: localCritical,
      warningThreshold: localWarning,
      enableVisualAlert: localVisualAlert,
      enableSoundAlert: localSoundAlert,
      soundType: localSoundType,
      soundVolume: localVolume,
      soundRepeatInterval: localRepeat,
      autoBlockOnMax: localAutoBlock,
      alertOnZoneCritical: localZoneAlert,
    });
    showToast('Umbrales y parámetros de aforo sincronizados exitosamente', 'success');
  };

  const handleTestSound = (type?: AlertSoundType, vol?: number) => {
    setIsTestingSound(true);
    playTestAlertSound(type || localSoundType, vol !== undefined ? vol : localVolume);
    setTimeout(() => setIsTestingSound(false), 900);
  };

  const handleQuickCriticalSelect = (val: number) => {
    playCyberFeedback('click', 0.15);
    setLocalCritical(val);
    updateThresholdSettings({ criticalThreshold: val });
  };

  const handleQuickWarningSelect = (val: number) => {
    playCyberFeedback('click', 0.15);
    setLocalWarning(val);
    updateThresholdSettings({ warningThreshold: val });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
      
      {/* ── TOP HUD HEADER BANNER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgba(8,16,42,0.92) 0%, rgba(4,8,24,0.96) 100%)',
        border: '1px solid rgba(0,240,255,0.25)',
        boxShadow: '0 0 35px rgba(0,240,255,0.08), inset 0 0 20px rgba(0,240,255,0.03)',
      }}>
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        
        {/* HUD corner brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyan-400" />
        <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyan-400" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyan-400" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyan-400" />

        <div className="flex flex-col z-10">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[11px] tracking-widest uppercase mb-1">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              CONFIGURACIÓN DEL SISTEMA
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-bold">MATRICES DE CONTROL & AFORO</span>
          </div>
          <h1 className="font-hud text-[24px] md:text-[28px] font-black text-white tracking-wider flex items-center gap-3">
            <span>CONFIGURACIÓN DEL SISTEMA Y UMBRALES</span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              PRD 3.2
            </span>
          </h1>
          <p className="font-sans text-[13px] text-slate-400 mt-0.5">
            Administración de umbrales máximos de aforo, alertas visuales/sonoras al 90% y gestión física de bahías
          </p>
        </div>

        {/* Live Aforo Badge */}
        <div className="flex items-center gap-3 z-10 self-start lg:self-auto">
          <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 shadow-lg transition-all ${
            isCapacityCritical
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-[0_0_20px_rgba(255,42,109,0.3)] animate-pulse'
              : isCapacityWarning
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(255,183,3,0.25)]'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(0,255,157,0.15)]'
          }`}>
            <span className={`w-3 h-3 rounded-full shrink-0 ${
              isCapacityCritical ? 'bg-rose-500 animate-ping' : isCapacityWarning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-ping'
            }`} />
            <div className="flex flex-col">
              <span className="font-hud text-[10px] uppercase font-bold tracking-wider">
                {isCapacityCritical ? 'AFORO CRÍTICO DISPARADO' : isCapacityWarning ? 'AFORO PREVENTIVO' : 'AFORO EN RANGO NOMINAL'}
              </span>
              <span className="font-mono text-[14px] font-black">
                {occupancyPercent}% ({totalOccupied}/{totalCapacity} ocupadas)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS: THRESHOLDS VS INFRASTRUCTURE ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl border border-cyan-500/20 w-full sm:w-fit" style={{
        background: 'rgba(4,8,24,0.85)',
      }}>
        <button
          type="button"
          onClick={() => {
            playCyberFeedback('click', 0.15);
            setActiveConfigTab('thresholds');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-hud text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            activeConfigTab === 'thresholds'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">notifications_active</span>
          <span>UMBRALES DE AFORO & ALERTAS (90%)</span>
          {isCapacityCritical && (
            <span className="px-2 py-0.5 rounded-full text-[9px] bg-rose-500 text-white font-mono font-bold animate-pulse">
              ALERTA
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            playCyberFeedback('click', 0.15);
            setActiveConfigTab('infrastructure');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-hud text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            activeConfigTab === 'infrastructure'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-400 shadow-[0_0_15px_rgba(255,183,3,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">grid_view</span>
          <span>TARIFAS & BAHÍAS FÍSICAS</span>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">({totalCapacity} celdas)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: UMBRALES DE AFORO & NOTIFICACIONES (TAB 1)                      */}
      {/* ========================================================================= */}
      {activeConfigTab === 'thresholds' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          {/* Live Status and Interactive Simulation Deck */}
          <div className="rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col gap-5" style={{
            background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
            border: '1px solid rgba(0,240,255,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-[24px]">speed</span>
                  <h2 className="font-hud text-[16px] font-bold text-white tracking-wider">
                    MONITOR EN TIEMPO REAL & VERIFICACIÓN DE AFORO
                  </h2>
                </div>
                <p className="font-sans text-[12px] text-slate-400 mt-1">
                  Telemetría continua del aforo en patio y verificación de comportamiento de alarmas
                </p>
              </div>

              {/* Simulation Quick Triggers */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase text-slate-400 mr-1 font-bold">
                  Simular Escenarios:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playCyberFeedback('laser', 0.3);
                    simulateCapacity(90);
                  }}
                  className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/35 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,42,109,0.3)] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">warning</span>
                  <span>Simular 90% (Crítico)</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    playCyberFeedback('laser', 0.3);
                    simulateCapacity(96);
                  }}
                  className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold bg-rose-600/20 text-rose-200 border border-rose-600/40 hover:bg-rose-600/35 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Simular 96%</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    playCyberFeedback('click', 0.15);
                    simulateCapacity(75);
                  }}
                  className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/35 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Simular 75%</span>
                </button>

                {isSimulatedCapacity && (
                  <button
                    type="button"
                    onClick={() => {
                      playCyberFeedback('click', 0.15);
                      resetSimulatedCapacity();
                    }}
                    className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400 hover:bg-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                    <span>Restablecer Real</span>
                  </button>
                )}
              </div>
            </div>

            {/* Aforo Visual Gauge Bar */}
            <div className="p-4 rounded-xl border border-cyan-500/20 flex flex-col gap-3" style={{ background: 'rgba(2,5,16,0.75)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-hud text-[12px] text-white">OCUPACIÓN GLOBAL:</span>
                  <span className={`font-mono text-[20px] font-black ${
                    occupancyPercent >= localCritical ? 'text-rose-400 glow-text-red' : occupancyPercent >= localWarning ? 'text-amber-400' : 'text-cyan-300 glow-text-cyan'
                  }`}>
                    {occupancyPercent}%
                  </span>
                  <span className="font-mono text-slate-400">
                    ({totalOccupied} de {totalCapacity} celdas ocupadas)
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-slate-400">
                    Zona A (Carros): <strong className="text-cyan-300">{occupiedCarsCount}/30</strong>
                  </span>
                  <span className="text-slate-400">
                    Zona B (Motos): <strong className="text-violet-300">{occupiedMotosCount}/20</strong>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {totalCapacity - totalOccupied} libres
                  </span>
                </div>
              </div>

              {/* Progress bar with marked threshold ticks */}
              <div className="relative w-full h-5 rounded-full overflow-hidden border border-cyan-500/30 shadow-inner" style={{ background: 'rgba(0,0,0,0.6)' }}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    occupancyPercent >= localCritical
                      ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 shadow-[0_0_20px_rgba(255,42,109,0.8)]'
                      : occupancyPercent >= localWarning
                      ? 'bg-gradient-to-r from-cyan-500 to-amber-500 shadow-[0_0_15px_rgba(255,183,3,0.5)]'
                      : 'bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  }`}
                  style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                />

                {/* Warning threshold indicator tick */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 shadow-[0_0_6px_#ffb703]"
                  style={{ left: `${localWarning}%` }}
                />

                {/* Critical threshold indicator tick */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-rose-400 z-10 shadow-[0_0_8px_#ff2a6d]"
                  style={{ left: `${localCritical}%` }}
                />
              </div>

              {/* Threshold indicator labels underneath */}
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 pt-0.5">
                <span>0%</span>
                <span className="text-amber-400 font-bold" style={{ marginLeft: `${localWarning - 15}%` }}>
                  ▲ Alerta Preventiva ({localWarning}%)
                </span>
                <span className="text-rose-400 font-bold" style={{ marginRight: `${100 - localCritical - 5}%` }}>
                  ▲ Umbral Crítico ({localCritical}%)
                </span>
                <span>100%</span>
              </div>
            </div>

            {/* Simulated Banner Warning notice if active */}
            {isSimulatedCapacity && (
              <div className="p-3 bg-cyan-950/60 border border-cyan-400 text-cyan-200 rounded-xl text-xs flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-cyan-400 animate-spin-slow">science</span>
                  <span>
                    <strong>MODO SIMULACIÓN TELEMÉTRICA ACTIVO:</strong> El aforo virtual está forzado al {occupancyPercent}% para validar las respuestas de audio y alertas.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playCyberFeedback('click', 0.2);
                    resetSimulatedCapacity();
                  }}
                  className="text-xs font-bold text-cyan-400 underline hover:text-white cursor-pointer"
                >
                  Restablecer
                </button>
              </div>
            )}
          </div>

          {/* 2-Column Bento Grid: Thresholds vs Audio/Visual Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUMN 1: DEFINICIÓN DE UMBRALES DE AFORO */}
            <div className="rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col justify-between gap-5" style={{
              background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
              border: '1px solid rgba(0,240,255,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-400 text-[24px]">tune</span>
                    <h3 className="font-hud text-[14px] font-bold text-white tracking-wider">
                      1. DEFINICIÓN DE UMBRALES DE AFORO
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-cyan-500/10 rounded-lg font-mono text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                    TOTAL: {totalCapacity} BAHÍAS
                  </span>
                </div>

                {/* Critical Threshold Setting */}
                <div className="p-4 rounded-xl border border-rose-500/30 flex flex-col gap-3" style={{ background: 'rgba(2,5,16,0.7)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-hud text-[12px] font-bold text-rose-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[17px]">error</span>
                        UMBRAL CRÍTICO DE AFORO MÁXIMO
                      </span>
                      <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                        Porcentaje en el cual se disparan las alertas sonoras y visuales automáticas
                      </p>
                    </div>
                    <div className="bg-rose-950/60 px-3 py-1 rounded-lg border border-rose-500/40">
                      <span className="font-mono text-[20px] font-black text-rose-300 glow-text-red">
                        {localCritical}%
                      </span>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] font-mono text-slate-400">70%</span>
                    <input
                      type="range"
                      min={70}
                      max={100}
                      step={1}
                      value={localCritical}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setLocalCritical(val);
                        updateThresholdSettings({ criticalThreshold: val });
                      }}
                      className="cyber-range"
                    />
                    <span className="text-[10px] font-mono text-slate-400">100%</span>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Preajustes:</span>
                    {[80, 85, 90, 95].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleQuickCriticalSelect(val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                          localCritical === val
                            ? 'bg-rose-500/30 text-rose-200 border-rose-400 shadow-[0_0_12px_rgba(255,42,109,0.4)]'
                            : 'bg-black/40 text-slate-400 hover:text-white border-white/10'
                        }`}
                      >
                        {val}% {val === 90 ? '(Recomendado)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warning Threshold Setting */}
                <div className="p-4 rounded-xl border border-amber-500/30 flex flex-col gap-3" style={{ background: 'rgba(2,5,16,0.7)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-hud text-[12px] font-bold text-amber-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[17px]">warning</span>
                        UMBRAL PREVENTIVO (ADVERTENCIA)
                      </span>
                      <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                        Alerta temprana para preparar desvíos o acelerar rotación vehicular
                      </p>
                    </div>
                    <div className="bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-500/40">
                      <span className="font-mono text-[18px] font-black text-amber-300">
                        {localWarning}%
                      </span>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] font-mono text-slate-400">50%</span>
                    <input
                      type="range"
                      min={50}
                      max={85}
                      step={1}
                      value={localWarning}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setLocalWarning(val);
                        updateThresholdSettings({ warningThreshold: val });
                      }}
                      className="cyber-range"
                    />
                    <span className="text-[10px] font-mono text-slate-400">85%</span>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Preajustes:</span>
                    {[65, 70, 75, 80].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleQuickWarningSelect(val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                          localWarning === val
                            ? 'bg-amber-500/30 text-amber-200 border-amber-400 shadow-[0_0_12px_rgba(255,183,3,0.4)]'
                            : 'bg-black/40 text-slate-400 hover:text-white border-white/10'
                        }`}
                      >
                        {val}% {val === 75 ? '(Por Defecto)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Capacity Policies */}
                <div className="flex flex-col gap-2 pt-1">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-white/10 hover:border-cyan-500/30 cursor-pointer transition-all" style={{ background: 'rgba(2,5,16,0.6)' }}>
                    <input
                      type="checkbox"
                      checked={localAutoBlock}
                      onChange={(e) => {
                        setLocalAutoBlock(e.target.checked);
                        updateThresholdSettings({ autoBlockOnMax: e.target.checked });
                      }}
                      className="mt-1 accent-cyan-400 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-hud text-[11px] text-white font-bold">
                        BLOQUEO AUTOMÁTICO DE NUEVOS INGRESOS AL 100%
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 mt-0.5">
                        Rechaza registros automáticos cuando no existan bahías libres para evitar sobrecupo.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-white/10 hover:border-cyan-500/30 cursor-pointer transition-all" style={{ background: 'rgba(2,5,16,0.6)' }}>
                    <input
                      type="checkbox"
                      checked={localZoneAlert}
                      onChange={(e) => {
                        setLocalZoneAlert(e.target.checked);
                        updateThresholdSettings({ alertOnZoneCritical: e.target.checked });
                      }}
                      className="mt-1 accent-cyan-400 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-hud text-[11px] text-white font-bold">
                        MONITOREO INDEPENDIENTE POR ZONA (ZONA A / ZONA B)
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 mt-0.5">
                        Dispara alerta si la Zona A (Carros) o la Zona B (Motos) alcanzan el 90% independientemente del aforo global.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-500">
                  Parámetros sincronizados en tiempo real
                </span>
                <button
                  type="button"
                  onClick={handleSaveThresholds}
                  className="px-5 py-2.5 rounded-xl font-hud text-[11px] font-bold tracking-wider cursor-pointer cyber-btn-cyan"
                >
                  GUARDAR UMBRALES
                </button>
              </div>
            </div>

            {/* COLUMN 2: NOTIFICACIONES VISUALES Y SONORAS */}
            <div className="rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col justify-between gap-5" style={{
              background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
              border: '1px solid rgba(0,240,255,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-400 text-[24px]">campaign</span>
                    <h3 className="font-hud text-[14px] font-bold text-white tracking-wider">
                      2. NOTIFICACIONES VISUALES Y SONORAS
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400">Web Audio API Nativa</span>
                </div>

                {/* Sub-Card A: Configuración Visual */}
                <div className="p-4 rounded-xl border border-cyan-500/20 flex flex-col gap-3" style={{ background: 'rgba(2,5,16,0.7)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-cyan-400 text-[20px]">visibility</span>
                      <span className="font-hud text-[12px] font-bold text-white">
                        ALERTAS VISUALES EN PANTALLA
                      </span>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = !localVisualAlert;
                        setLocalVisualAlert(next);
                        updateThresholdSettings({ enableVisualAlert: next });
                        playCyberFeedback('click', 0.15);
                      }}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors border ${
                        localVisualAlert ? 'bg-cyan-500/40 border-cyan-400' : 'bg-black/60 border-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          localVisualAlert ? 'translate-x-6 bg-cyan-300 shadow-[0_0_8px_#00f0ff]' : 'translate-x-0 bg-slate-500'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="font-mono text-[10px] text-slate-400 leading-relaxed">
                    Muestra un banner superior destacado en el Panel Operativo, indicador pulsante en la barra superior y aviso en el módulo de Registro de Entrada cuando el aforo supere el {localCritical}%.
                  </p>

                  {/* Preview Banner of Visual Alert */}
                  <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center justify-between text-xs text-rose-300">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-400 text-[18px] animate-pulse">
                        error
                      </span>
                      <span className="font-mono text-[11px]">
                        <strong>Previsualización:</strong> &ldquo;⚠ Aforo Crítico al {localCritical}% — Bahías agotándose&rdquo;
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-500/30 text-rose-200 font-mono font-bold rounded text-[9px] border border-rose-500/50">
                      Banner Activo
                    </span>
                  </div>
                </div>

                {/* Sub-Card B: Configuración Sonora */}
                <div className="p-4 rounded-xl border border-cyan-500/20 flex flex-col gap-4" style={{ background: 'rgba(2,5,16,0.7)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-cyan-400 text-[20px]">volume_up</span>
                      <span className="font-hud text-[12px] font-bold text-white">
                        ALARMA AUDITIVA AL SUPERAR {localCritical}%
                      </span>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = !localSoundAlert;
                        setLocalSoundAlert(next);
                        updateThresholdSettings({ enableSoundAlert: next });
                        playCyberFeedback('click', 0.15);
                      }}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors border ${
                        localSoundAlert ? 'bg-cyan-500/40 border-cyan-400' : 'bg-black/60 border-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          localSoundAlert ? 'translate-x-6 bg-cyan-300 shadow-[0_0_8px_#00f0ff]' : 'translate-x-0 bg-slate-500'
                        }`}
                      />
                    </button>
                  </div>

                  {localSoundAlert && (
                    <div className="flex flex-col gap-3.5 pt-1 animate-in fade-in duration-150">
                      
                      {/* Sound Type Selection */}
                      <div>
                        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                          Tipo de Síntesis Sonora:
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'alarm', label: 'Alarma Industrial', icon: 'fmd_bad', desc: 'Pulsos de advertencia' },
                            { id: 'chime', label: 'Campana Melódica', icon: 'notifications', desc: 'Chime armónico' },
                            { id: 'beep', label: 'Doble Beep', icon: 'graphic_eq', desc: 'Beep dual de terminal' },
                          ].map((snd) => (
                            <button
                              key={snd.id}
                              type="button"
                              onClick={() => {
                                setLocalSoundType(snd.id as AlertSoundType);
                                updateThresholdSettings({ soundType: snd.id as AlertSoundType });
                                handleTestSound(snd.id as AlertSoundType);
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                localSoundType === snd.id
                                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                                  : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="material-symbols-outlined text-[18px] text-cyan-400">
                                  {snd.icon}
                                </span>
                                <span className="font-hud text-[11px] font-bold">{snd.label}</span>
                              </div>
                              <span className="font-mono text-[9px] text-slate-500">
                                {snd.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Volume Slider & Test Button with Waveform Visualizer */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                        <div className="flex-1 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between font-mono text-xs">
                            <span className="text-slate-400">Volumen del Sintetizador:</span>
                            <span className="text-cyan-300 font-bold font-mono">
                              {Math.round(localVolume * 100)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0.1}
                            max={1.0}
                            step={0.05}
                            value={localVolume}
                            onChange={(e) => {
                              const vol = parseFloat(e.target.value);
                              setLocalVolume(vol);
                              updateThresholdSettings({ soundVolume: vol });
                            }}
                            className="cyber-range"
                          />
                        </div>

                        {/* Visualizer & Test Button */}
                        <div className="flex items-center gap-3">
                          {/* Animated wave bars */}
                          <div className="flex items-end gap-1 h-7 px-2 py-1 bg-black/60 rounded-lg border border-cyan-500/30">
                            <span className={`w-1 rounded-full bg-cyan-400 ${isTestingSound ? 'audio-bar-1' : 'h-2'}`} />
                            <span className={`w-1 rounded-full bg-cyan-400 ${isTestingSound ? 'audio-bar-2' : 'h-3'}`} />
                            <span className={`w-1 rounded-full bg-cyan-300 ${isTestingSound ? 'audio-bar-3' : 'h-4'}`} />
                            <span className={`w-1 rounded-full bg-cyan-300 ${isTestingSound ? 'audio-bar-4' : 'h-3'}`} />
                            <span className={`w-1 rounded-full bg-cyan-400 ${isTestingSound ? 'audio-bar-5' : 'h-1.5'}`} />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleTestSound()}
                            disabled={isTestingSound}
                            className="px-4 py-2.5 rounded-xl font-hud text-[11px] font-bold tracking-wider cursor-pointer cyber-btn-cyan whitespace-nowrap"
                          >
                            <span className="material-symbols-outlined text-[17px] mr-1.5 align-middle">
                              {isTestingSound ? 'graphic_eq' : 'volume_up'}
                            </span>
                            <span>{isTestingSound ? 'SONANDO...' : 'PROBAR AUDIO'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Sound Repeat Interval */}
                      <div>
                        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                          Frecuencia de Repetición Sonora:
                        </span>
                        <select
                          value={localRepeat}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setLocalRepeat(val);
                            updateThresholdSettings({ soundRepeatInterval: val });
                          }}
                          className="w-full h-11 px-3 rounded-xl font-mono text-xs text-cyan-200 border border-cyan-500/30 focus:outline-none focus:border-cyan-400 cursor-pointer"
                          style={{ background: 'rgba(2,5,16,0.85)' }}
                        >
                          <option value={0} className="bg-slate-900 text-white">Solo una vez al cruzar el umbral del {localCritical}%</option>
                          <option value={30} className="bg-slate-900 text-white">Repetir cada 30 segundos si permanece en aforo crítico</option>
                          <option value={60} className="bg-slate-900 text-white">Repetir cada 60 segundos (Recomendado para evitar saturación)</option>
                          <option value={120} className="bg-slate-900 text-white">Repetir cada 2 minutos</option>
                        </select>
                      </div>

                    </div>
                  )}
                </div>
              </div>

              {/* Protocol Contingency Callout */}
              <div className="p-3.5 rounded-xl border border-cyan-500/25 flex items-start gap-3" style={{ background: 'rgba(0,240,255,0.05)' }}>
                <span className="material-symbols-outlined text-cyan-400 text-[20px] shrink-0 mt-0.5">policy</span>
                <div>
                  <strong className="font-hud text-[11px] text-cyan-300 block">PROTOCOLO OPERATIVO AL ALCANZAR {localCritical}%:</strong>
                  <p className="font-mono text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    1. La taquilla de entrada debe notificar aforo restringido al conductor.<br />
                    2. Al llegar al 100%, la barrera norte mantendrá bloqueo físico hasta el próximo despacho fiscal en caja.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: INFRAESTRUCTURA DE CELDAS Y TARIFAS (TAB 2)                    */}
      {/* ========================================================================= */}
      {activeConfigTab === 'infrastructure' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          {/* Top Holographic Tariff Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(tariffs) as VehicleType[]).map((cat) => {
              const item = tariffs[cat];
              const occupiedInCat = cells.filter(
                (c) => c.category === cat && c.status === 'occupied'
              ).length;

              const isCar = cat === 'Carro';
              const isMoto = cat === 'Moto';
              const borderGlow = isCar ? 'border-cyan-500/35' : isMoto ? 'border-violet-500/35' : 'border-amber-500/35';

              return (
                <div
                  key={cat}
                  className={`p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between border ${borderGlow}`}
                  style={{
                    background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-hud text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                        {cat}
                      </span>
                      <div className="font-mono text-[24px] font-black text-cyan-300 mt-1 glow-text-cyan">
                        ${item.ratePerHour.toLocaleString('es-CO')}
                        <span className="text-[11px] font-normal text-slate-400 ml-1">/h</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30">
                      {item.snapshotVersion}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-cyan-500/15 flex flex-col gap-1.5 font-mono text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Fracción (0-15 min):</span>
                      <span className="text-white font-bold">
                        ${item.minFraction.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ocupación actual:</span>
                      <span className="text-cyan-300 font-bold">
                        {occupiedInCat} ocupadas ({item.capacity} cupo)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid of Cells with Maintenance Controls */}
          <div className="rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col gap-4" style={{
            background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
            border: '1px solid rgba(0,240,255,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-[22px]">tune</span>
                <h2 className="font-hud text-[15px] font-bold text-white tracking-wider">
                  ESTADO DE BAHÍAS & GESTIÓN DE MANTENIMIENTO
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-400 uppercase">Filtrar Zona:</span>
                <div className="inline-flex p-1 rounded-xl border border-cyan-500/20" style={{ background: 'rgba(2,5,16,0.85)' }}>
                  {[
                    { id: 'all', label: 'Todas las Zonas' },
                    { id: 'Zona A', label: 'Zona A (Carros)' },
                    { id: 'Zona B', label: 'Zona B (Motos)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        playCyberFeedback('click', 0.15);
                        setSelectedZone(tab.id as any);
                      }}
                      className={`px-3 py-1 text-xs rounded-lg font-mono font-bold transition-all cursor-pointer ${
                        selectedZone === tab.id
                          ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <span className="material-symbols-outlined text-[16px] text-cyan-400">touch_app</span>
              <span>Haga clic en cualquier bahía para bloquearla por mantenimiento de sensor o liberarla al servicio.</span>
            </div>

            {/* Cells Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2.5 pt-1">
              {filteredCells.map((cell) => {
                const isBlocked = cell.status === 'blocked';
                const isOccupied = cell.status === 'occupied';

                let cardStyle = {
                  background: 'linear-gradient(160deg, rgba(0,20,10,0.6) 0%, rgba(0,5,15,0.8) 100%)',
                  border: '1px solid rgba(0,255,157,0.25)',
                };
                let icon = 'check_circle';
                let iconColor = 'text-emerald-400';
                let label = 'LIBRE';
                let labelColor = 'text-emerald-300';

                if (isBlocked) {
                  cardStyle = {
                    background: 'linear-gradient(160deg, rgba(40,25,0,0.8) 0%, rgba(15,10,0,0.9) 100%)',
                    border: '1px solid rgba(255,183,3,0.35)',
                  };
                  icon = 'construction';
                  iconColor = 'text-amber-400';
                  label = 'MANT.';
                  labelColor = 'text-amber-300';
                } else if (isOccupied) {
                  cardStyle = {
                    background: 'linear-gradient(160deg, rgba(50,0,20,0.85) 0%, rgba(15,0,8,0.95) 100%)',
                    border: '1px solid rgba(255,42,109,0.35)',
                  };
                  icon = 'directions_car';
                  iconColor = 'text-rose-400';
                  label = cell.plate || 'OCUPADA';
                  labelColor = 'text-yellow-300';
                }

                return (
                  <button
                    key={cell.id}
                    type="button"
                    onClick={() => {
                      playCyberFeedback('click', 0.2);
                      setSelectedCellToManage(cell);
                    }}
                    className="p-3 rounded-xl flex flex-col justify-between items-center text-center transition-all cursor-pointer min-h-[96px] cell-card group relative overflow-hidden"
                    style={cardStyle}
                  >
                    <div className="w-full flex items-center justify-between text-[11px] font-mono">
                      <span className="font-hud font-bold text-white">{cell.id}</span>
                      <span className="material-symbols-outlined text-[14px] text-slate-500">
                        {cell.category === 'Moto' ? 'two_wheeler' : 'directions_car'}
                      </span>
                    </div>
                    <span className={`material-symbols-outlined text-[22px] my-1 group-hover:scale-110 transition-transform ${iconColor}`}>
                      {icon}
                    </span>
                    <span className={`font-mono text-[10px] font-bold truncate max-w-full ${labelColor}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: MANAGE CELL MAINTENANCE ── */}
      {selectedCellToManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-md w-full rounded-2xl p-6 flex flex-col gap-4 overflow-hidden" style={{
            background: 'linear-gradient(160deg, rgba(8,16,44,0.98) 0%, rgba(3,7,20,0.99) 100%)',
            border: '1px solid rgba(0,240,255,0.4)',
            boxShadow: '0 0 60px rgba(0,240,255,0.15), 0 32px 80px rgba(0,0,0,0.9)',
          }}>
            {/* Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-[24px]">tune</span>
                <h3 className="font-hud text-[16px] font-black text-white tracking-wider">
                  BAHÍA {selectedCellToManage.id} ({selectedCellToManage.zone})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCellToManage(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-4 rounded-xl flex flex-col gap-2 font-mono text-xs border border-cyan-500/20" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <div className="flex justify-between">
                <span className="text-slate-400">Categoría asignada:</span>
                <span className="font-bold text-cyan-300">{selectedCellToManage.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado actual:</span>
                <span className="font-bold uppercase text-white">
                  {selectedCellToManage.status === 'blocked'
                    ? 'Bloqueada por mantenimiento'
                    : selectedCellToManage.status === 'occupied'
                    ? `Ocupada (${selectedCellToManage.plate})`
                    : 'Disponible'}
                </span>
              </div>
              {selectedCellToManage.maintenanceReason && (
                <div className="flex justify-between text-amber-300 font-semibold pt-1 border-t border-white/10">
                  <span>Motivo registrado:</span>
                  <span>{selectedCellToManage.maintenanceReason}</span>
                </div>
              )}
            </div>

            {selectedCellToManage.status === 'free' && (
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-mono uppercase text-slate-400" htmlFor="block-reason-input">
                  Motivo de Inhabilitación / Bloqueo:
                </label>
                <input
                  id="block-reason-input"
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ej. Falla en sensor ultrasónico, pintura de bahía..."
                  className="w-full h-11 px-3 rounded-xl font-mono text-xs text-white border border-amber-500/40 focus:outline-none focus:border-amber-400 transition-all"
                  style={{ background: 'rgba(0,0,0,0.6)' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    playCyberFeedback('laser', 0.3);
                    toggleCellMaintenance(selectedCellToManage.id, blockReason);
                    setSelectedCellToManage(null);
                  }}
                  className="w-full py-3 rounded-xl font-hud text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(255,183,3,0.35)] transition-all cursor-pointer"
                >
                  BLOQUEAR BAHÍA POR MANTENIMIENTO
                </button>
              </div>
            )}

            {selectedCellToManage.status === 'blocked' && (
              <button
                type="button"
                onClick={() => {
                  playCyberFeedback('checkout', 0.25);
                  toggleCellMaintenance(selectedCellToManage.id);
                  setSelectedCellToManage(null);
                }}
                className="w-full py-3 rounded-xl font-hud text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(0,255,157,0.35)] transition-all cursor-pointer"
              >
                HABILITAR BAHÍA AL SERVICIO
              </button>
            )}

            {selectedCellToManage.status === 'occupied' && (
              <div className="p-3 bg-rose-500/15 text-rose-300 border border-rose-500/35 rounded-xl text-xs font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>
                  Celda ocupada por el vehículo {selectedCellToManage.plate}. Proceda primero a liquidar la salida en caja para modificarla.
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedCellToManage(null)}
              className="w-full py-2.5 rounded-xl font-mono text-xs font-bold text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors cursor-pointer"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

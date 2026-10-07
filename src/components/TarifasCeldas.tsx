import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { VehicleType, ParkingCell, AlertSoundType } from '../types/parking.ts';

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
    isAlertDismissed,
    dismissAlert,
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
  const [blockReason, setBlockReason] = useState('Mantenimiento de Sensor');

  // Local state for threshold inputs before or during auto-saving
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
  };

  const handleTestSound = (type?: AlertSoundType, vol?: number) => {
    setIsTestingSound(true);
    playTestAlertSound(type || localSoundType, vol !== undefined ? vol : localVolume);
    setTimeout(() => setIsTestingSound(false), 800);
  };

  const handleQuickCriticalSelect = (val: number) => {
    setLocalCritical(val);
    updateThresholdSettings({ criticalThreshold: val });
  };

  const handleQuickWarningSelect = (val: number) => {
    setLocalWarning(val);
    updateThresholdSettings({ warningThreshold: val });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-text-secondary font-label-code text-[12px] uppercase tracking-wider mb-1">
            <span>Configuración del Sistema</span>
            <span>/</span>
            <span className="text-secondary font-semibold">Parámetros Operativos & Aforo</span>
          </div>
          <h1 className="font-sans text-[26px] font-bold text-on-surface tracking-tight">
            Configuración del Sistema y Umbrales
          </h1>
          <p className="text-[13px] text-text-secondary">
            Administración de umbrales máximos de aforo, alertas visuales/sonoras al 90% y gestión física de bahías
          </p>
        </div>

        {/* Live Aforo Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border shadow-xs flex items-center gap-2.5 ${
            isCapacityCritical
              ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
              : isCapacityWarning
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-surface-card border-surface-border text-text-primary'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${
              isCapacityCritical ? 'bg-red-600 animate-ping' : isCapacityWarning ? 'bg-amber-500' : 'bg-status-available animate-pulse'
            }`}></span>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase font-bold tracking-wider">
                {isCapacityCritical ? 'Aforo Crítico' : isCapacityWarning ? 'Aforo Preventivo' : 'Aforo Normal'}
              </span>
              <span className="font-label-code text-[13px] font-bold">
                {occupancyPercent}% ({totalOccupied}/{totalCapacity} ocupadas)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs between Threshold Settings & Cell Infrastructure */}
      <div className="flex items-center gap-2 p-1 bg-surface-card rounded-xl border border-surface-border shadow-xs w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveConfigTab('thresholds')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
            activeConfigTab === 'thresholds'
              ? 'bg-secondary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">notifications_active</span>
          <span>Umbrales de Aforo y Alertas (90%)</span>
          {isCapacityCritical && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold animate-pulse">
              ALERTA
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveConfigTab('infrastructure')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
            activeConfigTab === 'infrastructure'
              ? 'bg-secondary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">grid_view</span>
          <span>Tarifas y Bahías Físicas</span>
          <span className="text-[11px] opacity-75 font-label-code">({totalCapacity} celdas)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: UMBRALES DE AFORO Y NOTIFICACIONES (USER REQUEST FOCUS)          */}
      {/* ========================================================================= */}
      {activeConfigTab === 'thresholds' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          {/* Live Status and Interactive Simulation Bar */}
          <div className="bg-surface-card rounded-2xl p-6 border border-surface-border shadow-sm flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[24px]">speed</span>
                  <h2 className="font-sans text-[18px] font-bold text-text-primary">
                    Monitor en Tiempo Real y Verificación de Aforo
                  </h2>
                </div>
                <p className="text-[12px] text-text-secondary mt-0.5">
                  Visualice el estado del patio y compruebe el comportamiento de las alertas configuradas.
                </p>
              </div>

              {/* Simulation Quick Triggers */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] font-semibold text-text-secondary mr-1">
                  Probar Alertas:
                </span>
                <button
                  type="button"
                  onClick={() => simulateCapacity(90)}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 font-sans text-[12px] font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Simula 45 vehículos ocupados para activar inmediatamente la alerta del 90%"
                >
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>Simular 90% (45/50)</span>
                </button>
                <button
                  type="button"
                  onClick={() => simulateCapacity(96)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 font-sans text-[12px] font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Simula aforo casi lleno (96%)"
                >
                  <span>Simular 96%</span>
                </button>
                <button
                  type="button"
                  onClick={() => simulateCapacity(75)}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 font-sans text-[12px] font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Simula aforo preventivo al 75%"
                >
                  <span>Simular 75%</span>
                </button>
                {isSimulatedCapacity && (
                  <button
                    type="button"
                    onClick={resetSimulatedCapacity}
                    className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container text-text-primary border border-surface-border font-sans text-[12px] font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Restablecer Real</span>
                  </button>
                )}
              </div>
            </div>

            {/* Aforo Visual Gauge Bar */}
            <div className="bg-surface-container-low p-5 rounded-xl border border-surface-border flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-text-primary text-[14px]">Ocupación Global:</span>
                  <span className={`text-[18px] font-bold font-label-code ${
                    isCapacityCritical ? 'text-red-600' : isCapacityWarning ? 'text-amber-600' : 'text-primary'
                  }`}>
                    {occupancyPercent}%
                  </span>
                  <span className="text-text-secondary font-normal">
                    ({totalOccupied} de {totalCapacity} celdas en patio)
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-label-code">
                  <span className="text-text-secondary">
                    Zona A (Carros): <strong className="text-primary">{occupiedCarsCount}/30</strong>
                  </span>
                  <span className="text-text-secondary">
                    Zona B (Motos): <strong className="text-secondary">{occupiedMotosCount}/20</strong>
                  </span>
                  <span className="text-status-available font-bold">
                    {totalCapacity - totalOccupied} libres
                  </span>
                </div>
              </div>

              {/* Progress bar with marked threshold points */}
              <div className="relative w-full bg-surface-container-high h-4 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    occupancyPercent >= localCritical
                      ? 'bg-red-600 animate-pulse'
                      : occupancyPercent >= localWarning
                      ? 'bg-amber-500'
                      : 'bg-secondary'
                  }`}
                  style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                ></div>

                {/* Warning threshold indicator tick */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-700/80 z-10"
                  style={{ left: `${localWarning}%` }}
                  title={`Umbral preventivo: ${localWarning}%`}
                ></div>

                {/* Critical 90% threshold indicator tick */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-red-900 z-10 shadow-sm"
                  style={{ left: `${localCritical}%` }}
                  title={`Umbral crítico: ${localCritical}%`}
                ></div>
              </div>

              {/* Threshold indicator labels underneath */}
              <div className="flex items-center justify-between text-[11px] text-text-secondary pt-0.5 font-label-code">
                <span>0%</span>
                <span className="flex items-center gap-1 text-amber-600 font-bold" style={{ marginLeft: `${localWarning - 10}%` }}>
                  ▲ Alerta Preventiva ({localWarning}%)
                </span>
                <span className="flex items-center gap-1 text-red-600 font-bold" style={{ marginRight: `${100 - localCritical - 2}%` }}>
                  ▲ Umbral Crítico ({localCritical}%)
                </span>
                <span>100%</span>
              </div>
            </div>

            {/* Simulated Banner Warning notice if active */}
            {isSimulatedCapacity && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-600">science</span>
                  <span>
                    <strong>Modo Simulación Activo:</strong> El parqueadero está mostrando datos de prueba para verificar las notificaciones al {occupancyPercent}%.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetSimulatedCapacity}
                  className="text-xs font-bold text-blue-700 underline hover:text-blue-900 cursor-pointer"
                >
                  Volver al estado real
                </button>
              </div>
            )}
          </div>

          {/* Grid: 2 Columns for Configurations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUMN 1: DEFINICIÓN DE UMBRALES DE AFORO */}
            <div className="bg-surface-card rounded-2xl p-6 border border-surface-border shadow-sm flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-[24px]">tune</span>
                    <h3 className="font-sans text-[17px] font-bold text-text-primary">
                      1. Definición de Umbrales de Aforo
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 bg-surface-container rounded-md font-label-code text-[11px] font-bold text-primary">
                    Aforo Total: {totalCapacity} Bahías
                  </span>
                </div>

                {/* Critical Threshold Setting (Default 90%) */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-surface-border flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-bold text-red-600 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        Umbral Crítico de Aforo Máximo
                      </span>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Porcentaje en el cual se disparan las alertas sonoras y visuales automáticas
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-red-200 shadow-xs">
                      <span className="font-label-code text-[20px] font-bold text-red-600">
                        {localCritical}%
                      </span>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] text-text-secondary font-label-code">70%</span>
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
                      className="w-full accent-red-600 cursor-pointer h-2 bg-surface-container-high rounded-lg"
                    />
                    <span className="text-[11px] text-text-secondary font-label-code">100%</span>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[11px] text-text-secondary font-medium">Preajustes rápidos:</span>
                    {[80, 85, 90, 95].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleQuickCriticalSelect(val)}
                        className={`px-2.5 py-1 rounded text-xs font-label-code font-bold transition-all cursor-pointer ${
                          localCritical === val
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-white text-text-secondary hover:text-text-primary border border-surface-border'
                        }`}
                      >
                        {val}% {val === 90 ? '(Recomendado)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warning Threshold Setting (Default 75%) */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-surface-border flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-bold text-amber-600 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        Umbral Preventivo (Advertencia)
                      </span>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Alerta temprana para preparar desvíos o acelerar rotación vehicular
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-xs">
                      <span className="font-label-code text-[18px] font-bold text-amber-600">
                        {localWarning}%
                      </span>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] text-text-secondary font-label-code">50%</span>
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
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-surface-container-high rounded-lg"
                    />
                    <span className="text-[11px] text-text-secondary font-label-code">85%</span>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[11px] text-text-secondary font-medium">Preajustes:</span>
                    {[65, 70, 75, 80].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleQuickWarningSelect(val)}
                        className={`px-2.5 py-1 rounded text-xs font-label-code font-bold transition-all cursor-pointer ${
                          localWarning === val
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-text-secondary hover:text-text-primary border border-surface-border'
                        }`}
                      >
                        {val}% {val === 75 ? '(Por Defecto)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Capacity Control Policies */}
                <div className="flex flex-col gap-2.5 pt-1">
                  <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl border border-surface-border cursor-pointer hover:bg-surface-container transition-colors">
                    <input
                      type="checkbox"
                      checked={localAutoBlock}
                      onChange={(e) => {
                        setLocalAutoBlock(e.target.checked);
                        updateThresholdSettings({ autoBlockOnMax: e.target.checked });
                      }}
                      className="mt-0.5 accent-secondary w-4 h-4 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-text-primary">
                        Bloqueo automático de nuevos registros al 100% de aforo
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        Rechaza ingresos exprés cuando no existan bahías libres para evitar sobrecupo físico.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl border border-surface-border cursor-pointer hover:bg-surface-container transition-colors">
                    <input
                      type="checkbox"
                      checked={localZoneAlert}
                      onChange={(e) => {
                        setLocalZoneAlert(e.target.checked);
                        updateThresholdSettings({ alertOnZoneCritical: e.target.checked });
                      }}
                      className="mt-0.5 accent-secondary w-4 h-4 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-text-primary">
                        Monitoreo independiente por categoría (Carros / Motos)
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        Dispara alerta si la Zona A (Carros) o la Zona B (Motos) alcanzan el 90% independientemente del aforo global.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-surface-border flex items-center justify-between">
                <span className="text-xs text-text-secondary">
                  Los cambios se aplican y sincronizan de inmediato
                </span>
                <button
                  type="button"
                  onClick={handleSaveThresholds}
                  className="px-4 py-2 bg-secondary hover:bg-primary text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Guardar Umbrales
                </button>
              </div>
            </div>

            {/* COLUMN 2: NOTIFICACIONES VISUALES Y SONORAS */}
            <div className="bg-surface-card rounded-2xl p-6 border border-surface-border shadow-sm flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-[24px]">campaign</span>
                    <h3 className="font-sans text-[17px] font-bold text-text-primary">
                      2. Notificaciones Visuales y Sonoras
                    </h3>
                  </div>
                  <span className="text-xs text-text-secondary">Web Audio API Nativa</span>
                </div>

                {/* Sub-Card A: Configuración Visual */}
                <div className="p-4 bg-surface-container-low rounded-xl border border-surface-border flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[20px]">visibility</span>
                      <span className="text-[13px] font-bold text-text-primary">
                        Alertas Visuales en Pantalla
                      </span>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = !localVisualAlert;
                        setLocalVisualAlert(next);
                        updateThresholdSettings({ enableVisualAlert: next });
                      }}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        localVisualAlert ? 'bg-secondary' : 'bg-surface-container-high'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          localVisualAlert ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      ></div>
                    </button>
                  </div>

                  <p className="text-[12px] text-text-secondary">
                    Muestra un banner superior destacado en el Panel Operativo, indicador pulsante en la barra superior y aviso en el módulo de Registro de Entrada cuando el aforo supere el {localCritical}%.
                  </p>

                  {/* Preview Banner of Visual Alert */}
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-xs text-red-900">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-600 text-[18px] animate-pulse">
                        error
                      </span>
                      <span>
                        <strong>Previsualización:</strong> &ldquo;⚠️ Aforo Crítico al {localCritical}% — Bahías agotándose&rdquo;
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-red-200 text-red-800 font-bold rounded text-[10px]">
                      Banner Activo
                    </span>
                  </div>
                </div>

                {/* Sub-Card B: Configuración Sonora */}
                <div className="p-4 bg-surface-container-low rounded-xl border border-surface-border flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[20px]">volume_up</span>
                      <span className="text-[13px] font-bold text-text-primary">
                        Alarma Sonora al Superar {localCritical}%
                      </span>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = !localSoundAlert;
                        setLocalSoundAlert(next);
                        updateThresholdSettings({ enableSoundAlert: next });
                      }}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        localSoundAlert ? 'bg-secondary' : 'bg-surface-container-high'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          localSoundAlert ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      ></div>
                    </button>
                  </div>

                  {localSoundAlert && (
                    <div className="flex flex-col gap-3.5 pt-1 animate-in fade-in duration-100">
                      {/* Sound Type Selection */}
                      <div>
                        <span className="text-[12px] font-semibold text-text-secondary block mb-1.5">
                          Tipo de Tono Auditivo:
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'alarm', label: 'Alarma Industrial', icon: 'fmd_bad', desc: 'Urgent modulated pulses' },
                            { id: 'chime', label: 'Campana Melódica', icon: 'notifications', desc: 'Harmonic 3-tone chime' },
                            { id: 'beep', label: 'Doble Beep', icon: 'graphic_eq', desc: 'Clean electronic pip' },
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
                                  ? 'bg-secondary/10 border-secondary text-primary font-bold shadow-xs'
                                  : 'bg-white border-surface-border text-text-secondary hover:text-text-primary'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="material-symbols-outlined text-[18px] text-secondary">
                                  {snd.icon}
                                </span>
                                <span className="text-[12px]">{snd.label}</span>
                              </div>
                              <span className="text-[10px] text-text-secondary font-normal">
                                {snd.id === 'alarm' ? 'Pulsos de advertencia' : snd.id === 'chime' ? 'Chime armónico' : 'Beep dual de terminal'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Volume Slider & Test Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary font-medium">Volumen de Alarma:</span>
                            <span className="font-label-code font-bold text-primary">
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
                            className="w-full accent-secondary cursor-pointer h-2 bg-surface-container-high rounded-lg"
                          />
                        </div>

                        {/* Test Sound Button */}
                        <button
                          type="button"
                          onClick={() => handleTestSound()}
                          disabled={isTestingSound}
                          className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-primary border border-surface-border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
                        >
                          <span className={`material-symbols-outlined text-[18px] text-secondary ${
                            isTestingSound ? 'animate-bounce' : ''
                          }`}>
                            volume_up
                          </span>
                          <span>{isTestingSound ? 'Sonando...' : 'Probar Sonido'}</span>
                        </button>
                      </div>

                      {/* Sound Repeat Interval */}
                      <div>
                        <span className="text-[12px] font-semibold text-text-secondary block mb-1">
                          Frecuencia de repetición sonora:
                        </span>
                        <select
                          value={localRepeat}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setLocalRepeat(val);
                            updateThresholdSettings({ soundRepeatInterval: val });
                          }}
                          className="w-full h-10 px-3 bg-white text-text-primary rounded-lg text-xs border border-surface-border font-medium focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                        >
                          <option value={0}>Solo una vez al cruzar el umbral del {localCritical}%</option>
                          <option value={30}>Repetir cada 30 segundos si permanece en aforo crítico</option>
                          <option value={60}>Repetir cada 60 segundos (Recomendado para evitar saturación)</option>
                          <option value={120}>Repetir cada 2 minutos</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Protocol Contingency Callout */}
              <div className="p-3.5 bg-surface-canvas rounded-xl border border-surface-border text-xs text-text-secondary flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                  policy
                </span>
                <div>
                  <strong className="text-text-primary">Protocolo Operativo Sugerido al alcanzar {localCritical}%:</strong>
                  <p className="mt-0.5 leading-relaxed">
                    1. La taquilla de entrada debe avisar al usuario del aforo limitado.
                    2. En caso de llegar al 100%, la barrera se mantendrá cerrada hasta la próxima salida liquidada en caja.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: INFRAESTRUCTURA DE CELDAS Y TARIFAS                              */}
      {/* ========================================================================= */}
      {activeConfigTab === 'infrastructure' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          {/* Top Cards: Rates and Capacity per Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(tariffs) as VehicleType[]).map((cat) => {
              const item = tariffs[cat];
              const occupiedInCat = cells.filter(
                (c) => c.category === cat && c.status === 'occupied'
              ).length;

              return (
                <div
                  key={cat}
                  className="bg-surface-card p-5 rounded-xl border border-surface-border shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-text-secondary tracking-wider">
                        {cat}
                      </span>
                      <div className="text-[22px] font-bold text-primary mt-1 font-label-code">
                        ${item.ratePerHour.toLocaleString('es-CO')}{' '}
                        <span className="text-[12px] font-normal text-text-secondary">/hora</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-surface-container font-label-code text-[11px] font-bold text-secondary">
                      {item.snapshotVersion}
                    </span>
                  </div>

                  <div className="mt-4 pt-2 border-t border-surface-border/60 flex flex-col gap-1.5 text-xs text-text-secondary">
                    <div className="flex justify-between">
                      <span>Fracción (0-30 min):</span>
                      <span className="font-label-code font-bold text-text-primary">
                        ${item.minFraction.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ocupación actual:</span>
                      <span className="font-label-code font-semibold text-secondary">
                        {occupiedInCat} ocupadas
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid of Cells with Maintenance Controls */}
          <div className="bg-surface-card rounded-xl p-5 border border-surface-border shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">tune</span>
                <h2 className="font-sans text-[16px] font-bold text-text-primary">
                  Estado de Bahías y Mantenimiento
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12px] text-text-secondary">Zona:</span>
                <div className="inline-flex p-1 bg-surface-container-low rounded-lg border border-surface-border">
                  {[
                    { id: 'all', label: 'Todas las Zonas' },
                    { id: 'Zona A', label: 'Zona A (Carros)' },
                    { id: 'Zona B', label: 'Zona B (Motos)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedZone(tab.id as any)}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                        selectedZone === tab.id
                          ? 'bg-white text-primary font-bold shadow-xs'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
              <span className="font-semibold text-text-primary">Instrucción:</span>
              <span>Haga clic en cualquier celda para alternar su estado de mantenimiento preventivo o verificar detalles.</span>
            </div>

            {/* Cells Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2.5">
              {filteredCells.map((cell) => {
                const isBlocked = cell.status === 'blocked';
                const isOccupied = cell.status === 'occupied';

                let bg = 'bg-status-available-bg/60 border-status-available/30 hover:border-status-available';
                let icon = 'check_circle';
                let iconColor = 'text-status-available';
                let label = 'Libre';

                if (isBlocked) {
                  bg = 'bg-status-warning-bg/60 border-status-warning/40 hover:border-status-warning';
                  icon = 'construction';
                  iconColor = 'text-status-warning';
                  label = 'Mantenimiento';
                } else if (isOccupied) {
                  bg = 'bg-status-occupied-bg/50 border-status-occupied/30 hover:border-status-occupied';
                  icon = 'directions_car';
                  iconColor = 'text-status-occupied';
                  label = cell.plate || 'Ocupada';
                }

                return (
                  <button
                    key={cell.id}
                    type="button"
                    onClick={() => setSelectedCellToManage(cell)}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between items-center text-center transition-all cursor-pointer shadow-xs min-h-[95px] ${bg}`}
                  >
                    <div className="w-full flex items-center justify-between text-[11px] font-label-code">
                      <span className="font-bold text-text-primary">{cell.id}</span>
                      <span className="material-symbols-outlined text-[14px] opacity-70">
                        {cell.category === 'Moto' ? 'two_wheeler' : 'directions_car'}
                      </span>
                    </div>
                    <span className={`material-symbols-outlined text-[20px] my-1 ${iconColor}`}>
                      {icon}
                    </span>
                    <span className="text-[10px] font-label-code font-bold truncate max-w-full text-text-primary">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE CELL MAINTENANCE */}
      {selectedCellToManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-surface-card max-w-md w-full rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-surface-border">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">tune</span>
                <h3 className="font-sans text-[18px] font-bold text-text-primary">
                  Bahía {selectedCellToManage.id} ({selectedCellToManage.zone})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCellToManage(null)}
                className="text-text-secondary hover:text-text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Categoría:</span>
                <span className="font-semibold text-text-primary">{selectedCellToManage.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Estado actual:</span>
                <span className="font-label-code font-bold uppercase text-primary">
                  {selectedCellToManage.status === 'blocked'
                    ? 'Bloqueada por mantenimiento'
                    : selectedCellToManage.status === 'occupied'
                    ? `Ocupada (${selectedCellToManage.plate})`
                    : 'Disponible'}
                </span>
              </div>
              {selectedCellToManage.maintenanceReason && (
                <div className="flex justify-between text-status-warning font-semibold">
                  <span>Motivo actual:</span>
                  <span>{selectedCellToManage.maintenanceReason}</span>
                </div>
              )}
            </div>

            {selectedCellToManage.status === 'free' && (
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-semibold text-text-primary" htmlFor="block-reason-input">
                  Motivo de Inhabilitación / Bloqueo:
                </label>
                <input
                  id="block-reason-input"
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ej. Falla en sensor, mancha de aceite, pintura..."
                  className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-[13px] border border-surface-border focus:outline-none focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    toggleCellMaintenance(selectedCellToManage.id, blockReason);
                    setSelectedCellToManage(null);
                  }}
                  className="w-full py-2.5 bg-status-warning text-white font-bold rounded-xl text-[13px] shadow-sm hover:bg-amber-600 transition-colors mt-2 cursor-pointer"
                >
                  Bloquear Bahía por Mantenimiento
                </button>
              </div>
            )}

            {selectedCellToManage.status === 'blocked' && (
              <button
                type="button"
                onClick={() => {
                  toggleCellMaintenance(selectedCellToManage.id);
                  setSelectedCellToManage(null);
                }}
                className="w-full py-2.5 bg-status-available text-white font-bold rounded-xl text-[13px] shadow-sm hover:bg-emerald-600 transition-colors cursor-pointer"
              >
                Habilitar Bahía Nuevamente
              </button>
            )}

            {selectedCellToManage.status === 'occupied' && (
              <div className="p-3 bg-status-occupied-bg text-status-occupied rounded-xl text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>
                  Esta celda está ocupada por el vehículo {selectedCellToManage.plate}. Realice el cobro y salida primero para modificarla.
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedCellToManage(null)}
              className="w-full py-2 bg-surface-container hover:bg-surface-container-high text-text-primary font-semibold rounded-xl text-[13px] cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

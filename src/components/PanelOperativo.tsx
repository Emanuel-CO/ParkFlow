import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { ParkingCell, VehicleType } from '../types/parking.ts';

export const PanelOperativo: React.FC = () => {
  const {
    cells,
    movements,
    totalOccupied,
    totalCapacity,
    occupancyPercent,
    freeCarsCount,
    occupiedCarsCount,
    freeMotosCount,
    occupiedMotosCount,
    todayRevenue,
    todayEntriesCount,
    setActiveView,
    setSelectedCellForModal,
    registerEntry,
    showToast,
    thresholdSettings,
    isCapacityCritical,
    isCapacityWarning,
    isAlertDismissed,
    dismissAlert,
  } = useParking();

  const [activeFilter, setActiveFilter] = useState<'all' | 'free' | 'occupied' | 'blocked'>('all');
  const [selectedLevel, setSelectedLevel] = useState('lvl-1');
  const [quickPlate, setQuickPlate] = useState('');
  const [quickVehicleType, setQuickVehicleType] = useState<VehicleType>('Carro');
  const [quickTargetSlot, setQuickTargetSlot] = useState('A-02');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered cells
  const filterCell = (cell: ParkingCell) => {
    if (activeFilter === 'all') return true;
    return cell.status === activeFilter;
  };

  const carsCells = cells.filter((c) => c.zone === 'Zona A').filter(filterCell);
  const motosCells = cells.filter((c) => c.zone === 'Zona B').filter(filterCell);

  const freeSlots = cells.filter((c) => c.status === 'free');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Sensores de bahía sincronizados con la estación central', 'info');
    }, 500);
  };

  const handleQuickEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPlate || quickPlate.length < 3) {
      showToast('Ingrese un número de placa válido', 'warning');
      return;
    }
    const res = registerEntry(quickPlate, quickVehicleType, quickTargetSlot);
    if (res.success) {
      setQuickPlate('');
    }
  };

  const handleCellClick = (cell: ParkingCell) => {
    if (cell.status === 'occupied') {
      setSelectedCellForModal(cell);
    } else if (cell.status === 'free') {
      setQuickTargetSlot(cell.id);
      setQuickVehicleType(cell.category);
      showToast(`Celda ${cell.id} seleccionada para nuevo registro`, 'info');
      // Focus quick plate
      const el = document.getElementById('quick-plate-input');
      if (el) el.focus();
    } else {
      showToast(`Celda ${cell.id} inhabilitada: ${cell.maintenanceReason || 'En mantenimiento'}`, 'warning');
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
      {/* Visual Alert Banner when Critical Capacity is reached (e.g. 90%) */}
      {isCapacityCritical && thresholdSettings.enableVisualAlert && !isAlertDismissed && (
        <div className="bg-red-50 border-2 border-red-500 p-4.5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-start md:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <span className="material-symbols-outlined text-[28px]">notification_important</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans font-bold text-red-800 text-[16px] tracking-tight">
                  ALERTA DE AFORO MÁXIMO: {occupancyPercent}% DE CAPACIDAD ALCANZADA
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white font-label-code">
                  Umbral: {thresholdSettings.criticalThreshold}%
                </span>
              </div>
              <p className="text-[13px] text-red-950 mt-1">
                El parqueadero tiene <strong>{totalOccupied} de {totalCapacity} bahías ocupadas</strong> (quedan únicamente <strong>{totalCapacity - totalOccupied} libres</strong>).
                {thresholdSettings.enableSoundAlert ? ' Notificación sonora activa.' : ''} Considere activar desvío vehicular en taquilla.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={dismissAlert}
              className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-900 border border-red-300 font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Silenciar alarma temporalmente"
            >
              <span className="material-symbols-outlined text-[16px]">volume_off</span>
              <span>Silenciar Alerta</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('tarifas-y-celdas')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Configurar Umbrales</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Header Controls */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-card p-4 rounded-xl border border-surface-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">grid_view</span>
            </div>
            <div>
              <h1 className="font-sans text-[20px] font-bold text-text-primary leading-tight">
                Panel Operativo en Tiempo Real
              </h1>
              <p className="text-[12px] text-text-secondary">
                Monitoreo continuo de bahías, tarifas activas y flujo vehicular
              </p>
            </div>
          </div>

          {/* Level selector */}
          <div className="flex items-center gap-1.5 bg-surface-canvas px-3 py-1.5 rounded-lg border border-surface-border shadow-sm">
            <span className="material-symbols-outlined text-text-secondary text-[18px]">layers</span>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                showToast(`Vista cambiada a: ${e.target.options[e.target.selectedIndex].text}`, 'info');
              }}
              className="bg-transparent text-[13px] font-medium text-text-primary focus:outline-none cursor-pointer pr-1"
            >
              <option value="lvl-1">Nivel 1 - Principal (50 celdas)</option>
              <option value="lvl-2">Nivel 2 - Subsuelo Norte (40 celdas)</option>
              <option value="lvl-vip">Nivel E - Zona VIP & Lavado (15 celdas)</option>
            </select>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container text-[13px] font-semibold border border-surface-border transition-all"
            type="button"
          >
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-500 ${isRefreshing ? 'rotate-180' : ''}`}>
              autorenew
            </span>
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={() => setActiveView('registro-de-entrada')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-white hover:bg-primary text-[13px] font-semibold shadow-sm hover:shadow transition-all active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">directions_car</span>
            <span>Nuevo Ingreso</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded ml-1 font-mono font-bold">F1</span>
          </button>

          <button
            onClick={() => setActiveView('salida-y-cobro')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-status-available text-white hover:bg-emerald-600 text-[13px] font-semibold shadow-sm hover:shadow transition-all active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            <span>Registrar Salida</span>
            <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded ml-1 font-mono font-bold">F2</span>
          </button>
        </div>
      </header>

      {/* 4 KPIs & Aforo Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Aforo General */}
        <div className="bg-surface-card rounded-xl p-4 border border-surface-border shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">
                Aforo General
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[28px] font-bold text-text-primary">{occupancyPercent}%</span>
                <span className="text-[13px] text-text-secondary">{totalOccupied} / {totalCapacity}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-occupied-bg text-status-occupied flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">pie_chart</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between items-center text-[12px] mb-1.5 text-text-secondary">
              <span>{totalCapacity - totalOccupied} celdas libres</span>
              <span className="font-label-code font-bold text-status-available">
                {100 - occupancyPercent}% libre
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-700"
                style={{ width: `${occupancyPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Carros */}
        <div className="bg-surface-card rounded-xl p-4 border border-surface-border shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">directions_car</span>
                <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Carros</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[28px] font-bold text-text-primary">
                  {occupiedCarsCount}
                  <span className="text-text-secondary text-[16px] font-normal">/30</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-status-available-bg text-status-available font-bold">
                  {freeCarsCount} Libres
                </span>
              </div>
            </div>
            <span className="font-label-code text-[11px] bg-surface-container-high text-primary font-bold px-2 py-1 rounded">
              $4.500/h
            </span>
          </div>
          <div className="mt-2 pt-1 flex items-center justify-between text-text-secondary text-[12px]">
            <span>Ocupación {Math.round((occupiedCarsCount / 30) * 100)}%</span>
            <div className="w-24 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full"
                style={{ width: `${(occupiedCarsCount / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 3: Motos */}
        <div className="bg-surface-card rounded-xl p-4 border border-surface-border shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">two_wheeler</span>
                <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Motos</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[28px] font-bold text-text-primary">
                  {occupiedMotosCount}
                  <span className="text-text-secondary text-[16px] font-normal">/20</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-status-available-bg text-status-available font-bold">
                  {freeMotosCount} Libres
                </span>
              </div>
            </div>
            <span className="font-label-code text-[11px] bg-surface-container-high text-primary font-bold px-2 py-1 rounded">
              $2.200/h
            </span>
          </div>
          <div className="mt-2 pt-1 flex items-center justify-between text-text-secondary text-[12px]">
            <span>Ocupación {Math.round((occupiedMotosCount / 20) * 100)}%</span>
            <div className="w-24 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${(occupiedMotosCount / 20) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 4: Recaudo Turno Hoy */}
        <div className="bg-surface-card rounded-xl p-4 border border-surface-border shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">
                Recaudo Turno Hoy
              </span>
              <div className="text-[24px] font-bold text-primary mt-1">
                ${todayRevenue.toLocaleString('es-CO')}{' '}
                <span className="text-[12px] text-text-secondary font-normal">COP</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 font-label-code text-[12px] text-text-secondary">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-status-available">check_circle</span>
              <span>{todayEntriesCount} ingresos</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">pace</span>
              <span>Prom. 1h 45m</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout (8 cols Grid / 4 cols Actions) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bays Grid Matrix (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          {/* Visual Filters Bar */}
          <div className="bg-surface-card p-4 rounded-xl border border-surface-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[12px] text-text-secondary uppercase tracking-wider font-semibold mr-1 hidden md:inline">
                Filtrar:
              </span>
              <div className="inline-flex p-1 bg-surface-canvas rounded-lg border border-surface-border">
                {[
                  { id: 'all', label: `Todas (${totalCapacity})` },
                  { id: 'free', label: `Libres (${totalCapacity - totalOccupied - 2})` },
                  { id: 'occupied', label: `Ocupadas (${totalOccupied})` },
                  { id: 'blocked', label: 'Bloqueadas (2)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-md text-[13px] transition-all ${
                      activeFilter === tab.id
                        ? 'bg-surface-card text-primary shadow-sm font-semibold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Status Legend */}
            <div className="flex items-center gap-4 flex-wrap text-text-secondary text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-status-available"></span>
                <span>Libre</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-status-occupied"></span>
                <span>Ocupado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-status-warning"></span>
                <span>Mantenimiento</span>
              </div>
            </div>
          </div>

          {/* SECTION A: CARROS (Tarjetas de Celdas) */}
          <div className="bg-surface-card p-4 rounded-xl border border-surface-border shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-surface-border/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-surface-container text-secondary">
                  <span className="material-symbols-outlined text-[20px]">directions_car</span>
                </div>
                <h2 className="font-sans text-[16px] font-bold text-text-primary">
                  Zona A • Carros y Camionetas
                </h2>
                <span className="font-label-code text-[12px] text-text-secondary">30 celdas</span>
              </div>
              <span className="font-label-code text-[11px] text-on-surface-variant bg-surface-canvas px-2 py-0.5 rounded border border-surface-border">
                Rango A-01 a A-30
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {carsCells.map((cell) => {
                if (cell.status === 'blocked') {
                  return (
                    <div
                      key={cell.id}
                      onClick={() => handleCellClick(cell)}
                      className="bg-status-warning-bg/60 border border-status-warning/30 p-3 rounded-xl shadow-sm cursor-pointer flex flex-col justify-between min-h-[115px] hover:border-status-warning transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label-code text-[13px] font-bold text-text-primary">{cell.id}</span>
                        <span className="material-symbols-outlined text-status-warning text-[18px]">lock</span>
                      </div>
                      <div className="flex flex-col items-center justify-center my-auto text-center">
                        <span className="material-symbols-outlined text-status-warning text-[20px]">construction</span>
                        <span className="text-[10px] text-status-warning font-bold mt-1 tracking-tight uppercase">
                          {cell.maintenanceReason || 'MANTENIMIENTO'}
                        </span>
                      </div>
                      <span className="text-center font-label-code text-[10px] text-text-secondary">Inhabilitada</span>
                    </div>
                  );
                }

                if (cell.status === 'occupied') {
                  return (
                    <div
                      key={cell.id}
                      onClick={() => handleCellClick(cell)}
                      className="group bg-status-occupied-bg/40 hover:bg-status-occupied-bg border border-status-occupied/20 p-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[115px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label-code text-[13px] font-bold text-text-primary">{cell.id}</span>
                        <span className="w-2 h-2 rounded-full bg-status-occupied"></span>
                      </div>
                      <div className="my-1">
                        <span className="font-label-plate text-[16px] text-text-primary tracking-wider block font-bold">
                          {cell.plate}
                        </span>
                        <span className="text-[11px] text-text-secondary">Desde {cell.entryTime}</span>
                      </div>
                      <div className="flex items-center justify-between font-label-code text-[11px] text-status-occupied font-semibold">
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px]">timer</span>
                          {cell.duration}
                        </span>
                        <span>${cell.currentTotal?.toLocaleString('es-CO')}</span>
                      </div>
                    </div>
                  );
                }

                // Free Cell
                return (
                  <div
                    key={cell.id}
                    onClick={() => handleCellClick(cell)}
                    className="group bg-status-available-bg/30 hover:bg-status-available-bg border border-status-available/20 p-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[115px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-code text-[13px] font-bold text-text-primary">{cell.id}</span>
                      <span className="w-2 h-2 rounded-full bg-status-available"></span>
                    </div>
                    <div className="flex flex-col items-center justify-center my-auto py-1">
                      <span className="material-symbols-outlined text-status-available text-[24px] group-hover:scale-125 transition-transform">
                        add_circle
                      </span>
                      <span className="text-[11px] text-status-available font-bold mt-1">DISPONIBLE</span>
                    </div>
                    <div className="text-center font-label-code text-[10px] text-text-secondary">
                      Click para asignar
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION B: MOTOS (Tarjetas de Celdas) */}
          <div className="bg-surface-card p-4 rounded-xl border border-surface-border shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-surface-border/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-surface-container text-primary">
                  <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
                </div>
                <h2 className="font-sans text-[16px] font-bold text-text-primary">
                  Zona B • Motocicletas
                </h2>
                <span className="font-label-code text-[12px] text-text-secondary">20 celdas</span>
              </div>
              <span className="font-label-code text-[11px] text-on-surface-variant bg-surface-canvas px-2 py-0.5 rounded border border-surface-border">
                Rango B-01 a B-20
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {motosCells.map((cell) => {
                if (cell.status === 'blocked') {
                  return (
                    <div
                      key={cell.id}
                      onClick={() => handleCellClick(cell)}
                      className="bg-status-warning-bg/60 border border-status-warning/30 p-3 rounded-xl shadow-sm cursor-pointer flex flex-col justify-between min-h-[115px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label-code text-[13px] font-bold text-text-primary">{cell.id}</span>
                        <span className="material-symbols-outlined text-status-warning text-[18px]">lock</span>
                      </div>
                      <div className="flex flex-col items-center justify-center my-auto text-center">
                        <span className="material-symbols-outlined text-status-warning text-[20px]">oil_barrel</span>
                        <span className="text-[10px] text-status-warning font-bold mt-1 tracking-tight uppercase">
                          {cell.maintenanceReason || 'LIMPIEZA'}
                        </span>
                      </div>
                      <span className="text-center font-label-code text-[10px] text-text-secondary">Inhabilitada</span>
                    </div>
                  );
                }

                if (cell.status === 'occupied') {
                  return (
                    <div
                      key={cell.id}
                      onClick={() => handleCellClick(cell)}
                      className="group bg-status-occupied-bg/40 hover:bg-status-occupied-bg border border-status-occupied/20 p-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[115px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label-code text-[13px] font-bold text-text-primary">{cell.id}</span>
                        <span className="w-2 h-2 rounded-full bg-status-occupied"></span>
                      </div>
                      <div className="my-1">
                        <span className="font-label-plate text-[16px] text-text-primary tracking-wider block font-bold">
                          {cell.plate}
                        </span>
                        <span className="text-[11px] text-text-secondary">Desde {cell.entryTime}</span>
                      </div>
                      <div className="flex items-center justify-between font-label-code text-[11px] text-status-occupied font-semibold">
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px]">timer</span>
                          {cell.duration}
                        </span>
                        <span>${cell.currentTotal?.toLocaleString('es-CO')}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={cell.id}
                    onClick={() => handleCellClick(cell)}
                    className="group bg-status-available-bg/30 hover:bg-status-available-bg border border-status-available/20 p-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[115px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-code text-[13px] font-bold text-text-primary">{cell.id}</span>
                      <span className="w-2 h-2 rounded-full bg-status-available"></span>
                    </div>
                    <div className="flex flex-col items-center justify-center my-auto py-1">
                      <span className="material-symbols-outlined text-status-available text-[24px] group-hover:scale-125 transition-transform">
                        add_circle
                      </span>
                      <span className="text-[11px] text-status-available font-bold mt-1">DISPONIBLE</span>
                    </div>
                    <div className="text-center font-label-code text-[10px] text-text-secondary">
                      Click para asignar
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Fast Entry POS & Recent Movements (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Tarjeta de Entrada Rápida Integrada */}
          <div className="bg-surface-card p-4 rounded-xl border border-surface-border shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-surface-border/50">
              <span className="text-[12px] uppercase tracking-wider text-text-secondary font-bold">
                Ingreso Express
              </span>
              <span className="font-label-code text-[12px] text-secondary font-bold">
                Lector QR/LPR Listo
              </span>
            </div>

            <form onSubmit={handleQuickEntrySubmit} className="flex flex-col gap-3 mt-1">
              <div>
                <label className="text-[12px] text-text-secondary block mb-1 font-medium" htmlFor="quick-plate-input">
                  Número de Placa
                </label>
                <div className="relative">
                  <input
                    id="quick-plate-input"
                    maxLength={7}
                    placeholder="ABC-123"
                    value={quickPlate}
                    onChange={(e) => setQuickPlate(e.target.value.toUpperCase())}
                    required
                    type="text"
                    className="w-full h-12 bg-surface-canvas rounded-lg px-4 font-label-plate text-[20px] text-center uppercase tracking-widest text-text-primary placeholder:text-outline-variant focus:bg-white focus:ring-2 focus:ring-secondary outline-none transition-all shadow-sm border border-surface-border"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-3 text-text-secondary pointer-events-none text-[22px]">
                    pin
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${
                    quickVehicleType === 'Carro'
                      ? 'bg-primary-container text-on-primary-container font-semibold border-transparent shadow-sm'
                      : 'bg-surface-canvas text-text-primary hover:bg-surface-container border-surface-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="quick-vehicle-type"
                    value="Carro"
                    checked={quickVehicleType === 'Carro'}
                    onChange={() => setQuickVehicleType('Carro')}
                    className="hidden"
                  />
                  <span className="material-symbols-outlined text-[18px]">directions_car</span>
                  <span className="text-[13px]">Carro</span>
                </label>

                <label
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${
                    quickVehicleType === 'Moto'
                      ? 'bg-primary-container text-on-primary-container font-semibold border-transparent shadow-sm'
                      : 'bg-surface-canvas text-text-primary hover:bg-surface-container border-surface-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="quick-vehicle-type"
                    value="Moto"
                    checked={quickVehicleType === 'Moto'}
                    onChange={() => setQuickVehicleType('Moto')}
                    className="hidden"
                  />
                  <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
                  <span className="text-[13px]">Moto</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={quickTargetSlot}
                  onChange={(e) => setQuickTargetSlot(e.target.value)}
                  className="w-1/2 h-10 bg-surface-canvas text-text-primary rounded-lg px-2 font-label-code text-[12px] outline-none border border-surface-border focus:ring-2 focus:ring-secondary"
                >
                  {freeSlots.slice(0, 10).map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      Celda {slot.id} (Libre)
                    </option>
                  ))}
                  {freeSlots.length === 0 && <option value="">Sin celdas libres</option>}
                </select>

                <button
                  className="w-1/2 h-10 bg-secondary hover:bg-primary text-white rounded-lg text-[13px] font-semibold transition-all shadow flex items-center justify-center gap-1 cursor-pointer"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Emitir Ticket</span>
                </button>
              </div>
            </form>
          </div>

          {/* Tabla: Últimos Movimientos Operativos */}
          <div className="bg-surface-card p-4 rounded-xl border border-surface-border shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-surface-border/50">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">swap_vert</span>
                <h2 className="font-sans text-[15px] font-bold text-text-primary">
                  Últimos Movimientos
                </h2>
              </div>
              <span className="text-[12px] text-text-secondary">En vivo</span>
            </div>

            <div className="flex flex-col gap-2">
              {movements.slice(0, 5).map((mov) => {
                const isEntry = mov.type === 'Entrada';
                return (
                  <div
                    key={mov.id}
                    className="p-2.5 rounded-lg bg-surface-canvas flex items-center justify-between hover:bg-surface-container-low transition-colors border border-surface-border/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isEntry
                            ? 'bg-status-available-bg text-status-available'
                            : 'bg-status-occupied-bg text-status-occupied'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isEntry ? 'login' : 'logout'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-plate text-[14px] text-text-primary font-bold leading-tight">
                          {mov.plate}
                        </span>
                        <span className="text-[11px] text-text-secondary">
                          {mov.vehicleType} • Celda {mov.cellId}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      {isEntry ? (
                        <span className="font-label-code text-[12px] text-status-available font-bold">
                          Entrada
                        </span>
                      ) : (
                        <span className="font-label-code text-[12px] text-primary font-bold">
                          ${mov.amount?.toLocaleString('es-CO')}
                        </span>
                      )}
                      <span className="text-[11px] text-text-secondary">{mov.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Banner de Periféricos & Hardware del Estacionamiento */}
          <div className="bg-surface-card rounded-xl p-4 border border-surface-border shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-available-bg text-status-available">
                <span className="material-symbols-outlined text-[20px]">print</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-text-primary">Impresora Térmica</span>
                <span className="text-[11px] text-text-secondary">Papel 80mm: 78% disponible</span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-status-available animate-pulse" title="Conectado y en línea"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

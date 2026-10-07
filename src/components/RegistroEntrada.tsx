import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { VehicleType } from '../types/parking.ts';

export const RegistroEntrada: React.FC = () => {
  const {
    cells,
    tariffs,
    registerEntry,
    showToast,
    todayEntriesCount,
    totalOccupied,
    totalCapacity,
    isCapacityCritical,
    occupancyPercent,
    thresholdSettings,
  } = useParking();

  const [plate, setPlate] = useState('ABC-123');
  const [category, setCategory] = useState<VehicleType>('Carro');
  const [slotMode, setSlotMode] = useState<'auto' | 'manual'>('auto');
  const [manualSlot, setManualSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [ticketNumber, setTicketNumber] = useState('#PF-2024-08941');
  const [ticketTime, setTicketTime] = useState('');

  // Find recommended slot
  const availableZoneCells = cells.filter(
    (c) => c.status === 'free' && (category === 'Moto' || category === 'Bicicleta' ? c.zone === 'Zona B' : c.zone === 'Zona A')
  );
  const autoRecommendedSlot = availableZoneCells[0]?.id || 'A-07';

  // Active assigned slot
  const effectiveSlot = slotMode === 'auto' ? autoRecommendedSlot : manualSlot || autoRecommendedSlot;

  // Real-time time format
  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    setTicketTime(now.toLocaleDateString('es-CO', options));
  }, []);

  // Format plate uppercase with hyphen
  const handlePlateChange = (val: string) => {
    let clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 3) {
      clean = clean.slice(0, 3) + '-' + clean.slice(3, 7);
    }
    setPlate(clean);
  };

  // Anti-passback check
  const isDuplicate = cells.some(
    (c) => c.status === 'occupied' && c.plate?.toUpperCase() === plate.toUpperCase().trim()
  );

  const handleQuickTag = (tag: string) => {
    if (!notes.includes(tag)) {
      setNotes(notes ? `${notes}, ${tag}` : tag);
    }
  };

  const handleGenerateTicket = () => {
    if (!plate || plate.length < 3) {
      showToast('Por favor ingrese un número de placa válido', 'warning');
      return;
    }
    if (isDuplicate) {
      showToast('BLOQUEO ANTI-PASSBACK: El vehículo ya figura en las instalaciones', 'error');
      return;
    }

    const res = registerEntry(plate, category, effectiveSlot, notes);
    if (res.success) {
      setTicketNumber(res.ticketId || `#PF-2024-${Math.floor(10000 + Math.random() * 90000)}`);
      const now = new Date();
      setTicketTime(
        now.toLocaleDateString('es-CO', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    }
  };

  const handleReset = () => {
    setPlate('');
    setNotes('');
    setSlotMode('auto');
  };

  const currentTariff = tariffs[category] || tariffs['Carro'];

  // Categories definition
  const categoriesList: {
    type: VehicleType;
    label: string;
    icon: string;
    rate: string;
    availCount: number;
    badgeColor: string;
  }[] = [
    {
      type: 'Carro',
      label: 'Carro',
      icon: 'directions_car',
      rate: '$4.500/h',
      availCount: cells.filter((c) => c.zone === 'Zona A' && c.status === 'free').length,
      badgeColor: 'bg-status-available text-white',
    },
    {
      type: 'Moto',
      label: 'Motocicleta',
      icon: 'two_wheeler',
      rate: '$2.200/h',
      availCount: cells.filter((c) => c.zone === 'Zona B' && c.status === 'free').length,
      badgeColor: 'bg-surface-container-highest text-text-primary',
    },
    {
      type: 'Camioneta / SUV',
      label: 'SUV / Carga',
      icon: 'airport_shuttle',
      rate: '$6.000/h',
      availCount: 2,
      badgeColor: 'bg-status-warning-bg text-status-warning',
    },
    {
      type: 'Bicicleta',
      label: 'Bicicleta',
      icon: 'pedal_bike',
      rate: '$1.000/h',
      availCount: 5,
      badgeColor: 'bg-surface-container-highest text-text-primary',
    },
  ];

  return (
    <div className="px-6 py-4 flex flex-col gap-5 max-w-[1600px] mx-auto w-full">
      {/* Top Action Bar / Metadatos de Estación */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-card p-4 rounded-xl border border-surface-border shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">login</span>
            </span>
            <div>
              <h1 className="font-sans text-[18px] font-bold text-text-primary tracking-tight">
                Registro de Ingreso Rápido
              </h1>
              <p className="text-[12px] text-text-secondary">
                Terminal T-01 • Modos táctil y teclado habilitados
              </p>
            </div>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-available-bg text-status-available text-[12px] font-semibold">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Tiempo estimado: &lt; 15s</span>
          </div>
        </div>

        {/* Live Shift Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-surface-container-low flex items-center gap-2 border border-surface-border/60">
            <span className="text-[12px] text-text-secondary">Celdas Libres:</span>
            <span className="font-label-code text-[13px] text-secondary font-bold">
              {totalCapacity - totalOccupied} / {totalCapacity}
            </span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-surface-container-low flex items-center gap-2 border border-surface-border/60">
            <span className="text-[12px] text-text-secondary">Ingresos Turno:</span>
            <span className="font-label-code text-[13px] text-primary font-bold">
              {todayEntriesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Capacity Warning Callout */}
      {isCapacityCritical && thresholdSettings.enableVisualAlert && (
        <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-950 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 text-[26px] animate-pulse shrink-0">
              report
            </span>
            <div>
              <strong className="text-red-900 text-sm">
                ALERTA DE AFORO CRÍTICO: Parqueadero al {occupancyPercent}% de Capacidad (Umbral {thresholdSettings.criticalThreshold}%)
              </strong>
              <p className="text-xs text-red-900 mt-0.5">
                Quedan únicamente <strong>{totalCapacity - totalOccupied} bahías disponibles</strong> en patio.
                {thresholdSettings.autoBlockOnMax ? ' El sistema bloqueará nuevos ingresos si se alcanza el 100%.' : ' Asegúrese de contar con espacio libre antes de expedir el ticket.'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold shrink-0">
            {totalCapacity - totalOccupied} Libres
          </span>
        </div>
      )}

      {/* Main Grid: Form 7 cols / Ticket preview 5 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-surface-card rounded-xl p-5 border border-surface-border shadow-sm flex flex-col gap-4">
            {/* Step 1: Plate Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] uppercase tracking-wider text-text-secondary flex items-center gap-1.5 font-bold" htmlFor="plate-input">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span>Placa del Vehículo</span>
                </label>
                <span className="font-label-code text-[11px] text-text-secondary">
                  Atajo: [F2] o autoenfoque
                </span>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-4 font-label-code text-headline-sm text-text-secondary select-none">
                  <span className="material-symbols-outlined text-[28px] align-middle text-secondary">pin</span>
                </span>
                <input
                  id="plate-input"
                  type="text"
                  maxLength={7}
                  placeholder="ABC-123"
                  value={plate}
                  onChange={(e) => handlePlateChange(e.target.value)}
                  className="w-full bg-surface-container-low text-text-primary font-label-plate text-[26px] uppercase pl-14 pr-12 py-3 rounded-xl border border-surface-border focus:outline-none focus:bg-white focus:ring-2 focus:ring-secondary transition-all shadow-inner tracking-widest text-center"
                />
                <button
                  type="button"
                  onClick={() => setPlate('')}
                  className="absolute right-3 p-1.5 rounded-lg text-text-secondary hover:bg-surface-container-high transition-colors"
                  title="Limpiar campo"
                >
                  <span className="material-symbols-outlined text-[20px]">backspace</span>
                </button>
              </div>

              {/* Dynamic Plate Feedback Banner */}
              {isDuplicate ? (
                <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-error-container text-error border border-error/20 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span className="text-[12px] font-semibold">
                      ¡ALERTA ANTI-PASSBACK! Placa con vehículo actualmente dentro del patio
                    </span>
                  </div>
                  <span className="font-label-code text-[12px] font-bold">BLOQUEADO</span>
                </div>
              ) : plate.length >= 3 ? (
                <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-status-available-bg text-status-available border border-status-available/20 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span className="text-[12px] font-medium">
                      Formato válido • Sin registros duplicados en patio
                    </span>
                  </div>
                  <span className="font-label-code text-[12px] font-bold">OK</span>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-surface-container-low text-text-secondary text-[12px]">
                  <span>Ingrese 6 caracteres alfanuméricos</span>
                  <span className="font-label-code text-[11px]">En espera...</span>
                </div>
              )}
            </div>

            {/* Step 2: Vehicle Category Selector */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] uppercase tracking-wider text-text-secondary font-bold">
                  Categoría de Vehículo
                </label>
                <span className="text-[12px] text-text-secondary">Selección obligatoria</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categoriesList.map((cat) => {
                  const isSelected = category === cat.type;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => setCategory(cat.type)}
                      className={`text-left p-3 rounded-xl flex flex-col justify-between transition-all border ${
                        isSelected
                          ? 'bg-primary-container text-on-primary-container border-transparent shadow-md ring-2 ring-secondary'
                          : 'bg-surface-container-low text-text-primary hover:bg-surface-container border-surface-border'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full mb-2">
                        <span className={`material-symbols-outlined text-[28px] ${isSelected ? 'text-on-primary-container' : 'text-secondary'}`}>
                          {cat.icon}
                        </span>
                        <span className={`font-label-code text-[11px] px-2 py-0.5 rounded-full font-bold ${cat.badgeColor}`}>
                          {cat.availCount} lib.
                        </span>
                      </div>
                      <div>
                        <div className="text-[13px] font-bold leading-tight">{cat.label}</div>
                        <div className={`font-label-code text-[11px] ${isSelected ? 'opacity-90' : 'text-text-secondary'}`}>
                          {cat.rate}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Space & Slot Assignment */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[12px] uppercase tracking-wider text-text-secondary font-bold">
                  Asignación de Espacio / Bahía
                </label>
                <span className="font-label-code text-[12px] text-secondary font-semibold">
                  {category === 'Moto' || category === 'Bicicleta' ? 'Zona B • Nivel 1' : 'Zona A • Nivel 1'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                    slotMode === 'auto'
                      ? 'bg-surface-container-low border-secondary/40 shadow-xs'
                      : 'bg-surface-canvas border-surface-border hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="radio"
                    name="slot-assignment"
                    value="auto"
                    checked={slotMode === 'auto'}
                    onChange={() => setSlotMode('auto')}
                    className="w-4 h-4 text-secondary accent-secondary"
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-text-primary">Automática Inteligente</span>
                      <span className="px-1.5 py-0.5 rounded bg-status-available text-white font-label-code text-[10px]">
                        Recomendada
                      </span>
                    </div>
                    <span className="text-[11px] text-text-secondary truncate">
                      Asigna la más cercana al portón:{' '}
                      <strong className="text-primary font-label-code">Celda {autoRecommendedSlot}</strong>
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                    slotMode === 'manual'
                      ? 'bg-surface-container-low border-secondary/40 shadow-xs'
                      : 'bg-surface-canvas border-surface-border hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="radio"
                    name="slot-assignment"
                    value="manual"
                    checked={slotMode === 'manual'}
                    onChange={() => setSlotMode('manual')}
                    className="w-4 h-4 text-secondary accent-secondary"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-semibold text-text-primary">Selección Manual</span>
                    <span className="text-[11px] text-text-secondary truncate">
                      Elegir celda de la lista de vacantes
                    </span>
                  </div>
                </label>
              </div>

              {slotMode === 'manual' && (
                <div className="p-3 bg-surface-container rounded-xl border border-surface-border flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-[20px]">grid_goldenratio</span>
                  <div className="flex-1">
                    <label className="block text-[11px] text-text-secondary mb-1">
                      Celdas disponibles para {category}:
                    </label>
                    <select
                      value={manualSlot || autoRecommendedSlot}
                      onChange={(e) => setManualSlot(e.target.value)}
                      className="w-full bg-white text-text-primary font-label-code text-[12px] p-2 rounded-lg border border-surface-border focus:outline-none"
                    >
                      {availableZoneCells.map((c) => (
                        <option key={c.id} value={c.id}>
                          Celda {c.id} ({c.zone} - Disponible)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Observations / Inventario */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-[12px] uppercase tracking-wider text-text-secondary flex items-center justify-between font-bold" htmlFor="notes-input">
                <span>Observaciones / Inventario Rápido (Opcional)</span>
                <span className="text-[11px] text-text-secondary font-normal">Máx. 120 caracteres</span>
              </label>
              <input
                id="notes-input"
                type="text"
                maxLength={120}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Rayón en puerta derecha, espejo fisurado, 1 casco dejado..."
                className="w-full bg-surface-container-low text-text-primary text-[13px] px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:bg-white transition-colors"
              />

              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-text-secondary">Etiquetas rápidas:</span>
                {['Casco recibido', 'Rayón preexistente', 'Sin objetos de valor'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickTag(tag)}
                    className="font-label-code text-[11px] px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors border border-surface-border"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2 mt-1">
              <button
                type="button"
                disabled={isDuplicate || !plate}
                onClick={handleGenerateTicket}
                className="flex-1 min-h-[48px] px-6 rounded-xl bg-secondary text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md hover:bg-secondary-container transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">print</span>
                <span>Generar Ingreso e Imprimir Ticket</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/20 text-white font-label-code text-[11px]">
                  ↵ Enter
                </span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[48px] px-5 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-text-secondary text-[13px] font-semibold transition-colors border border-surface-border"
              >
                Cancelar
              </button>
            </div>
          </div>

          {/* Operational Integrity Safeguards */}
          <div className="bg-surface-card rounded-xl p-4 border border-surface-border shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary text-[13px] font-bold">
              <span className="material-symbols-outlined text-[20px] text-secondary">security</span>
              <span>Reglas de Integridad Operativa Activas</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-surface-container-low flex items-start gap-2.5 border border-surface-border/50">
                <span className="material-symbols-outlined text-status-available text-[20px] mt-0.5">verified_user</span>
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-text-primary">Control Anti-Passback</span>
                  <span className="text-[11px] text-text-secondary">
                    Bloquea reingreso instantáneo si la placa figura activa en el patio sin checkout previo.
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low flex items-start gap-2.5 border border-surface-border/50">
                <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">timer</span>
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-text-primary">Cálculo al Segundo</span>
                  <span className="text-[11px] text-text-secondary">
                    Marca de tiempo criptográfica no alterable con sincronización NTP de alta precisión.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Thermal Ticket Live Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-card rounded-xl p-5 border border-surface-border shadow-md flex flex-col items-center relative overflow-hidden">
            {/* Top Badge */}
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-surface-border">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">receipt_long</span>
                <span className="text-[12px] uppercase font-bold text-text-primary tracking-wide">
                  Comprobante de Entrada
                </span>
              </div>
              <span className="font-label-code text-[11px] px-2.5 py-0.5 rounded-full bg-status-available-bg text-status-available font-semibold border border-status-available/20">
                Térmica 80mm
              </span>
            </div>

            {/* Physical Ticket Simulation */}
            <div className="w-full max-w-[340px] bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center text-text-primary font-label-code text-xs">
              {/* Ticket Header */}
              <div className="flex flex-col items-center text-center pb-2 w-full">
                <div className="flex items-center gap-1.5 text-[16px] font-bold text-primary tracking-tight font-sans">
                  <span className="material-symbols-outlined text-[20px]">local_parking</span>
                  <span>PARKFLOW OS</span>
                </div>
                <span className="text-[11px] text-text-secondary tracking-widest uppercase">
                  Parqueadero Sede Central
                </span>
                <span className="text-[10px] text-text-secondary">NIT: 901.442.839-1 • Régimen Común</span>
                <span className="text-[10px] text-text-secondary">Cra. 43A # 18 Sur - 45 • Tel: (604) 448-9000</span>
                <span className="text-[10px] text-text-secondary">Medellín, Colombia</span>
              </div>

              {/* Separation line */}
              <div className="w-full text-center text-text-secondary opacity-40 text-xs py-1 select-none overflow-hidden whitespace-nowrap">
                - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
              </div>

              {/* Ticket meta */}
              <div className="w-full flex justify-between items-center py-1">
                <span className="text-text-secondary uppercase">Ticket N°:</span>
                <span className="font-bold text-primary">{ticketNumber}</span>
              </div>
              <div className="w-full flex justify-between items-center py-1">
                <span className="text-text-secondary uppercase">Ingreso:</span>
                <span className="font-bold text-text-primary">{ticketTime}</span>
              </div>
              <div className="w-full flex justify-between items-center py-1">
                <span className="text-text-secondary uppercase">Operador:</span>
                <span className="text-text-primary">T-01 (Admin)</span>
              </div>

              {/* Big Plate Box */}
              <div className="w-full my-3 p-3 bg-surface-container-low rounded-lg text-center flex flex-col items-center justify-center border border-surface-border">
                <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">
                  Placa Registrada
                </span>
                <span className="font-label-plate text-[26px] text-primary tracking-widest font-bold">
                  {plate || '--- ---'}
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-container font-label-code text-[11px] font-semibold text-secondary">
                    {category}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary-container text-white font-label-code text-[11px] font-bold">
                    Celda {effectiveSlot}
                  </span>
                </div>
              </div>

              {/* Pricing breakdown on ticket */}
              <div className="w-full flex flex-col gap-1 py-1">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Tarifa Base por Hora:</span>
                  <span className="font-bold text-text-primary">${currentTariff.ratePerHour.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-text-secondary">Fracción mín. (0-30 min):</span>
                  <span className="text-text-secondary">${currentTariff.minFraction.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-text-secondary">Tolerancia salida:</span>
                  <span className="text-text-secondary">15 minutos</span>
                </div>
              </div>

              {notes && (
                <div className="w-full py-1 text-[11px] text-text-secondary border-t border-slate-100 mt-1">
                  <strong className="text-text-primary">Obs: </strong>
                  <span>{notes}</span>
                </div>
              )}

              {/* Simulated High Density Barcode */}
              <div className="w-full my-3 flex flex-col items-center">
                <div className="w-48 h-10 flex items-center justify-center gap-[2px] bg-white px-2 py-1 border border-slate-300 rounded">
                  <span className="w-[3px] h-8 bg-black inline-block"></span>
                  <span className="w-[1px] h-8 bg-black inline-block"></span>
                  <span className="w-[4px] h-8 bg-black inline-block"></span>
                  <span className="w-[2px] h-8 bg-black inline-block"></span>
                  <span className="w-[1px] h-8 bg-black inline-block"></span>
                  <span className="w-[3px] h-8 bg-black inline-block"></span>
                  <span className="w-[2px] h-8 bg-black inline-block"></span>
                  <span className="w-[4px] h-8 bg-black inline-block"></span>
                  <span className="w-[1px] h-8 bg-black inline-block"></span>
                  <span className="w-[2px] h-8 bg-black inline-block"></span>
                  <span className="w-[3px] h-8 bg-black inline-block"></span>
                  <span className="w-[1px] h-8 bg-black inline-block"></span>
                  <span className="w-[4px] h-8 bg-black inline-block"></span>
                  <span className="w-[2px] h-8 bg-black inline-block"></span>
                  <span className="w-[3px] h-8 bg-black inline-block"></span>
                </div>
                <span className="text-[10px] text-text-secondary tracking-widest mt-1">
                  PF*{plate || 'ABC123'}*08941*T
                </span>
              </div>

              {/* Legal disclaimer */}
              <div className="w-full text-center text-[9px] text-text-secondary leading-tight pt-1">
                <p>Conserve este comprobante. En caso de pérdida se cobrará tarifa plena de día más costo de reposición física ($15.000 COP).</p>
                <p className="mt-1 font-semibold">Vigilancia privada 24/7 • Ley 1480 de 2011</p>
              </div>

              <div className="w-full text-center text-text-secondary opacity-40 text-xs py-1 select-none overflow-hidden whitespace-nowrap">
                - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
              </div>
              <div className="text-[9px] text-text-secondary tracking-wider">
                *** GRACIAS POR SU VISITA ***
              </div>
            </div>

            {/* Print Controls */}
            <div className="w-full flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => showToast('Comprobante enviado a impresora térmica T-01')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-surface-container text-primary hover:bg-surface-container-high text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors border border-surface-border cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Reimprimir Comprobante</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-4 rounded-xl bg-surface-container text-secondary hover:bg-surface-container-high text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-surface-border cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Nuevo</span>
              </button>
            </div>
          </div>

          {/* Capacity Mini-Widget with Occupancy Bar */}
          <div className="bg-surface-card rounded-xl p-4 border border-surface-border shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] uppercase tracking-wider text-text-secondary font-bold">
                Ocupación por Nivel
              </span>
              <span className="font-label-code text-[12px] text-secondary font-bold">
                27 / 50 Ocupadas
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-secondary h-full" style={{ width: '54%' }}></div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-surface-container-low text-center border border-surface-border/50">
                <span className="block text-[11px] text-text-secondary">Nivel 1 (Ppal)</span>
                <span className="font-label-code text-[12px] font-bold text-text-primary">14 / 25</span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low text-center border border-surface-border/50">
                <span className="block text-[11px] text-text-secondary">Nivel 2 (Motos)</span>
                <span className="font-label-code text-[12px] font-bold text-text-primary">10 / 15</span>
              </div>
              <div className="p-2 rounded-lg bg-surface-container-low text-center border border-surface-border/50">
                <span className="block text-[11px] text-text-secondary">Nivel 3 (SUV)</span>
                <span className="font-label-code text-[12px] font-bold text-text-primary">3 / 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

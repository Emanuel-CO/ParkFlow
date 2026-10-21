import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { VehicleType } from '../types/parking.ts';
import { playCyberFeedback } from '../utils/audioAlert.ts';


export const RegistroEntrada: React.FC = () => {
  const {
    cells,
    tariffs,
    registerEntry,
    showToast,
    totalOccupied,
    totalCapacity,
    todayEntriesCount,
    occupancyPercent,
    thresholdSettings,
    isCapacityCritical,
  } = useParking();

  const [plate, setPlate] = useState('');
  const [category, setCategory] = useState<VehicleType>('Carro');
  const [slotMode, setSlotMode] = useState<'auto' | 'manual'>('auto');
  const [manualSlot, setManualSlot] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [ticketNumber, setTicketNumber] = useState('#PF-2099-00000');
  const [ticketTime, setTicketTime] = useState('');

  // Zone available cells
  const targetZone = (category === 'Moto' || category === 'Bicicleta') ? 'Zona B' : 'Zona A';
  const availableZoneCells = cells.filter((c) => c.zone === targetZone && c.status === 'free');
  const autoRecommendedSlot = availableZoneCells[0]?.id || (cells.find((c) => c.status === 'free')?.id || '---');
  const effectiveSlot = slotMode === 'auto' ? autoRecommendedSlot : (manualSlot || autoRecommendedSlot);

  // Initialize clock format
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
      playCyberFeedback('click', 0.2);
      showToast('Por favor ingrese un número de placa válido', 'warning');
      return;
    }
    if (isDuplicate) {
      playCyberFeedback('laser', 0.35);
      showToast('BLOQUEO ANTI-PASSBACK: El vehículo ya figura en las instalaciones', 'error');
      return;
    }

    const res = registerEntry(plate, category, effectiveSlot, notes);
    if (res.success) {
      playCyberFeedback('checkout', 0.35);
      setTicketNumber(res.ticketId || `#PF-2099-${Math.floor(10000 + Math.random() * 90000)}`);
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

  const categoriesList: {
    type: VehicleType;
    label: string;
    icon: string;
    rate: string;
    availCount: number;
    accentColor: string;
  }[] = [
    {
      type: 'Carro',
      label: 'Carro Particular',
      icon: 'directions_car',
      rate: '$4.500/h',
      availCount: cells.filter((c) => c.zone === 'Zona A' && c.status === 'free').length,
      accentColor: 'text-cyan-400 border-cyan-400/40 bg-cyan-500/10',
    },
    {
      type: 'Moto',
      label: 'Motocicleta',
      icon: 'two_wheeler',
      rate: '$2.200/h',
      availCount: cells.filter((c) => c.zone === 'Zona B' && c.status === 'free').length,
      accentColor: 'text-violet-400 border-violet-400/40 bg-violet-500/10',
    },
    {
      type: 'Camioneta / SUV',
      label: 'SUV / Blindado',
      icon: 'airport_shuttle',
      rate: '$6.000/h',
      availCount: cells.filter((c) => c.zone === 'Zona A' && c.status === 'free').length,
      accentColor: 'text-amber-400 border-amber-400/40 bg-amber-500/10',
    },
    {
      type: 'Bicicleta',
      label: 'E-Bike / Bici',
      icon: 'pedal_bike',
      rate: '$1.000/h',
      availCount: 8,
      accentColor: 'text-emerald-400 border-emerald-400/40 bg-emerald-500/10',
    },
  ];

  return (
    <div className="px-5 py-5 flex flex-col gap-5 max-w-[1700px] mx-auto w-full text-slate-100">
      {/* Top Action Bar / Metadatos de Estación */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl" style={{ background: 'linear-gradient(160deg, rgba(6,12,32,0.9) 0%, rgba(2,5,16,0.95) 100%)', border: '1px solid rgba(0,240,255,0.18)', boxShadow: '0 0 20px rgba(0,240,255,0.06)' }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <span className="material-symbols-outlined text-[24px]">login</span>
            </span>
            <div>
              <h1 className="font-hud text-lg font-black text-white tracking-wide">
                REGISTRO DE INGRESO // TERMINAL ÓPTICA
              </h1>
              <p className="text-xs font-mono text-slate-400">
                LPR Scanner Online • Sincronización continua de marca temporal
              </p>
            </div>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>LATENCIA: &lt; 12ms</span>
          </div>
        </div>

        {/* Live Shift Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#060a1a] flex items-center gap-2 border border-cyan-500/25">
            <span className="text-xs font-mono text-slate-400">Bahías Libres:</span>
            <span className="font-hud text-xs text-cyan-300 font-bold">
              {totalCapacity - totalOccupied} / {totalCapacity}
            </span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[#060a1a] flex items-center gap-2 border border-cyan-500/25">
            <span className="text-xs font-mono text-slate-400">Ingresos Turno:</span>
            <span className="font-hud text-xs text-emerald-400 font-bold">
              {todayEntriesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form 7 cols / Ticket preview 5 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Intake Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(4,10,28,0.95) 0%, rgba(2,5,16,0.98) 100%)', border: '1px solid rgba(0,240,255,0.22)', boxShadow: '0 0 30px rgba(0,240,255,0.06)' }}>
            {/* Step 1: Plate Input with Holographic Scanner */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="font-hud text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-2 font-bold" htmlFor="plate-input">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]"></span>
                  <span>MATRÍCULA / PLACA DEL VEHÍCULO</span>
                </label>
                <span className="font-mono text-[10px] text-slate-400">
                  AUTOENFOQUE // ESCÁNER LPR
                </span>
              </div>

              <div className="relative flex items-center overflow-hidden rounded-2xl border-2 border-cyan-500/50 bg-[#040714] shadow-[0_0_25px_rgba(0,240,255,0.2)]">
                {/* Simulated laser scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent h-10 w-full animate-laser pointer-events-none"></div>

                <span className="absolute left-4 font-mono text-cyan-400 select-none">
                  <span className="material-symbols-outlined text-[28px] align-middle">camera</span>
                </span>
                <input
                  id="plate-input"
                  type="text"
                  maxLength={7}
                  placeholder="ABC-123"
                  value={plate}
                  onChange={(e) => handlePlateChange(e.target.value)}
                  className="w-full bg-transparent text-yellow-300 font-label-plate text-[30px] uppercase pl-16 pr-12 py-3.5 outline-none tracking-widest text-center placeholder:text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setPlate('')}
                  className="absolute right-4 p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                  title="Limpiar campo"
                >
                  <span className="material-symbols-outlined text-[20px]">backspace</span>
                </button>
              </div>

              {/* Dynamic Feedback Banner */}
              {isDuplicate ? (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-red-950/70 text-rose-300 border border-rose-500/40 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-rose-400 animate-pulse">report</span>
                    <span className="font-mono text-xs font-bold">
                      ALERTA ANTI-PASSBACK: El vehículo {plate} ya se encuentra activo en patio.
                    </span>
                  </div>
                  <span className="font-hud text-xs font-black text-rose-400">BLOQUEADO</span>
                </div>
              ) : plate.length >= 3 ? (
                <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-400">verified</span>
                    <span className="font-mono text-xs font-medium">
                      Patrón válido verificado • Sin conflictos de paso
                    </span>
                  </div>
                  <span className="font-hud text-xs font-black text-emerald-400">LISTO // OK</span>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-[#060a1a] text-slate-500 font-mono text-xs border border-cyan-500/15">
                  <span>Ingrese 6 caracteres alfanuméricos</span>
                  <span>ESPERANDO ENTRADA...</span>
                </div>
              )}
            </div>

            {/* Step 2: Vehicle Category Selector */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="font-hud text-xs uppercase tracking-wider text-cyan-300 font-bold">
                  CATEGORÍA Y CLASE DE VEHÍCULO
                </label>
                <span className="font-mono text-[10px] text-slate-400">TARIFA HORARIA ASOCIADA</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categoriesList.map((cat) => {
                  const isSelected = category === cat.type;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => setCategory(cat.type)}
                      className={`text-left p-3.5 rounded-xl flex flex-col justify-between transition-all border relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-b from-cyan-500/25 to-blue-900/40 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] text-white'
                          : 'bg-[#060a1a] hover:bg-[#0a122e] text-slate-300 border-cyan-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full mb-2">
                        <span className={`material-symbols-outlined text-[28px] ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                          {cat.icon}
                        </span>
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          {cat.availCount} lib.
                        </span>
                      </div>
                      <div>
                        <div className="font-hud text-xs font-bold leading-tight">{cat.label}</div>
                        <div className="font-mono text-[11px] text-cyan-400 font-semibold mt-0.5">
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
                <label className="font-hud text-xs uppercase tracking-wider text-cyan-300 font-bold">
                  ASIGNACIÓN DE BAHÍA // TELEMETRÍA
                </label>
                <span className="font-mono text-[11px] text-emerald-400 font-bold">
                  {category === 'Moto' || category === 'Bicicleta' ? 'ZONA B // 20 BAHÍAS' : 'ZONA A // 30 BAHÍAS'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${
                    slotMode === 'auto'
                      ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.15)] text-white'
                      : 'bg-[#060a1a] border-cyan-500/20 text-slate-300 hover:bg-[#0a122e]'
                  }`}
                >
                  <input
                    type="radio"
                    name="slot-assignment"
                    value="auto"
                    checked={slotMode === 'auto'}
                    onChange={() => setSlotMode('auto')}
                    className="w-4 h-4 text-cyan-400 accent-cyan-400"
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-hud text-xs font-bold">Auto-Asignación IA</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[9px] font-bold">
                        ÓPTIMA
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                      Bahía designada:{' '}
                      <strong className="text-cyan-300 font-hud">{autoRecommendedSlot}</strong>
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${
                    slotMode === 'manual'
                      ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.15)] text-white'
                      : 'bg-[#060a1a] border-cyan-500/20 text-slate-300 hover:bg-[#0a122e]'
                  }`}
                >
                  <input
                    type="radio"
                    name="slot-assignment"
                    value="manual"
                    checked={slotMode === 'manual'}
                    onChange={() => setSlotMode('manual')}
                    className="w-4 h-4 text-cyan-400 accent-cyan-400"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-hud text-xs font-bold">Selección Manual</span>
                    <span className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                      Elegir celda de la matriz de vacantes
                    </span>
                  </div>
                </label>
              </div>

              {slotMode === 'manual' && (
                <div className="p-3 bg-[#060a1a] rounded-xl border border-cyan-500/30 flex items-center gap-3 mt-1">
                  <span className="material-symbols-outlined text-cyan-400 text-[20px]">grid_goldenratio</span>
                  <div className="flex-1">
                    <label className="block font-mono text-[10px] text-cyan-300 mb-1">
                      Celdas libres para {category}:
                    </label>
                    <select
                      value={manualSlot || autoRecommendedSlot}
                      onChange={(e) => setManualSlot(e.target.value)}
                      className="w-full bg-slate-900 text-cyan-300 font-mono text-xs p-2 rounded-lg border border-cyan-500/30 focus:outline-none"
                    >
                      {availableZoneCells.map((c) => (
                        <option key={c.id} value={c.id}>
                          Celda {c.id} ({c.zone} - Vacante)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Observations / Inventario */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="font-hud text-xs uppercase tracking-wider text-cyan-300 flex items-center justify-between font-bold" htmlFor="notes-input">
                <span>OBSERVACIONES / TELEMETRÍA PREVIA</span>
                <span className="font-mono text-[10px] text-slate-400">MÁX. 120 CHARS</span>
              </label>
              <input
                id="notes-input"
                type="text"
                maxLength={120}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Rayón preexistente, casco en custodia, sin objetos de valor..."
                className="w-full bg-[#060a1a] text-slate-200 font-mono text-xs px-4 py-3 rounded-xl border border-cyan-500/30 focus:border-cyan-400 outline-none transition-colors"
              />

              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="font-mono text-[10px] text-slate-500">Etiquetas:</span>
                {['Casco recibido', 'Rayón preexistente', 'Sin objetos de valor'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickTag(tag)}
                    className="font-mono text-[10px] px-2.5 py-1 rounded-lg bg-[#060a1a] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                disabled={isDuplicate || !plate}
                onClick={handleGenerateTicket}
                className="flex-1 min-h-[50px] px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud text-xs font-black flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer tracking-wider"
              >
                <span className="material-symbols-outlined text-[22px]">print</span>
                <span>GENERAR INGRESO & IMPRIMIR</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-black/20 text-black font-mono text-[10px] font-bold">
                  ↵ ENTER
                </span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[50px] px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs font-semibold border border-cyan-500/25 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Holographic Ticket Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 shadow-2xl flex flex-col items-center relative overflow-hidden">
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-[20px]">receipt_long</span>
                <span className="font-hud text-xs font-bold text-white tracking-wider">
                  TICKET DIGITAL // HOLOGRÁFICO
                </span>
              </div>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                EN VIVO
              </span>
            </div>

            {/* Simulated Cyber Ticket */}
            <div className="w-full max-w-[360px] bg-gradient-to-b from-[#09122c] to-[#040817] p-6 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-cyan-400/40 flex flex-col items-center text-slate-200 font-mono text-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-500 shadow-[0_0_10px_#00f0ff]"></div>

              {/* Ticket Brand */}
              <div className="flex flex-col items-center text-center pb-2 w-full">
                <div className="flex items-center gap-1.5 font-hud text-base font-black text-cyan-300 tracking-wider">
                  <span className="material-symbols-outlined text-[20px] text-cyan-400">electric_bolt</span>
                  <span>PARKFLOW 2099</span>
                </div>
                <span className="text-[10px] text-cyan-400/80 tracking-widest uppercase">
                  Sede Central // Quantum Hub
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5">NTP Time Cryptographically Verified</span>
              </div>

              {/* Dotted separator */}
              <div className="w-full text-center text-cyan-500/40 text-xs py-1 select-none overflow-hidden">
                - - - - - - - - - - - - - - - - - - - - - - - - - -
              </div>

              {/* Meta */}
              <div className="w-full flex justify-between items-center py-1 font-mono text-[11px]">
                <span className="text-slate-400">TICKET ID:</span>
                <span className="font-hud text-cyan-300 font-bold">{ticketNumber}</span>
              </div>
              <div className="w-full flex justify-between items-center py-1 font-mono text-[11px]">
                <span className="text-slate-400">REGISTRO:</span>
                <span className="text-white">{ticketTime}</span>
              </div>
              <div className="w-full flex justify-between items-center py-1 font-mono text-[11px]">
                <span className="text-slate-400">OPERADOR:</span>
                <span className="text-cyan-400">T-01 (Admin)</span>
              </div>

              {/* Big Plate Display Box */}
              <div className="w-full my-3 p-4 bg-[#050814] rounded-xl text-center flex flex-col items-center justify-center border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold mb-1">
                  MATRÍCULA ASIGNADA
                </span>
                <span className="font-label-plate text-2xl text-yellow-300 tracking-widest font-black">
                  {plate || '--- ---'}
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 font-mono text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                    {category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-hud text-[10px] font-black border border-emerald-500/40">
                    BAHÍA {effectiveSlot}
                  </span>
                </div>
              </div>

              {/* Pricing breakdown on ticket */}
              <div className="w-full flex flex-col gap-1 py-1 font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tarifa Base:</span>
                  <span className="font-bold text-white">${currentTariff.ratePerHour.toLocaleString('es-CO')} / h</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Fracción mín. (0-30 min):</span>
                  <span className="text-slate-400">${currentTariff.minFraction.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Periodo de gracia:</span>
                  <span className="text-emerald-400 font-bold">15 minutos</span>
                </div>
              </div>

              {notes && (
                <div className="w-full py-2 text-[10px] text-slate-400 border-t border-cyan-500/20 mt-1">
                  <strong className="text-cyan-300 font-mono">OBSERVACIÓN: </strong>
                  <span>{notes}</span>
                </div>
              )}

              {/* Holographic Barcode */}
              <div className="w-full my-3 flex flex-col items-center">
                <div className="w-52 h-10 flex items-center justify-center gap-[2px] bg-[#050814] px-3 py-1 border border-cyan-500/40 rounded-lg shadow-inner">
                  <span className="w-[3px] h-8 bg-cyan-400 inline-block"></span>
                  <span className="w-[1px] h-8 bg-cyan-400 inline-block"></span>
                  <span className="w-[4px] h-8 bg-cyan-400 inline-block"></span>
                  <span className="w-[2px] h-8 bg-cyan-400 inline-block"></span>
                  <span className="w-[1px] h-8 bg-cyan-400 inline-block"></span>
                  <span className="w-[3px] h-8 bg-cyan-400 inline-block"></span>
                  <span className="w-[2px] h-8 bg-cyan-400 inline-block"></span>
                  <span className="w-[4px] h-8 bg-cyan-400 inline-block"></span>
                  <span className="w-[1px] h-8 bg-cyan-400 inline-block"></span>
                  <span className="w-[3px] h-8 bg-cyan-400 inline-block"></span>
                  <span className="w-[2px] h-8 bg-cyan-400 inline-block"></span>
                  <span className="w-[4px] h-8 bg-cyan-400 inline-block"></span>
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-1">2 0 9 9 8 9 4 2 1 0 4 7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

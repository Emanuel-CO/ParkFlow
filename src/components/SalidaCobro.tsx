import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { ParkingCell } from '../types/parking.ts';
import { playCyberFeedback } from '../utils/audioAlert.ts';

const CAM_ENT_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuABMSHFi9z9ZuSwIJSl9LpWa9KupMi6pOZqGSpb5Ky1vGXPYGnvhg02qbJESXSAk_Dv8b3hgeGb6zUnxNmgdaUwW31AcxSiu7FtxiVDeh1QdV4z1UlwGCuxmmLPH64PnBrR4UT5zUBHywIo_k4Br3U6ovTBeheyGcxehUBj4WMEoYdSmwhKMJ2bvYyamW_p-aftoIcVHRVRq4cZgV8V86RRbeBuR3qSunotzoI6QKuCXIMIMw1dblZm";
const CAM_SAL_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuDX824AoEaYC9qCqNMPBVrlOA-t-AMBD-afvstjk8RYYEwC3cBMkM5AVhnCxmfl4ci9W1-Z6KlN7WbhSHdcn7Y-LBuPjXDNrMWUTXNCwuwOpHkJ4THl3qi1OLOEjJhsPizEGLut46kp6z01m_18Ab7w6XGYHdj237bQdKLcEgp66W0bXq9OKzNaL5PQl8iEBuUcJt7z-sy8-IE_Trwjs5-WbgeecDVagp3wA82y6AjLAEhRzhCzODEL";

export const SalidaCobro: React.FC = () => {
  const {
    cells,
    processCheckout,
    showToast,
    selectedVehicleForCheckout,
    setSelectedVehicleForCheckout,
    currentTimeString,
  } = useParking();

  const [searchQuery, setSearchQuery] = useState('KLO-892');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr'>('cash');
  const [receivedAmount, setReceivedAmount] = useState<number>(20000);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false);
  const [secondsTicking, setSecondsTicking] = useState(24);
  const [isScanningLpr, setIsScanningLpr] = useState(false);

  // Default target cell fallback
  const defaultTargetCell: ParkingCell = cells.find(
    (c) => c.status === 'occupied' && (c.plate === searchQuery || c.id === searchQuery)
  ) || cells.find((c) => c.status === 'occupied') || {
    id: 'A-04',
    zone: 'Zona A',
    category: 'Carro',
    status: 'occupied',
    plate: 'KLO-892',
    entryTime: '08:30:00 AM',
    duration: '3h 15m 20s',
    ratePerHour: 4500,
    currentTotal: 14625,
    ticketId: '#TK-2099-8992',
  };

  const activeCell = selectedVehicleForCheckout?.cell || defaultTargetCell;

  // Billing calculation
  const hourlyRate = activeCell.ratePerHour || 4500;
  const hoursComplete = 3;
  const fractionQuarterFee = Math.round(hourlyRate / 4); // 1.125
  const totalDue = hoursComplete * hourlyRate + fractionQuarterFee; // 14.625
  const changeAmount = receivedAmount - totalDue;

  // Ticking duration
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsTicking((prev) => (prev + 1) % 60);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (plate: string) => {
    playCyberFeedback('click', 0.2);
    setSearchQuery(plate);
    const found = cells.find(
      (c) => c.status === 'occupied' && (c.plate?.toUpperCase() === plate.toUpperCase() || c.id.toUpperCase() === plate.toUpperCase())
    );
    if (found) {
      setSelectedVehicleForCheckout({
        cell: found,
        calculatedTotal: totalDue,
        hours: 3,
        fractionMinutes: 15,
      });
      showToast(`Vehículo localizado en telemetría: ${found.plate || found.id}`, 'success');
    } else {
      showToast(`Placa o celda "${plate}" cargada en despacho de liquidación`, 'info');
    }
  };

  const handleTriggerLpr = () => {
    setIsScanningLpr(true);
    playCyberFeedback('laser', 0.35);
    setTimeout(() => {
      setIsScanningLpr(false);
      showToast('Cámara LPR óptica: Placa KLO-892 identificada (Confianza: 99.4%)', 'success');
      setSearchQuery('KLO-892');
      playCyberFeedback('success', 0.25);
    }, 900);
  };

  const handleSelectPaymentMethod = (method: 'cash' | 'card' | 'qr') => {
    playCyberFeedback('click', 0.15);
    setPaymentMethod(method);
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === 'cash' && changeAmount < 0) {
      showToast('El monto en efectivo recibido es insuficiente para cubrir la tarifa', 'error');
      playCyberFeedback('laser', 0.4);
      return;
    }

    const methodMap = {
      cash: 'Efectivo',
      card: 'Datáfono',
      qr: 'QR Nequi/Davi',
    } as const;

    const res = processCheckout(activeCell.id, methodMap[paymentMethod], receivedAmount);
    if (res.success) {
      playCyberFeedback('checkout', 0.4);
      setIsSuccessModalOpen(true);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
      
      {/* ── TOP HUD HEADER BANNER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgba(8,16,42,0.92) 0%, rgba(4,8,24,0.96) 100%)',
        border: '1px solid rgba(0,240,255,0.25)',
        boxShadow: '0 0 35px rgba(0,240,255,0.08), inset 0 0 20px rgba(0,240,255,0.03)',
      }}>
        {/* Top laser scan accent */}
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
              TERMINAL T-01 // CAJA PRINCIPAL
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-violet-400 font-bold">DESPACHO & LIQUIDACIÓN QUANTUM</span>
          </div>
          <h1 className="font-hud text-[24px] md:text-[28px] font-black text-white tracking-wider flex items-center gap-3">
            <span>SALIDA Y LIQUIDACIÓN AUTOMATIZADA</span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              HUD v3.4
            </span>
          </h1>
          <p className="font-sans text-[13px] text-slate-400 mt-0.5">
            Módulo de liquidación matemática auditada, captura biométrica LPR y despacho de barreras de salida
          </p>
        </div>

        {/* Operational Integrity Telemetry Chip */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 z-10 self-start lg:self-auto shadow-[0_0_20px_rgba(0,255,157,0.12)]">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/40">
            <span className="material-symbols-outlined text-[24px] animate-pulse-subtle">verified_user</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-hud text-[11px] text-emerald-300 font-bold tracking-wider">INTEGRIDAD PRD 3.3</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="font-mono text-[10px] text-emerald-400/80">0% Discrepancias Tarifarias Activas</span>
          </div>
        </div>
      </div>

      {/* ── QUICK SEARCH & LPR SCANNER BAR ── */}
      <section className="p-4 md:p-5 rounded-2xl relative overflow-hidden" style={{
        background: 'linear-gradient(145deg, rgba(6,12,32,0.88) 0%, rgba(3,7,20,0.94) 100%)',
        border: '1px solid rgba(0,240,255,0.2)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      }}>
        {/* Subtle scanline */}
        <div className="absolute inset-0 scanline-bg opacity-40 pointer-events-none" />

        <form
          className="relative z-10 flex flex-col md:flex-row items-stretch gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cyan-400">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              placeholder="BUSCAR POR PLACA O CELDA... (EJ. KLO-892, A-04)"
              className="w-full h-13 pl-12 pr-28 rounded-xl font-mono text-[16px] md:text-[18px] uppercase text-cyan-300 placeholder:text-slate-600 placeholder:font-mono placeholder:text-xs focus:outline-none focus:border-cyan-400 transition-all"
              style={{
                background: 'rgba(2,5,16,0.85)',
                border: '1px solid rgba(0,240,255,0.3)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), 0 0 15px rgba(0,240,255,0.06)',
              }}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-1.5 pointer-events-none">
              <kbd className="px-2 py-0.5 rounded font-mono text-[10px] text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 font-bold">
                ENTER
              </kbd>
            </div>
          </div>

          <button
            type="submit"
            className="h-13 px-6 rounded-xl font-hud text-[12px] font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer cyber-btn-cyan"
          >
            <span className="material-symbols-outlined text-[20px]">directions_car</span>
            <span>BUSCAR VEHÍCULO</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerLpr}
            disabled={isScanningLpr}
            className={`h-13 px-5 rounded-xl font-hud text-[12px] font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isScanningLpr
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 animate-pulse'
                : 'cyber-btn-violet'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{isScanningLpr ? 'hourglass_top' : 'linked_camera'}</span>
            <span>{isScanningLpr ? 'ESCANEANDO LPR...' : 'SENSOR LPR SALIDA'}</span>
          </button>
        </form>

        {/* Quick Recent Search Chips */}
        <div className="relative z-10 flex items-center gap-2 mt-3.5 overflow-x-auto pt-1">
          <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap uppercase tracking-wider">
            En cola reciente:
          </span>
          {['KLO-892 (A-04)', 'MTR-411 (B-12)', 'XYZ-908 (M-02)', 'NVY-402 (A-03)'].map((item) => {
            const plateKey = item.split(' ')[0];
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleSearch(plateKey)}
                className="px-3 py-1 rounded-lg font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 transition-all cursor-pointer whitespace-nowrap hover:shadow-[0_0_12px_rgba(0,240,255,0.3)]"
              >
                {item}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── MAIN WORKFLOW BENTO: AUDIT & CHECKOUT ACTION PANE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Vehicle Details & Mathematical Liquidation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Card: Vehicle Information & Telemetry */}
          <div className="rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col gap-5" style={{
            background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
            border: '1px solid rgba(0,240,255,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />
            
            {/* Status bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-cyan-500/15">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-rose-500/15 text-rose-300 text-[11px] font-hud font-bold rounded-full flex items-center gap-2 border border-rose-500/40 shadow-[0_0_12px_rgba(255,42,109,0.3)]">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  SERVICIO ACTIVO EN LIQUIDACIÓN
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {activeCell.ticketId || '#TK-2099-8992'}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                <span className="material-symbols-outlined text-cyan-400 text-[20px]">local_parking</span>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Celda Asignada</span>
                  <span className="font-mono text-[12px] text-cyan-300 font-bold">
                    {activeCell.id} · {activeCell.zone || 'Sector Norte'}
                  </span>
                </div>
              </div>
            </div>

            {/* Central Vehicle Showcase Bento */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-cyan-500/20 relative overflow-hidden" style={{
              background: 'rgba(2,5,16,0.8)',
            }}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-cyan-300 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.2)] shrink-0" style={{
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(139,92,246,0.2) 100%)',
                }}>
                  <span className="material-symbols-outlined text-[36px]">directions_car</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Placa Óptica Reconocida
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <div className="plate-bezel px-3 py-1 rounded-lg">
                      <span className="font-label-plate text-[22px] md:text-[26px] text-yellow-300 font-black tracking-widest block drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">
                        {activeCell.plate || 'KLO-892'}
                      </span>
                    </div>
                    <span className="text-[12px] font-hud font-bold text-cyan-400">
                      {activeCell.category || 'Carro / Automóvil'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 mt-1">
                    Sedán Particular · Color Gris Plata · Telemetría Activa
                  </span>
                </div>
              </div>

              {/* Elapsed Time Counter */}
              <div className="flex flex-col items-start sm:items-end justify-center p-3 rounded-xl border border-cyan-500/25 shrink-0" style={{
                background: 'rgba(0,240,255,0.06)',
                boxShadow: '0 0 15px rgba(0,240,255,0.08)',
              }}>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Permanencia Total</span>
                <div className="flex items-center gap-1.5 text-cyan-300 text-[20px] md:text-[22px] font-mono font-black glow-text-cyan">
                  <span className="material-symbols-outlined text-[20px] text-cyan-400">timer</span>
                  <span>3h 15m {String(secondsTicking).padStart(2, '0')}s</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold mt-0.5">
                  3 horas + 15 min fracción aplicada
                </span>
              </div>
            </div>

            {/* Timestamps & Operator Attribution Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-cyan-500/15 flex flex-col" style={{ background: 'rgba(2,5,16,0.6)' }}>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 uppercase">
                  <span className="material-symbols-outlined text-[15px] text-cyan-400">login</span>
                  Hora Ingreso
                </span>
                <span className="font-mono text-[13px] text-cyan-200 font-bold mt-1">
                  {activeCell.entryTime || 'Hoy, 08:30:00 AM'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5">Barrera Norte 01 // LPR</span>
              </div>

              <div className="p-3 rounded-xl border border-cyan-500/15 flex flex-col" style={{ background: 'rgba(2,5,16,0.6)' }}>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 uppercase">
                  <span className="material-symbols-outlined text-[15px] text-rose-400">logout</span>
                  Hora Salida (Actual)
                </span>
                <span className="font-mono text-[13px] text-white font-bold mt-1">
                  {currentTimeString ? currentTimeString.split('-')[0].trim() : '11:45:20 AM'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 mt-0.5">Tolerancia: 10 min post-pago</span>
              </div>

              <div className="p-3 rounded-xl border border-cyan-500/15 flex flex-col" style={{ background: 'rgba(2,5,16,0.6)' }}>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 uppercase">
                  <span className="material-symbols-outlined text-[15px] text-violet-400">badge</span>
                  Operador Registro
                </span>
                <span className="font-mono text-[13px] text-violet-300 font-bold mt-1 truncate">Carlos Gómez</span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5">Turno Mañana (S-01)</span>
              </div>
            </div>

            {/* LPR Camera Feeds Dual View */}
            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              
              {/* CAM-ENT-01 Ingress Evidence */}
              <div className="sm:w-1/2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-cyan-400">photo_camera</span>
                    Evidencia Entrada (Ingreso)
                  </span>
                  <span className="text-cyan-400 font-bold">08:30:00 AM</span>
                </div>
                <div className="h-32 rounded-xl overflow-hidden relative border border-cyan-500/30 group shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={CAM_ENT_URL}
                    alt="Evidencia entrada"
                  />
                  {/* Overlay scanline */}
                  <div className="absolute inset-0 scanline-bg opacity-30 pointer-events-none" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 text-cyan-300 font-mono text-[9px] rounded border border-cyan-500/40 backdrop-blur-xs font-bold">
                    CAM-ENT-01 · CAPTURADO
                  </span>
                </div>
              </div>

              {/* CAM-SAL-02 Egress Reticle Live */}
              <div className="sm:w-1/2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-400">videocam</span>
                    Cámara Salida en Vivo (LPR)
                  </span>
                  <span className="font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE HUD
                  </span>
                </div>
                <div className="h-32 rounded-xl overflow-hidden relative border border-emerald-500/40 group shadow-[0_0_20px_rgba(0,255,157,0.15)]">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={CAM_SAL_URL}
                    alt="Evidencia salida en vivo"
                  />
                  {/* Optical Reticle */}
                  <div className="camera-reticle" />
                  {/* Live OCR plate detection box */}
                  <div className="absolute top-1/3 left-1/4 right-1/4 h-10 border-2 border-cyan-400 rounded bg-cyan-500/10 pointer-events-none flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                    <span className="font-mono text-[10px] text-yellow-300 font-bold bg-black/70 px-1 rounded">
                      OCR: {activeCell.plate || 'KLO-892'} [99.4%]
                    </span>
                  </div>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 text-emerald-300 font-mono text-[9px] rounded border border-emerald-500/40 backdrop-blur-xs font-bold">
                    CAM-SAL-02 · OPTICAL SCAN
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Desglose Detallado de Cobro (Liquidación Auditada) */}
          <div className="rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col gap-4" style={{
            background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
            border: '1px solid rgba(0,240,255,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-[24px]">calculate</span>
                <h2 className="font-hud text-[15px] font-bold text-white tracking-wider">
                  LIQUIDACIÓN DE TARIFA (REGLA AUDITADA)
                </h2>
              </div>
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 font-mono text-[10px] rounded-lg font-bold border border-cyan-500/30">
                SNAPSHOT: v2.4 (FIJA INGRESO)
              </span>
            </div>

            <div className="flex flex-col gap-2 p-4 rounded-xl border border-cyan-500/20" style={{ background: 'rgba(2,5,16,0.7)' }}>
              
              <div className="flex items-center justify-between py-1.5 font-mono text-[12px] text-slate-300 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-cyan-400">sell</span>
                  <span>Tarifa base por hora (Automóvil)</span>
                </div>
                <span className="text-cyan-200 font-bold">${hourlyRate.toLocaleString('es-CO')} COP</span>
              </div>

              <div className="flex items-center justify-between py-1.5 font-mono text-[12px] text-slate-300 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-cyan-400">schedule</span>
                  <span>Cobro por 3 horas completas (3 x ${hourlyRate.toLocaleString('es-CO')})</span>
                </div>
                <span className="text-cyan-200 font-bold">${(3 * hourlyRate).toLocaleString('es-CO')} COP</span>
              </div>

              <div className="flex items-center justify-between py-1.5 font-mono text-[12px] text-slate-300 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-cyan-400">more_time</span>
                  <span>Fracción adicional aplicada (15 min = 1/4 hora)</span>
                </div>
                <span className="text-cyan-200 font-bold">${fractionQuarterFee.toLocaleString('es-CO')} COP</span>
              </div>

              <div className="flex items-center justify-between py-1.5 font-mono text-[12px] text-slate-300 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">loyalty</span>
                  <span>Descuento aplicado / Cortesía comercial</span>
                </div>
                <span className="text-emerald-400 font-bold">-$0 COP</span>
              </div>

              {/* Total Hero */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-1 border-t border-cyan-500/30">
                <div className="flex flex-col">
                  <span className="font-hud text-[12px] uppercase tracking-wider text-cyan-400 font-bold">
                    TOTAL LIQUIDADO A PAGAR
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    Impuestos y tasa de parqueo incluidos · Ley 12
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono text-[11px] rounded font-bold border border-cyan-500/40">
                    COP
                  </span>
                  <span className="font-mono text-[32px] md:text-[36px] font-black text-cyan-300 glow-text-cyan tracking-tight">
                    ${totalDue.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
              <span className="material-symbols-outlined text-[16px] text-cyan-400">info</span>
              <p>
                Cálculo inmutable certificado según Art. 12 Ley de Estacionamientos y regla de redondeo al cuarto de hora registrado al ingreso.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment Reception Terminal (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col gap-5 sticky top-20" style={{
            background: 'linear-gradient(160deg, rgba(8,16,44,0.95) 0%, rgba(3,7,20,0.98) 100%)',
            border: '1px solid rgba(0,240,255,0.35)',
            boxShadow: '0 0 40px rgba(0,240,255,0.1), 0 16px 40px rgba(0,0,0,0.7)',
          }}>
            {/* Top Cyan Glow Line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-[24px]">payments</span>
                <h2 className="font-hud text-[15px] font-bold text-white tracking-wider">RECEPCIÓN DE PAGO</h2>
              </div>
              <span className="px-3 py-1 bg-amber-500/15 text-amber-300 font-mono text-[10px] font-bold rounded-full flex items-center gap-1.5 border border-amber-500/40 shadow-[0_0_12px_rgba(255,183,3,0.25)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                PENDIENTE
              </span>
            </div>

            {/* Method Tabs */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                1. Seleccionar Método de Pago:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all cursor-pointer border ${
                    paymentMethod === 'cash'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(0,240,255,0.35)]'
                      : 'bg-black/40 hover:bg-black/60 text-slate-400 border-white/10 hover:border-cyan-500/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">payments</span>
                  <span className="font-hud text-[11px] mt-1 font-bold">EFECTIVO</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all cursor-pointer border ${
                    paymentMethod === 'card'
                      ? 'bg-violet-500/25 border-violet-400 text-violet-200 shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                      : 'bg-black/40 hover:bg-black/60 text-slate-400 border-white/10 hover:border-violet-500/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">credit_card</span>
                  <span className="font-hud text-[11px] mt-1 font-bold">TARJETA NFC</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPaymentMethod('qr')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all cursor-pointer border ${
                    paymentMethod === 'qr'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(0,255,157,0.35)]'
                      : 'bg-black/40 hover:bg-black/60 text-slate-400 border-white/10 hover:border-emerald-500/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                  <span className="font-hud text-[11px] mt-1 font-bold">QR DINÁMICO</span>
                </button>
              </div>
            </div>

            {/* Cash Calculator Terminal */}
            {paymentMethod === 'cash' && (
              <div className="flex flex-col gap-3 p-4 rounded-xl border border-cyan-500/25 relative overflow-hidden" style={{
                background: 'rgba(2,5,16,0.85)',
              }}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-slate-400 flex justify-between items-center" htmlFor="amount-input">
                    <span className="uppercase tracking-wider">Monto Recibido en Caja</span>
                    <span className="text-cyan-400 font-mono text-[11px] font-bold">
                      Tarifa: ${totalDue.toLocaleString('es-CO')}
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-mono text-cyan-400 font-bold text-sm">
                      $
                    </span>
                    <input
                      id="amount-input"
                      type="number"
                      step={500}
                      value={receivedAmount || ''}
                      onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
                      className="w-full h-12 pl-8 pr-16 rounded-xl font-mono text-[20px] font-black text-cyan-300 focus:outline-none focus:border-cyan-400 transition-all"
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(0,240,255,0.4)',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.9)',
                      }}
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center font-mono text-cyan-400/80 text-[11px] font-bold">
                      COP
                    </span>
                  </div>
                </div>

                {/* Quick Bills Shortcuts */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Billetes:</span>
                  {[15000, 20000, 50000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        playCyberFeedback('click', 0.15);
                        setReceivedAmount(val);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                        receivedAmount === val
                          ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                          : 'bg-black/50 text-slate-400 hover:text-white border-white/10'
                      }`}
                    >
                      ${val.toLocaleString('es-CO')}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      playCyberFeedback('click', 0.15);
                      setReceivedAmount(totalDue);
                    }}
                    className="px-2.5 py-1 bg-cyan-950/70 text-cyan-300 hover:text-white rounded-lg text-xs font-mono font-bold border border-cyan-500/40 cursor-pointer"
                  >
                    Exacto
                  </button>
                </div>

                {/* Change / Vueltos Display */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  changeAmount >= 0
                    ? 'bg-emerald-500/10 border-emerald-500/35 shadow-[0_0_20px_rgba(0,255,157,0.12)]'
                    : 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_20px_rgba(255,42,109,0.15)]'
                }`}>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Cambio / Vueltos al Conductor:
                    </span>
                    <span className={`text-[11px] font-mono font-bold mt-0.5 ${changeAmount >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                      {changeAmount >= 0 ? (changeAmount === 0 ? '✓ Pago Exacto sin cambio' : '✓ Listo para entregar') : '⚠ Monto insuficiente'}
                    </span>
                  </div>
                  <div className={`flex items-baseline gap-1 font-mono font-black ${changeAmount >= 0 ? 'text-emerald-300 glow-text-emerald' : 'text-rose-400 glow-text-red'}`}>
                    <span className="text-sm">$</span>
                    <span className="text-[22px] md:text-[24px]">
                      {Math.abs(changeAmount).toLocaleString('es-CO')}
                    </span>
                    <span className="text-[10px] opacity-70">COP</span>
                  </div>
                </div>
              </div>
            )}

            {/* Digital Card Terminal Panel */}
            {paymentMethod === 'card' && (
              <div className="flex flex-col items-center justify-center p-5 rounded-xl gap-3 text-center border border-violet-500/35 relative overflow-hidden" style={{
                background: 'rgba(2,5,16,0.85)',
              }}>
                <div className="w-14 h-14 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shadow-[0_0_25px_rgba(139,92,246,0.35)] animate-pulse">
                  <span className="material-symbols-outlined text-[32px]">credit_card</span>
                </div>
                <div>
                  <h4 className="font-hud text-[13px] font-bold text-white tracking-wider">DATÁFONO POS EN LÍNEA</h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    Aproxime tarjeta contactless o inserte chip en terminal POS #1
                  </p>
                </div>
                <div className="font-mono text-[13px] text-violet-300 font-bold bg-violet-950/60 px-4 py-1.5 rounded-lg border border-violet-500/35 shadow-sm">
                  TOTAL APROXIMAR: ${totalDue.toLocaleString('es-CO')} COP
                </div>
              </div>
            )}

            {/* Digital QR Panel */}
            {paymentMethod === 'qr' && (
              <div className="flex flex-col items-center justify-center p-5 rounded-xl gap-3 text-center border border-emerald-500/35 relative overflow-hidden" style={{
                background: 'rgba(2,5,16,0.85)',
              }}>
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-[0_0_25px_rgba(0,255,157,0.35)]">
                  <span className="material-symbols-outlined text-[32px]">qr_code_2</span>
                </div>
                <div>
                  <h4 className="font-hud text-[13px] font-bold text-white tracking-wider">CÓDIGO QR QUANTUM LISTO</h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    Transfiera exactamente ${totalDue.toLocaleString('es-CO')} COP a Nequi o Daviplata ParkFlow
                  </p>
                </div>
                <div className="font-mono text-[12px] text-emerald-300 font-bold bg-emerald-950/60 px-4 py-1.5 rounded-lg border border-emerald-500/35">
                  REF: PK-{activeCell.plate || '892-KLO'}
                </div>
              </div>
            )}

            {/* Business Rule Notice */}
            <div className="p-3.5 rounded-xl flex items-start gap-3 border border-cyan-500/25" style={{ background: 'rgba(0,240,255,0.05)' }}>
              <span className="material-symbols-outlined text-cyan-400 text-[20px] shrink-0 mt-0.5">autorenew</span>
              <div className="flex flex-col">
                <span className="font-hud text-[11px] text-cyan-300 font-bold">REGLA AUTOMATIZADA PRD 3.3:</span>
                <span className="font-sans text-[11px] text-slate-400 leading-snug mt-0.5">
                  Al confirmar el pago exitoso, la celda <strong className="text-cyan-300 font-mono">{activeCell.id}</strong> se liberará automáticamente en la matriz y la barrera se elevará durante 10 segundos.
                </span>
              </div>
            </div>

            {/* Primary Action Button Stack */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="w-full min-h-[54px] rounded-xl font-hud text-[13px] font-black tracking-wider flex items-center justify-center gap-2.5 cursor-pointer cyber-btn-emerald shadow-[0_0_25px_rgba(0,255,157,0.3)]"
              >
                <span className="material-symbols-outlined text-[24px]">task_alt</span>
                <span>CONFIRMAR PAGO Y LIBERAR CELDA {activeCell.id}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playCyberFeedback('click', 0.2);
                    showToast('Imprimiendo duplicado fiscal con firma criptográfica...', 'info');
                  }}
                  className="min-h-[42px] rounded-xl font-mono text-[11px] font-bold text-slate-300 hover:text-white bg-black/40 hover:bg-black/70 border border-white/10 hover:border-cyan-500/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-cyan-400">receipt_long</span>
                  <span>Factura Fiscal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playCyberFeedback('laser', 0.3);
                    setIsAbortModalOpen(true);
                  }}
                  className="min-h-[42px] rounded-xl font-mono text-[11px] font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">cancel</span>
                  <span>Cancelar Salida</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── ANTI-EVASION SAFEGUARD BANNER ── */}
      <div className="p-4 md:p-5 rounded-2xl border border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{
        background: 'linear-gradient(145deg, rgba(6,12,32,0.85) 0%, rgba(3,7,20,0.92) 100%)',
      }}>
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
            <span className="material-symbols-outlined text-[24px]">gavel</span>
          </div>
          <div className="flex flex-col">
            <span className="font-hud text-[13px] text-white font-bold tracking-wider">
              PROTOCOLO ANTI-EVASIÓN DE BARRERAS (CRITERIO LÍMITE PRD 3.3)
            </span>
            <p className="font-mono text-[11px] text-slate-400 leading-tight mt-0.5">
              El subsistema prohíbe la apertura forzada de la barrera o liberación de celda si la transacción no registra balance $0.00 COP certificado.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            playCyberFeedback('click', 0.2);
            showToast('Auditoría verificada: Bloqueo lógico SHA-256 en estado nominal', 'info');
          }}
          className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all shrink-0 cursor-pointer"
        >
          LOG DE INTEGRIDAD
        </button>
      </div>

      {/* ── MODAL: SUCCESSFUL CHECKOUT & CELL RELEASE ── */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-md w-full rounded-2xl p-6 flex flex-col gap-4 text-center overflow-hidden" style={{
            background: 'linear-gradient(160deg, rgba(4,16,28,0.98) 0%, rgba(2,6,16,0.99) 100%)',
            border: '1px solid rgba(0,255,157,0.4)',
            boxShadow: '0 0 60px rgba(0,255,157,0.2), 0 32px 80px rgba(0,0,0,0.9)',
          }}>
            {/* Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            
            {/* HUD Corner Accents */}
            <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-emerald-400" />
            <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-emerald-400" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-emerald-400" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-emerald-400" />

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,255,157,0.4)]">
              <span className="material-symbols-outlined text-[36px] animate-pulse">task_alt</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-hud text-[18px] font-black text-white tracking-wider">¡PAGO CONFIRMADO CON ÉXITO!</span>
              <span className="font-mono text-[12px] text-slate-300">
                Factura electrónica #FAC-98432 emitida por ${totalDue.toLocaleString('es-CO')} COP.
              </span>
            </div>

            <div className="p-4 rounded-xl flex flex-col gap-2.5 text-left border border-emerald-500/25" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <div className="flex items-center justify-between font-mono text-[12px]">
                <span className="text-slate-400">Vehículo despachado:</span>
                <span className="font-mono text-cyan-300 font-bold">{activeCell.plate}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[12px]">
                <span className="text-slate-400">Estado de Celda {activeCell.id}:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  LIBERADA (Disponible)
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-[12px]">
                <span className="text-slate-400">Barrera de Salida:</span>
                <span className="font-mono text-cyan-300 font-bold animate-pulse">ABIERTA (10s)</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  playCyberFeedback('click', 0.2);
                  setIsSuccessModalOpen(false);
                }}
                className="w-full h-12 rounded-xl font-hud text-[12px] font-bold tracking-wider cursor-pointer cyber-btn-cyan"
              >
                FINALIZAR Y ATENDER SIGUIENTE
              </button>
              <button
                type="button"
                onClick={() => {
                  playCyberFeedback('click', 0.2);
                  showToast('Imprimiendo recibo térmico con código QR...', 'info');
                }}
                className="w-full h-10 font-mono text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Imprimir Recibo Térmico Duplicado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ABORT WARNING ── */}
      {isAbortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-md w-full rounded-2xl p-6 flex flex-col gap-4 text-center overflow-hidden" style={{
            background: 'linear-gradient(160deg, rgba(28,4,12,0.98) 0%, rgba(12,2,6,0.99) 100%)',
            border: '1px solid rgba(255,42,109,0.5)',
            boxShadow: '0 0 60px rgba(255,42,109,0.25), 0 32px 80px rgba(0,0,0,0.9)',
          }}>
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,42,109,0.4)]">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="font-hud text-[16px] font-black text-white tracking-wider">
                ¿CANCELAR LIQUIDACIÓN DE SALIDA?
              </span>
              <p className="font-mono text-[12px] text-slate-400 leading-relaxed mt-1">
                El vehículo <strong className="text-yellow-300 font-bold">{activeCell.plate}</strong> continuará sumando tiempo en la celda <strong className="text-cyan-300">{activeCell.id}</strong> y la barrera no se elevará.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  playCyberFeedback('click', 0.2);
                  setIsAbortModalOpen(false);
                }}
                className="flex-1 h-11 rounded-xl font-mono text-xs font-bold text-slate-300 bg-black/50 hover:bg-black/70 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer"
              >
                Continuar Cobro
              </button>
              <button
                type="button"
                onClick={() => {
                  playCyberFeedback('laser', 0.3);
                  setIsAbortModalOpen(false);
                  showToast('Salida cancelada: Vehículo permanece en patio', 'warning');
                }}
                className="flex-1 h-11 rounded-xl font-hud text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(255,42,109,0.4)] transition-all cursor-pointer"
              >
                REVERTIR A OCUPADO
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

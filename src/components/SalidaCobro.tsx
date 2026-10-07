import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { ParkingCell } from '../types/parking.ts';

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
  const [secondsTicking, setSecondsTicking] = useState(20);

  // Find target cell based on selection or search query
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
    ticketId: '#TK-2024-8992',
  };

  const activeCell = selectedVehicleForCheckout?.cell || defaultTargetCell;

  // Billing calculation
  const hourlyRate = activeCell.ratePerHour || 4500;
  const hoursComplete = 3;
  const fractionQuarterFee = Math.round(hourlyRate / 4); // 1.125
  const totalDue = hoursComplete * hourlyRate + fractionQuarterFee; // 14.625

  // Change / Vueltos
  const changeAmount = receivedAmount - totalDue;

  // Seconds ticking effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsTicking((prev) => (prev + 1) % 60);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (plate: string) => {
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
      showToast(`Vehículo localizado: ${found.plate || found.id}`, 'success');
    } else {
      showToast(`Placa o celda "${plate}" cargada en despacho de liquidación`, 'info');
    }
  };

  const handleTriggerLpr = () => {
    showToast('Cámara LPR reconoció placa KLO-892 con 99.4% de confianza', 'success');
    setSearchQuery('KLO-892');
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === 'cash' && changeAmount < 0) {
      showToast('El monto recibido es insuficiente para cubrir la tarifa', 'error');
      return;
    }

    const methodMap = {
      cash: 'Efectivo',
      card: 'Datáfono',
      qr: 'QR Nequi/Davi',
    } as const;

    const res = processCheckout(activeCell.id, methodMap[paymentMethod], receivedAmount);
    if (res.success) {
      setIsSuccessModalOpen(true);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Header Context & Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-text-secondary font-label-code text-[12px] uppercase tracking-wider mb-1">
            <span>Terminal T-01</span>
            <span>/</span>
            <span>Caja Principal</span>
            <span>/</span>
            <span className="text-secondary font-semibold">Despacho y Liquidación</span>
          </div>
          <h1 className="font-sans text-[26px] font-bold text-on-surface tracking-tight">
            Salida y Liquidación Automatizada
          </h1>
        </div>

        {/* Safe Protocol Metric Chip */}
        <div className="flex items-center gap-3 bg-surface-card p-3 rounded-xl border border-surface-border shadow-sm self-start md:self-auto">
          <div className="w-9 h-9 rounded-lg bg-status-available-bg flex items-center justify-center text-status-available">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] text-on-surface font-semibold">Integridad Operativa PRD 3.3</span>
            <span className="text-[11px] text-text-secondary">0% Discrepancias Tarifarias Activas</span>
          </div>
        </div>
      </div>

      {/* 1. Quick Search Bar */}
      <section className="bg-surface-card p-4 rounded-xl border border-surface-border shadow-sm relative overflow-hidden">
        <form
          className="relative z-10 flex flex-col md:flex-row items-stretch gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              placeholder="Buscar por Placa o Celda... (ej. KLO-892, A-04)"
              className="w-full h-12 pl-12 pr-28 bg-surface-container-low rounded-xl font-label-plate text-[20px] uppercase text-primary placeholder:text-outline placeholder:font-sans placeholder:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-secondary border border-surface-border transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-1.5 pointer-events-none">
              <kbd className="px-2 py-1 bg-surface-container text-on-surface-variant font-label-code text-xs rounded border border-surface-border font-semibold">
                Ctrl
              </kbd>
              <span className="text-on-surface-variant font-label-code text-xs">+</span>
              <kbd className="px-2 py-1 bg-surface-container text-on-surface-variant font-label-code text-xs rounded border border-surface-border font-semibold">
                B
              </kbd>
            </div>
          </div>

          <button
            type="submit"
            className="h-12 px-6 bg-secondary hover:bg-primary text-white font-sans text-[14px] font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">directions_car</span>
            <span>Buscar Vehículo</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerLpr}
            className="h-12 px-4 bg-surface-container hover:bg-surface-container-high text-primary font-sans text-[13px] font-semibold rounded-xl flex items-center justify-center gap-2 border border-surface-border transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">linked_camera</span>
            <span className="hidden sm:inline">Sensor LPR Salida</span>
          </button>
        </form>

        {/* Quick Recent Search Chips */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pt-1">
          <span className="text-[12px] text-text-secondary whitespace-nowrap">Búsquedas recientes en cola:</span>
          {['KLO-892 (A-04)', 'MTR-411 (B-12)', 'XYZ-908 (M-02)'].map((item) => {
            const plateKey = item.split(' ')[0];
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleSearch(plateKey)}
                className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-secondary/15 text-secondary font-label-code text-xs font-semibold transition-colors border border-surface-border"
              >
                {item}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2 & 3. Main Workflow: Vehicle Audit & Checkout Action Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Vehicle Details & Mathematical Liquidation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card: Vehicle Information */}
          <div className="bg-surface-card rounded-xl p-5 border border-surface-border shadow-sm flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-surface-border/50">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-status-occupied-bg text-status-occupied text-[12px] font-bold rounded-full flex items-center gap-1.5 border border-status-occupied/20">
                  <span className="w-2 h-2 rounded-full bg-status-occupied animate-pulse"></span>
                  Servicio Activo en Liquidación
                </span>
                <span className="font-label-code text-[12px] text-text-secondary">
                  {activeCell.ticketId || 'Ticket #TK-2024-8992'}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg border border-surface-border">
                <span className="material-symbols-outlined text-secondary text-[20px]">local_parking</span>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-on-surface-variant font-medium">Celda Asignada</span>
                  <span className="font-label-code text-[12px] text-primary font-bold">
                    {activeCell.id} • Sector Norte
                  </span>
                </div>
              </div>
            </div>

            {/* Central Vehicle Showcase */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface-container-low rounded-xl border border-surface-border/60">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white shadow-sm border border-surface-border flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[36px]">directions_car</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-text-secondary uppercase font-semibold">Placa Detectada</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-label-plate text-[24px] text-primary tracking-widest bg-white px-3 py-1 rounded-lg border border-surface-border shadow-xs">
                      {activeCell.plate || 'KLO-892'}
                    </span>
                    <span className="text-[12px] text-secondary font-bold">Carro / Automóvil</span>
                  </div>
                  <span className="text-[12px] text-text-secondary mt-0.5">
                    Sedán Particular • Color Gris Plata
                  </span>
                </div>
              </div>

              {/* Elapsed Time Counter */}
              <div className="flex flex-col items-start sm:items-end justify-center bg-white p-3 rounded-lg border border-surface-border shadow-xs">
                <span className="text-[11px] text-text-secondary">Permanencia Total</span>
                <div className="flex items-center gap-1.5 text-secondary text-[20px] font-bold font-sans">
                  <span className="material-symbols-outlined text-[20px]">timer</span>
                  <span>3h 15m {secondsTicking}s</span>
                </div>
                <span className="text-[11px] text-status-available font-semibold">
                  3 horas + 15 min fracción
                </span>
              </div>
            </div>

            {/* Timestamps & Operator Attribution Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-white rounded-lg border border-surface-border shadow-xs flex flex-col">
                <span className="text-[11px] text-text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">login</span>
                  Hora Entrada
                </span>
                <span className="font-label-code text-[12px] text-on-surface font-bold mt-1">
                  {activeCell.entryTime || 'Hoy, 08:30:00 AM'}
                </span>
                <span className="text-[10px] text-text-secondary">Barrera Norte 01</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-surface-border shadow-xs flex flex-col">
                <span className="text-[11px] text-text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-status-occupied">logout</span>
                  Hora Salida (Actual)
                </span>
                <span className="font-label-code text-[12px] text-on-surface font-bold mt-1">
                  {currentTimeString ? currentTimeString.split('-')[0].trim() : '11:45:20 AM'}
                </span>
                <span className="text-[10px] text-status-available font-medium">Tolerancia: 10 min post-pago</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-surface-border shadow-xs flex flex-col">
                <span className="text-[11px] text-text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-text-secondary">badge</span>
                  Operador Registro
                </span>
                <span className="text-[12px] text-on-surface font-semibold mt-1 truncate">Carlos Gómez</span>
                <span className="text-[10px] text-text-secondary">Turno Mañana (S-01)</span>
              </div>
            </div>

            {/* LPR Photographic Snapshot Evidence */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <div className="sm:w-1/2 flex flex-col gap-1">
                <div className="flex items-center justify-between text-text-secondary text-[11px]">
                  <span>Evidencia Cámara Entrada</span>
                  <span className="font-label-code">08:30 AM</span>
                </div>
                <div className="h-28 rounded-xl overflow-hidden relative shadow-inner border border-surface-border group">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={CAM_ENT_URL}
                    alt="Evidencia entrada"
                  />
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/70 text-white font-label-code text-[10px] rounded backdrop-blur-xs">
                    CAM-ENT-01
                  </span>
                </div>
              </div>

              <div className="sm:w-1/2 flex flex-col gap-1">
                <div className="flex items-center justify-between text-text-secondary text-[11px]">
                  <span>Cámara Salida en Vivo</span>
                  <span className="font-label-code text-status-available flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-ping"></span>
                    EN VIVO
                  </span>
                </div>
                <div className="h-28 rounded-xl overflow-hidden relative shadow-inner border border-surface-border group">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={CAM_SAL_URL}
                    alt="Evidencia salida"
                  />
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/70 text-white font-label-code text-[10px] rounded backdrop-blur-xs">
                    CAM-SAL-02
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desglose Detallado de Cobro (Liquidación Auditada) */}
          <div className="bg-surface-card rounded-xl p-5 border border-surface-border shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">calculate</span>
                <h2 className="font-sans text-[16px] font-bold text-on-surface">
                  Liquidación de Tarifa (Regla Auditada)
                </h2>
              </div>
              <span className="px-2.5 py-1 bg-surface-container text-primary font-label-code text-[11px] rounded font-medium border border-surface-border">
                Snapshot Tarifa: v2.4 (Fija Ingreso)
              </span>
            </div>

            <div className="flex flex-col gap-1.5 bg-surface-container-low p-4 rounded-xl border border-surface-border/60">
              <div className="flex items-center justify-between py-1 text-text-secondary text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">sell</span>
                  <span>Tarifa base por hora (Automóvil)</span>
                </div>
                <span className="font-label-code text-on-surface font-semibold">
                  ${hourlyRate.toLocaleString('es-CO')} COP
                </span>
              </div>

              <div className="flex items-center justify-between py-1 text-text-secondary text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span>Cobro por 3 horas completas (3 x ${hourlyRate.toLocaleString('es-CO')})</span>
                </div>
                <span className="font-label-code text-on-surface font-semibold">
                  ${(3 * hourlyRate).toLocaleString('es-CO')} COP
                </span>
              </div>

              <div className="flex items-center justify-between py-1 text-text-secondary text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">more_time</span>
                  <span>Fracción adicional aplicada (15 min = 1/4 hora)</span>
                </div>
                <span className="font-label-code text-on-surface font-semibold">
                  ${fractionQuarterFee.toLocaleString('es-CO')} COP
                </span>
              </div>

              <div className="flex items-center justify-between py-1 text-text-secondary text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">loyalty</span>
                  <span>Descuento aplicado / Cortesía comercial</span>
                </div>
                <span className="font-label-code text-status-available font-semibold">-$0 COP</span>
              </div>

              <div className="h-px bg-surface-border my-2"></div>

              {/* Total Hero */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="flex flex-col">
                  <span className="text-[12px] uppercase tracking-wider text-text-secondary font-bold">
                    Total Liquidado a Pagar
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    Impuestos y tasa de parqueo incluidos
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="px-2.5 py-0.5 bg-secondary text-white font-label-code text-[11px] rounded-full font-bold">
                    COP
                  </span>
                  <span className="font-sans text-[32px] font-bold text-primary tracking-tight">
                    ${totalDue.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-text-secondary text-[11px]">
              <span className="material-symbols-outlined text-[16px] text-secondary">info</span>
              <p>
                Cálculo inmutable certificado según Art. 12 Ley de Estacionamientos y regla de redondeo al cuarto de hora registrado al ingreso.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment Reception (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-card rounded-xl p-5 border border-surface-border shadow-md flex flex-col gap-4 sticky top-20">
            <div className="flex items-center justify-between pb-1 border-b border-surface-border/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">payments</span>
                <h2 className="font-sans text-[16px] font-bold text-on-surface">Recepción de Pago</h2>
              </div>
              <span className="px-2.5 py-1 bg-status-warning-bg text-status-warning font-label-code text-[11px] font-bold rounded flex items-center gap-1 border border-status-warning/20">
                <span className="material-symbols-outlined text-[14px]">pending_actions</span>
                Pendiente
              </span>
            </div>

            {/* Method Tabs */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-on-surface font-semibold">1. Método de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all border cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-secondary text-white border-transparent shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-border'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">payments</span>
                  <span className="text-[12px] mt-1 font-semibold">Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all border cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-secondary text-white border-transparent shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-border'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">credit_card</span>
                  <span className="text-[12px] mt-1 font-semibold">Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all border cursor-pointer ${
                    paymentMethod === 'qr'
                      ? 'bg-secondary text-white border-transparent shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-border'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                  <span className="text-[12px] mt-1 font-semibold">QR Nequi/Davi</span>
                </button>
              </div>
            </div>

            {/* Cash Calculator */}
            {paymentMethod === 'cash' && (
              <div className="flex flex-col gap-3 bg-surface-container-low p-4 rounded-xl border border-surface-border/60">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-on-surface font-semibold flex justify-between items-center" htmlFor="amount-input">
                    <span>Monto Recibido en Caja</span>
                    <span className="text-secondary font-label-code text-[11px] font-bold">
                      Total: ${totalDue.toLocaleString('es-CO')} COP
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-label-code text-on-surface-variant font-bold text-sm">
                      $
                    </span>
                    <input
                      id="amount-input"
                      type="number"
                      step={500}
                      value={receivedAmount || ''}
                      onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
                      className="w-full h-12 pl-8 pr-16 bg-white rounded-lg font-label-plate text-[20px] text-primary focus:outline-none focus:ring-2 focus:ring-secondary border border-surface-border shadow-xs"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center font-label-code text-text-secondary text-[11px] font-semibold">
                      COP
                    </span>
                  </div>
                </div>

                {/* Quick Bills Shortcuts */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-text-secondary">Billetes:</span>
                  {[15000, 20000, 50000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setReceivedAmount(val)}
                      className={`px-2 py-0.5 rounded text-xs font-label-code shadow-xs transition-colors border ${
                        receivedAmount === val
                          ? 'bg-secondary/15 text-secondary font-bold border-secondary/30'
                          : 'bg-white text-text-secondary hover:text-primary border-surface-border'
                      }`}
                    >
                      ${val.toLocaleString('es-CO')}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReceivedAmount(totalDue)}
                    className="px-2 py-0.5 bg-white text-text-secondary hover:text-primary rounded text-xs font-label-code border border-surface-border"
                  >
                    Exacto
                  </button>
                </div>

                {/* Change / Vueltos Display */}
                <div className="p-3 bg-white rounded-lg border border-surface-border shadow-xs flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-text-secondary font-semibold">
                      Cambio / Vueltos al Conductor:
                    </span>
                    <span className={`text-[11px] font-medium ${changeAmount >= 0 ? 'text-status-available' : 'text-error'}`}>
                      {changeAmount >= 0 ? (changeAmount === 0 ? 'Pago Exacto recibido' : 'Listo para entregar') : 'Faltante para cubrir tarifa'}
                    </span>
                  </div>
                  <div className={`flex items-baseline gap-1 ${changeAmount >= 0 ? 'text-status-available' : 'text-error'}`}>
                    <span className="font-label-code font-bold">$</span>
                    <span className="font-sans text-[22px] font-bold">
                      {Math.abs(changeAmount).toLocaleString('es-CO')}
                    </span>
                    <span className="font-label-code text-[11px]">COP</span>
                  </div>
                </div>
              </div>
            )}

            {/* Digital Card / QR Panels */}
            {paymentMethod === 'card' && (
              <div className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-xl gap-2 text-center border border-surface-border">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[28px]">credit_card</span>
                </div>
                <span className="text-[13px] font-bold text-on-surface">Datáfono Terminal Conectado</span>
                <span className="text-[11px] text-text-secondary">
                  Aproxime chip o tarjeta contactless en terminal POS #1 por ${totalDue.toLocaleString('es-CO')} COP
                </span>
                <span className="font-label-code text-[11px] text-secondary font-bold bg-white px-3 py-1 rounded border border-surface-border">
                  POS ID: DATA-T01-OK
                </span>
              </div>
            )}

            {paymentMethod === 'qr' && (
              <div className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-xl gap-2 text-center border border-surface-border">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[28px]">qr_code_2</span>
                </div>
                <span className="text-[13px] font-bold text-on-surface">Código QR Listo para Escaneo</span>
                <span className="text-[11px] text-text-secondary">
                  Transfiera exactamente ${totalDue.toLocaleString('es-CO')} COP a Nequi o Daviplata ParkFlow
                </span>
                <span className="font-label-code text-[11px] text-secondary font-bold bg-white px-3 py-1 rounded border border-surface-border">
                  REF: PK-892-KLO
                </span>
              </div>
            )}

            {/* Business Rule Notice */}
            <div className="p-3 bg-status-available-bg rounded-lg flex items-start gap-2 border border-status-available/20">
              <span className="material-symbols-outlined text-status-available text-[20px] shrink-0 mt-0.5">autorenew</span>
              <div className="flex flex-col">
                <span className="text-[11px] text-on-surface font-bold">Regla de Negocio PRD (Criterio 3.3):</span>
                <span className="text-[11px] text-text-secondary leading-snug">
                  Al confirmar el pago exitoso, la celda <strong className="text-primary font-label-code">{activeCell.id}</strong> se liberará automáticamente en el mapa y cambiará a <strong className="text-status-available">Disponible</strong>.
                </span>
              </div>
            </div>

            {/* Primary Confirmation Button Stack */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="w-full min-h-[52px] bg-status-available hover:bg-emerald-600 text-white rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">check_circle</span>
                <span>Confirmar Pago y Liberar Celda {activeCell.id}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Imprimiendo duplicado fiscal de factura...', 'info')}
                  className="min-h-[42px] bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-surface-border"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  <span>Reimprimir Factura</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAbortModalOpen(true)}
                  className="min-h-[42px] bg-error-container hover:bg-red-200 text-error text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-error/20"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  <span>Cancelar Salida</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Anti-Evasion Safeguard Banner */}
      <div className="bg-surface-card rounded-xl p-4 border border-surface-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[24px]">gavel</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] text-on-surface font-bold">
              Bloqueo de Seguridad Anti-Evasión (Criterio Límite 3.3)
            </span>
            <p className="text-[11px] text-text-secondary leading-tight">
              El sistema prohíbe la apertura manual de la barrera de salida o la liberación de la celda si el comprobante fiscal no registra balance $0.00 COP.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => showToast('Registro de auditoría verificado: Integridad OK (SHA-256)', 'info')}
          className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-primary text-[12px] font-semibold rounded-lg transition-colors border border-surface-border shrink-0 cursor-pointer"
        >
          Ver Log de Auditoría
        </button>
      </div>

      {/* MODAL: SUCCESSFUL CHECKOUT AND RELEASE */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-surface-card max-w-md w-full rounded-2xl shadow-2xl p-6 flex flex-col gap-4 text-center border border-surface-border">
            <div className="w-16 h-16 rounded-full bg-status-available-bg text-status-available flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">task_alt</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[18px] font-bold text-on-surface">¡Pago Confirmado con Éxito!</span>
              <span className="text-[13px] text-text-secondary">
                Se ha emitido el recibo electrónico #FAC-98432 por ${totalDue.toLocaleString('es-CO')} COP.
              </span>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 text-left border border-surface-border">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-secondary">Vehículo despachado:</span>
                <span className="font-label-code text-primary font-bold">{activeCell.plate}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-secondary">Estado de Celda {activeCell.id}:</span>
                <span className="px-2 py-0.5 rounded bg-status-available-bg text-status-available font-label-code font-bold">
                  LIBERADA (Disponible)
                </span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-secondary">Barrera de Salida:</span>
                <span className="font-label-code text-secondary font-bold">ABIERTA (10s)</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full h-12 bg-secondary hover:bg-primary text-white text-[14px] font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Finalizar y Atender Siguiente Vehículo
              </button>
              <button
                type="button"
                onClick={() => showToast('Imprimiendo recibo térmico duplicado...', 'info')}
                className="w-full h-10 text-secondary hover:bg-surface-container text-[13px] font-semibold rounded-lg transition-colors"
              >
                Imprimir Ticket Térmico Duplicado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ABORT WARNING */}
      {isAbortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-surface-card max-w-md w-full rounded-2xl shadow-2xl p-6 flex flex-col gap-4 text-center border border-surface-border">
            <div className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[18px] font-bold text-on-surface">¿Cancelar Liquidación de Salida?</span>
              <span className="text-[13px] text-text-secondary">
                El vehículo <strong className="font-label-code text-primary">{activeCell.plate}</strong> continuará sumando tiempo en la celda <strong className="font-label-code text-primary">{activeCell.id}</strong> y la barrera no se habilitará.
              </span>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAbortModalOpen(false)}
                className="flex-1 h-11 bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-semibold rounded-xl transition-colors border border-surface-border"
              >
                Continuar Cobro
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAbortModalOpen(false);
                  showToast('Salida cancelada: El vehículo permanece en el patio', 'warning');
                }}
                className="flex-1 h-11 bg-error hover:bg-red-700 text-white text-[13px] font-semibold rounded-xl transition-colors"
              >
                Revertir a Ocupado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

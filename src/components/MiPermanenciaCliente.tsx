import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { playCyberFeedback } from '../utils/audioAlert.ts';

export const MiPermanenciaCliente: React.FC = () => {
  const { currentUser, cells, processCheckout, showToast, setActiveView } = useParking();

  const [consultPlate, setConsultPlate] = useState<string>(currentUser?.plate || 'KLO-892');
  const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'efectivo'>('tarjeta');
  const [paymentReceipt, setPaymentReceipt] = useState<{
    receiptId: string;
    ticketId: string;
    plate: string;
    cellId: string;
    vehicleType: string;
    driverName: string;
    entryTime: string;
    duration: string;
    amountPaid: number;
    paymentMethod: string;
    paidAt: string;
    toleranceMinutes: number;
  } | null>(null);

  const activePlate = (consultPlate || currentUser?.plate || 'KLO-892').trim().toUpperCase();
  const cleanActive = activePlate.replace(/[^A-Z0-9]/g, '');
  const clientOccupiedCell = cells.find(
    c => c.status === 'occupied' && c.plate && c.plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanActive
  );

  const calculateAmount = () => {
    if (!clientOccupiedCell) return 13500;
    return clientOccupiedCell.currentTotal || (clientOccupiedCell.type === 'Moto' ? 2500 : clientOccupiedCell.type === 'Pesado' ? 9000 : 5000);
  };

  const liveAmount = calculateAmount();
  const liveDur = clientOccupiedCell?.duration || '0h 00m 00s';

  const handleCheckoutDecision = () => {
    if (!clientOccupiedCell) {
      playCyberFeedback('laser', 0.25);
      showToast(`No se encontró vehículo activo con placa ${activePlate} en patio.`, 'error');
      return;
    }

    playCyberFeedback('checkout', 0.25);
    const methodLabel = paymentMethod === 'tarjeta' ? 'Tarjeta de Crédito / Débito (En Línea)' : 'Efectivo (Liquidación Taquilla / Tótem)';
    const result = processCheckout(clientOccupiedCell.plate, methodLabel);

    if (result.success) {
      setPaymentReceipt({
        receiptId: `REC-${Date.now().toString().slice(-6)}`,
        ticketId: clientOccupiedCell.ticketId || `TK-${Math.floor(1000 + Math.random() * 9000)}`,
        plate: clientOccupiedCell.plate,
        cellId: clientOccupiedCell.id,
        vehicleType: clientOccupiedCell.type || 'Carro',
        driverName: clientOccupiedCell.driverName || currentUser?.name || 'Cliente',
        entryTime: clientOccupiedCell.entryTime || '11:15 AM',
        duration: liveDur,
        amountPaid: liveAmount,
        paymentMethod: methodLabel,
        paidAt: new Date().toLocaleTimeString(),
        toleranceMinutes: 15,
      });

      showToast(
        paymentMethod === 'tarjeta'
          ? `✅ Pago de $${liveAmount.toLocaleString('es-CO')} COP con tarjeta exitoso. Tienes 15 min de gracia.`
          : `✅ Orden de pago en efectivo generada ($${liveAmount.toLocaleString('es-CO')} COP). Bahía liberada.`,
        'success'
      );
    } else {
      showToast(result.error || 'Error al procesar el pago', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full animate-fadeIn">
      {/* Header Banner */}
      <div 
        className="p-6 rounded-2xl border border-cyan-500/30 relative overflow-hidden" 
        style={{ background: 'linear-gradient(135deg, rgba(6,16,36,0.95) 0%, rgba(2,10,22,0.98) 100%)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <div className="font-mono text-xs text-cyan-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px]">timer</span>
          <span>// AUTOGESTIÓN CONDUCTOR // CONSULTA DE PERMANENCIA & PAGO</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-hud text-2xl md:text-3xl font-black text-white tracking-wider flex items-center gap-3">
              <span>MI PERMANENCIA EN PATIO</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                TIEMPO REAL
              </span>
            </h1>
            <p className="font-sans text-xs text-slate-400 mt-1">
              Monitorea los minutos exactos de estancia de tu vehículo y liquida tu salida con Tarjeta o Efectivo cuando lo decidas.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 border border-cyan-500/30">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">account_circle</span>
            <div className="font-mono text-[11px] leading-tight">
              <span className="text-slate-400 block">Conductor en Sesión:</span>
              <strong className="text-white font-bold">{currentUser?.name || 'Cliente Registrado'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Plate Search Bar */}
      <div className="p-5 rounded-2xl border border-cyan-500/20 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="material-symbols-outlined text-cyan-400 text-[26px]">directions_car</span>
          <div>
            <span className="font-hud text-xs font-bold text-white block">VEHÍCULO ASOCIADO A TU PERFIL:</span>
            <span className="font-mono text-[11px] text-slate-400">Puedes consultar tu placa habitual o buscar otra placa</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={consultPlate}
            placeholder={currentUser?.plate || 'KLO-892'}
            onChange={(e) => setConsultPlate(e.target.value.toUpperCase())}
            className="h-11 px-4 rounded-xl font-mono text-base font-black text-yellow-300 bg-black/80 border border-cyan-500/40 focus:outline-none focus:border-cyan-400 tracking-wider text-center"
            style={{ minWidth: '150px' }}
          />
          <button
            type="button"
            onClick={() => {
              playCyberFeedback('click', 0.2);
              setPaymentReceipt(null);
              showToast(`Consultando telemetría para ${activePlate}...`, 'info');
            }}
            className="h-11 px-5 rounded-xl font-hud text-xs font-bold cyber-btn-cyan cursor-pointer whitespace-nowrap"
          >
            CONSULTAR
          </button>
        </div>
      </div>

      {/* Payment Receipt / Pase de Salida Modal/Card if Paid */}
      {paymentReceipt ? (
        <div className="p-8 rounded-3xl border border-emerald-500/50 bg-gradient-to-b from-emerald-950/40 via-black/80 to-black/90 shadow-[0_0_50px_rgba(0,255,157,0.25)] flex flex-col gap-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-500/30 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 text-2xl">
                <span className="material-symbols-outlined text-[28px]">verified</span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-emerald-400 font-bold block">// COMPROBANTE DIGITAL DE SALIDA</span>
                <h2 className="font-hud text-xl font-black text-white">PASE DE SALIDA AUTORIZADO</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>BARRERA LPR HABILITADA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-2xl bg-black/70 border border-emerald-500/30 flex flex-col items-center justify-center text-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[48px]">qr_code_2</span>
              <span className="font-mono text-xs text-slate-300 font-bold">{paymentReceipt.ticketId}</span>
              <span className="font-mono text-[10px] text-slate-500">Muestra este QR en el lector óptico</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/70 border border-emerald-500/30 font-mono text-xs flex flex-col justify-between gap-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Placa:</span>
                <strong className="text-yellow-300 font-black text-base">{paymentReceipt.plate}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bahía Desocupada:</span>
                <span className="text-cyan-300 font-bold">{paymentReceipt.cellId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Permanencia Total:</span>
                <span className="text-emerald-400 font-bold">{paymentReceipt.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Método de Pago:</span>
                <span className="text-white font-bold">{paymentReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1.5 text-slate-400">
                <span>Hora de Pago:</span>
                <span className="text-slate-200">{paymentReceipt.paidAt}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-black/80 border border-emerald-500/40 flex flex-col justify-between text-center gap-3">
              <div>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">TOTAL CANCELADO</span>
                <div className="font-hud text-3xl font-black text-emerald-300 glow-text-emerald mt-1">
                  ${paymentReceipt.amountPaid.toLocaleString('es-CO')} COP
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/60 border border-emerald-500/30 font-mono text-xs text-emerald-300 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px] animate-pulse">timer</span>
                <span>Tienes <strong>15 minutos</strong> de gracia para salir</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  playCyberFeedback('click', 0.2);
                  showToast('Imprimiendo recibo digital y guardando registro fiscal...', 'success');
                }}
                className="w-full py-2.5 rounded-xl font-hud text-xs font-bold cyber-btn-emerald cursor-pointer"
              >
                IMPRIMIR COMPROBANTE
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                playCyberFeedback('click', 0.2);
                setPaymentReceipt(null);
                setActiveView('portal-cliente');
              }}
              className="px-5 py-2.5 rounded-xl font-hud text-xs font-bold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20 cursor-pointer"
            >
              NUEVO PARQUEO (ELEGIR PUESTO)
            </button>
            <button
              type="button"
              onClick={() => {
                playCyberFeedback('click', 0.2);
                setActiveView('mi-perfil-cliente');
              }}
              className="px-5 py-2.5 rounded-xl font-hud text-xs font-bold cyber-btn-cyan cursor-pointer"
            >
              IR A MI PERFIL
            </button>
          </div>
        </div>
      ) : clientOccupiedCell ? (
        /* Vehicle Found in Patio: Real-time Telemetry & Decision Module */
        <div className="flex flex-col gap-6">
          
          {/* Live HUD Status Card */}
          <div className="p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-black/80 to-cyan-950/20 relative overflow-hidden flex flex-col gap-5 shadow-[0_0_35px_rgba(0,240,255,0.15)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyan-500/25 gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-hud text-sm font-bold text-white tracking-wider">
                  ESTANCIA ACTIVA EN PATIO // BAHÍA {clientOccupiedCell.id}
                </span>
              </div>

              <div className="font-mono text-xs text-emerald-400 font-bold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1.5 self-start sm:self-auto">
                <span className="material-symbols-outlined text-[15px] animate-spin">autorenew</span>
                <span>CONTANDO EN TIEMPO REAL</span>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Plate Box */}
              <div className="p-4 rounded-2xl bg-black/60 border border-cyan-500/30 flex flex-col justify-between">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">PLACA REGISTRADA</span>
                <div className="plate-bezel px-3 py-1.5 rounded-lg text-center mt-2">
                  <span className="font-mono text-2xl font-black text-yellow-300 tracking-wider">
                    {clientOccupiedCell.plate}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-cyan-400 mt-2 text-center">
                  Tipo: {clientOccupiedCell.type}
                </div>
              </div>

              {/* Bay & Entry Time */}
              <div className="p-4 rounded-2xl bg-black/60 border border-cyan-500/30 flex flex-col justify-between font-mono text-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">UBICACIÓN Y HORA</span>
                <div className="my-1">
                  <div className="font-hud text-2xl font-black text-cyan-300">{clientOccupiedCell.id}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Ingreso: <strong>{clientOccupiedCell.entryTime || '11:15 AM'}</strong></div>
                </div>
                <div className="text-[10px] text-slate-400">
                  Conductor: {clientOccupiedCell.driverName || currentUser?.name || 'Cliente'}
                </div>
              </div>

              {/* Live Ticking Permanence */}
              <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/40 flex flex-col justify-between font-mono text-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-[10px] text-emerald-400 uppercase tracking-widest">
                  <span>TIEMPO TRANSCURRIDO</span>
                  <span className="material-symbols-outlined text-[15px] animate-pulse">timer</span>
                </div>
                <div className="my-1">
                  <div className="font-hud text-2xl sm:text-3xl font-black text-emerald-300 tracking-wider">
                    {liveDur}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Segundo a segundo en patio</div>
                </div>
                <div className="text-[10px] text-slate-400">
                  Tarifa: ${(clientOccupiedCell.ratePerHour || 5000).toLocaleString('es-CO')}/h
                </div>
              </div>

              {/* Amount to Pay */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-black/60 border border-emerald-500/40 flex flex-col justify-between">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">MONTO LIQUIDADO</span>
                <div className="my-1">
                  <div className="font-hud text-2xl sm:text-3xl font-black text-white glow-text-emerald">
                    ${liveAmount.toLocaleString('es-CO')}
                  </div>
                  <div className="font-mono text-[10px] text-emerald-400 mt-0.5">Pesos Colombianos (COP)</div>
                </div>
                <div className="font-mono text-[10px] text-slate-400">Sin recargos ocultos</div>
              </div>
            </div>
          </div>

          {/* DECISIÓN DE PAGO (PAGAR YA CON TARJETA O EN EFECTIVO) */}
          <div className="p-7 rounded-3xl border border-violet-500/35 bg-gradient-to-b from-violet-950/30 via-black/80 to-black/90 flex flex-col gap-6 shadow-[0_0_40px_rgba(139,92,246,0.18)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-violet-500/25 gap-2">
              <div>
                <span className="font-mono text-[10px] text-violet-400 font-bold tracking-widest block uppercase">
                  // PROTOCOLO DE SALIDA // DECISIÓN DE PAGO
                </span>
                <h2 className="font-hud text-lg sm:text-xl font-black text-white flex items-center gap-2 mt-0.5">
                  <span className="material-symbols-outlined text-violet-400 text-[24px]">payments</span>
                  ¿DESEAS PAGAR TU ESTANCIA YA?
                </h2>
              </div>

              <div className="font-mono text-xs text-slate-400">
                Total a pagar: <strong className="text-emerald-400 font-hud text-sm">${liveAmount.toLocaleString('es-CO')} COP</strong>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Method 1: Tarjeta */}
              <div
                onClick={() => { playCyberFeedback('click', 0.15); setPaymentMethod('tarjeta'); }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  paymentMethod === 'tarjeta'
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.25)]'
                    : 'bg-black/40 border-white/10 hover:border-cyan-500/40 text-slate-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'tarjeta' ? 'bg-cyan-500/25 text-cyan-300' : 'bg-white/5 text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">credit_card</span>
                    </div>
                    <div>
                      <span className="font-hud text-sm font-bold text-white block">PAGAR CON TARJETA</span>
                      <span className="font-mono text-[10px] text-slate-400">Débito / Crédito / Pasarela en línea</span>
                    </div>
                  </div>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'tarjeta' ? 'border-cyan-400 bg-cyan-500' : 'border-white/20'
                  }`}>
                    {paymentMethod === 'tarjeta' && <span className="w-2 h-2 rounded-full bg-black" />}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/20 font-mono text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Medio:</span>
                    <span className="text-white font-bold">Visa / Master / PSE</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Titular:</span>
                    <span className="text-cyan-300">{currentUser?.name || 'Cliente Registrado'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Seguridad:</span>
                    <span className="text-emerald-400 font-bold">Cifrado 3D Secure</span>
                  </div>
                </div>

                <p className="font-mono text-[10px] text-slate-400 leading-relaxed">
                  Pago digital inmediato. Al confirmar se libera tu celda y la barrera se elevará automáticamente al acercarte con tu placa.
                </p>
              </div>

              {/* Method 2: Efectivo */}
              <div
                onClick={() => { playCyberFeedback('click', 0.15); setPaymentMethod('efectivo'); }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  paymentMethod === 'efectivo'
                    ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_25px_rgba(0,255,157,0.25)]'
                    : 'bg-black/40 border-white/10 hover:border-emerald-500/40 text-slate-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'efectivo' ? 'bg-emerald-500/25 text-emerald-300' : 'bg-white/5 text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">payments</span>
                    </div>
                    <div>
                      <span className="font-hud text-sm font-bold text-white block">PAGAR EN EFECTIVO</span>
                      <span className="font-mono text-[10px] text-slate-400">Taquilla física o Tótem de pago</span>
                    </div>
                  </div>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'efectivo' ? 'border-emerald-400 bg-emerald-500' : 'border-white/20'
                  }`}>
                    {paymentMethod === 'efectivo' && <span className="w-2 h-2 rounded-full bg-black" />}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/20 font-mono text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Punto de Pago:</span>
                    <span className="text-white font-bold">Taquilla Principal</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Monto Exacto:</span>
                    <span className="text-emerald-300 font-bold">${liveAmount.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Modalidad:</span>
                    <span className="text-yellow-300 font-bold">Recibo Físico / QR</span>
                  </div>
                </div>

                <p className="font-mono text-[10px] text-slate-400 leading-relaxed">
                  Genera tu orden de pago para cancelar en efectivo al operador o cajero automático antes de salir del parqueadero.
                </p>
              </div>
            </div>

            {/* Action Decision Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  playCyberFeedback('click', 0.2);
                  showToast(`Permanencia continúa activa para ${clientOccupiedCell.plate}. El contador sigue corriendo.`, 'info');
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl font-hud text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
              >
                ⏸️ AÚN NO DESEO PAGAR (SEGUIR ESTACIONADO)
              </button>

              <button
                type="button"
                onClick={handleCheckoutDecision}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-hud text-xs font-black tracking-wider cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === 'tarjeta'
                    ? 'cyber-btn-cyan shadow-[0_0_25px_rgba(0,240,255,0.4)]'
                    : 'cyber-btn-emerald shadow-[0_0_25px_rgba(0,255,157,0.4)]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {paymentMethod === 'tarjeta' ? 'lock' : 'check_circle'}
                </span>
                <span>
                  {paymentMethod === 'tarjeta'
                    ? `PAGAR YA CON TARJETA ($${liveAmount.toLocaleString('es-CO')} COP)`
                    : `CONFIRMAR PAGO EN EFECTIVO ($${liveAmount.toLocaleString('es-CO')} COP)`}
                </span>
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Vehicle NOT in Patio */
        <div className="p-10 rounded-3xl border border-cyan-500/20 bg-black/60 flex flex-col items-center justify-center text-center gap-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-[36px]">no_crash</span>
          </div>
          <div>
            <div className="font-mono text-xs text-slate-400 uppercase tracking-widest">// SIN ESTANCIA ACTIVA //</div>
            <h3 className="font-hud text-xl font-black text-white mt-1">
              NO SE ENCONTRÓ NINGÚN VEHÍCULO ESTACIONADO CON LA PLACA <span className="text-yellow-300 font-mono">{activePlate}</span>
            </h3>
            <p className="font-sans text-xs text-slate-400 max-w-md mt-2">
              Tu vehículo no tiene una bahía asignada en este momento o ya completó su ciclo de parqueo y salida. Si vas a ingresar al parqueadero, elige una bahía libre en el mapa interactivo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-2">
            <button
              type="button"
              onClick={() => {
                playCyberFeedback('click', 0.2);
                setActiveView('portal-cliente');
              }}
              className="px-6 py-2.5 rounded-xl font-hud text-xs font-black cyber-btn-emerald cursor-pointer shadow-[0_0_20px_rgba(0,255,157,0.3)] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">local_parking</span>
              IR A ELEGIR MI PUESTO
            </button>
            <button
              type="button"
              onClick={() => {
                playCyberFeedback('click', 0.2);
                setActiveView('mi-perfil-cliente');
              }}
              className="px-6 py-2.5 rounded-xl font-hud text-xs font-bold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20 cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
              VER MI PERFIL
            </button>
          </div>
        </div>
      )}

    </div>
  );
};


import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { VehicleType } from '../types/parking.ts';
import { playCyberFeedback } from '../utils/audioAlert.ts';

export const PortalCliente: React.FC = () => {
  const { cells, registerClientAutoOccupy, processCheckout, showToast, currentTimeString, currentUser } = useParking();

  const [selectedBay, setSelectedBay] = useState<string>('A-02');
  const [plate, setPlate] = useState<string>(currentUser?.plate || 'KLO-892');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Carro');
  const [issuedTicket, setIssuedTicket] = useState<{
    ticketId: string;
    plate: string;
    cellId: string;
    category: VehicleType;
    entryTime: string;
    ratePerHour: number;
    driverName?: string;
  } | null>(null);

  const [lookupPlate, setLookupPlate] = useState<string>('');
  const [paySuccess, setPaySuccess] = useState<boolean>(false);
  const [paidSummary, setPaidSummary] = useState<{ plate: string; total: number; cellId: string } | null>(null);

  // Filter free bays
  const freeBays = cells.filter(c => c.status === 'free');
  const occupiedBays = cells.filter(c => c.status === 'occupied');

  const handleOccupyBay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || plate.trim().length < 3) {
      showToast('Por favor ingrese su matrícula / placa', 'warning');
      return;
    }
    if (!selectedBay) {
      showToast('Seleccione un puesto libre en el mapa', 'warning');
      return;
    }

    playCyberFeedback('checkout', 0.25);
    const driverName = currentUser?.name || 'Alejandro Vélez';
    const driverDoc = currentUser?.document || '1020304050';
    const driverPhone = currentUser?.phone || '310 987 6543';

    const result = registerClientAutoOccupy(
      selectedBay,
      plate.trim().toUpperCase(),
      vehicleType,
      driverName,
      driverDoc,
      driverPhone
    );
    
    if (result.success) {
      const rate = vehicleType === 'Moto' ? 2200 : vehicleType === 'Camioneta / SUV' ? 6000 : 4500;
      setIssuedTicket({
        ticketId: result.ticketId || `#PK-CLI-${Math.floor(1000 + Math.random() * 9000)}`,
        plate: plate.trim().toUpperCase(),
        cellId: selectedBay,
        category: vehicleType,
        entryTime: currentTimeString || new Date().toLocaleTimeString(),
        ratePerHour: rate,
        driverName,
      });
      showToast(`¡Puesto ${selectedBay} asignado y barrera habilitada!`, 'success');
      // Pick next free bay if available
      const nextFree = cells.find(c => c.status === 'free' && c.id !== selectedBay);
      if (nextFree) setSelectedBay(nextFree.id);
    }
  };

  const handleOnlinePay = () => {
    const targetPlate = (lookupPlate || 'KLO-892').trim().toUpperCase();
    playCyberFeedback('checkout', 0.25);

    const result = processCheckout(targetPlate, 'QR Nequi/Davi');
    if (result.success) {
      setPaidSummary({
        plate: targetPlate,
        total: result.total || 13500,
        cellId: result.cellId || 'A-01',
      });
      setPaySuccess(true);
      showToast('¡Pago en línea confirmado! Barrera de salida habilitada.', 'success');
    } else {
      showToast(result.error || 'No se encontró vehículo con esa placa', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full animate-fadeIn">
      
      {/* ── HEADER BANNER ── */}
      <div 
        className="p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(4,24,18,0.94) 0%, rgba(2,10,14,0.98) 100%)',
          boxShadow: '0 0 40px rgba(0,255,157,0.15)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>PORTAL DE AUTOGESTIÓN PARA CONDUCTORES // PARKFLOW 2099</span>
          </div>
          <h1 className="font-hud text-2xl md:text-3xl font-black text-white tracking-wider flex items-center gap-3">
            <span>SELECCIÓN DE PUESTO Y AUTO-TICKET</span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              CLIENTE
            </span>
          </h1>
          <p className="font-sans text-xs text-slate-400 mt-1">
            Verifica el aforo en tiempo real, escoge libremente la celda donde deseas estacionar y obtén tu ticket digital al instante.
          </p>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-emerald-500/20 pt-3 md:pt-0 md:pl-5 font-mono text-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Bahías Libres</span>
            <span className="font-hud text-2xl font-black text-emerald-400">{freeBays.length}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Ocupadas</span>
            <span className="font-hud text-2xl font-black text-rose-400">{occupiedBays.length}</span>
          </div>
        </div>
      </div>

      {/* ── PASO 1: MAPA DE CELDAS INTERACTIVO ── */}
      <div className="p-6 rounded-2xl border border-cyan-500/25 flex flex-col gap-4" style={{ background: 'rgba(6,12,32,0.88)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-cyan-500/20">
          <div>
            <span className="font-hud text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-400 text-black text-xs font-black flex items-center justify-center">1</span>
              ELIGE TU PUESTO LIBRE EN EL MAPA TELEMÉTRICO:
            </span>
            <p className="font-mono text-[11px] text-slate-400 mt-0.5">
              Haz clic en cualquier celda verde para seleccionarla como tu destino de parqueo.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Libre ({freeBays.length})
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Ocupada ({occupiedBays.length})
            </span>
          </div>
        </div>

        {/* Bays Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 pt-2">
          {cells.slice(0, 30).map(c => {
            const isFree = c.status === 'free';
            const isSelected = selectedBay === c.id;
            return (
              <button
                key={c.id}
                disabled={!isFree}
                type="button"
                onClick={() => {
                  if (isFree) {
                    playCyberFeedback('click', 0.2);
                    setSelectedBay(c.id);
                    setVehicleType(c.category);
                  }
                }}
                className={`p-3.5 rounded-xl border flex flex-col justify-between items-center text-center transition-all min-h-[105px] ${
                  !isFree
                    ? 'bg-rose-950/25 border-rose-500/30 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-cyan-500/25 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-105 cursor-pointer ring-2 ring-cyan-400'
                    : 'bg-emerald-950/25 border-emerald-500/35 hover:border-cyan-400 hover:scale-102 cursor-pointer'
                }`}
              >
                <div className="w-full flex justify-between font-mono text-[11px]">
                  <span className="font-hud font-bold text-white">{c.id}</span>
                  <span className="text-[10px] text-slate-400">{c.category === 'Moto' ? 'Moto' : 'Carro'}</span>
                </div>
                
                <span className={`material-symbols-outlined text-[28px] my-1 ${
                  isSelected ? 'text-cyan-300 animate-bounce' : isFree ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isSelected ? 'task_alt' : isFree ? 'local_parking' : 'directions_car'}
                </span>

                <div className="font-mono text-[10px] font-bold">
                  {isSelected ? (
                    <span className="text-cyan-300 glow-text-cyan font-black">ELEGIDO</span>
                  ) : isFree ? (
                    <span className="text-emerald-300">DISPONIBLE</span>
                  ) : (
                    <span className="text-rose-400">{c.plate || 'OCUPADO'}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PASO 2: FORMULARIO DE REGISTRO & AUTO-TICKET ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input details */}
        <form 
          onSubmit={handleOccupyBay} 
          className="lg:col-span-7 p-6 rounded-2xl border border-cyan-500/25 flex flex-col gap-4"
          style={{ background: 'rgba(6,12,32,0.88)' }}
        >
          <div className="font-hud text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-cyan-500/20">
            <span className="w-5 h-5 rounded-full bg-cyan-400 text-black text-xs font-black flex items-center justify-center">2</span>
            REGISTRA TU PLACA & TARIFA:
          </div>

          <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-slate-400 uppercase">Puesto Seleccionado:</span>
              <span className="font-hud text-2xl font-black text-cyan-300">{selectedBay}</span>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
              {vehicleType === 'Moto' ? 'Bahía Sector Motos' : 'Bahía Sector Principal'}
            </span>
          </div>

          <div>
            <label className="font-mono text-xs text-slate-400 uppercase block mb-1.5 font-bold">
              Tu Placa / Matrícula Vehicular:
            </label>
            <input
              type="text"
              placeholder="EJ: KLO-892"
              maxLength={7}
              value={plate}
              onChange={e => setPlate(e.target.value.toUpperCase())}
              required
              className="w-full h-14 rounded-xl px-4 font-mono text-3xl font-black tracking-widest text-center text-cyan-300 border border-cyan-500/40 bg-black/60 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="font-mono text-xs text-slate-400 uppercase block mb-1.5 font-bold">
              Categoría de Vehículo:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'Carro' as VehicleType, label: 'Carro', rate: '$4.500/h', icon: 'directions_car' },
                { type: 'Moto' as VehicleType, label: 'Moto', rate: '$2.200/h', icon: 'two_wheeler' },
                { type: 'Camioneta / SUV' as VehicleType, label: 'Camioneta', rate: '$6.000/h', icon: 'airport_shuttle' },
              ].map(c => (
                <button
                  key={c.type}
                  type="button"
                  onClick={() => { playCyberFeedback('click', 0.2); setVehicleType(c.type); }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    vehicleType === c.type
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px] block mx-auto">{c.icon}</span>
                  <div className="font-hud text-xs font-bold mt-0.5">{c.label}</div>
                  <div className="font-mono text-[10px] text-emerald-400 font-semibold">{c.rate}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 h-14 rounded-xl font-hud text-xs font-black tracking-wider cyber-btn-emerald cursor-pointer shadow-[0_0_20px_rgba(0,255,157,0.3)] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>OCUPAR PUESTO {selectedBay} & GENERAR TICKET</span>
          </button>
        </form>

        {/* Right: Issued Digital Ticket Preview */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {issuedTicket ? (
            <div 
              className="p-6 rounded-2xl border border-emerald-500/40 relative overflow-hidden flex flex-col gap-4 animate-fadeIn" 
              style={{
                background: 'linear-gradient(160deg, rgba(4,24,18,0.98) 0%, rgba(2,10,14,0.99) 100%)',
                boxShadow: '0 0 40px rgba(0,255,157,0.25)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
              
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                <div>
                  <span className="font-mono text-[10px] text-emerald-400 block font-bold">TICKET DIGITAL ACTIVO</span>
                  <span className="font-hud text-base font-black text-white">{issuedTicket.ticketId}</span>
                </div>
                <span className="material-symbols-outlined text-emerald-400 text-[32px] animate-pulse">qr_code_2</span>
              </div>

              <div className="plate-bezel px-4 py-2.5 rounded-xl text-center">
                <span className="font-mono text-3xl font-black text-yellow-300 tracking-widest">{issuedTicket.plate}</span>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-500/25 bg-black/60 font-mono text-xs flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Puesto Asignado:</span>
                  <span className="font-bold text-cyan-300 font-hud text-base">{issuedTicket.cellId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hora de Ingreso:</span>
                  <span className="font-bold text-white">{issuedTicket.entryTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tarifa por Hora:</span>
                  <span className="font-bold text-emerald-300">${issuedTicket.ratePerHour.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-1.5 text-slate-300">
                  <span>Barrera de Entrada:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    HABILITADA (Ingresa)
                  </span>
                </div>
              </div>

              <div className="text-center font-mono text-[10px] text-slate-500">
                Conserva este ticket digital para pre-pagar o registrar tu salida en la taquilla.
              </div>
            </div>
          ) : (
            <div 
              className="p-6 rounded-2xl border border-cyan-500/20 flex flex-col items-center justify-center text-center gap-3 min-h-[320px]" 
              style={{ background: 'rgba(6,12,32,0.6)' }}
            >
              <span className="material-symbols-outlined text-slate-600 text-[56px]">confirmation_number</span>
              <span className="font-hud text-sm font-bold text-slate-300">AÚN NO HAS GENERADO TICKET</span>
              <p className="font-mono text-[11px] text-slate-500 max-w-xs">
                Elige tu puesto en el mapa 3D y presiona el botón verde para obtener tu ticket digital instantáneo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── PASO 3: CONSULTAR Y PRE-PAGAR EN LÍNEA ── */}
      <div 
        className="p-6 rounded-2xl border border-violet-500/30 flex flex-col gap-4" 
        style={{ background: 'rgba(10,8,28,0.85)' }}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-violet-400 text-[26px]">payments</span>
          <div>
            <h2 className="font-hud text-base font-bold text-white tracking-wider">
              ¿YA VAS A SALIR? CONSULTA TU PERMANENCIA & PAGA EN LÍNEA
            </h2>
            <p className="font-mono text-xs text-slate-400 mt-0.5">
              Ingresa tu placa para ver cuánto llevas consumido y pagar inmediatamente con QR Nequi/Davi o Tarjeta.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            placeholder="INGRESA TU PLACA (EJ. KLO-892)"
            value={lookupPlate}
            onChange={e => setLookupPlate(e.target.value.toUpperCase())}
            className="flex-1 h-13 rounded-xl px-4 font-mono text-lg font-bold text-cyan-300 bg-black/60 border border-violet-500/40 focus:outline-none focus:border-violet-400"
          />
          <button
            type="button"
            onClick={handleOnlinePay}
            className="px-6 h-13 rounded-xl font-hud text-xs font-bold cyber-btn-violet cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">credit_card</span>
            <span>CONSULTAR Y PAGAR ONLINE</span>
          </button>
        </div>

        {paySuccess && paidSummary && (
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[24px]">verified</span>
              <div>
                <strong>¡Pago de ${paidSummary.total.toLocaleString('es-CO')} COP recibido con éxito para {paidSummary.plate}!</strong>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  La celda {paidSummary.cellId} ha sido liberada. La barrera de salida se elevará automáticamente. Tienes 15 minutos de gracia.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setPaySuccess(false)} 
              className="underline text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

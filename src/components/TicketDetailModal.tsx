import React from 'react';
import { useParking } from '../context/ParkingContext.tsx';

export const TicketDetailModal: React.FC = () => {
  const { selectedCellForModal, setSelectedCellForModal, processCheckout, setActiveView, setSelectedVehicleForCheckout } = useParking();

  if (!selectedCellForModal) return null;

  const cell = selectedCellForModal;
  const isOccupied = cell.status === 'occupied';

  const handleChargeAndRelease = () => {
    if (isOccupied && cell.plate) {
      processCheckout(cell.id);
      setSelectedCellForModal(null);
    }
  };

  const handleNavigateToCheckout = () => {
    setSelectedVehicleForCheckout({
      cell,
      calculatedTotal: cell.currentTotal || 4500,
      hours: 2,
      fractionMinutes: 15,
    });
    setSelectedCellForModal(null);
    setActiveView('salida-y-cobro');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
    }}>
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setSelectedCellForModal(null)} />

      <div className="relative w-full max-w-md rounded-2xl overflow-hidden" style={{
        background: 'linear-gradient(160deg, rgba(4,8,24,0.98) 0%, rgba(2,4,14,0.99) 100%)',
        border: '1px solid rgba(0,240,255,0.35)',
        boxShadow: '0 0 60px rgba(0,240,255,0.15), 0 32px 80px rgba(0,0,0,0.8)',
        animation: 'power-on 0.4s ease-out forwards',
      }}>
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
        {/* HUD corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400" style={{ boxShadow: '-2px -2px 8px rgba(0,240,255,0.4)' }} />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-400" style={{ boxShadow: '2px -2px 8px rgba(0,240,255,0.4)' }} />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-400" style={{ boxShadow: '-2px 2px 8px rgba(0,240,255,0.4)' }} />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400" style={{ boxShadow: '2px 2px 8px rgba(0,240,255,0.4)' }} />

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{
          background: 'linear-gradient(90deg, rgba(0,240,255,0.08) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(0,240,255,0.15)',
        }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-cyan-300" style={{
              background: 'rgba(0,240,255,0.1)',
              border: '1px solid rgba(0,240,255,0.3)',
              boxShadow: '0 0 15px rgba(0,240,255,0.2)',
            }}>
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            </div>
            <div>
              <h3 className="font-hud text-[14px] font-black text-white tracking-wider">TICKET DE ESTACIONAMIENTO</h3>
              <p className="font-mono text-[9px] text-cyan-400/70 mt-0.5">
                Celda: <span className="text-cyan-300 font-bold">{cell.id}</span> · 
                ${cell.ratePerHour.toLocaleString('es-CO')}/h
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedCellForModal(null)}
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3.5">
          {/* Plate display */}
          <div className="rounded-xl p-4 flex items-center justify-between" style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(0,240,255,0.2)',
          }}>
            <div>
              <span className="font-mono text-[9px] text-slate-500 block mb-1 tracking-wider">PLACA REGISTRADA</span>
              <span className="font-label-plate text-[26px] text-yellow-300 font-black tracking-widest" style={{ textShadow: '0 0 15px rgba(250,204,21,0.5)' }}>
                {cell.plate || '---'}
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-[9px] text-slate-500 block mb-1 tracking-wider">CATEGORÍA</span>
              <span className="font-hud text-[13px] font-bold text-cyan-300">{cell.category}</span>
            </div>
          </div>

          {/* Time info */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl p-3" style={{
              background: 'rgba(0,240,255,0.04)',
              border: '1px solid rgba(0,240,255,0.15)',
            }}>
              <span className="font-mono text-[9px] text-slate-500 block mb-1.5 tracking-wider">HORA INGRESO</span>
              <span className="font-label-code text-[13px] text-cyan-200 font-bold">{cell.entryTime || '--:--'}</span>
            </div>
            <div className="rounded-xl p-3" style={{
              background: 'rgba(255,42,109,0.04)',
              border: '1px solid rgba(255,42,109,0.2)',
            }}>
              <span className="font-mono text-[9px] text-slate-500 block mb-1.5 tracking-wider">TIEMPO ACTIVO</span>
              <span className="font-label-code text-[13px] text-rose-300 font-bold">{cell.duration || '0h 0m'}</span>
            </div>
          </div>

          {/* Total */}
          <div className="rounded-xl p-4 flex items-center justify-between" style={{
            background: 'linear-gradient(135deg, rgba(0,255,157,0.06) 0%, rgba(0,200,100,0.04) 100%)',
            border: '1px solid rgba(0,255,157,0.25)',
            boxShadow: '0 0 15px rgba(0,255,157,0.06)',
          }}>
            <div>
              <span className="font-mono text-[9px] text-emerald-400/60 block tracking-wider uppercase">Total a Cobrar</span>
              <span className="font-mono text-[10px] text-slate-500">Tarifa incluida</span>
            </div>
            <span className="font-hud text-[28px] font-black text-emerald-300" style={{ textShadow: '0 0 20px rgba(0,255,157,0.6)' }}>
              ${(cell.currentTotal || 0).toLocaleString('es-CO')}
            </span>
          </div>

          {cell.notes && (
            <div className="px-3 py-2.5 rounded-xl" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span className="font-mono text-[9px] text-slate-500 block mb-1">OBSERVACIONES</span>
              <p className="text-[11px] text-slate-400 font-mono">{cell.notes}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleNavigateToCheckout}
              type="button"
              className="py-3 rounded-xl font-hud text-[11px] font-bold text-slate-300 transition-all flex items-center justify-center gap-1.5 hover:text-white"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
              Ir a Caja
            </button>
            <button
              onClick={handleChargeAndRelease}
              type="button"
              className="btn-neon py-3 rounded-xl font-hud text-[11px] font-black text-slate-950 transition-all flex items-center justify-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #00ff9d, #00c870)',
                boxShadow: '0 0 20px rgba(0,255,157,0.4)',
              }}
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              Cobrar y Liberar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

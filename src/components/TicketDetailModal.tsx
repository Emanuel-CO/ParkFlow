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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tertiary/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-150">
      <div className="bg-surface-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-surface-border">
        {/* Modal Header */}
        <div className="bg-primary px-6 py-4 text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            <div>
              <h3 className="font-sans text-[18px] font-bold">Ticket de Estacionamiento</h3>
              <p className="text-[12px] opacity-80">
                Celda: {cell.id} • Tarifa {cell.category} (${cell.ratePerHour.toLocaleString('es-CO')}/h)
              </p>
            </div>
          </div>
          <button
            className="text-on-primary/80 hover:text-on-primary p-1 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setSelectedCellForModal(null)}
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between bg-surface-canvas p-4 rounded-xl border border-surface-border">
            <div className="flex flex-col">
              <span className="text-[12px] text-text-secondary">Placa Registrada</span>
              <span className="font-label-plate text-[22px] text-primary font-bold">
                {cell.plate || 'SIN ASIGNAR'}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[12px] text-text-secondary">Categoría</span>
              <span className="font-sans text-[14px] font-semibold text-text-primary">
                {cell.category}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div className="bg-surface-canvas p-3 rounded-xl border border-surface-border">
              <span className="text-text-secondary block text-[11px]">Hora Ingreso</span>
              <span className="font-label-code text-text-primary font-bold">
                {cell.entryTime || '11:15 AM'}
              </span>
            </div>
            <div className="bg-surface-canvas p-3 rounded-xl border border-surface-border">
              <span className="text-text-secondary block text-[11px]">Tiempo Transcurrido</span>
              <span className="font-label-code text-status-occupied font-bold">
                {cell.duration || '2h 17m'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-status-occupied-bg text-status-occupied border border-status-occupied/20 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold uppercase tracking-wider">Total a Cobrar</span>
              <span className="text-[11px] text-text-secondary">IVA y tasa incluidos</span>
            </div>
            <span className="font-sans text-[28px] font-bold text-text-primary">
              ${(cell.currentTotal || 13500).toLocaleString('es-CO')}
            </span>
          </div>

          {cell.notes && (
            <div className="p-3 bg-surface-canvas rounded-lg text-xs text-text-secondary">
              <strong className="text-text-primary">Observaciones: </strong> {cell.notes}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              className="w-full py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary text-[14px] font-semibold transition-all"
              onClick={handleNavigateToCheckout}
              type="button"
            >
              Ir a Caja / Salida
            </button>
            <button
              className="w-full py-3 rounded-xl bg-status-available hover:bg-emerald-600 text-white text-[14px] font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
              onClick={handleChargeAndRelease}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span>Cobrar y Liberar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

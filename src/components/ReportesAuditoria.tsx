import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { Transaction, VehicleType } from '../types/parking.ts';

const FACILITY_OVERHEAD_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuB2YhYzqkfV44BvrbHZmkPD8YqS3h27g_LrAQA1ue1aTr5u1tHfq1m_Q4Cc7V3HT7sEkeNWM6qLvEjpbApUkvXqEX7DPZLJWYGDWcwcsqsWGE4tvClec6gElxdwDLB6ub5DCI5yAA6bBNpyGnxzttuDcZFW7Zp1cd-_1pWO8zQm0QvCggHMIc4QtgvpJA5o7HG2EP25oqqnArPolA0gCCtAC_SdX6yONvmvaVLW8sjVRV4i-ClbA42s";

export const ReportesAuditoria: React.FC = () => {
  const {
    transactions,
    tariffs,
    updateTariff,
    exportToCsv,
    exportToExcel,
    showToast,
  } = useParking();

  const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'month' | 'custom'>('today');
  const [categoryFilter, setCategoryFilter] = useState<'all' | VehicleType>('all');
  const [operatorFilter, setOperatorFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [tableSearch, setTableSearch] = useState('');
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);

  // Edit Tariff Modal
  const [isEditTariffOpen, setIsEditTariffOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VehicleType>('Carro');
  const [newRate, setNewRate] = useState(4500);
  const [newFraction, setNewFraction] = useState(2500);
  const [editReason, setEditReason] = useState('Ajuste inflacionario 2024');

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (categoryFilter !== 'all' && tx.vehicleType !== categoryFilter) return false;
    if (tableSearch) {
      const q = tableSearch.toUpperCase();
      const matchPlate = tx.plate.toUpperCase().includes(q);
      const matchId = tx.id.toUpperCase().includes(q);
      const matchCell = tx.cellId.toUpperCase().includes(q);
      if (!matchPlate && !matchId && !matchCell) return false;
    }
    return true;
  });

  const handleSaveTariff = (e: React.FormEvent) => {
    e.preventDefault();
    updateTariff(editingCategory, newRate, newFraction, editReason);
    setIsEditTariffOpen(false);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
      {/* Header Context & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-text-secondary font-label-code text-[12px] uppercase tracking-wider mb-1">
            <span className="text-secondary font-semibold">Módulo Financiero y Fiscal</span>
            <span>/</span>
            <span>Auditoría de Operaciones</span>
          </div>
          <h1 className="font-sans text-[26px] font-bold text-on-surface tracking-tight">
            Reportes Operativos y Auditoría
          </h1>
          <p className="text-[13px] text-text-secondary">
            Consolidación contable inmutable, control de cajas e historial completo de transacciones
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-surface-card px-3 py-2 rounded-xl border border-surface-border shadow-xs">
            <span className="material-symbols-outlined text-secondary text-[20px]">policy</span>
            <span className="text-[11px] text-text-secondary font-medium">
              Auditabilidad Total PRD 3.1 & 3.4 • Borrado Lógico Protegido
            </span>
          </div>

          <button
            type="button"
            onClick={exportToExcel}
            className="px-4 py-2.5 bg-surface-card hover:bg-surface-container-high text-primary font-sans text-[13px] font-semibold rounded-xl border border-surface-border shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-status-available text-[20px]">table_chart</span>
            <span>Exportar Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={exportToCsv}
            className="px-4 py-2.5 bg-secondary hover:bg-primary text-white font-sans text-[13px] font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Descargar CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-card p-4 rounded-xl border border-surface-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Date Ranges */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-lg border border-surface-border overflow-x-auto">
          {[
            { id: 'today', label: 'Hoy (24 Oct)' },
            { id: '7days', label: 'Últimos 7 Días' },
            { id: 'month', label: 'Mes en Curso' },
            { id: 'custom', label: 'Personalizado' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setDateFilter(tab.id as any);
                showToast(`Filtro de fecha: ${tab.label}`);
              }}
              className={`px-3 py-1.5 rounded-md text-[13px] transition-all whitespace-nowrap cursor-pointer ${
                dateFilter === tab.id
                  ? 'bg-white text-primary shadow-xs font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-border">
            <span className="text-[11px] text-text-secondary">Categoría:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-transparent text-[12px] font-semibold text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">Todas</option>
              <option value="Carro">Carros</option>
              <option value="Moto">Motos</option>
              <option value="Camioneta / SUV">Camionetas</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-border">
            <span className="text-[11px] text-text-secondary">Turno / Operador:</span>
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value as any)}
              className="bg-transparent text-[12px] font-semibold text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los turnos</option>
              <option value="morning">Turno Mañana (S-01)</option>
              <option value="afternoon">Turno Tarde (S-02)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Financial & Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-card p-5 rounded-xl border border-surface-border shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-text-secondary uppercase font-semibold tracking-wider">
                Recaudo Neto Total
              </span>
              <div className="text-[26px] font-bold text-primary mt-1">
                $3.842.000 <span className="text-xs text-text-secondary font-normal">COP</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-available-bg text-status-available flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">attach_money</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-status-available font-semibold mt-3">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+14.2% vs periodo anterior</span>
          </div>
        </div>

        <div className="bg-surface-card p-5 rounded-xl border border-surface-border shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-text-secondary uppercase font-semibold tracking-wider">
                Vehículos Atendidos
              </span>
              <div className="text-[26px] font-bold text-text-primary mt-1">584</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">directions_car</span>
            </div>
          </div>
          <div className="text-[12px] text-text-secondary mt-3">
            Tasa de rotación: <strong className="text-text-primary font-label-code">3.8 veh/celda</strong>
          </div>
        </div>

        <div className="bg-surface-card p-5 rounded-xl border border-surface-border shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-text-secondary uppercase font-semibold tracking-wider">
                Tiempo Promedio Estadía
              </span>
              <div className="text-[26px] font-bold text-text-primary mt-1 font-label-code">1h 48m</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">schedule</span>
            </div>
          </div>
          <div className="text-[12px] text-text-secondary mt-3">
            Mediana: <strong className="text-text-primary font-label-code">1h 15m</strong>
          </div>
        </div>

        <div className="bg-surface-card p-5 rounded-xl border border-surface-border shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-text-secondary uppercase font-semibold tracking-wider">
                Exenciones / Gracia
              </span>
              <div className="text-[26px] font-bold text-status-warning mt-1">18</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
          </div>
          <div className="text-[12px] text-text-secondary mt-3">
            3.0% del volumen total auditado
          </div>
        </div>
      </div>

      {/* Bento Row: Tariffs Snapshot Rule & Facility Overhead */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Tariff Scheme & Snapshot Rules (7 cols) */}
        <div className="lg:col-span-7 bg-surface-card rounded-xl p-5 border border-surface-border shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[24px]">price_change</span>
              <h2 className="font-sans text-[16px] font-bold text-text-primary">
                Esquema Tarifario Auditado y Versionamiento
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsEditTariffOpen(true)}
              className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-primary font-sans text-[12px] font-semibold rounded-lg border border-surface-border transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Editar Tarifas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-surface-container-low rounded-xl border border-surface-border flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-secondary text-[11px]">
                <span>Carros</span>
                <span className="font-label-code text-secondary font-bold">
                  {tariffs['Carro']?.snapshotVersion}
                </span>
              </div>
              <div className="text-[20px] font-bold text-primary my-1 font-label-code">
                ${tariffs['Carro']?.ratePerHour.toLocaleString('es-CO')}/h
              </div>
              <span className="text-[11px] text-text-secondary">
                Frac: ${tariffs['Carro']?.minFraction.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl border border-surface-border flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-secondary text-[11px]">
                <span>Motos</span>
                <span className="font-label-code text-secondary font-bold">
                  {tariffs['Moto']?.snapshotVersion}
                </span>
              </div>
              <div className="text-[20px] font-bold text-primary my-1 font-label-code">
                ${tariffs['Moto']?.ratePerHour.toLocaleString('es-CO')}/h
              </div>
              <span className="text-[11px] text-text-secondary">
                Frac: ${tariffs['Moto']?.minFraction.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl border border-surface-border flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-secondary text-[11px]">
                <span>Camionetas / SUV</span>
                <span className="font-label-code text-secondary font-bold">
                  {tariffs['Camioneta / SUV']?.snapshotVersion}
                </span>
              </div>
              <div className="text-[20px] font-bold text-primary my-1 font-label-code">
                ${tariffs['Camioneta / SUV']?.ratePerHour.toLocaleString('es-CO')}/h
              </div>
              <span className="text-[11px] text-text-secondary">
                Frac: ${tariffs['Camioneta / SUV']?.minFraction.toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* Snapshot Rule Callout */}
          <div className="p-3 bg-surface-canvas rounded-xl border border-surface-border text-xs text-text-secondary flex items-start gap-2.5">
            <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">lock_clock</span>
            <div>
              <strong className="text-text-primary">Regla Inmutable PRD (Criterio 3.4):</strong>
              <p className="mt-0.5 leading-relaxed">
                Todo cambio tarifario genera una nueva versión snapshot. Los vehículos actualmente en patio conservan su tarifa de ingreso hasta que se liquide su salida para evitar cobros retroactivos o auditorías descalificadas.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Facility Snapshot & Method Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-surface-card rounded-xl p-5 border border-surface-border shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-[15px] font-bold text-text-primary">
              Distribución de Medios de Recaudo
            </h2>
            <span className="font-label-code text-[11px] text-text-secondary">Sede Medellín</span>
          </div>

          <div className="relative rounded-xl overflow-hidden h-28 border border-surface-border shadow-inner">
            <img
              src={FACILITY_OVERHEAD_URL}
              alt="Instalaciones ParkFlow"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex items-end p-3">
              <span className="text-white text-xs font-semibold">
                Sede Central • Cra 43A El Poblado (50 bahías monitoreadas)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1 text-[12px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span>Efectivo en Caja</span>
              </div>
              <span className="font-label-code font-bold text-primary">58% ($2.228.360)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span>Tarjeta / Datáfono</span>
              </div>
              <span className="font-label-code font-bold text-secondary">26% ($998.920)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-status-available"></span>
                <span>Transferencia QR Nequi/Davi</span>
              </div>
              <span className="font-label-code font-bold text-status-available">16% ($614.720)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Audit Transaction Table */}
      <div className="bg-surface-card rounded-xl p-5 border border-surface-border shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-sans text-[17px] font-bold text-text-primary">
              Registro Granular de Transacciones Fiscales
            </h2>
            <p className="text-[12px] text-text-secondary">
              Cada movimiento está sellado con identificador inmutable y marca de tiempo certificada
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar placa, ticket, celda..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-surface-container-low text-text-primary text-[13px] rounded-lg border border-surface-border focus:outline-none focus:bg-white focus:ring-2 focus:ring-secondary"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-text-secondary text-[18px]">
              search
            </span>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto border border-surface-border rounded-xl">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-surface-container-low text-text-secondary font-label-code text-[11px] uppercase border-b border-surface-border">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Placa</th>
                <th className="py-3 px-4">Vehículo</th>
                <th className="py-3 px-4">Celda</th>
                <th className="py-3 px-4">Ingreso</th>
                <th className="py-3 px-4">Salida</th>
                <th className="py-3 px-4">Estadía</th>
                <th className="py-3 px-4 text-right">Cobrado</th>
                <th className="py-3 px-4">Medio Pago</th>
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border font-sans">
              {filteredTransactions.map((tx) => {
                let statusBadge = (
                  <span className="px-2 py-0.5 rounded-full bg-status-available-bg text-status-available text-[11px] font-bold">
                    Completado
                  </span>
                );
                if (tx.status === 'En Curso') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full bg-status-warning-bg text-status-warning text-[11px] font-bold">
                      En Curso
                    </span>
                  );
                } else if (tx.status === 'Anulado') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary text-[11px] font-bold">
                      Anulado (Gracia)
                    </span>
                  );
                }

                return (
                  <tr key={tx.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-4 font-label-code font-bold text-primary">{tx.id}</td>
                    <td className="py-3 px-4 font-label-plate font-bold text-text-primary">{tx.plate}</td>
                    <td className="py-3 px-4 text-text-secondary">{tx.vehicleType}</td>
                    <td className="py-3 px-4 font-label-code text-secondary font-bold">{tx.cellId}</td>
                    <td className="py-3 px-4 font-label-code text-text-secondary text-[12px]">{tx.entryTime}</td>
                    <td className="py-3 px-4 font-label-code text-text-secondary text-[12px]">{tx.exitTime || 'En patio'}</td>
                    <td className="py-3 px-4 font-label-code text-text-primary">{tx.duration}</td>
                    <td className="py-3 px-4 font-label-code font-bold text-primary text-right">
                      ${tx.totalPaid.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{tx.paymentMethod}</td>
                    <td className="py-3 px-4 text-text-secondary text-[12px]">{tx.operator}</td>
                    <td className="py-3 px-4 text-center">{statusBadge}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedTxForDetail(tx)}
                        className="p-1 rounded text-secondary hover:bg-surface-container transition-colors"
                        title="Ver detalle del ticket"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info & pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-text-secondary text-[12px] pt-1">
          <span>Mostrando {filteredTransactions.length} registros auditados</span>
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <button
              type="button"
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-50"
              disabled
            >
              Anterior
            </button>
            <span className="px-2 font-label-code text-primary font-bold">1</span>
            <button
              type="button"
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors"
              onClick={() => showToast('Página siguiente cargada')}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: EDIT TARIFFS */}
      {isEditTariffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-surface-card max-w-md w-full rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-surface-border">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">tune</span>
                <h3 className="font-sans text-[18px] font-bold text-text-primary">
                  Modificar Tarifa Vehicular
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditTariffOpen(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTariff} className="flex flex-col gap-4">
              <div className="p-3 bg-status-warning-bg/70 rounded-xl text-status-warning border border-status-warning/20 text-xs flex items-start gap-2">
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">info</span>
                <span>
                  <strong>Atención:</strong> Esta modificación creará una nueva versión snapshot. Los autos actualmente estacionados seguirán pagando con la tarifa anterior (PRD 3.4).
                </span>
              </div>

              <div>
                <label className="text-[12px] text-text-secondary block mb-1 font-semibold">
                  Categoría
                </label>
                <select
                  value={editingCategory}
                  onChange={(e) => {
                    const cat = e.target.value as VehicleType;
                    setEditingCategory(cat);
                    setNewRate(tariffs[cat]?.ratePerHour || 4500);
                    setNewFraction(tariffs[cat]?.minFraction || 2500);
                  }}
                  className="w-full h-11 bg-surface-container-low text-text-primary rounded-lg px-3 text-[13px] border border-surface-border font-semibold"
                >
                  <option value="Carro">Carro</option>
                  <option value="Moto">Moto</option>
                  <option value="Camioneta / SUV">Camioneta / SUV</option>
                  <option value="Bicicleta">Bicicleta</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] text-text-secondary block mb-1 font-semibold">
                  Nueva Tarifa por Hora (COP)
                </label>
                <input
                  type="number"
                  step={100}
                  value={newRate}
                  onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 bg-surface-container-low text-text-primary rounded-lg px-3 font-label-code text-[16px] font-bold border border-surface-border"
                />
              </div>

              <div>
                <label className="text-[12px] text-text-secondary block mb-1 font-semibold">
                  Fracción Mínima (0 - 30 min) (COP)
                </label>
                <input
                  type="number"
                  step={100}
                  value={newFraction}
                  onChange={(e) => setNewFraction(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 bg-surface-container-low text-text-primary rounded-lg px-3 font-label-code text-[16px] font-bold border border-surface-border"
                />
              </div>

              <div>
                <label className="text-[12px] text-text-secondary block mb-1 font-semibold">
                  Justificación de Auditoría
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full h-11 bg-surface-container-low text-text-primary rounded-lg px-3 text-[13px] border border-surface-border"
                  placeholder="Ej. Decreto alcaldía / inflación"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditTariffOpen(false)}
                  className="flex-1 h-11 bg-surface-container hover:bg-surface-container-high text-text-primary font-semibold rounded-xl text-[13px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-secondary hover:bg-primary text-white font-bold rounded-xl text-[13px] shadow-sm cursor-pointer"
                >
                  Guardar y Versionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TICKET DETAIL VIEW */}
      {selectedTxForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-surface-card max-w-md w-full rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-surface-border text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">receipt_long</span>
            </div>
            <div>
              <span className="font-label-code text-[13px] text-secondary font-bold">
                {selectedTxForDetail.id}
              </span>
              <h3 className="font-label-plate text-[24px] font-bold text-text-primary mt-1">
                {selectedTxForDetail.plate}
              </h3>
              <p className="text-[12px] text-text-secondary">
                {selectedTxForDetail.vehicleType} • Celda {selectedTxForDetail.cellId}
              </p>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Ingreso:</span>
                <span className="font-label-code text-text-primary font-bold">{selectedTxForDetail.entryTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Salida:</span>
                <span className="font-label-code text-text-primary font-bold">{selectedTxForDetail.exitTime || 'En patio'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Estadía total:</span>
                <span className="font-label-code text-text-primary font-bold">{selectedTxForDetail.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tarifa aplicada:</span>
                <span className="font-label-code text-text-primary font-bold">${selectedTxForDetail.snapshotRate}/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Método de Pago:</span>
                <span className="text-text-primary font-bold">{selectedTxForDetail.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-surface-border pt-2 text-sm font-bold text-primary">
                <span>Total Liquidado:</span>
                <span>${selectedTxForDetail.totalPaid.toLocaleString('es-CO')} COP</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTxForDetail(null)}
              className="w-full h-11 bg-surface-container hover:bg-surface-container-high text-text-primary font-bold rounded-xl text-[13px]"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

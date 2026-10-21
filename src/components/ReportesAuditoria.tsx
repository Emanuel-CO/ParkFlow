import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { Transaction, VehicleType } from '../types/parking.ts';
import { playCyberFeedback } from '../utils/audioAlert.ts';

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
  const [editReason, setEditReason] = useState('Ajuste inflacionario 2099');

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
    playCyberFeedback('checkout', 0.3);
    updateTariff(editingCategory, newRate, newFraction, editReason);
    setIsEditTariffOpen(false);
    showToast(`Tarifa de ${editingCategory} actualizada y snapshot versionado`, 'success');
  };

  const handleExportCsv = () => {
    playCyberFeedback('click', 0.2);
    exportToCsv();
  };

  const handleExportExcel = () => {
    playCyberFeedback('click', 0.2);
    exportToExcel();
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
      
      {/* ── TOP HUD HEADER BANNER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgba(8,16,42,0.92) 0%, rgba(4,8,24,0.96) 100%)',
        border: '1px solid rgba(0,240,255,0.25)',
        boxShadow: '0 0 35px rgba(0,240,255,0.08), inset 0 0 20px rgba(0,240,255,0.03)',
      }}>
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
              FINANCIAL TELEMETRY // LEDGER BLOCKCHAIN
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-emerald-400 font-bold">AUDITORÍA INMUTABLE</span>
          </div>
          <h1 className="font-hud text-[24px] md:text-[28px] font-black text-white tracking-wider flex items-center gap-3">
            <span>REPORTES OPERATIVOS & AUDITORÍA</span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              SHA-256
            </span>
          </h1>
          <p className="font-sans text-[13px] text-slate-400 mt-0.5">
            Consolidación contable inmutable, control de cajas e historial completo de transacciones fiscales
          </p>
        </div>

        {/* Action Buttons Stack */}
        <div className="flex items-center gap-3 flex-wrap z-10">
          <div className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10">
            <span className="material-symbols-outlined text-cyan-400 text-[18px]">policy</span>
            <span className="font-mono text-[10px] text-cyan-300 font-bold">
              PRD 3.1 & 3.4 · BORRADO LÓGICO PROTEGIDO
            </span>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl font-hud text-[11px] font-bold tracking-wider flex items-center gap-2 cursor-pointer cyber-btn-cyan"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-400">table_chart</span>
            <span>EXPORTAR EXCEL</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl font-hud text-[11px] font-bold tracking-wider flex items-center gap-2 cursor-pointer cyber-btn-emerald"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>DESCARGAR CSV</span>
          </button>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ── */}
      <div className="p-4 rounded-2xl border border-cyan-500/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4" style={{
        background: 'linear-gradient(145deg, rgba(6,12,32,0.88) 0%, rgba(3,7,20,0.94) 100%)',
      }}>
        {/* Date Range Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-cyan-500/20 overflow-x-auto" style={{ background: 'rgba(2,5,16,0.8)' }}>
          {[
            { id: 'today', label: 'Hoy (En Vivo)' },
            { id: '7days', label: 'Últimos 7 Días' },
            { id: 'month', label: 'Mes en Curso' },
            { id: 'custom', label: 'Histórico Completo' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playCyberFeedback('click', 0.15);
                setDateFilter(tab.id as any);
                showToast(`Filtro de fecha: ${tab.label}`);
              }}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                dateFilter === tab.id
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/20" style={{ background: 'rgba(2,5,16,0.8)' }}>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Categoría:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                playCyberFeedback('click', 0.15);
                setCategoryFilter(e.target.value as any);
              }}
              className="bg-transparent text-xs font-mono font-bold text-cyan-300 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">Todas</option>
              <option value="Carro" className="bg-slate-900 text-white">Carros</option>
              <option value="Moto" className="bg-slate-900 text-white">Motos</option>
              <option value="Camioneta / SUV" className="bg-slate-900 text-white">Camionetas</option>
              <option value="Bicicleta" className="bg-slate-900 text-white">Bicicletas</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/20" style={{ background: 'rgba(2,5,16,0.8)' }}>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Turno / Operador:</span>
            <select
              value={operatorFilter}
              onChange={(e) => {
                playCyberFeedback('click', 0.15);
                setOperatorFilter(e.target.value as any);
              }}
              className="bg-transparent text-xs font-mono font-bold text-cyan-300 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">Todos los turnos</option>
              <option value="morning" className="bg-slate-900 text-white">Turno Mañana (S-01)</option>
              <option value="afternoon" className="bg-slate-900 text-white">Turno Tarde (S-02)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 4 FINANCIAL & OPERATIONAL KPIS BENTO ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Recaudo Neto */}
        <div className="p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between border border-emerald-500/35" style={{
          background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-hud text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Recaudo Neto Total
              </span>
              <div className="font-mono text-[26px] md:text-[28px] font-black text-emerald-300 mt-1 glow-text-emerald">
                $3.842.000 <span className="text-xs font-normal opacity-70">COP</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,157,0.3)] shrink-0">
              <span className="material-symbols-outlined text-[24px]">attach_money</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 font-bold mt-4 pt-2 border-t border-emerald-500/20">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+14.2% vs periodo anterior · Auditoría OK</span>
          </div>
        </div>

        {/* KPI 2: Vehículos Atendidos */}
        <div className="p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between border border-cyan-500/35" style={{
          background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-hud text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Vehículos Atendidos
              </span>
              <div className="font-mono text-[26px] md:text-[28px] font-black text-cyan-300 mt-1 glow-text-cyan">
                584 <span className="text-xs font-normal opacity-70">flujo</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0">
              <span className="material-symbols-outlined text-[24px]">directions_car</span>
            </div>
          </div>
          <div className="font-mono text-[11px] text-slate-400 mt-4 pt-2 border-t border-cyan-500/20">
            Tasa de rotación: <strong className="text-cyan-300">3.8 veh/celda/día</strong>
          </div>
        </div>

        {/* KPI 3: Tiempo Promedio Estadía */}
        <div className="p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between border border-violet-500/35" style={{
          background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-hud text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Tiempo Promedio Estadía
              </span>
              <div className="font-mono text-[26px] md:text-[28px] font-black text-violet-300 mt-1 glow-text-violet">
                1h 48m
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/35 text-violet-300 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] shrink-0">
              <span className="material-symbols-outlined text-[24px]">schedule</span>
            </div>
          </div>
          <div className="font-mono text-[11px] text-slate-400 mt-4 pt-2 border-t border-violet-500/20">
            Mediana estacional: <strong className="text-violet-300">1h 15m</strong>
          </div>
        </div>

        {/* KPI 4: Exenciones / Gracia */}
        <div className="p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between border border-amber-500/35" style={{
          background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}>
          <div className="flex items-start justify-between">
            <div>
              <span className="font-hud text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Exenciones / Gracia
              </span>
              <div className="font-mono text-[26px] md:text-[28px] font-black text-amber-300 mt-1">
                18 <span className="text-xs font-normal opacity-70">servicios</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 flex items-center justify-center shadow-[0_0_15px_rgba(255,183,3,0.3)] shrink-0">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
          </div>
          <div className="font-mono text-[11px] text-slate-400 mt-4 pt-2 border-t border-amber-500/20">
            3.0% del volumen auditado (Tolerancia 15m)
          </div>
        </div>

      </div>

      {/* ── BENTO ROW: TARIFFS SNAPSHOT RULE & FACILITY OVERHEAD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Tariff Scheme & Snapshot Rules (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col justify-between gap-4 border border-cyan-500/25" style={{
          background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-[24px]">price_change</span>
              <h2 className="font-hud text-[14px] font-bold text-white tracking-wider">
                ESQUEMA TARIFARIO AUDITADO & VERSIONAMIENTO
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                playCyberFeedback('click', 0.2);
                setIsEditTariffOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl font-hud text-[11px] font-bold tracking-wider flex items-center gap-1.5 cursor-pointer cyber-btn-cyan"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>EDITAR TARIFAS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-cyan-500/20 flex flex-col justify-between" style={{ background: 'rgba(2,5,16,0.7)' }}>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Carros</span>
                <span className="text-cyan-400 font-bold">
                  {tariffs['Carro']?.snapshotVersion}
                </span>
              </div>
              <div className="font-mono text-[22px] font-black text-cyan-300 my-1 glow-text-cyan">
                ${tariffs['Carro']?.ratePerHour.toLocaleString('es-CO')}<span className="text-xs text-slate-500">/h</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                Frac: ${tariffs['Carro']?.minFraction.toLocaleString('es-CO')} COP
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-violet-500/20 flex flex-col justify-between" style={{ background: 'rgba(2,5,16,0.7)' }}>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Motos</span>
                <span className="text-violet-400 font-bold">
                  {tariffs['Moto']?.snapshotVersion}
                </span>
              </div>
              <div className="font-mono text-[22px] font-black text-violet-300 my-1 glow-text-violet">
                ${tariffs['Moto']?.ratePerHour.toLocaleString('es-CO')}<span className="text-xs text-slate-500">/h</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                Frac: ${tariffs['Moto']?.minFraction.toLocaleString('es-CO')} COP
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-500/20 flex flex-col justify-between" style={{ background: 'rgba(2,5,16,0.7)' }}>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Camionetas</span>
                <span className="text-amber-400 font-bold">
                  {tariffs['Camioneta / SUV']?.snapshotVersion}
                </span>
              </div>
              <div className="font-mono text-[22px] font-black text-amber-300 my-1">
                ${tariffs['Camioneta / SUV']?.ratePerHour.toLocaleString('es-CO')}<span className="text-xs text-slate-500">/h</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                Frac: ${tariffs['Camioneta / SUV']?.minFraction.toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>

          {/* Snapshot Rule Callout */}
          <div className="p-3.5 rounded-xl border border-cyan-500/20 flex items-start gap-3" style={{ background: 'rgba(0,240,255,0.04)' }}>
            <span className="material-symbols-outlined text-cyan-400 text-[20px] shrink-0 mt-0.5">lock_clock</span>
            <div>
              <strong className="font-hud text-[11px] text-cyan-300 block">REGLA INMUTABLE PRD (CRITERIO 3.4):</strong>
              <p className="font-mono text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                Todo cambio tarifario genera una nueva versión snapshot. Los vehículos actualmente en patio conservan su tarifa de ingreso hasta que se liquide su salida para evitar cobros retroactivos o auditorías descalificadas.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Facility Snapshot & Method Breakdown (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col justify-between gap-4 border border-cyan-500/25" style={{
          background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <div className="flex items-center justify-between">
            <h2 className="font-hud text-[14px] font-bold text-white tracking-wider">
              DISTRIBUCIÓN DE MEDIOS DE RECAUDO
            </h2>
            <span className="font-mono text-[10px] text-cyan-400 font-bold">SEDE MEDELLÍN</span>
          </div>

          <div className="relative rounded-xl overflow-hidden h-28 border border-cyan-500/30 group">
            <img
              src={FACILITY_OVERHEAD_URL}
              alt="Instalaciones ParkFlow"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-3">
              <span className="font-mono text-[11px] text-cyan-200 font-bold">
                Sede Central · Cra 43A El Poblado (50 bahías monitoreadas)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1 font-mono text-[12px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
                <span className="text-slate-300">Efectivo en Caja</span>
              </div>
              <span className="font-bold text-cyan-300">58% ($2.228.360)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_6px_#8b5cf6]" />
                <span className="text-slate-300">Tarjeta / Datáfono</span>
              </div>
              <span className="font-bold text-violet-300">26% ($998.920)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#00ff9d]" />
                <span className="text-slate-300">Transferencia QR Nequi/Davi</span>
              </div>
              <span className="font-bold text-emerald-300">16% ($614.720)</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── HISTORICAL AUDIT TRANSACTION TABLE ── */}
      <div className="rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col gap-4 border border-cyan-500/25" style={{
        background: 'linear-gradient(160deg, rgba(8,16,44,0.92) 0%, rgba(3,7,20,0.96) 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-hud text-[16px] font-bold text-white tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">table_rows</span>
              <span>REGISTRO GRANULAR DE TRANSACCIONES FISCALES</span>
            </h2>
            <p className="font-mono text-[11px] text-slate-400 mt-0.5">
              Cada movimiento está sellado con identificador inmutable SHA-256 y marca de tiempo certificada
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-cyan-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="BUSCAR PLACA, TICKET, CELDA..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl font-mono text-xs uppercase text-cyan-200 placeholder:text-slate-600 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
              style={{ background: 'rgba(2,5,16,0.85)' }}
            />
          </div>
        </div>

        {/* The Cyber Table */}
        <div className="overflow-x-auto rounded-xl border border-cyan-500/20" style={{ background: 'rgba(2,5,16,0.7)' }}>
          <table className="w-full text-left border-collapse font-mono text-[12px]">
            <thead>
              <tr className="border-b border-cyan-500/25 font-hud text-[10px] uppercase text-cyan-400 tracking-wider" style={{ background: 'rgba(0,240,255,0.06)' }}>
                <th className="py-3.5 px-4">Ticket</th>
                <th className="py-3.5 px-4">Placa</th>
                <th className="py-3.5 px-4">Vehículo</th>
                <th className="py-3.5 px-4">Celda</th>
                <th className="py-3.5 px-4">Ingreso</th>
                <th className="py-3.5 px-4">Salida</th>
                <th className="py-3.5 px-4">Estadía</th>
                <th className="py-3.5 px-4 text-right">Cobrado</th>
                <th className="py-3.5 px-4">Medio Pago</th>
                <th className="py-3.5 px-4">Operador</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => {
                let statusBadge = (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Completado
                  </span>
                );
                if (tx.status === 'En Curso') {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      En Curso
                    </span>
                  );
                } else if (tx.status === 'Anulado') {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[10px] font-bold">
                      Anulado (Gracia)
                    </span>
                  );
                }

                return (
                  <tr key={tx.id} className="data-row hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-cyan-400">{tx.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-label-plate font-black text-yellow-300 bg-black/60 border border-yellow-500/30">
                        {tx.plate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{tx.vehicleType}</td>
                    <td className="py-3.5 px-4 font-bold text-cyan-300">{tx.cellId}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">{tx.entryTime}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">{tx.exitTime || 'En patio'}</td>
                    <td className="py-3.5 px-4 text-emerald-300 font-bold">{tx.duration}</td>
                    <td className="py-3.5 px-4 font-black text-cyan-300 text-right glow-text-cyan">
                      ${tx.totalPaid.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{tx.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">{tx.operator}</td>
                    <td className="py-3.5 px-4 text-center">{statusBadge}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          playCyberFeedback('click', 0.2);
                          setSelectedTxForDetail(tx);
                        }}
                        className="p-1.5 rounded-lg text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 transition-all cursor-pointer"
                        title="Ver detalle del ticket"
                      >
                        <span className="material-symbols-outlined text-[17px]">receipt</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info & pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] text-slate-400 pt-1">
          <span>Mostrando {filteredTransactions.length} registros auditados con firma SHA-256</span>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <span className="px-3 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
              PÁGINA 1 DE 1
            </span>
          </div>
        </div>
      </div>

      {/* ── MODAL: EDIT TARIFFS ── */}
      {isEditTariffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-md w-full rounded-2xl p-6 flex flex-col gap-4 overflow-hidden" style={{
            background: 'linear-gradient(160deg, rgba(8,16,44,0.98) 0%, rgba(3,7,20,0.99) 100%)',
            border: '1px solid rgba(0,240,255,0.4)',
            boxShadow: '0 0 60px rgba(0,240,255,0.15), 0 32px 80px rgba(0,0,0,0.9)',
          }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-[24px]">tune</span>
                <h3 className="font-hud text-[15px] font-black text-white tracking-wider">
                  MODIFICAR TARIFA VEHICULAR
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditTariffOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTariff} className="flex flex-col gap-4">
              <div className="p-3 bg-amber-500/15 rounded-xl text-amber-300 border border-amber-500/30 font-mono text-xs flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 text-amber-400">info</span>
                <span>
                  <strong>Atención:</strong> Esta modificación creará una nueva versión snapshot. Los autos actualmente estacionados seguirán pagando con la tarifa anterior (PRD 3.4).
                </span>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
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
                  className="w-full h-11 rounded-xl px-3 font-mono text-xs text-white border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
                  style={{ background: 'rgba(2,5,16,0.85)' }}
                >
                  <option value="Carro" className="bg-slate-900 text-white">Carro</option>
                  <option value="Moto" className="bg-slate-900 text-white">Moto</option>
                  <option value="Camioneta / SUV" className="bg-slate-900 text-white">Camioneta / SUV</option>
                  <option value="Bicicleta" className="bg-slate-900 text-white">Bicicleta</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Nueva Tarifa por Hora (COP)
                </label>
                <input
                  type="number"
                  step={100}
                  value={newRate}
                  onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 rounded-xl px-3 font-mono text-[16px] font-bold text-cyan-300 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
                  style={{ background: 'rgba(2,5,16,0.85)' }}
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Fracción Mínima (0 - 15 min) (COP)
                </label>
                <input
                  type="number"
                  step={100}
                  value={newFraction}
                  onChange={(e) => setNewFraction(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 rounded-xl px-3 font-mono text-[16px] font-bold text-cyan-300 border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
                  style={{ background: 'rgba(2,5,16,0.85)' }}
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Justificación de Auditoría
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full h-11 rounded-xl px-3 font-mono text-xs text-white border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
                  style={{ background: 'rgba(2,5,16,0.85)' }}
                  placeholder="Ej. Decreto alcaldía / ajuste anual"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditTariffOpen(false)}
                  className="flex-1 h-11 rounded-xl font-mono text-xs font-bold text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl font-hud text-xs font-bold text-white cursor-pointer cyber-btn-cyan"
                >
                  GUARDAR & VERSIONAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: TICKET DETAIL VIEW ── */}
      {selectedTxForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-md w-full rounded-2xl p-6 flex flex-col gap-4 text-center overflow-hidden" style={{
            background: 'linear-gradient(160deg, rgba(8,16,44,0.98) 0%, rgba(3,7,20,0.99) 100%)',
            border: '1px solid rgba(0,240,255,0.4)',
            boxShadow: '0 0 60px rgba(0,240,255,0.15), 0 32px 80px rgba(0,0,0,0.9)',
          }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <span className="material-symbols-outlined text-[28px]">receipt_long</span>
            </div>

            <div>
              <span className="font-mono text-[12px] text-cyan-400 font-bold">
                {selectedTxForDetail.id}
              </span>
              <div className="plate-bezel px-4 py-1.5 rounded-xl w-fit mx-auto mt-2">
                <span className="font-label-plate text-[24px] font-black text-yellow-300 tracking-widest drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                  {selectedTxForDetail.plate}
                </span>
              </div>
              <p className="font-mono text-[11px] text-slate-400 mt-2">
                {selectedTxForDetail.vehicleType} · Celda {selectedTxForDetail.cellId}
              </p>
            </div>

            <div className="p-4 rounded-xl flex flex-col gap-2 font-mono text-xs border border-cyan-500/20 text-left" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <div className="flex justify-between">
                <span className="text-slate-400">Hora Ingreso:</span>
                <span className="font-bold text-white">{selectedTxForDetail.entryTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hora Salida:</span>
                <span className="font-bold text-white">{selectedTxForDetail.exitTime || 'En patio'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estadía total:</span>
                <span className="font-bold text-emerald-300">{selectedTxForDetail.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tarifa aplicada:</span>
                <span className="font-bold text-cyan-300">${selectedTxForDetail.snapshotRate}/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Método de Pago:</span>
                <span className="font-bold text-white">{selectedTxForDetail.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-cyan-500/20 pt-2 text-sm font-bold">
                <span className="text-slate-300">Total Liquidado:</span>
                <span className="text-cyan-300 glow-text-cyan">${selectedTxForDetail.totalPaid.toLocaleString('es-CO')} COP</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTxForDetail(null)}
              className="w-full h-11 rounded-xl font-hud text-xs font-bold text-white cursor-pointer cyber-btn-cyan"
            >
              CERRAR DETALLE
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

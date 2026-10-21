import React from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { playCyberFeedback } from '../utils/audioAlert.ts';

export const MiPerfilCliente: React.FC = () => {
  const { currentUser, setActiveView, showToast } = useParking();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full animate-fadeIn">
      
      {/* Header Banner */}
      <div 
        className="p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden" 
        style={{
          background: 'linear-gradient(135deg, rgba(4,24,18,0.92) 0%, rgba(2,10,14,0.96) 100%)',
          boxShadow: '0 0 30px rgba(0,255,157,0.15)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px]">verified_user</span>
          <span>CREDENCIAL PERSONALIZADA // PERFIL DE CONDUCTOR</span>
        </div>
        <h1 className="font-hud text-2xl md:text-3xl font-black text-white tracking-wider flex items-center gap-3">
          <span>MI PERFIL & FIDELIZACIÓN</span>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            USUARIO VERIFICADO
          </span>
        </h1>
        <p className="font-sans text-xs text-slate-400 mt-1">
          Gestión de tus vehículos registrados, saldo en billetera digital y puntos acumulados en ParkFlow 2099.
        </p>
      </div>

      {/* Profile Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Identity Card */}
        <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 text-3xl shadow-[0_0_15px_rgba(0,255,157,0.3)]">
              <span className="material-symbols-outlined text-[34px]">person</span>
            </div>
            <div>
              <div className="font-hud text-lg font-black text-white">{currentUser?.name || 'Alejandro Vélez'}</div>
              <div className="font-mono text-xs text-emerald-400 font-bold">CC: {currentUser?.id || '1020304050'}</div>
              <div className="font-mono text-[10px] text-slate-400">Tel: {currentUser?.phone || '310 987 6543'}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-black/50 font-mono text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Vehículo Habitual:</span>
              <strong className="text-yellow-300 font-black tracking-widest">{currentUser?.plate || 'KLO-892'}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Nivel de Acceso:</span>
              <span className="text-emerald-400 font-bold">Conductor Protegido</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Seguridad de Datos:</span>
              <span className="text-cyan-400 font-bold">Cifrado AES-256</span>
            </div>
          </div>
        </div>

        {/* Card 2: Wallet & Balance */}
        <div className="p-6 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between text-slate-400 font-mono text-xs mb-1">
              <span>BILLETERA VIRTUAL</span>
              <span className="material-symbols-outlined text-cyan-400 text-[20px]">account_balance_wallet</span>
            </div>
            <div className="font-hud text-3xl font-black text-cyan-300 glow-text-cyan">
              ${(currentUser?.balance || 50000).toLocaleString('es-CO')} COP
            </div>
            <p className="font-mono text-[10px] text-slate-400 mt-1">
              Saldo prepagado para salidas sin contacto por lectura automática de placa LPR.
            </p>
          </div>

          <button
            type="button"
            onClick={() => showToast('Redirigiendo a pasarela PSE / Nequi para recargar saldo...', 'info')}
            className="w-full py-2.5 rounded-xl font-hud text-xs font-black tracking-wider cyber-btn-cyan cursor-pointer"
          >
            + RECARGAR BILLETERA
          </button>
        </div>

        {/* Card 3: Loyalty Points */}
        <div className="p-6 rounded-2xl border border-violet-500/30 bg-violet-950/20 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between text-slate-400 font-mono text-xs mb-1">
              <span>CLUB PARKFLOW REWARDS</span>
              <span className="material-symbols-outlined text-violet-400 text-[20px]">workspace_premium</span>
            </div>
            <div className="font-hud text-3xl font-black text-violet-300">
              {currentUser?.points || 420} PTS
            </div>
            <div className="w-full bg-black/60 rounded-full h-2 mt-2 overflow-hidden border border-violet-500/30">
              <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: '84%' }} />
            </div>
            <p className="font-mono text-[10px] text-slate-400 mt-2">
              Te faltan 80 puntos para redimir 1 hora gratis en tu próximo parqueo.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-violet-500/20 font-mono text-[10px] text-slate-300 text-center">
            Tier: <strong className="text-violet-400 font-bold">CONDUCTOR PLATINUM 2099</strong>
          </div>
        </div>
      </div>

      {/* Active Parking Status Card */}
      <div className="p-6 rounded-2xl border border-cyan-500/25 flex flex-col gap-4" style={{ background: 'rgba(6,12,32,0.85)' }}>
        <div className="font-hud text-sm font-bold text-white flex items-center justify-between pb-2 border-b border-cyan-500/20">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            ESTADO ACTUAL DE TU VEHÍCULO ({currentUser?.plate || 'KLO-892'})
          </span>
          <span className="font-mono text-xs text-emerald-400 font-bold">EN PATIO DE PARQUEO</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-black/50 border border-cyan-500/20">
            <span className="text-slate-400 text-[10px] block">Bahía Ocupada</span>
            <strong className="font-hud text-xl text-cyan-300">A-02</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-black/50 border border-cyan-500/20">
            <span className="text-slate-400 text-[10px] block">Hora de Entrada</span>
            <strong className="font-hud text-base text-white">11:15 AM</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-black/50 border border-cyan-500/20">
            <span className="text-slate-400 text-[10px] block">Tiempo Acumulado</span>
            <strong className="font-hud text-base text-emerald-400">2h 17m</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-black/50 border border-cyan-500/20">
            <span className="text-slate-400 text-[10px] block">Total Liquidado</span>
            <strong className="font-hud text-base text-cyan-300">$13.500 COP</strong>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => { playCyberFeedback('click', 0.2); setActiveView('portal-cliente'); }}
            className="px-4 py-2 rounded-xl font-hud text-xs text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20 cursor-pointer"
          >
            VER EN MAPA 3D
          </button>
          <button
            type="button"
            onClick={() => { playCyberFeedback('checkout', 0.2); setActiveView('portal-cliente'); }}
            className="px-5 py-2 rounded-xl font-hud text-xs font-black cyber-btn-violet cursor-pointer"
          >
            PAGAR EN LÍNEA AHORA
          </button>
        </div>
      </div>

    </div>
  );
};

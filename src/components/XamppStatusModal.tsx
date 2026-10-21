import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.tsx';
import { playCyberFeedback } from '../utils/audioAlert.ts';

export const XamppStatusModal: React.FC = () => {
  const {
    isXamppModalOpen,
    setIsXamppModalOpen,
    isDbConnected,
    isDbSyncing,
    dbInfo,
    reconnectDb,
    initializeDatabase,
    showToast,
  } = useParking();

  const [isInitializing, setIsInitializing] = useState(false);

  if (!isXamppModalOpen) return null;

  const handleInitDb = async () => {
    playCyberFeedback('laser', 0.3);
    setIsInitializing(true);
    try {
      await initializeDatabase();
    } finally {
      setIsInitializing(false);
    }
  };

  const handleOpenPhpMyAdmin = () => {
    playCyberFeedback('click', 0.2);
    window.open('http://localhost/phpmyadmin/index.php?route=/database/structure&db=parkflow_db', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative max-w-xl w-full rounded-2xl overflow-hidden text-white"
        style={{
          background: 'linear-gradient(160deg, rgba(8,16,44,0.98) 0%, rgba(3,7,20,0.99) 100%)',
          border: '1px solid rgba(0,240,255,0.4)',
          boxShadow: '0 0 60px rgba(0,240,255,0.18), 0 32px 80px rgba(0,0,0,0.9)',
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* HUD Corner Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyan-400" />
        <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyan-400" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyan-400" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyan-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyan-500/20" style={{ background: 'rgba(0,240,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
              isDbConnected 
                ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                : 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(255,183,3,0.3)]'
            }`}>
              <span className="material-symbols-outlined text-[24px]">
                {isDbConnected ? 'dns' : 'cloud_off'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-hud text-[14px] font-black text-white tracking-wider">
                  TELEMETRÍA XAMPP & MOTOR MYSQL
                </h3>
                <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  PORT 3306
                </span>
              </div>
              <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                Backend en PHP 8.2 + Base de datos relacional MySQL (parkflow_db)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playCyberFeedback('click', 0.15);
              setIsXamppModalOpen(false);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            isDbConnected
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(0,255,157,0.12)]'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(255,183,3,0.15)]'
          }`}>
            <span className="material-symbols-outlined text-[24px] mt-0.5 shrink-0">
              {isDbConnected ? 'check_circle' : 'warning'}
            </span>
            <div className="flex-1 text-xs">
              <span className="font-hud text-[12px] font-bold block tracking-wider">
                {isDbConnected
                  ? 'ENLACE ESTABLECIDO CON XAMPP & MYSQL'
                  : 'NODO MYSQL FUERA DE LÍNEA'}
              </span>
              <p className="mt-1 font-mono text-[11px] opacity-90 leading-relaxed text-slate-300">
                {isDbConnected
                  ? `Las celdas, cobros, tarifas y auditoría se sincronizan en tiempo real con la base de datos 'parkflow_db' a través del API en PHP.`
                  : `El frontend está operando con memoria temporal. Para sincronizar con tu base de datos MySQL, inicia Apache y MySQL en el Panel de Control de XAMPP.`}
              </p>
            </div>
          </div>

          {/* Connection Details Bento */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-cyan-500/20" style={{ background: 'rgba(2,5,16,0.7)' }}>
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Servidor Web / API</span>
              <span className="font-mono font-bold text-cyan-300 text-[13px] mt-0.5 block truncate">
                Apache (PHP {dbInfo?.php_version || '8.2'})
              </span>
              <span className="font-mono text-[10px] text-slate-500 block mt-0.5">
                http://localhost/parkflow-api
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-cyan-500/20" style={{ background: 'rgba(2,5,16,0.7)' }}>
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Base de Datos</span>
              <span className="font-mono font-bold text-white text-[13px] mt-0.5 block">
                MySQL (parkflow_db)
              </span>
              <span className="font-mono text-[10px] text-slate-500 block mt-0.5">
                Host: {dbInfo?.host || 'localhost:3306'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-cyan-500/20" style={{ background: 'rgba(2,5,16,0.7)' }}>
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Tablas Relacionales</span>
              <span className="font-mono font-bold text-cyan-300 text-[13px] mt-0.5 block">
                {dbInfo?.tables ? `${dbInfo.tables.length} tablas activas` : '5 tablas creadas'}
              </span>
              <span className="font-mono text-[10px] text-slate-500 block mt-0.5 truncate">
                celdas, movimientos, tarifas, tx
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-cyan-500/20" style={{ background: 'rgba(2,5,16,0.7)' }}>
              <span className="font-mono text-[10px] text-slate-400 uppercase block">Telemetría de Enlace</span>
              <span className="font-mono font-bold text-emerald-400 text-[13px] mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {isDbSyncing ? 'Sincronizando...' : isDbConnected ? 'En tiempo real (1.2ms)' : 'En espera'}
              </span>
              <span className="font-mono text-[10px] text-slate-500 block mt-0.5">
                Heartbeat cada 15s activo
              </span>
            </div>
          </div>

          {/* Simulated Cyber Console Log */}
          <div className="p-3 rounded-xl border border-cyan-500/20 font-mono text-[11px] text-cyan-400/90 leading-relaxed" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] border-b border-white/5 pb-1 mb-1.5 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>TERMINAL STREAM // SQL_GATEWAY</span>
            </div>
            <div>[SQL_NET] Ping localhost:3306 ... {isDbConnected ? 'ACK 200 OK' : 'CONNECTION REFUSED'}</div>
            <div>[ENGINE] Protocol: MySQL InnoDB · Charset: utf8mb4_unicode_ci</div>
            <div>[STATUS] {isDbConnected ? '50 celdas cargadas en memoria y vinculadas a la API' : 'Memoria virtual autónoma activa (Fallback)'}</div>
          </div>

          {/* Instructions if disconnected */}
          {!isDbConnected && (
            <div className="p-4 rounded-xl border border-amber-500/30 text-xs font-mono space-y-2" style={{ background: 'rgba(255,183,3,0.06)' }}>
              <span className="font-hud text-amber-300 font-bold block flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">help</span>
                ¿CÓMO INICIAR LA CONEXIÓN CON XAMPP?
              </span>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                <li>Abre el <strong>XAMPP Control Panel</strong> en tu computadora.</li>
                <li>Haz clic en el botón <strong>Start</strong> al lado de <strong>Apache</strong>.</li>
                <li>Haz clic en el botón <strong>Start</strong> al lado de <strong>MySQL</strong>.</li>
                <li>Vuelve aquí y haz clic en <strong>"Reconectar"</strong> abajo.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-5 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3" style={{ background: 'rgba(2,5,16,0.85)' }}>
          <button
            type="button"
            onClick={handleOpenPhpMyAdmin}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>Abrir en phpMyAdmin</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isInitializing || isDbSyncing}
              onClick={handleInitDb}
              title="Crea las tablas o restablece los datos iniciales en MySQL"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-mono text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${isInitializing ? 'animate-spin' : ''}`}>
                cached
              </span>
              <span>{isInitializing ? 'Creando tablas...' : 'Crear / Reset Tablas'}</span>
            </button>

            <button
              type="button"
              disabled={isDbSyncing}
              onClick={() => {
                playCyberFeedback('click', 0.2);
                reconnectDb();
                showToast('Verificando enlace con MySQL...', 'info');
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-hud text-xs font-bold cursor-pointer cyber-btn-cyan disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${isDbSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isDbSyncing ? 'Conectando...' : 'RECONECTAR'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

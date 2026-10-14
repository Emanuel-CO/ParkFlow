import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext.tsx';

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
    setIsInitializing(true);
    try {
      await initializeDatabase();
    } finally {
      setIsInitializing(false);
    }
  };

  const handleOpenPhpMyAdmin = () => {
    window.open('http://localhost/phpmyadmin/index.php?route=/database/structure&db=parkflow_db', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface-card border border-surface-border rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden text-on-surface"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-border bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDbConnected ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
            }`}>
              <span className="material-symbols-outlined text-[24px]">
                {isDbConnected ? 'dns' : 'cloud_off'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary leading-tight">
                Conexión con XAMPP & MySQL
              </h3>
              <p className="text-xs text-text-secondary">
                Backend en PHP + Base de datos relacional MySQL
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsXamppModalOpen(false)}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container-high hover:text-text-primary transition-colors"
            title="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            isDbConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
          }`}>
            <span className="material-symbols-outlined text-[22px] mt-0.5">
              {isDbConnected ? 'check_circle' : 'warning'}
            </span>
            <div className="flex-1 text-xs">
              <span className="font-bold text-sm block">
                {isDbConnected
                  ? '¡Conectado exitosamente con XAMPP y MySQL!'
                  : 'Desconectado de MySQL / XAMPP'}
              </span>
              <p className="mt-1 opacity-90 leading-relaxed">
                {isDbConnected
                  ? `Las celdas, cobros, tarifas y auditoría se sincronizan en tiempo real con la base de datos 'parkflow_db' a través del API en PHP.`
                  : `El frontend está operando con memoria temporal. Para sincronizar con tu base de datos MySQL, inicia Apache y MySQL en el Panel de Control de XAMPP.`}
              </p>
            </div>
          </div>

          {/* Connection Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-surface-container-low border border-surface-border">
              <span className="text-text-secondary block font-medium">Servidor Web / API</span>
              <span className="font-bold text-text-primary font-mono text-[13px] mt-0.5 block truncate">
                Apache (PHP {dbInfo?.php_version || '8.2'})
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5">
                http://localhost/parkflow-api
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low border border-surface-border">
              <span className="text-text-secondary block font-medium">Base de Datos</span>
              <span className="font-bold text-text-primary font-mono text-[13px] mt-0.5 block">
                MySQL (parkflow_db)
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5">
                Host: {dbInfo?.host || 'localhost:3306'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low border border-surface-border">
              <span className="text-text-secondary block font-medium">Tablas en MySQL</span>
              <span className="font-bold text-text-primary font-mono text-[13px] mt-0.5 block">
                {dbInfo?.tables ? `${dbInfo.tables.length} tablas activas` : '5 tablas'}
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5 truncate">
                cells, movements, tariffs, tx...
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low border border-surface-border">
              <span className="text-text-secondary block font-medium">Estado de Sincronización</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[13px] mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {isDbSyncing ? 'Sincronizando...' : isDbConnected ? 'En tiempo real' : 'En espera'}
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5">
                Auto-refresco cada 15s
              </span>
            </div>
          </div>

          {/* Instructions if disconnected */}
          {!isDbConnected && (
            <div className="p-4 rounded-xl bg-surface-canvas border border-surface-border/70 text-xs space-y-2">
              <span className="font-bold text-text-primary block flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">help</span>
                ¿Cómo iniciar la conexión con XAMPP?
              </span>
              <ol className="list-decimal list-inside space-y-1 text-text-secondary pl-1">
                <li>Abre el <strong>XAMPP Control Panel</strong> en tu computadora.</li>
                <li>Haz clic en el botón <strong>Start</strong> al lado de <strong>Apache</strong>.</li>
                <li>Haz clic en el botón <strong>Start</strong> al lado de <strong>MySQL</strong>.</li>
                <li>Vuelve aquí y haz clic en <strong>"Reconectar con XAMPP"</strong> abajo.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-5 border-t border-surface-border bg-surface-container-low flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleOpenPhpMyAdmin}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-container hover:bg-surface-container-high border border-surface-border text-text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-500">open_in_new</span>
            <span>Abrir en phpMyAdmin</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isInitializing || isDbSyncing}
              onClick={handleInitDb}
              title="Crea las tablas o restablece los datos iniciales en MySQL"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-card hover:bg-surface-container border border-surface-border text-text-primary transition-all disabled:opacity-50"
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
                reconnectDb();
                showToast('Verificando conexión con XAMPP...', 'info');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-on-primary transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${isDbSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isDbSyncing ? 'Conectando...' : 'Reconectar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

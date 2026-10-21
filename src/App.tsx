import React, { useState, useEffect } from 'react';
import { ParkingProvider, useParking } from './context/ParkingContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TopHeader } from './components/TopHeader.tsx';
import { PanelOperativo } from './components/PanelOperativo.tsx';
import { RegistroEntrada } from './components/RegistroEntrada.tsx';
import { SalidaCobro } from './components/SalidaCobro.tsx';
import { TarifasCeldas } from './components/TarifasCeldas.tsx';
import { ReportesAuditoria } from './components/ReportesAuditoria.tsx';
import { TicketDetailModal } from './components/TicketDetailModal.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { XamppStatusModal } from './components/XamppStatusModal.tsx';
import { PortalCliente } from './components/PortalCliente.tsx';
import { MiPerfilCliente } from './components/MiPerfilCliente.tsx';
import { playCyberFeedback } from './utils/audioAlert.ts';
import { UserRole } from './types/parking.ts';

const AppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isDbConnected,
    occupancyPercent,
    totalOccupied,
    totalCapacity,
    userRole,
    currentUser,
    showRoleModal,
    setShowRoleModal,
    selectedRoleForAuth,
    setSelectedRoleForAuth,
    authenticateUser,
  } = useParking();

  // Authentication form state for step 2
  const [clientAuthDoc, setClientAuthDoc] = useState('1020304050');
  const [clientAuthName, setClientAuthName] = useState('Alejandro Vélez');
  const [clientAuthPlate, setClientAuthPlate] = useState('KLO-892');
  const [clientAuthPhone, setClientAuthPhone] = useState('310 987 6543');

  const [opAuthBadge, setOpAuthBadge] = useState('OP-418');
  const [opAuthName, setOpAuthName] = useState('Carlos Rojas');
  const [opAuthPin, setOpAuthPin] = useState('2099');
  const [opAuthShift, setOpAuthShift] = useState('Turno Mañana [06:00 - 14:00]');

  const [adminAuthUser, setAdminAuthUser] = useState('admin.master');
  const [adminAuthKey, setAdminAuthKey] = useState('quantum-key-2099');
  const [adminAuthOtp, setAdminAuthOtp] = useState('892-411');

  // Play subtle futuristic audio cue when view transitions
  useEffect(() => {
    playCyberFeedback('click', 0.12);
  }, [activeView]);

  const fillDemoCredentials = (role: UserRole) => {
    playCyberFeedback('laser', 0.18);
    if (role === 'cliente') {
      setClientAuthDoc('1020304050');
      setClientAuthName('Alejandro Vélez');
      setClientAuthPlate('KLO-892');
      setClientAuthPhone('310 987 6543');
    } else if (role === 'operador') {
      setOpAuthBadge('OP-418');
      setOpAuthName('Carlos Rojas');
      setOpAuthPin('2099');
      setOpAuthShift('Turno Mañana [06:00 - 14:00]');
    } else if (role === 'administrador') {
      setAdminAuthUser('admin.master');
      setAdminAuthKey('quantum-key-2099');
      setAdminAuthOtp('892-411');
    }
  };

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    playCyberFeedback('checkout', 0.25);

    if (selectedRoleForAuth === 'cliente') {
      authenticateUser({
        role: 'cliente',
        id: clientAuthDoc || '1020304050',
        name: clientAuthName || 'Conductor Registrado',
        plate: (clientAuthPlate || 'KLO-892').toUpperCase(),
        phone: clientAuthPhone || '310 987 6543',
        balance: 50000,
        points: 420,
        loginTime: new Date().toLocaleTimeString(),
      });
    } else if (selectedRoleForAuth === 'operador') {
      authenticateUser({
        role: 'operador',
        id: opAuthBadge || 'OP-418',
        badge: opAuthBadge || 'OP-418',
        name: opAuthName || 'Carlos Rojas',
        shift: opAuthShift,
        loginTime: new Date().toLocaleTimeString(),
      });
    } else if (selectedRoleForAuth === 'administrador') {
      authenticateUser({
        role: 'administrador',
        id: 'ROOT-01',
        name: 'Ing. Valderrama',
        badge: 'SUPERUSER',
        loginTime: new Date().toLocaleTimeString(),
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-on-surface relative overflow-x-hidden" style={{ background: '#020510' }}>
      
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none opacity-40 blur-[120px] -z-10" style={{
        background: 'radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)',
      }} />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30 blur-[140px] -z-10" style={{
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
      }} />

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Fixed Top Header */}
      <TopHeader />

      {/* Main App Content Body (offset by sidebar w-64 and header h-16) */}
      <main className="ml-64 pt-16 flex-1 flex flex-col min-h-screen relative z-10 pb-12">
        {/* Page transition wrapper */}
        <div key={activeView} className="animate-slide-right flex-1 flex flex-col">
          
          {/* CLIENT RESTRICTION 403 SHIELD */}
          {userRole === 'cliente' && ['panel-operativo', 'registro-de-entrada', 'salida-y-cobro', 'tarifas-y-celdas', 'reportes-y-auditoria'].includes(activeView) && (
            <div className="flex flex-col items-center justify-center p-8 max-w-xl mx-auto my-auto text-center gap-4 rounded-3xl border border-rose-500/40 bg-rose-950/20 backdrop-blur-xl animate-fadeIn mt-12">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(255,42,109,0.5)]">
                <span className="material-symbols-outlined text-[36px]">security</span>
              </div>
              <div className="font-hud text-xl font-black text-rose-300">ACCESO RESTRINGIDO // SEGURIDAD 403</div>
              <p className="font-mono text-xs text-slate-300 leading-relaxed">
                Tu perfil actual es de <strong>CLIENTE / CONDUCTOR ({currentUser?.name})</strong>. Por políticas de seguridad y aislamiento de red, no tienes acceso a la consola interna de taquilla, cobros, tarifas ni auditoría fiscal.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setActiveView('portal-cliente')}
                  className="px-6 py-2.5 rounded-xl font-hud text-xs font-black cyber-btn-emerald cursor-pointer"
                >
                  IR A ELEGIR MI PUESTO
                </button>
                <button
                  onClick={() => setActiveView('mi-perfil-cliente')}
                  className="px-6 py-2.5 rounded-xl font-hud text-xs font-black text-emerald-300 border border-emerald-400/40 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer"
                >
                  MI PERFIL Y BILLETERA
                </button>
              </div>
            </div>
          )}

          {/* OPERATOR RESTRICTION ON ADMIN MODULES */}
          {userRole === 'operador' && ['tarifas-y-celdas', 'reportes-y-auditoria'].includes(activeView) && (
            <div className="flex flex-col items-center justify-center p-8 max-w-xl mx-auto my-auto text-center gap-4 rounded-3xl border border-amber-500/40 bg-amber-950/20 backdrop-blur-xl animate-fadeIn mt-12">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(255,183,3,0.5)]">
                <span className="material-symbols-outlined text-[36px]">lock</span>
              </div>
              <div className="font-hud text-xl font-black text-amber-300">PRIVILEGIO INSUFICIENTE // NIVEL 2</div>
              <p className="font-mono text-xs text-slate-300 leading-relaxed">
                El módulo seleccionado requiere credencial de <strong>ADMINISTRADOR GLOBAL (NIVEL 4)</strong>. Como operador de turno tienes acceso a Panel Operativo, Entrada y Salida/Cobro.
              </p>
              <button
                onClick={() => setActiveView('panel-operativo')}
                className="px-6 py-2.5 rounded-xl font-hud text-xs font-black cyber-btn-violet cursor-pointer"
              >
                REGRESAR A PANEL OPERATIVO
              </button>
            </div>
          )}

          {/* PERMITTED VIEWS */}
          {activeView === 'portal-cliente'       && <PortalCliente />}
          {activeView === 'mi-perfil-cliente'    && <MiPerfilCliente />}
          {activeView === 'panel-operativo'      && userRole !== 'cliente' && <PanelOperativo />}
          {activeView === 'registro-de-entrada'  && userRole !== 'cliente' && <RegistroEntrada />}
          {activeView === 'salida-y-cobro'       && userRole !== 'cliente' && <SalidaCobro />}
          {activeView === 'tarifas-y-celdas'     && userRole === 'administrador' && <TarifasCeldas />}
          {activeView === 'reportes-y-auditoria' && userRole === 'administrador' && <ReportesAuditoria />}
        </div>

        {/* Futuristic telemetry status footer strip */}
        <footer className="mt-auto px-6 py-3 border-t border-cyan-500/15 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[10px] text-slate-500" style={{
          background: 'linear-gradient(90deg, rgba(2,5,16,0.95) 0%, rgba(4,8,24,0.98) 100%)',
        }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              PARKFLOW OS // 2099
            </span>
            <span className="text-slate-700">|</span>
            <span>KERNEL: <strong className="text-slate-400">v3.4.1-STABLE</strong></span>
            <span className="text-slate-700">|</span>
            <span>AFORO: <strong className={occupancyPercent >= 90 ? 'text-rose-400' : 'text-emerald-400'}>{occupancyPercent}% ({totalOccupied}/{totalCapacity})</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-600">GPS: 06°15&apos;N 75°34&apos;W</span>
            <span className="text-slate-700">|</span>
            <span className={isDbConnected ? 'text-cyan-400 font-bold' : 'text-amber-400 font-bold'}>
              {isDbConnected ? 'SQL: CONNECTED (PORT 3306)' : 'SQL: VIRTUAL MEMORY'}
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">CIPHER: AES-256</span>
          </div>
        </footer>
      </main>

      {/* ── MODAL DE SELECCIÓN E IDENTIFICACIÓN DE ROL (2-STEP GATEWAY) ── */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div 
            className="relative max-w-4xl w-full rounded-3xl p-6 md:p-8 flex flex-col gap-6 overflow-hidden border border-cyan-500/40"
            style={{
              background: 'linear-gradient(160deg, rgba(8,16,44,0.98) 0%, rgba(2,6,20,0.99) 100%)',
              boxShadow: '0 0 80px rgba(0,240,255,0.2), 0 32px 80px rgba(0,0,0,0.95)',
            }}
          >
            {/* Top cyan scan beam */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            {/* STEP 1: CHOOSE ROLE */}
            {selectedRoleForAuth === null ? (
              <>
                {/* Header */}
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>PORTAL DE IDENTIFICACIÓN & ACCESO SEGURO // PARKFLOW 2099</span>
                  </div>
                  <h2 className="font-hud text-2xl md:text-3xl font-black text-white tracking-wider">
                    ¿CON QUÉ ROL DESEAS INGRESAR?
                  </h2>
                  <p className="font-sans text-xs md:text-sm text-slate-400 max-w-lg">
                    Elige tu perfil de acceso. A continuación se te solicitará tu identificación para cargar tu perfil personalizado y aplicar las políticas de seguridad:
                  </p>
                </div>

                {/* 3 Role Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  
                  {/* CARD 1: CLIENTE */}
                  <div
                    onClick={() => {
                      playCyberFeedback('click', 0.2);
                      setSelectedRoleForAuth('cliente');
                    }}
                    className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between group hover:scale-102 hover:shadow-[0_0_25px_rgba(0,255,157,0.3)] relative overflow-hidden"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                          <span className="material-symbols-outlined text-[28px]">directions_car</span>
                        </div>
                        <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          PÚBLICO SEGURO
                        </span>
                      </div>

                      <div>
                        <h3 className="font-hud text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                          CLIENTE / CONDUCTOR
                        </h3>
                        <p className="font-mono text-[11px] text-slate-400 mt-1">
                          Acceso con tu Cédula y Placa. Autogestión aislada y protegida.
                        </p>
                      </div>

                      <div className="border-t border-emerald-500/20 pt-3 flex flex-col gap-1.5 font-mono text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-emerald-400 text-[15px]">check_circle</span>
                          <span>Perfil con tu Cédula y Placa</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-emerald-400 text-[15px]">check_circle</span>
                          <span>Elegir celda libre en mapa 3D</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-emerald-400 text-[15px]">check_circle</span>
                          <span>Billetera prepago y auto-ticket QR</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-400 text-[10px]">
                          <span className="material-symbols-outlined text-[13px]">lock</span>
                          <span>Sin acceso a datos internos ni caja</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-5 w-full py-2.5 rounded-xl font-hud text-xs font-black tracking-wider cyber-btn-emerald cursor-pointer"
                    >
                      IDENTIFICARME COMO CLIENTE
                    </button>
                  </div>

                  {/* CARD 2: OPERADOR */}
                  <div
                    onClick={() => {
                      playCyberFeedback('click', 0.2);
                      setSelectedRoleForAuth('operador');
                    }}
                    className="p-5 rounded-2xl border border-violet-500/40 bg-violet-950/20 hover:bg-violet-950/40 hover:border-violet-400 transition-all cursor-pointer flex flex-col justify-between group hover:scale-102 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] relative overflow-hidden"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-400 flex items-center justify-center text-violet-300">
                          <span className="material-symbols-outlined text-[28px]">badge</span>
                        </div>
                        <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                          NIVEL 2 // TAQUILLA
                        </span>
                      </div>

                      <div>
                        <h3 className="font-hud text-base font-black text-white group-hover:text-violet-300 transition-colors">
                          OPERADOR DE TURNO
                        </h3>
                        <p className="font-mono text-[11px] text-slate-400 mt-1">
                          Acceso con Carnet y PIN. Taquilla, barreras y cobro.
                        </p>
                      </div>

                      <div className="border-t border-violet-500/20 pt-3 flex flex-col gap-1.5 font-mono text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-violet-400 text-[15px]">check_circle</span>
                          <span>Acreditación con Carnet & PIN</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-violet-400 text-[15px]">check_circle</span>
                          <span>Escáner óptico LPR & barrera</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-violet-400 text-[15px]">check_circle</span>
                          <span>Liquidación en caja y vueltos</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-5 w-full py-2.5 rounded-xl font-hud text-xs font-black tracking-wider cyber-btn-violet cursor-pointer"
                    >
                      IDENTIFICARME COMO OPERADOR
                    </button>
                  </div>

                  {/* CARD 3: ADMINISTRADOR */}
                  <div
                    onClick={() => {
                      playCyberFeedback('click', 0.2);
                      setSelectedRoleForAuth('administrador');
                    }}
                    className="p-5 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-950/40 hover:border-cyan-400 transition-all cursor-pointer flex flex-col justify-between group hover:scale-102 hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] relative overflow-hidden"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                          <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
                        </div>
                        <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          NIVEL 4 // FULL ACCESS
                        </span>
                      </div>

                      <div>
                        <h3 className="font-hud text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                          ADMINISTRADOR GLOBAL
                        </h3>
                        <p className="font-mono text-[11px] text-slate-400 mt-1">
                          Superuser con clave cuántica. Acceso total a todo el sistema.
                        </p>
                      </div>

                      <div className="border-t border-cyan-500/20 pt-3 flex flex-col gap-1.5 font-mono text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-cyan-400 text-[15px]">check_circle</span>
                          <span>Acceso total a todos los módulos</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-cyan-400 text-[15px]">check_circle</span>
                          <span>Ajuste de tarifas y umbrales (90%)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-cyan-400 text-[15px]">check_circle</span>
                          <span>Auditoría contable SHA-256 & Excel</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-5 w-full py-2.5 rounded-xl font-hud text-xs font-black tracking-wider cyber-btn-cyan cursor-pointer"
                    >
                      ACCESO ADMINISTRADOR
                    </button>
                  </div>

                </div>

                {userRole && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRoleModal(false)}
                      className="font-mono text-xs text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Continuar con mi sesión actual ({currentUser?.name || userRole.toUpperCase()})
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* STEP 2: AUTHENTICATION FORM FOR SELECTED ROLE */
              <form onSubmit={handleAuthenticate} className="flex flex-col gap-5 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                  <button
                    type="button"
                    onClick={() => setSelectedRoleForAuth(null)}
                    className="flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Volver a selección de roles</span>
                  </button>

                  <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold border ${
                    selectedRoleForAuth === 'cliente' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    selectedRoleForAuth === 'operador' ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' :
                    'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {selectedRoleForAuth === 'cliente' ? 'PORTAL DE CONDUCTOR // IDENTIFICACIÓN' :
                     selectedRoleForAuth === 'operador' ? 'TAQUILLA // ACREDITACIÓN DE TURNO' :
                     'ROOT CONSOLE // CLAVE DE SEGURIDAD'}
                  </span>
                </div>

                {/* CLIENT AUTH FORM */}
                {selectedRoleForAuth === 'cliente' && (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-400 text-[26px]">shield_person</span>
                      <div>
                        <div className="font-hud text-sm font-bold text-white">IDENTIFICACIÓN DEL CLIENTE / CONDUCTOR</div>
                        <p className="font-mono text-xs text-slate-400 mt-0.5">
                          Ingresa tu número de documento y nombre para acceder a tu perfil personalizado. Tus datos protegen tu auto-ticket digital y no tendrás acceso a la información confidencial del negocio.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-xs text-slate-400 mb-1 font-bold">Cédula / Documento de Identidad:</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. 1020304050"
                          value={clientAuthDoc}
                          onChange={e => setClientAuthDoc(e.target.value)}
                          className="w-full h-12 rounded-xl px-4 font-mono text-base font-bold text-cyan-300 bg-black/60 border border-emerald-500/40 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-slate-400 mb-1 font-bold">Nombre Completo del Conductor:</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Alejandro Vélez"
                          value={clientAuthName}
                          onChange={e => setClientAuthName(e.target.value)}
                          className="w-full h-12 rounded-xl px-4 font-sans text-base font-bold text-white bg-black/60 border border-emerald-500/40 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-slate-400 mb-1 font-bold">Placa Habitual del Vehículo:</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. KLO-892"
                          value={clientAuthPlate}
                          onChange={e => setClientAuthPlate(e.target.value.toUpperCase())}
                          className="w-full h-12 rounded-xl px-4 font-mono text-xl font-black text-yellow-300 tracking-widest bg-black/60 border border-emerald-500/40 focus:outline-none focus:border-emerald-400 text-center"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-slate-400 mb-1 font-bold">Teléfono Móvil / WhatsApp:</label>
                        <input
                          type="text"
                          placeholder="Ej. 310 987 6543"
                          value={clientAuthPhone}
                          onChange={e => setClientAuthPhone(e.target.value)}
                          className="w-full h-12 rounded-xl px-4 font-mono text-base text-slate-300 bg-black/60 border border-emerald-500/40 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => fillDemoCredentials('cliente')}
                        className="px-3.5 py-2 rounded-xl font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        <span>Cargar Perfil Demo: Alejandro Vélez (KLO-892)</span>
                      </button>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3 rounded-xl font-hud text-xs font-black tracking-wider cyber-btn-emerald cursor-pointer shadow-[0_0_20px_rgba(0,255,157,0.3)]"
                      >
                        INGRESAR A MI PORTAL DE CONDUCTOR
                      </button>
                    </div>
                  </div>
                )}

                {/* OPERATOR AUTH FORM */}
                {selectedRoleForAuth === 'operador' && (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-950/20 flex items-start gap-3">
                      <span className="material-symbols-outlined text-violet-400 text-[26px]">badge</span>
                      <div>
                        <div className="font-hud text-sm font-bold text-white">AUTENTICACIÓN DE OPERADOR DE TAQUILLA</div>
                        <p className="font-mono text-xs text-slate-400 mt-0.5">
                          Ingresa tu carnet y credencial autorizada para iniciar el turno de recepción, control de barreras y liquidación de salidas.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-xs text-slate-400 mb-1 font-bold">Código de Carnet / ID Operador:</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. OP-418"
                          value={opAuthBadge}
                          onChange={e => setOpAuthBadge(e.target.value.toUpperCase())}
                          className="w-full h-12 rounded-xl px-4 font-mono text-base font-bold text-cyan-300 bg-black/60 border border-violet-500/40 focus:outline-none focus:border-violet-400"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-slate-400 mb-1 font-bold">Nombre del Operador:</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Carlos Rojas"
                          value={opAuthName}
                          onChange={e => setOpAuthName(e.target.value)}
                          className="w-full h-12 rounded-xl px-4 font-sans text-base font-bold text-white bg-black/60 border border-violet-500/40 focus:outline-none focus:border-violet-400"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-slate-400 mb-1 font-bold">PIN de Seguridad de Taquilla:</label>
                        <input
                          type="password"
                          required
                          placeholder="••••"
                          value={opAuthPin}
                          onChange={e => setOpAuthPin(e.target.value)}
                          className="w-full h-12 rounded-xl px-4 font-mono text-xl text-violet-300 bg-black/60 border border-violet-500/40 focus:outline-none focus:border-violet-400 text-center tracking-widest"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-slate-400 mb-1 font-bold">Turno de Operación Asignado:</label>
                        <select
                          value={opAuthShift}
                          onChange={e => setOpAuthShift(e.target.value)}
                          className="w-full h-12 rounded-xl px-4 font-mono text-xs font-bold text-white bg-black/60 border border-violet-500/40 focus:outline-none focus:border-violet-400"
                        >
                          <option value="Turno Mañana [06:00 - 14:00]">Turno Mañana [06:00 - 14:00]</option>
                          <option value="Turno Tarde [14:00 - 22:00]">Turno Tarde [14:00 - 22:00]</option>
                          <option value="Turno Noche [22:00 - 06:00]">Turno Noche [22:00 - 06:00]</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => fillDemoCredentials('operador')}
                        className="px-3.5 py-2 rounded-xl font-mono text-xs text-violet-400 bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500/20 cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        <span>Cargar Credencial Demo: Carlos Rojas (OP-418)</span>
                      </button>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3 rounded-xl font-hud text-xs font-black tracking-wider cyber-btn-violet cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                      >
                        INICIAR TURNO DE OPERADOR
                      </button>
                    </div>
                  </div>
                )}

                {/* ADMIN AUTH FORM */}
                {selectedRoleForAuth === 'administrador' && (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex items-start gap-3">
                      <span className="material-symbols-outlined text-cyan-400 text-[26px]">admin_panel_settings</span>
                      <div>
                        <div className="font-hud text-sm font-bold text-white">AUTORIZACIÓN DE SUPERUSUARIO MASTER (NIVEL 4)</div>
                        <p className="font-mono text-xs text-slate-400 mt-0.5">
                          Ingreso con credenciales maestras. Otorga control irrestricto sobre políticas de tarifas, sensores auditivos de aforo, auditoría contable y base de datos.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-mono text-xs text-slate-400 mb-1 font-bold">Usuario Administrador:</label>
                        <input
                          type="text"
                          required
                          placeholder="admin.master"
                          value={adminAuthUser}
                          onChange={e => setAdminAuthUser(e.target.value)}
                          className="w-full h-12 rounded-xl px-4 font-mono text-base font-bold text-cyan-300 bg-black/60 border border-cyan-500/40 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-slate-400 mb-1 font-bold">Llave Cuántica / Clave:</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={adminAuthKey}
                          onChange={e => setAdminAuthKey(e.target.value)}
                          className="w-full h-12 rounded-xl px-4 font-mono text-xl text-cyan-300 bg-black/60 border border-cyan-500/40 focus:outline-none focus:border-cyan-400 tracking-widest text-center"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs text-slate-400 mb-1 font-bold">Token 2FA OTP:</label>
                        <input
                          type="text"
                          placeholder="892-411"
                          value={adminAuthOtp}
                          onChange={e => setAdminAuthOtp(e.target.value)}
                          className="w-full h-12 rounded-xl px-4 font-mono text-base font-bold text-emerald-400 bg-black/60 border border-cyan-500/40 focus:outline-none focus:border-cyan-400 text-center tracking-widest"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => fillDemoCredentials('administrador')}
                        className="px-3.5 py-2 rounded-xl font-mono text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        <span>Cargar Acceso Superuser: Ing. Valderrama</span>
                      </button>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3 rounded-xl font-hud text-xs font-black tracking-wider cyber-btn-cyan cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                      >
                        AUTORIZAR ACCESO MAESTRO
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modals & Global Overlays */}
      <TicketDetailModal />
      <XamppStatusModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ParkingProvider>
      <AppContent />
    </ParkingProvider>
  );
}

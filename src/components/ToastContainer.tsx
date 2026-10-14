import React from 'react';
import { useParking } from '../context/ParkingContext.tsx';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useParking();

  if (toasts.length === 0) return null;

  const typeConfig = {
    success: {
      icon: 'check_circle',
      border: 'rgba(0,255,157,0.4)',
      glow: 'rgba(0,255,157,0.15)',
      iconColor: '#00ff9d',
      barColor: '#00ff9d',
    },
    error: {
      icon: 'error',
      border: 'rgba(255,42,109,0.4)',
      glow: 'rgba(255,42,109,0.15)',
      iconColor: '#ff2a6d',
      barColor: '#ff2a6d',
    },
    warning: {
      icon: 'warning',
      border: 'rgba(255,183,3,0.4)',
      glow: 'rgba(255,183,3,0.15)',
      iconColor: '#ffb703',
      barColor: '#ffb703',
    },
    info: {
      icon: 'info',
      border: 'rgba(0,240,255,0.4)',
      glow: 'rgba(0,240,255,0.15)',
      iconColor: '#00f0ff',
      barColor: '#00f0ff',
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const cfg = typeConfig[toast.type || 'info'] || typeConfig.info;
        return (
          <div
            key={toast.id}
            className="pointer-events-auto relative overflow-hidden rounded-xl flex items-start gap-3 px-4 py-3.5"
            style={{
              background: 'linear-gradient(135deg, rgba(4,8,24,0.97) 0%, rgba(2,5,16,0.99) 100%)',
              border: `1px solid ${cfg.border}`,
              boxShadow: `0 0 25px ${cfg.glow}, 0 8px 32px rgba(0,0,0,0.6)`,
              backdropFilter: 'blur(20px)',
              animation: 'slide-in-right 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
            }}
          >
            {/* Top edge glow */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{
              background: `linear-gradient(90deg, transparent, ${cfg.barColor}, transparent)`,
            }} />

            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{
              background: cfg.barColor,
              boxShadow: `0 0 8px ${cfg.barColor}`,
            }} />

            {/* Icon */}
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5" style={{ color: cfg.iconColor, filter: `drop-shadow(0 0 8px ${cfg.iconColor})` }}>
              {cfg.icon}
            </span>

            {/* Message */}
            <span className="text-[12px] font-mono text-slate-200 leading-relaxed flex-1">
              {toast.message}
            </span>

            {/* Close */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-600 hover:text-slate-300 transition-colors shrink-0 mt-0.5"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

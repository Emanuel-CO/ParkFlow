import React from 'react';
import { useParking } from '../context/ParkingContext.tsx';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useParking();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = 'check_circle';
        let bgClass = 'bg-tertiary text-on-tertiary';
        let iconColor = 'text-status-available';

        if (toast.type === 'error') {
          icon = 'error';
          iconColor = 'text-error';
        } else if (toast.type === 'warning') {
          icon = 'warning';
          iconColor = 'text-status-warning';
        } else if (toast.type === 'info') {
          icon = 'info';
          iconColor = 'text-secondary';
        }

        return (
          <div
            key={toast.id}
            className={`${bgClass} px-4 py-3 rounded-xl shadow-2xl border border-white/10 flex items-center justify-between gap-3 pointer-events-auto transition-all animate-in slide-in-from-bottom duration-200`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`material-symbols-outlined text-[20px] ${iconColor}`}>
                {icon}
              </span>
              <span className="text-[13px] font-medium leading-snug">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white p-1 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

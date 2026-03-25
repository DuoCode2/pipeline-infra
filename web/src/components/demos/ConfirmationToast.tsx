'use client';
import { useState, useEffect } from 'react';

export function ConfirmationToast({ show, onClose }: { show: boolean; onClose: () => void }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-xl bg-[var(--color-primary-dark)] px-6 py-4 text-[var(--color-on-primary-dark)] shadow-2xl animate-in slide-in-from-bottom-4">
        <span className="text-xl">{'\u2713'}</span>
        <div>
          <p className="font-semibold">Demo Mode</p>
          <p className="text-sm opacity-80">This feature will be available in the production version</p>
        </div>
        <button onClick={onClose} className="ml-4 rounded-full p-1 hover:bg-white/10" aria-label="Close">{'\u2715'}</button>
      </div>
    </div>
  );
}

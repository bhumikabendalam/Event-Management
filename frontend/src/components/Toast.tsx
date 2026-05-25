import React from 'react';
import { Toaster as HotToaster, toast } from 'react-hot-toast';

export const Toaster: React.FC = () => {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        // Use CSS variables for adaptive theme support
        style: {
          background: 'var(--bg-secondary)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--border-glass)',
          color: 'var(--text-primary)',
          fontFamily: "var(--font-body)",
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#14b8a6',
            secondary: 'var(--bg-secondary)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: 'var(--bg-secondary)',
          },
        },
      }}
    />
  );
};

export { toast };

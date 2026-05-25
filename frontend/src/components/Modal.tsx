import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'md':
      default:
        return 'max-w-lg';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop — themed via CSS var */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ backgroundColor: 'rgba(5, 8, 22, 0.65)' }}
            className="fixed inset-0 backdrop-blur-sm"
          />

          {/* Modal Container — uses CSS variables for theming */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35 }}
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-glass)',
              boxShadow: 'var(--shadow-lg)',
            }}
            className={`w-full ${getSizeClasses()} glass-panel border rounded-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col`}
          >
            {/* Header */}
            <div
              style={{ borderBottomColor: 'var(--border-glass)', backgroundColor: 'var(--bg-tertiary)' }}
              className="flex items-center justify-between px-6 py-5 border-b"
            >
              <h3 className="text-lg font-bold font-heading text-text-primary">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-white/5 transition-all duration-300 outline-none cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-grow">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

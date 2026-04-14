import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        className={cn(
          'relative bg-[var(--bg)] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-xl font-semibold text-[var(--text-h)]">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[var(--border)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text)]" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

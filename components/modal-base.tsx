"use client";

import { useEffect, useRef, useCallback, ReactNode } from "react";
import { X } from "lucide-react";

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  footer?: ReactNode;
  className?: string;
}

export function ModalBase({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
  footer,
  className = "",
}: ModalBaseProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] lg:max-w-6xl",
  };

  // Enhanced body scroll lock with scroll position preservation
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;

      // Lock body scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Focus management
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 150);

      return () => {
        clearTimeout(timer);

        // Restore body scroll
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        handleClose();
      }
    },
    [closeOnBackdrop, handleClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 lg:p-8
        ${className}
      `}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Enhanced Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Modal Container - Fixed and Scrollable */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeClasses[size]} 
          max-h-[90vh] sm:max-h-[85vh] lg:max-h-[90vh]
          bg-card border border-border rounded-lg shadow-2xl
          flex flex-col overflow-hidden
          animate-in fade-in zoom-in duration-200
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        {(title || showCloseButton) && (
          <div className="flex-none flex items-center justify-between p-4 sm:p-6 border-b border-border bg-card/95 backdrop-blur-sm">
            {title && (
              <h2
                id="modal-title"
                className="text-lg sm:text-xl font-semibold text-card-foreground leading-tight pr-4"
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                ref={closeButtonRef}
                onClick={handleClose}
                className="flex-shrink-0 p-2 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg focus-visible-ring transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content - Scrollable with touch support */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
          }}
        >
          <div className="p-4 sm:p-6">{children}</div>
        </div>

        {/* Footer - Fixed */}
        {footer && (
          <div className="flex-none border-t border-border bg-muted/30 backdrop-blur-sm p-4 sm:p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

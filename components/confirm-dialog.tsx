"use client";

import { ModalBase } from "./modal-base";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors focus-visible-ring"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        className={`
          px-4 py-2 rounded-lg font-medium transition-colors focus-visible-ring
          ${
            variant === "danger"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }
        `}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
    >
      <p className="text-card-foreground leading-relaxed">{message}</p>
    </ModalBase>
  );
}

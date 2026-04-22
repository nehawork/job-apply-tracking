"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        aria-modal="true"
        className="modal-panel"
        role="dialog"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title" id="modal-title">
              {title}
            </h2>
            {description ? <p className="modal-copy">{description}</p> : null}
          </div>
          <button
            aria-label="Close modal"
            className="modal-close"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}

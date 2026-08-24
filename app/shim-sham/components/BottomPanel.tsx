"use client";

import { useEffect, type ReactNode } from "react";

export function BottomPanel({
  title,
  onClose,
  children,
  fullScreen = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  fullScreen?: boolean;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <div className="panel-overlay" onClick={onClose} aria-hidden />
      <div
        className={`panel-sheet${fullScreen ? " panel-sheet--fullscreen" : ""}`}
        role="dialog"
        aria-label={title}
      >
        <div className="panel-header">
          <strong>{title}</strong>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="panel-body">{children}</div>
      </div>
    </>
  );
}

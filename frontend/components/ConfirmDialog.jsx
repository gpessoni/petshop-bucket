"use client";

import { useEffect } from "react";

// Diálogo de confirmação próprio (substitui window.confirm).
export default function ConfirmDialog({ title, message, confirmLabel = "Apagar", busy = false, onConfirm, onCancel }) {
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape" && !busy) onCancel(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [busy, onCancel]);

  return (
    <div className="dialog-backdrop" role="presentation" onClick={busy ? undefined : onCancel}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}>
        <h3 id="dialog-title">{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="button button-light" type="button" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button className="button button-primary" type="button" onClick={onConfirm} disabled={busy} autoFocus>{busy ? "Apagando..." : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

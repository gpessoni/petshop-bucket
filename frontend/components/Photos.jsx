"use client";

import { useEffect, useState } from "react";

export function PetPhoto({ src, alt, onClick }) {
  const [failed, setFailed] = useState(false);
  return (
    <button className={`pet-photo ${failed ? "photo-fallback" : ""}`} type="button" onClick={onClick} aria-label={`Ampliar foto: ${alt}`}>
      {failed ? <span className="fallback-paw" aria-hidden="true">🐾</span> : <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />}
    </button>
  );
}

export function PhotoLightbox({ photo, onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="lightbox" role="presentation" onClick={onClose}>
      <button className="lightbox-close" type="button" aria-label="Fechar foto" onClick={onClose}>×</button>
      <img src={photo.src} alt={photo.alt} onClick={(event) => event.stopPropagation()} />
      <p>{photo.alt}</p>
    </div>
  );
}

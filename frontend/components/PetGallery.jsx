"use client";

import { useState } from "react";
import { dateLabel } from "../lib/format";
import { galleryOrder } from "../lib/pets";
import { hideOnError } from "../lib/utils";

// Imagem principal em destaque + miniaturas, como página de produto.
export default function PetGallery({ pet, onPhoto }) {
  const photos = galleryOrder(pet.photos);
  const [activeId, setActiveId] = useState(null);
  const index = Math.max(photos.findIndex((photo) => photo.id === activeId), 0);
  const current = photos[index];
  const step = (delta) => setActiveId(photos[(index + delta + photos.length) % photos.length].id);
  const alt = current && `${pet.name} — foto de ${dateLabel(current.date)}`;

  return (
    <div className="pet-gallery">
      <div className="profile-image gallery-main">
        {current ? (
          <button className="gallery-zoom" type="button" onClick={() => onPhoto({ src: current.url, alt })} aria-label="Ampliar foto">
            <img key={current.id} src={current.url} alt={alt} onError={hideOnError} />
          </button>
        ) : (
          <span className="gallery-empty">🐾<small>Nenhuma foto ainda</small></span>
        )}
        {photos.length > 1 && (
          <>
            <button className="gallery-arrow prev" type="button" onClick={() => step(-1)} aria-label="Foto anterior">‹</button>
            <button className="gallery-arrow next" type="button" onClick={() => step(1)} aria-label="Próxima foto">›</button>
          </>
        )}
        {current && <span className="gallery-counter">{index + 1} / {photos.length} · {dateLabel(current.date)}</span>}
        {current?.isMain && <span className="gallery-badge">★ IMAGEM PRINCIPAL</span>}
      </div>

      {photos.length > 1 && (
        <div className="gallery-thumbs" aria-label="Miniaturas">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              className={`gallery-thumb ${i === index ? "active" : ""}`}
              type="button"
              onClick={() => setActiveId(photo.id)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
            >
              <img src={photo.url} alt="" loading="lazy" onError={hideOnError} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

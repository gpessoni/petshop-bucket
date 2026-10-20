import { PetPhoto } from "./Photos";
import { dateLabel, plural } from "../lib/format";
import { photosByDate } from "../lib/pets";

const COLORS = ["yellow", "pink", "blue", "lilac"];

// Histórico fotográfico do pet, agrupado por data, com ações de capa e exclusão.
export default function PhotoHistory({ pet, busyId, onPhoto, onSetMain, onDelete }) {
  return (
    <div className="visit-list">
      {photosByDate(pet.photos).map(([date, photos], index) => (
        <article className={`visit-card visit-${COLORS[index % COLORS.length]}`} key={date}>
          <div className="visit-header">
            <time dateTime={date} className="history-date">📅 {dateLabel(date)}</time>
            <span className="visit-number">{plural(photos.length, "FOTO", "FOTOS")}</span>
          </div>
          <div className="history-grid">
            {photos.map((photo) => {
              const alt = `${pet.name} em ${dateLabel(photo.date)}`;
              const busy = busyId === photo.id;
              return (
                <figure className={`history-photo ${photo.isMain ? "is-main" : ""} ${busy ? "is-busy" : ""}`} key={photo.id}>
                  <PetPhoto src={photo.url} alt={alt} onClick={() => onPhoto({ src: photo.url, alt })} />
                  {photo.isMain && <span className="history-main-badge">★ Principal</span>}
                  <figcaption>
                    <span>{dateLabel(photo.date)}</span>
                    <span className="history-actions">
                      {!photo.isMain && <button type="button" onClick={() => onSetMain(photo)} disabled={busy} title="Usar como imagem principal">★ Capa</button>}
                      <button className="danger" type="button" onClick={() => onDelete(photo)} disabled={busy} title="Apagar foto">🗑 Apagar</button>
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
          <span className="visit-tape" aria-hidden="true"></span>
        </article>
      ))}
    </div>
  );
}

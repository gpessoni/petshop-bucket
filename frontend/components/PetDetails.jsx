"use client";

import { useState } from "react";
import Field from "./Field";
import PetGallery from "./PetGallery";
import PhotoHistory from "./PhotoHistory";
import PhotoPicker from "./PhotoPicker";
import { LoadState, NotFound } from "./Layout";
import { useLoad } from "../hooks/useLoad";
import { api } from "../lib/api";
import { ageLabel, dateLabel, today } from "../lib/format";
import { speciesAndBreed } from "../lib/pets";

export default function PetDetails({ petId, onBack, onPhoto }) {
  const { data: pet, error, reload } = useLoad(() => api.getPet(petId), [petId]);
  const [showUpload, setShowUpload] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  if (error?.status === 404) return <NotFound onBack={onBack} />;
  if (!pet) return <div className="page-wrap inner-page"><LoadState error={error} onRetry={reload} /></div>;

  async function run(photoId, action) {
    setBusyId(photoId);
    setActionError("");
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const setMain = (photo) => run(photo.id, () => api.setMainPhoto(photo.id));
  const remove = (photo) => {
    if (window.confirm(`Apagar esta foto de ${pet.name} (${dateLabel(photo.date)})? Ela também será removida do bucket.`)) {
      run(photo.id, () => api.deletePhoto(photo.id));
    }
  };

  return (
    <div className="page-wrap inner-page detail-page">
      <div className="page-topline"><button className="text-back" type="button" onClick={onBack}>← TODA A TURMA</button><span>📒 FICHA DE ESTRELINHA</span></div>

      <section className="profile-hero">
        <PetGallery key={pet.id} pet={pet} onPhoto={onPhoto} />
        <div className="profile-intro">
          <span className="profile-sticker">{pet.species} ✿</span>
          <h1>{pet.name}<span>!</span></h1>
          <p className="profile-breed">{speciesAndBreed(pet)} <span>·</span> {ageLabel(pet.birthDate)}</p>
          <div className="profile-details">
            <span>RESPONSÁVEL<strong>{pet.owner} 🧡</strong></span>
            <span>NASCIMENTO<strong>{dateLabel(pet.birthDate)} 🎂</strong></span>
            <span>ESPÉCIE<strong>{pet.species}</strong></span>
            <span>RAÇA<strong>{pet.breed}</strong></span>
          </div>
        </div>
      </section>

      <section className="memories-section">
        <div className="memories-heading">
          <div><span className="section-kicker">CLIQUE, ESPUMA E MUITO CHAMEGO</span><h2>Histórico de fotos <span>🫧</span></h2><p>Todas as fotos de {pet.name}, organizadas pela data em que foram tiradas.</p></div>
          <button className="button button-primary" type="button" onClick={() => setShowUpload((open) => !open)}>{showUpload ? "Fechar ✕" : "＋ Enviar fotos"}</button>
        </div>

        {showUpload && <UploadForm pet={pet} onDone={() => { setShowUpload(false); reload(); }} />}
        {actionError && <p className="form-error" role="alert">{actionError}</p>}

        {pet.photos.length ? (
          <PhotoHistory pet={pet} busyId={busyId} onPhoto={onPhoto} onSetMain={setMain} onDelete={remove} />
        ) : (
          <div className="no-visits">
            <span>📸</span><h3>A primeira foto ainda vai chegar!</h3>
            <p>Envie fotos de {pet.name} e comece esse histórico de lembranças.</p>
            {!showUpload && <button className="button button-primary" type="button" onClick={() => setShowUpload(true)}>Enviar primeiras fotos <span>🫧</span></button>}
          </div>
        )}
        <div className="memory-signoff"><span>✿</span> CONTINUAMOS JUNTANDO MOMENTOS E BOLINHAS DE PELO <span>✿</span></div>
      </section>
    </div>
  );
}

function UploadForm({ pet, onDone }) {
  const hasPhotos = pet.photos.length > 0;
  const [photos, setPhotos] = useState({ files: [], mainIndex: null });
  const [date, setDate] = useState(today());
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!photos.files.length) { setError("Escolha pelo menos uma foto."); return; }
    setSending(true);
    setError("");
    try {
      await api.uploadPhotos(pet.id, { ...photos, date });
      onDone();
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <form className="visit-form" onSubmit={submit}>
      <div className="visit-form-title"><span>🛁</span><div><h3>Novas fotos de {pet.name}</h3><p>Todas as fotos deste envio ficam registradas na data escolhida.</p></div></div>
      <div className="form-grid">
        <Field label="Data das fotos *"><input type="date" value={date} max={today()} required onChange={(event) => setDate(event.target.value)} /></Field>
        <div className="field full"><PhotoPicker value={photos} onChange={setPhotos} allowKeepMain={hasPhotos} /></div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="visit-form-footer">
        <span>As imagens vão para o bucket; data e capa ficam registradas no banco. 📸</span>
        <button className="button button-dark" type="submit" disabled={sending}>{sending ? "Enviando..." : <>Enviar {photos.files.length || ""} foto(s) <span>♥</span></>}</button>
      </div>
    </form>
  );
}

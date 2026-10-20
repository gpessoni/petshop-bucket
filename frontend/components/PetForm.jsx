"use client";

import { useState } from "react";
import Field from "./Field";
import PhotoPicker from "./PhotoPicker";
import { api } from "../lib/api";
import { today } from "../lib/format";
import { BREEDS, SPECIES } from "../lib/pets";
import { formText } from "../lib/utils";

const FIELDS = ["name", "species", "breed", "owner", "birthDate"];

export default function PetForm({ onCancel, onSaved }) {
  const [photos, setPhotos] = useState({ files: [], mainIndex: null });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [species, setSpecies] = useState("");

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const pet = Object.fromEntries(FIELDS.map((key) => [key, formText(form, key)]));
    if (FIELDS.some((key) => !pet[key])) {
      setError("Preencha nome, espécie, raça, responsável e data de nascimento.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const created = await api.createPet(pet);
      if (photos.files.length) {
        await api.uploadPhotos(created.id, { ...photos, date: formText(form, "photoDate") || today() });
      }
      onSaved(created.id);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="page-wrap inner-page">
      <div className="page-topline"><button className="text-back" type="button" onClick={onCancel}>← VOLTAR PRO ÁLBUM</button><span>🧼 VAGA ABERTA NA TURMA!</span></div>
      <div className="register-heading"><div className="form-emoji">🐕‍🦺</div><span className="section-kicker">UM NOVO AMIGO NO ÁLBUM</span><h1>Quem é esse <span>fofurinha?</span></h1><p>Conta um pouquinho do seu pet pra gente preparar a página dele!</p></div>

      <form className="form-card" onSubmit={submit}>
        <h2>Dados do pet <span>👋</span></h2>
        <div className="form-grid">
          <Field label="Nome do pet *"><input name="name" placeholder="Ex.: Totó" required maxLength="50" /></Field>
          <Field label="Responsável *"><input name="owner" placeholder="Ex.: Gabriel" required maxLength="60" /></Field>
          <Field label="Espécie *">
            <select name="species" value={species} onChange={(event) => setSpecies(event.target.value)} required>
              <option value="" disabled>Escolha uma opção</option>
              {SPECIES.map((species) => <option key={species}>{species}</option>)}
            </select>
          </Field>
          <Field label="Raça *">
            {BREEDS[species]?.length ? (
              <select key={species} name="breed" defaultValue="" required>
                <option value="" disabled>Escolha a raça</option>
                {BREEDS[species].map((breed) => <option key={breed}>{breed}</option>)}
                <option>Outra</option>
              </select>
            ) : (
              <input key={species} name="breed" placeholder={species ? "Ex.: Mini, SRD..." : "Escolha a espécie primeiro"} required maxLength="60" disabled={!species} />
            )}
          </Field>
          <Field label="Data de nascimento *"><input name="birthDate" type="date" required max={today()} /></Field>
        </div>

        <h2 className="form-subtitle">Fotos <span>📸</span> <small>(opcional — dá pra enviar depois)</small></h2>
        <div className="form-grid">
          <Field label="Data das fotos"><input name="photoDate" type="date" defaultValue={today()} max={today()} /></Field>
          <div className="field full"><PhotoPicker value={photos} onChange={setPhotos} /></div>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button className="button button-light" type="button" onClick={onCancel} disabled={saving}>Deixa pra lá</button>
          <button className="button button-primary" type="submit" disabled={saving}>{saving ? "Salvando..." : <>Colocar no álbum <span>🐾</span></>}</button>
        </div>
      </form>
    </div>
  );
}

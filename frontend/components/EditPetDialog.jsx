"use client";

import { useEffect, useState } from "react";
import Field from "./Field";
import { api } from "../lib/api";
import { apenasData, today } from "../lib/format";
import { BREEDS, SPECIES } from "../lib/pets";
import { formText } from "../lib/utils";

const FIELDS = ["nome", "especie", "raca", "responsavel", "dataNascimento"];

// Edição dos dados do pet em um diálogo.
export default function EditPetDialog({ pet, onSaved, onCancel }) {
  const [species, setSpecies] = useState(pet.especie);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape" && !saving) onCancel(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [saving, onCancel]);

  const breeds = BREEDS[species] || [];
  // Mantém a raça atual selecionável mesmo que não esteja na lista sugerida.
  const breedOptions = species === pet.especie && pet.raca && !breeds.includes(pet.raca) ? [pet.raca, ...breeds] : breeds;

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(FIELDS.map((key) => [key, formText(form, key)]));
    if (FIELDS.some((key) => !data[key])) {
      setError("Preencha nome, espécie, raça, responsável e data de nascimento.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.updatePet(pet.id, data);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onClick={saving ? undefined : onCancel}>
      <form className="dialog dialog-wide" role="dialog" aria-modal="true" aria-labelledby="edit-title" onClick={(event) => event.stopPropagation()} onSubmit={submit}>
        <h3 id="edit-title">Editar {pet.nome}</h3>
        <div className="form-grid">
          <Field label="Nome do pet *"><input name="nome" defaultValue={pet.nome} required maxLength="50" /></Field>
          <Field label="Responsável *"><input name="responsavel" defaultValue={pet.responsavel} required maxLength="60" /></Field>
          <Field label="Espécie *">
            <select name="especie" value={species} onChange={(event) => setSpecies(event.target.value)} required>
              {[...new Set([pet.especie, ...SPECIES])].map((item) => <option key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Raça *">
            {breedOptions.length ? (
              <select key={species} name="raca" defaultValue={species === pet.especie ? pet.raca : ""} required>
                <option value="" disabled>Escolha a raça</option>
                {breedOptions.map((breed) => <option key={breed}>{breed}</option>)}
                <option>Outra</option>
              </select>
            ) : (
              <input key={species} name="raca" defaultValue={species === pet.especie ? pet.raca : ""} required maxLength="60" />
            )}
          </Field>
          <Field label="Data de nascimento *"><input name="dataNascimento" type="date" defaultValue={apenasData(pet.dataNascimento)} required max={today()} /></Field>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-actions">
          <button className="button button-light" type="button" onClick={onCancel} disabled={saving}>Cancelar</button>
          <button className="button button-primary" type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </div>
  );
}

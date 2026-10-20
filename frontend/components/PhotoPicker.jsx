"use client";

import { useEffect, useMemo } from "react";

// Seleção de n imagens com pré-visualização e escolha da imagem principal (capa).
// value = { files: File[], mainIndex: number | null }. mainIndex null = manter a capa atual do pet.
export default function PhotoPicker({ value, onChange, allowKeepMain = false }) {
  const { files, mainIndex } = value;
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function addFiles(event) {
    const added = [...event.target.files].filter((file) => file.type.startsWith("image/"));
    event.target.value = "";
    if (!added.length) return;
    onChange({ files: [...files, ...added], mainIndex: mainIndex ?? (allowKeepMain ? null : 0) });
  }

  function remove(index) {
    const next = files.filter((_, i) => i !== index);
    let nextMain = mainIndex;
    if (mainIndex === index) nextMain = allowKeepMain || !next.length ? null : 0;
    else if (mainIndex != null && mainIndex > index) nextMain = mainIndex - 1;
    onChange({ files: next, mainIndex: nextMain });
  }

  return (
    <div className="photo-picker">
      <label className="picker-drop">
        <input type="file" accept="image/*" multiple onChange={addFiles} />
        <span className="picker-icon">📷</span>
        <strong>Escolher fotos</strong>
        <small>Pode selecionar várias de uma vez (jpg, png, webp...)</small>
      </label>

      {files.length > 0 && (
        <>
          <p className="picker-hint">Toque em <b>★ Capa</b> para escolher a imagem principal do pet.</p>
          <div className="picker-grid">
            {files.map((file, index) => (
              <figure className={`picker-item ${mainIndex === index ? "is-main" : ""}`} key={previews[index]}>
                <img src={previews[index]} alt={file.name} />
                <button className="picker-main" type="button" onClick={() => onChange({ files, mainIndex: index })} aria-pressed={mainIndex === index}>
                  {mainIndex === index ? "★ Capa" : "☆ Capa"}
                </button>
                <button className="picker-remove" type="button" onClick={() => remove(index)} aria-label={`Remover ${file.name}`}>×</button>
              </figure>
            ))}
          </div>
          {allowKeepMain && (
            <label className="picker-keep">
              <input type="radio" checked={mainIndex == null} onChange={() => onChange({ files, mainIndex: null })} />
              Manter a capa atual do pet
            </label>
          )}
        </>
      )}
    </div>
  );
}

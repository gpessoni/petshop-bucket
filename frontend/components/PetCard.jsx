import { ageLabel, plural } from "../lib/format";
import { speciesAndBreed } from "../lib/pets";
import { hideOnError } from "../lib/utils";

export default function PetCard({ pet, index, onOpen }) {
  return (
    <article className={`pet-card card-color-${index % 4}`}>
      <button className="card-image" type="button" onClick={onOpen} aria-label={`Ver detalhes de ${pet.nome}`}>
        {pet.fotoPrincipalUrl
          ? <img src={pet.fotoPrincipalUrl} alt={`${pet.nome}, ${speciesAndBreed(pet)}`} loading="lazy" onError={hideOnError} />
          : <span className="card-no-photo" aria-hidden="true">🐾</span>}
        <span className="photo-label">{pet.especie} <span>✿</span></span>
        <span className="photo-counter">📸 {plural(pet.totalFotos ?? 0, "foto", "fotos")}</span>
      </button>
      <div className="pet-card-body">
        <div className="card-name-line"><h3>{pet.nome}<span>!</span></h3><span className="pet-age">{ageLabel(pet.dataNascimento)}</span></div>
        <p className="pet-breed">{speciesAndBreed(pet)}</p>
        <div className="card-foot">
          <span>COM {pet.responsavel} <span className="tiny-hearts">♥♥</span></span>
          <button type="button" onClick={onOpen}>Ver as fotos <b>↗</b></button>
        </div>
      </div>
      <span className="card-tape" aria-hidden="true"></span>
    </article>
  );
}

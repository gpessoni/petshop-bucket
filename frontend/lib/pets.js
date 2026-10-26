import { apenasData } from "./format";

// Raças sugeridas por espécie (alimentam o dropdown do formulário). "Outro" usa campo livre.
export const BREEDS = {
  Cachorro: ["SRD (Vira-lata)", "Shih Tzu", "Poodle", "Golden Retriever", "Labrador", "Bulldog Francês", "Dachshund", "Yorkshire", "Spitz Alemão", "Pug", "Border Collie", "Pastor Alemão", "Husky Siberiano", "Pinscher", "Lhasa Apso", "Maltês", "Beagle", "Rottweiler"],
  Gato: ["SRD (Vira-lata)", "Siamês", "Persa", "Maine Coon", "Angorá", "Ragdoll", "Bengal", "Sphynx", "British Shorthair", "Himalaio"],
  Coelho: ["Mini Lop", "Holandês", "Angorá", "Mini Rex", "Lionhead", "Cabeça de Leão", "Rex"],
  Hamster: ["Sírio", "Anão Russo", "Roborovski", "Chinês"],
  "Porquinho-da-índia": ["Americano", "Abissínio", "Peruano", "Sheltie", "Teddy"],
  Pássaro: ["Calopsita", "Periquito", "Canário", "Papagaio", "Agapornis", "Cacatua"],
  Réptil: ["Tartaruga", "Jabuti", "Iguana", "Gecko", "Cobra do Milho", "Dragão Barbudo"],
  Peixe: ["Beta", "Kinguio", "Neon", "Guppy", "Acará"],
};

export const SPECIES = [...Object.keys(BREEDS), "Outro"];

export const speciesAndBreed = (pet) => [pet.especie, pet.raca].filter(Boolean).join(" · ");

// Foto principal primeiro, depois as demais da mais recente para a mais antiga.
export function galleryOrder(photos) {
  const byDate = [...photos].sort((a, b) => b.dataFoto.localeCompare(a.dataFoto));
  return [...byDate.filter((photo) => photo.principal), ...byDate.filter((photo) => !photo.principal)];
}

// Histórico fotográfico: [[data, fotos], ...] da data mais recente para a mais antiga.
export function photosByDate(photos) {
  const groups = new Map();
  for (const photo of photos) groups.set(apenasData(photo.dataFoto), [...(groups.get(apenasData(photo.dataFoto)) || []), photo]);
  return [...groups].sort(([a], [b]) => b.localeCompare(a));
}

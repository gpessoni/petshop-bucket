export const SPECIES = ["Cachorro", "Gato", "Coelho", "Outro"];

export const speciesAndBreed = (pet) => [pet.species, pet.breed].filter(Boolean).join(" · ");

// Foto principal primeiro, depois as demais da mais recente para a mais antiga.
export function galleryOrder(photos) {
  const byDate = [...photos].sort((a, b) => b.date.localeCompare(a.date));
  return [...byDate.filter((photo) => photo.isMain), ...byDate.filter((photo) => !photo.isMain)];
}

// Histórico fotográfico: [[data, fotos], ...] da data mais recente para a mais antiga.
export function photosByDate(photos) {
  const groups = new Map();
  for (const photo of photos) groups.set(photo.date, [...(groups.get(photo.date) || []), photo]);
  return [...groups].sort(([a], [b]) => b.localeCompare(a));
}

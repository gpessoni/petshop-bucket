/*
 * Contrato esperado do back-end (REST + JSON). Para adaptar a outra API, altere só este arquivo.
 *
 *   Pet (listagem)  { id, name, species, breed, owner, birthDate: "AAAA-MM-DD", mainPhotoUrl, photoCount }
 *   Pet (detalhe)   { ...Pet, photos: Photo[] }
 *   Photo           { id, url, date: "AAAA-MM-DD", isMain }   url = URL pública do bucket
 *
 *   GET    /pets                    -> Pet[]
 *   GET    /pets/:id                -> Pet com photos
 *   POST   /pets                    { name, species, breed, owner, birthDate } -> Pet
 *   PUT    /pets/:id                { name, species, breed, owner, birthDate } -> Pet
 *   DELETE /pets/:id                apaga o pet e todas as suas fotos (banco e bucket)
 *   POST   /pets/:id/photos         multipart: files (n arquivos), date, mainIndex (opcional) -> Photo[]
 *   PATCH  /photos/:id/main         marca a foto como principal (desmarca as outras do pet)
 *   DELETE /photos/:id              apaga a foto do bucket e do banco
 */
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.sucesso === false) {
    const error = new Error(body?.erro || body?.message || `Erro ${response.status} ao falar com o servidor.`);
    error.status = response.status;
    throw error;
  }
  return body?.dados ?? body;
}

const json = (method, body) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// ---- Adaptadores: back-end (pt-BR, { sucesso, dados }) <-> contrato do front (inglês) ----
const day = (value) => (value ? String(value).slice(0, 10) : "");

const toPhoto = (foto) => ({ id: foto.id, url: foto.url, date: day(foto.dataFoto), isMain: foto.principal });

const toPet = (pet) => ({
  id: pet.id,
  name: pet.nome,
  species: pet.especie,
  breed: pet.raca,
  owner: pet.responsavel,
  birthDate: day(pet.dataNascimento),
  mainPhotoUrl: pet.fotoPrincipalUrl ?? pet.fotos?.find((foto) => foto.principal)?.url ?? null,
  photoCount: pet.totalFotos ?? pet.fotos?.length ?? 0,
  ...(pet.fotos && { photos: pet.fotos.map(toPhoto) }),
});

const fromPet = (pet) => ({
  nome: pet.name,
  especie: pet.species,
  raca: pet.breed || undefined,
  responsavel: pet.owner,
  dataNascimento: pet.birthDate,
});

export const api = {
  listPets: () => request("/pets").then((pets) => pets.map(toPet)),
  getPet: (id) => request(`/pets/${id}`).then(toPet),
  createPet: (pet) => request("/pets", json("POST", fromPet(pet))).then(toPet),
  updatePet: (id, pet) => request(`/pets/${id}`, json("PUT", fromPet(pet))).then(toPet),
  deletePet: (id) => request(`/pets/${id}`, { method: "DELETE" }),
  async uploadPhotos(petId, { files, date, mainIndex }) {
    const form = new FormData();
    files.forEach((file) => form.append("fotos", file));
    form.append("dataFoto", date);
    const saved = await request(`/pets/${petId}/fotos`, { method: "POST", body: form });
    // O back-end só marca a 1ª foto do pet como principal; respeita a escolha do usuário.
    if (mainIndex != null && saved[mainIndex] && !saved[mainIndex].principal) {
      await request(`/fotos/${saved[mainIndex].id}/principal`, { method: "PATCH" });
    }
    return saved.map(toPhoto);
  },
  setMainPhoto: (photoId) => request(`/fotos/${photoId}/principal`, { method: "PATCH" }),
  deletePhoto: (photoId) => request(`/fotos/${photoId}`, { method: "DELETE" }),
};

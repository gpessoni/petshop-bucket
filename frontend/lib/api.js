import * as mockApi from "./mock/mockApi";

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
 *   POST   /pets/:id/photos         multipart: files (n arquivos), date, mainIndex (opcional) -> Photo[]
 *   PATCH  /photos/:id/main         marca a foto como principal (desmarca as outras do pet)
 *   DELETE /photos/:id              apaga a foto do bucket e do banco
 *
 * Sem NEXT_PUBLIC_API_URL definido, o front usa uma API simulada no navegador (lib/mock).
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const error = new Error(body?.message || `Erro ${response.status} ao falar com o servidor.`);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

const json = (method, body) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const httpApi = {
  listPets: () => request("/pets"),
  getPet: (id) => request(`/pets/${id}`),
  createPet: (pet) => request("/pets", json("POST", pet)),
  uploadPhotos(petId, { files, date, mainIndex }) {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    form.append("date", date);
    if (mainIndex != null) form.append("mainIndex", String(mainIndex));
    return request(`/pets/${petId}/photos`, { method: "POST", body: form });
  },
  setMainPhoto: (photoId) => request(`/photos/${photoId}/main`, { method: "PATCH" }),
  deletePhoto: (photoId) => request(`/photos/${photoId}`, { method: "DELETE" }),
};

export const usingMockApi = !BASE_URL;
export const api = usingMockApi ? mockApi : httpApi;

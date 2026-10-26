/*
 * Chamadas ao backend (REST + JSON). Os nomes dos campos são os mesmos do backend:
 *
 *   Pet (listagem)  { id, nome, especie, raca, responsavel, dataNascimento, fotoPrincipalUrl, totalFotos }
 *   Pet (detalhe)   { ...Pet, fotos: Foto[] }
 *   Foto            { id, url, dataFoto, principal }
 *
 *   GET    /pets                    lista os pets
 *   GET    /pets/:id                pet com fotos
 *   POST   /pets                    cria o pet
 *   PUT    /pets/:id                atualiza o pet
 *   DELETE /pets/:id                apaga o pet e todas as suas fotos (banco e bucket)
 *   POST   /pets/:id/fotos          multipart: fotos (n arquivos), dataFoto
 *   PATCH  /fotos/:id/principal     marca a foto como principal (desmarca as outras do pet)
 *   DELETE /fotos/:id               apaga a foto do bucket e do banco
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

export const api = {
  listPets: () => request("/pets"),
  getPet: (id) => request(`/pets/${id}`),
  createPet: (pet) => request("/pets", json("POST", pet)),
  updatePet: (id, pet) => request(`/pets/${id}`, json("PUT", pet)),
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
    return saved;
  },
  setMainPhoto: (photoId) => request(`/fotos/${photoId}/principal`, { method: "PATCH" }),
  deletePhoto: (photoId) => request(`/fotos/${photoId}`, { method: "DELETE" }),
};

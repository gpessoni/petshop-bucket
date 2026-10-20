// API simulada no navegador (localStorage), com o mesmo contrato de lib/api.js.
// Serve só para desenvolver o front sem o back-end; as fotos enviadas ficam como data URL reduzida.
import { seedPets } from "./seed";

const STORAGE_KEY = "focinho-feliz-mock-api-v1";
const unsplash = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;
const newId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const wait = () => new Promise((resolve) => setTimeout(resolve, 150));

let db = null;

function seedDb() {
  const pets = seedPets.map(({ photos, ...pet }) => pet);
  const photos = seedPets.flatMap((pet) =>
    pet.photos.flatMap(([date, ids], group) =>
      ids.map((id, index) => ({ id: `${pet.id}-${date}-${index}`, petId: pet.id, url: unsplash(id), date, isMain: group === 0 && index === 0 }))));
  return { pets, photos };
}

function load() {
  if (db) return db;
  try { db = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { db = null; }
  return (db ??= seedDb());
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    throw new Error("Sem espaço no navegador para guardar as fotos da API simulada.");
  }
}

const photosOf = (petId) => load().photos.filter((photo) => photo.petId === petId);
const stripPetId = ({ petId, ...photo }) => photo;

function summary(pet) {
  const photos = photosOf(pet.id);
  return { ...pet, mainPhotoUrl: (photos.find((photo) => photo.isMain) ?? photos[0])?.url ?? null, photoCount: photos.length };
}

function setMain(petId, photoId) {
  photosOf(petId).forEach((photo) => { photo.isMain = photo.id === photoId; });
}

async function toDataUrl(file, maxSize = 1000) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

function findPet(id) {
  const pet = load().pets.find((item) => item.id === id);
  if (!pet) throw Object.assign(new Error("Pet não encontrado."), { status: 404 });
  return pet;
}

export async function listPets() {
  await wait();
  return load().pets.map(summary);
}

export async function getPet(id) {
  await wait();
  return { ...summary(findPet(id)), photos: photosOf(id).map(stripPetId) };
}

export async function createPet(data) {
  await wait();
  const pet = { id: newId("pet"), ...data };
  load().pets.unshift(pet);
  save();
  return summary(pet);
}

export async function uploadPhotos(petId, { files, date, mainIndex }) {
  findPet(petId);
  const hadMain = photosOf(petId).some((photo) => photo.isMain);
  const created = await Promise.all(files.map(async (file) => ({ id: newId("photo"), petId, url: await toDataUrl(file), date, isMain: false })));
  load().photos.push(...created);
  if (mainIndex != null) setMain(petId, created[mainIndex].id);
  else if (!hadMain) setMain(petId, created[0].id);
  save();
  return created.map(stripPetId);
}

export async function setMainPhoto(photoId) {
  await wait();
  const photo = load().photos.find((item) => item.id === photoId);
  if (photo) { setMain(photo.petId, photo.id); save(); }
  return null;
}

export async function deletePhoto(photoId) {
  await wait();
  const photo = load().photos.find((item) => item.id === photoId);
  if (!photo) return null;
  db.photos = db.photos.filter((item) => item.id !== photoId);
  const [next] = photosOf(photo.petId);
  if (photo.isMain && next) setMain(photo.petId, next.id);
  save();
  return null;
}

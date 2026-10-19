const crypto = require('crypto');
const path = require('path');
const { storage, bucketName } = require('../config/storage');

const bucket = () => storage.bucket(bucketName);

function urlPublica(caminho) {
  return `https://storage.googleapis.com/${bucketName}/${caminho}`;
}

// Gera: pets/{petId}/{data}/{nomeUnico}.ext
function gerarCaminho(petId, dataFoto, nomeOriginal) {
  const data = dataFoto.toISOString().slice(0, 10);
  const extensao = path.extname(nomeOriginal).toLowerCase();
  return `pets/${petId}/${data}/${crypto.randomUUID()}${extensao}`;
}

async function uploadImagem(arquivo, caminho) {
  await bucket().file(caminho).save(arquivo.buffer, {
    contentType: arquivo.mimetype,
    resumable: false,
  });
  return urlPublica(caminho);
}

async function excluirImagem(caminho) {
  // ignoreNotFound: se o objeto já não existe, a exclusão é considerada concluída
  await bucket().file(caminho).delete({ ignoreNotFound: true });
}

async function listarObjetos(prefixo) {
  const [arquivos] = await bucket().getFiles({ prefix: prefixo });
  return arquivos.map((a) => ({
    caminho: a.name,
    tamanho: Number(a.metadata.size),
    tipo: a.metadata.contentType,
    url: urlPublica(a.name),
  }));
}

async function baixarImagem(caminho) {
  const [buffer] = await bucket().file(caminho).download();
  return buffer;
}

module.exports = { gerarCaminho, uploadImagem, excluirImagem, listarObjetos, baixarImagem };

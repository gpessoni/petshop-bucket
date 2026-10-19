const fotoService = require('../services/fotoService');
const storageService = require('../services/storageService');

async function enviar(req, res) {
  const fotos = await fotoService.enviar(Number(req.params.id), req.files, req.body.dataFoto);
  res.status(201).json({ sucesso: true, dados: fotos });
}

async function listarDoPet(req, res) {
  const fotos = await fotoService.fotosDoPet(Number(req.params.id));
  res.json({ sucesso: true, dados: fotos });
}

async function definirPrincipal(req, res) {
  const foto = await fotoService.definirPrincipal(Number(req.params.id));
  res.json({ sucesso: true, dados: foto });
}

async function excluir(req, res) {
  await fotoService.excluir(Number(req.params.id));
  res.json({ sucesso: true, mensagem: 'Foto excluída com sucesso' });
}

async function baixar(req, res) {
  const { foto, buffer } = await fotoService.baixar(Number(req.params.id));
  res.attachment(foto.nomeArquivo);
  res.send(buffer);
}

// Lista os objetos do bucket (opcional: ?prefixo=pets/1/)
async function listarBucket(req, res) {
  const objetos = await storageService.listarObjetos(req.query.prefixo);
  res.json({ sucesso: true, dados: objetos });
}

module.exports = { enviar, listarDoPet, definirPrincipal, excluir, baixar, listarBucket };

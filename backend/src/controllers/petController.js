const petService = require('../services/petService');

async function criar(req, res) {
  const pet = await petService.criar(req.body);
  res.status(201).json({ sucesso: true, dados: pet });
}

async function listar(req, res) {
  const pets = await petService.listar();
  res.json({ sucesso: true, dados: pets });
}

async function buscarPorId(req, res) {
  const pet = await petService.buscarPorId(Number(req.params.id));
  res.json({ sucesso: true, dados: pet });
}

async function atualizar(req, res) {
  const pet = await petService.atualizar(Number(req.params.id), req.body);
  res.json({ sucesso: true, dados: pet });
}

async function excluir(req, res) {
  await petService.excluir(Number(req.params.id));
  res.json({ sucesso: true, mensagem: 'Pet excluído com sucesso' });
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };

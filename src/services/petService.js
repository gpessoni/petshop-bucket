const prisma = require('../config/prisma');
const storageService = require('./storageService');

function erro(status, mensagem) {
  const e = new Error(mensagem);
  e.status = status;
  return e;
}

// Valida e normaliza os dados do pet. Em atualização parcial não exige todos os campos.
function validarDados(dados, parcial = false) {
  const obrigatorios = ['nome', 'especie', 'responsavel', 'dataNascimento'];
  const faltando = obrigatorios.filter((c) => !parcial && !dados[c]);
  if (faltando.length) {
    throw erro(400, `Campos obrigatórios ausentes: ${faltando.join(', ')}`);
  }

  const pet = {};
  for (const campo of ['nome', 'especie', 'raca', 'responsavel']) {
    if (dados[campo] !== undefined) pet[campo] = dados[campo];
  }
  if (dados.dataNascimento !== undefined) {
    const data = new Date(dados.dataNascimento);
    if (isNaN(data)) throw erro(400, 'dataNascimento inválida');
    pet.dataNascimento = data;
  }
  return pet;
}

async function buscarOuFalhar(id) {
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: { fotos: { orderBy: { dataFoto: 'asc' } } },
  });
  if (!pet) throw erro(404, 'Pet não encontrado');
  return pet;
}

async function criar(dados) {
  return prisma.pet.create({ data: validarDados(dados) });
}

async function listar() {
  const pets = await prisma.pet.findMany({
    orderBy: { id: 'asc' },
    include: { fotos: { where: { principal: true }, take: 1 } },
  });
  return pets.map(({ fotos, ...pet }) => ({
    ...pet,
    fotoPrincipalUrl: fotos[0] ? fotos[0].url : null,
  }));
}

async function buscarPorId(id) {
  return buscarOuFalhar(id);
}

async function atualizar(id, dados) {
  await buscarOuFalhar(id);
  return prisma.pet.update({ where: { id }, data: validarDados(dados, true) });
}

async function excluir(id) {
  const pet = await buscarOuFalhar(id);
  // Primeiro remove do bucket; se falhar, o banco permanece intacto (nada fica órfão)
  for (const foto of pet.fotos) {
    await storageService.excluirImagem(foto.caminhoBucket);
  }
  await prisma.pet.delete({ where: { id } }); // fotos removidas em cascata
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir, erro };

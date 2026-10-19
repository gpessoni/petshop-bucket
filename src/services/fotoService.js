const prisma = require('../config/prisma');
const storageService = require('./storageService');
const { erro } = require('./petService');

async function fotosDoPet(petId) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) throw erro(404, 'Pet não encontrado');
  return prisma.foto.findMany({ where: { petId }, orderBy: { dataFoto: 'asc' } });
}

// datas: valor único (vale para todas) ou lista (uma por arquivo, na mesma ordem)
function dataDaFoto(datas, indice) {
  const lista = [].concat(datas || []);
  const valor = lista.length > 1 ? lista[indice] : lista[0];
  if (!valor) return new Date();
  const data = new Date(valor);
  if (isNaN(data)) throw erro(400, `dataFoto inválida: ${valor}`);
  return data;
}

async function enviar(petId, arquivos, datas) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) throw erro(404, 'Pet não encontrado');
  if (!arquivos || arquivos.length === 0) throw erro(400, 'Envie ao menos uma imagem no campo "fotos"');

  // Valida todas as datas antes de enviar qualquer arquivo
  const datasFotos = arquivos.map((_, i) => dataDaFoto(datas, i));

  const salvas = [];
  for (let i = 0; i < arquivos.length; i++) {
    const arquivo = arquivos[i];
    const caminho = storageService.gerarCaminho(petId, datasFotos[i], arquivo.originalname);
    const url = await storageService.uploadImagem(arquivo, caminho);

    try {
      const foto = await prisma.$transaction(async (tx) => {
        const jaTemPrincipal = await tx.foto.count({ where: { petId, principal: true } });
        return tx.foto.create({
          data: {
            petId,
            nomeArquivo: arquivo.originalname,
            caminhoBucket: caminho,
            url,
            dataFoto: datasFotos[i],
            principal: jaTemPrincipal === 0, // primeira foto vira principal
          },
        });
      });
      salvas.push(foto);
    } catch (e) {
      // Falha ao salvar no banco: remove o arquivo do bucket para não ficar órfão
      await storageService.excluirImagem(caminho).catch(() => {});
      throw e;
    }
  }
  return salvas;
}

async function buscarOuFalhar(id) {
  const foto = await prisma.foto.findUnique({ where: { id } });
  if (!foto) throw erro(404, 'Foto não encontrada');
  return foto;
}

async function definirPrincipal(id) {
  const foto = await buscarOuFalhar(id);
  return prisma.$transaction(async (tx) => {
    await tx.foto.updateMany({
      where: { petId: foto.petId, principal: true },
      data: { principal: false },
    });
    return tx.foto.update({ where: { id }, data: { principal: true } });
  });
}

async function excluir(id) {
  const foto = await buscarOuFalhar(id);
  await storageService.excluirImagem(foto.caminhoBucket); // se falhar, o registro é mantido
  await prisma.foto.delete({ where: { id } });
}

async function baixar(id) {
  const foto = await buscarOuFalhar(id);
  const buffer = await storageService.baixarImagem(foto.caminhoBucket);
  return { foto, buffer };
}

module.exports = { fotosDoPet, enviar, definirPrincipal, excluir, baixar };

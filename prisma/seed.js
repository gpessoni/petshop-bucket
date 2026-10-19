const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pets = [
  { nome: 'Thor', especie: 'Cachorro', raca: 'Golden Retriever', responsavel: 'Ana Souza', dataNascimento: '2020-03-15' },
  { nome: 'Luna', especie: 'Gato', raca: 'Siamês', responsavel: 'Carlos Lima', dataNascimento: '2021-07-02' },
  { nome: 'Bob', especie: 'Cachorro', raca: 'Beagle', responsavel: 'Mariana Alves', dataNascimento: '2019-11-23' },
  { nome: 'Mel', especie: 'Cachorro', raca: 'Poodle', responsavel: 'João Pereira', dataNascimento: '2022-01-10' },
  { nome: 'Mia', especie: 'Gato', raca: 'Persa', responsavel: 'Fernanda Costa', dataNascimento: '2018-05-30' },
  { nome: 'Rex', especie: 'Cachorro', raca: 'Pastor Alemão', responsavel: 'Ricardo Gomes', dataNascimento: '2017-09-08' },
  { nome: 'Nina', especie: 'Gato', raca: 'Maine Coon', responsavel: 'Patrícia Rocha', dataNascimento: '2020-12-19' },
  { nome: 'Floquinho', especie: 'Cachorro', raca: 'Shih Tzu', responsavel: 'Lucas Martins', dataNascimento: '2021-04-25' },
  { nome: 'Simba', especie: 'Gato', raca: null, responsavel: 'Beatriz Nunes', dataNascimento: '2023-02-14' },
  { nome: 'Pipoca', especie: 'Cachorro', raca: 'Vira-lata', responsavel: 'Gabriel Ferreira', dataNascimento: '2019-08-06' },
  { nome: 'Cleo', especie: 'Gato', raca: 'Bengal', responsavel: 'Juliana Barros', dataNascimento: '2022-10-31' },
];

async function main() {
  if ((await prisma.pet.count()) > 0) {
    console.log('Já existem pets cadastrados, seed ignorado.');
    return;
  }
  await prisma.pet.createMany({
    data: pets.map((p) => ({ ...p, dataNascimento: new Date(p.dataNascimento) })),
  });
  console.log(`${pets.length} pets cadastrados.`);
}

main().finally(() => prisma.$disconnect());

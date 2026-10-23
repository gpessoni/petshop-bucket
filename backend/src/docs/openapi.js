// Especificação OpenAPI 3.0 da API (servida em /docs pelo swagger-ui-express)

const respostaErro = (descricao) => ({
  description: descricao,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } },
});

const idPath = (descricao) => ({
  name: 'id',
  in: 'path',
  required: true,
  description: descricao,
  schema: { type: 'integer', minimum: 1, example: 1 },
});

const envelope = (schema) => ({
  type: 'object',
  properties: { sucesso: { type: 'boolean', example: true }, dados: schema },
});

const json = (schema) => ({ 'application/json': { schema } });

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Focinho Feliz — API do Álbum de Pets',
    version: '1.0.0',
    description:
      'API do petshop: cadastro de pets (PostgreSQL) e álbum de fotos por data. ' +
      'Os arquivos de imagem ficam no Google Cloud Storage; o banco guarda apenas metadados e a URL pública.',
  },
  servers: [{ url: 'http://localhost:3333', description: 'Desenvolvimento local' }],
  tags: [
    { name: 'Pets', description: 'Cadastro de pets' },
    { name: 'Fotos', description: 'Upload, listagem, download e exclusão de imagens (Google Cloud Storage)' },
    { name: 'Bucket', description: 'Operações diretas sobre o bucket' },
  ],
  paths: {
    '/pets': {
      post: {
        tags: ['Pets'],
        summary: 'Cria um pet',
        requestBody: {
          required: true,
          content: json({ $ref: '#/components/schemas/PetEntrada' }),
        },
        responses: {
          201: {
            description: 'Pet criado',
            content: json(envelope({ $ref: '#/components/schemas/Pet' })),
          },
          400: respostaErro('Campos obrigatórios ausentes ou dataNascimento inválida'),
        },
      },
      get: {
        tags: ['Pets'],
        summary: 'Lista todos os pets',
        description: 'Cada item traz a URL da foto principal (capa) e o total de fotos.',
        responses: {
          200: {
            description: 'Lista de pets',
            content: json(envelope({ type: 'array', items: { $ref: '#/components/schemas/PetListagem' } })),
          },
        },
      },
    },
    '/pets/{id}': {
      parameters: [idPath('ID do pet')],
      get: {
        tags: ['Pets'],
        summary: 'Busca um pet com todas as fotos',
        description: 'As fotos vêm ordenadas por data (mais antiga primeiro).',
        responses: {
          200: {
            description: 'Pet encontrado',
            content: json(envelope({ $ref: '#/components/schemas/PetDetalhe' })),
          },
          400: respostaErro('ID inválido'),
          404: respostaErro('Pet não encontrado'),
        },
      },
      put: {
        tags: ['Pets'],
        summary: 'Atualiza um pet',
        description: 'Aceita atualização parcial: envie apenas os campos a alterar.',
        requestBody: {
          required: true,
          content: json({ $ref: '#/components/schemas/PetAtualizacao' }),
        },
        responses: {
          200: {
            description: 'Pet atualizado',
            content: json(envelope({ $ref: '#/components/schemas/Pet' })),
          },
          400: respostaErro('ID ou dataNascimento inválidos'),
          404: respostaErro('Pet não encontrado'),
        },
      },
      delete: {
        tags: ['Pets'],
        summary: 'Exclui um pet',
        description: 'Remove as imagens do bucket e, em seguida, o pet e suas fotos do banco.',
        responses: {
          200: { description: 'Pet excluído', content: json({ $ref: '#/components/schemas/Mensagem' }) },
          400: respostaErro('ID inválido'),
          404: respostaErro('Pet não encontrado'),
        },
      },
    },
    '/pets/{id}/fotos': {
      parameters: [idPath('ID do pet')],
      post: {
        tags: ['Fotos'],
        summary: 'Envia imagens para o bucket',
        description:
          'Envia de 1 a 10 imagens (JPEG, PNG ou WebP, até 5 MB cada) no campo `fotos`. ' +
          'Os arquivos vão para o bucket em `pets/{petId}/{data}/{uuid}.ext`. ' +
          'A primeira foto do pet torna-se a principal automaticamente.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['fotos'],
                properties: {
                  fotos: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    maxItems: 10,
                    description: 'Arquivos de imagem',
                  },
                  dataFoto: {
                    type: 'string',
                    format: 'date',
                    example: '2025-06-10',
                    description:
                      'Data das fotos. Um único valor vale para todas; repita o campo para informar uma data por arquivo (mesma ordem). Padrão: hoje.',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Fotos enviadas',
            content: json(envelope({ type: 'array', items: { $ref: '#/components/schemas/Foto' } })),
          },
          400: respostaErro('Nenhum arquivo, tipo inválido, arquivo maior que 5 MB ou dataFoto inválida'),
          404: respostaErro('Pet não encontrado'),
        },
      },
      get: {
        tags: ['Fotos'],
        summary: 'Lista as fotos de um pet',
        description: 'Ordenadas por data da foto (mais antiga primeiro).',
        responses: {
          200: {
            description: 'Fotos do pet',
            content: json(envelope({ type: 'array', items: { $ref: '#/components/schemas/Foto' } })),
          },
          400: respostaErro('ID inválido'),
          404: respostaErro('Pet não encontrado'),
        },
      },
    },
    '/fotos/bucket': {
      get: {
        tags: ['Bucket'],
        summary: 'Lista os objetos do bucket',
        parameters: [
          {
            name: 'prefixo',
            in: 'query',
            required: false,
            description: 'Filtra objetos cujo caminho começa com o prefixo',
            schema: { type: 'string', example: 'pets/1/' },
          },
        ],
        responses: {
          200: {
            description: 'Objetos do bucket',
            content: json(envelope({ type: 'array', items: { $ref: '#/components/schemas/ObjetoBucket' } })),
          },
        },
      },
    },
    '/fotos/{id}/principal': {
      patch: {
        tags: ['Fotos'],
        summary: 'Define a foto principal do pet',
        description: 'A foto principal anterior do mesmo pet deixa de ser principal.',
        parameters: [idPath('ID da foto')],
        responses: {
          200: { description: 'Foto definida como principal', content: json(envelope({ $ref: '#/components/schemas/Foto' })) },
          400: respostaErro('ID inválido'),
          404: respostaErro('Foto não encontrada'),
        },
      },
    },
    '/fotos/{id}': {
      delete: {
        tags: ['Fotos'],
        summary: 'Exclui uma foto',
        description: 'Remove o objeto do bucket e o registro do banco.',
        parameters: [idPath('ID da foto')],
        responses: {
          200: { description: 'Foto excluída', content: json({ $ref: '#/components/schemas/Mensagem' }) },
          400: respostaErro('ID inválido'),
          404: respostaErro('Foto não encontrada'),
        },
      },
    },
    '/fotos/{id}/download': {
      get: {
        tags: ['Fotos'],
        summary: 'Baixa a imagem',
        description: 'A aplicação baixa o objeto do bucket e o devolve como anexo.',
        parameters: [idPath('ID da foto')],
        responses: {
          200: {
            description: 'Arquivo da imagem',
            headers: {
              'Content-Disposition': { schema: { type: 'string' }, description: 'attachment; filename="..."' },
            },
            content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } },
          },
          400: respostaErro('ID inválido'),
          404: respostaErro('Foto não encontrada'),
        },
      },
    },
  },
  components: {
    schemas: {
      PetEntrada: {
        type: 'object',
        required: ['nome', 'especie', 'responsavel', 'dataNascimento'],
        properties: {
          nome: { type: 'string', example: 'Thor' },
          especie: { type: 'string', example: 'Cachorro' },
          raca: { type: 'string', nullable: true, example: 'Golden Retriever' },
          responsavel: { type: 'string', example: 'Ana Souza' },
          dataNascimento: { type: 'string', format: 'date', example: '2020-03-15' },
        },
      },
      PetAtualizacao: {
        type: 'object',
        description: 'Todos os campos são opcionais',
        properties: {
          nome: { type: 'string' },
          especie: { type: 'string' },
          raca: { type: 'string', nullable: true },
          responsavel: { type: 'string' },
          dataNascimento: { type: 'string', format: 'date' },
        },
      },
      Pet: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Thor' },
          especie: { type: 'string', example: 'Cachorro' },
          raca: { type: 'string', nullable: true, example: 'Golden Retriever' },
          responsavel: { type: 'string', example: 'Ana Souza' },
          dataNascimento: { type: 'string', format: 'date-time', example: '2020-03-15T00:00:00.000Z' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PetListagem: {
        allOf: [
          { $ref: '#/components/schemas/Pet' },
          {
            type: 'object',
            properties: {
              fotoPrincipalUrl: {
                type: 'string',
                nullable: true,
                example: 'https://storage.googleapis.com/fatec-2026-grupo-a/pets/1/2025-06-10/uuid.jpg',
              },
              totalFotos: { type: 'integer', example: 3 },
            },
          },
        ],
      },
      PetDetalhe: {
        allOf: [
          { $ref: '#/components/schemas/Pet' },
          {
            type: 'object',
            properties: { fotos: { type: 'array', items: { $ref: '#/components/schemas/Foto' } } },
          },
        ],
      },
      Foto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 10 },
          petId: { type: 'integer', example: 1 },
          nomeArquivo: { type: 'string', example: 'thor1.jpg' },
          caminhoBucket: { type: 'string', example: 'pets/1/2025-06-10/3f2a...c1.jpg' },
          url: {
            type: 'string',
            format: 'uri',
            example: 'https://storage.googleapis.com/fatec-2026-grupo-a/pets/1/2025-06-10/3f2a...c1.jpg',
          },
          principal: { type: 'boolean', example: true },
          dataFoto: { type: 'string', format: 'date-time', example: '2025-06-10T00:00:00.000Z' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ObjetoBucket: {
        type: 'object',
        properties: {
          caminho: { type: 'string', example: 'pets/1/2025-06-10/3f2a...c1.jpg' },
          tamanho: { type: 'integer', description: 'Tamanho em bytes', example: 184320 },
          tipo: { type: 'string', example: 'image/jpeg' },
          url: { type: 'string', format: 'uri' },
        },
      },
      Mensagem: {
        type: 'object',
        properties: {
          sucesso: { type: 'boolean', example: true },
          mensagem: { type: 'string', example: 'Operação concluída com sucesso' },
        },
      },
      Erro: {
        type: 'object',
        properties: {
          sucesso: { type: 'boolean', example: false },
          erro: { type: 'string', example: 'Pet não encontrado' },
        },
      },
    },
  },
};

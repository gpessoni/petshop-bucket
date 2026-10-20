# 🛠️ Backend — Focinho Feliz

API REST em **Node.js + Express 5 + Prisma + PostgreSQL**. As imagens ficam no **Google Cloud Storage**; o banco guarda apenas os metadados e a URL pública.

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)

## 📑 Sumário

- [Pré-requisitos](#-pré-requisitos)
- [Como rodar](#-como-rodar)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Scripts](#-scripts)
- [Endpoints](#-endpoints)
- [Modelo de dados](#-modelo-de-dados)
- [Armazenamento de imagens](#-armazenamento-de-imagens)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Formato das respostas](#-formato-das-respostas)

## ✅ Pré-requisitos

- Node.js 20+ e npm
- PostgreSQL (local ou Docker)
- Uma Service Account do Google Cloud com permissão no bucket

## 🚀 Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Subir o PostgreSQL

Use um banco existente ou suba um com Docker:

```bash
docker run -d --name petshop-db \
  -e POSTGRES_USER=petshop -e POSTGRES_PASSWORD=petshop -e POSTGRES_DB=petshop \
  -p 5432:5432 postgres:16-alpine
```

### 3. Configurar o ambiente

```bash
cp .env.example .env
```

Edite o `.env` (veja a [tabela abaixo](#-variáveis-de-ambiente)).

### 4. Credenciais do Google Cloud

Salve o JSON da Service Account em `credentials/service-account.json` (pasta ignorada pelo Git) e aponte `GOOGLE_APPLICATION_CREDENTIALS` para ele. O nome do bucket vai em `GCS_BUCKET_NAME`.

### 5. Preparar o banco

```bash
npm run generate   # gera o Prisma Client
npm run migrate    # cria as tabelas
npm run seed       # opcional: cadastra 11 pets de exemplo
```

### 6. Iniciar o servidor

```bash
npm run dev        # desenvolvimento (reinicia ao salvar)
npm start          # produção
```

A API sobe em **http://localhost:3333**.

## 🔧 Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL | `postgresql://usuario:senha@localhost:5432/petshop?schema=public` |
| `PORT` | Porta da API | `3333` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Caminho do JSON da Service Account | `./credentials/service-account.json` |
| `GCS_BUCKET_NAME` | Nome do bucket | `fatec-2026-grupo-a` |

## 📜 Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor com reinício automático (`node --watch`) |
| `npm start` | Servidor normal |
| `npm run generate` | Gera o Prisma Client |
| `npm run migrate` | Aplica as migrations (`prisma migrate dev`) |
| `npm run seed` | Popula o banco com pets de exemplo (ignora se já houver dados) |

## 🔌 Endpoints

Base: `http://localhost:3333`

### Pets

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/pets` | Cria um pet |
| `GET` | `/pets` | Lista pets com `fotoPrincipalUrl` e `totalFotos` |
| `GET` | `/pets/:id` | Pet com todas as fotos, ordenadas por data |
| `PUT` | `/pets/:id` | Atualiza (campos parciais aceitos) |
| `DELETE` | `/pets/:id` | Remove o pet, suas fotos do banco **e** do bucket |

### Fotos

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/pets/:id/fotos` | Envia de 1 a 10 imagens (`multipart/form-data`) |
| `GET` | `/pets/:id/fotos` | Fotos do pet por data |
| `PATCH` | `/fotos/:id/principal` | Define a foto principal |
| `DELETE` | `/fotos/:id` | Remove do bucket e do banco |
| `GET` | `/fotos/:id/download` | Baixa a imagem |
| `GET` | `/fotos/bucket` | Lista objetos do bucket (`?prefixo=pets/1/`) |

### Exemplos

**Criar pet**

```bash
curl -X POST http://localhost:3333/pets \
  -H "Content-Type: application/json" \
  -d '{"nome":"Thor","especie":"Cachorro","raca":"Golden Retriever","responsavel":"Ana Souza","dataNascimento":"2020-03-15"}'
```

**Enviar fotos** (campo `fotos`; `dataFoto` vale para todas, ou repita o campo para uma data por arquivo)

```bash
curl -X POST http://localhost:3333/pets/1/fotos \
  -F "fotos=@./thor1.jpg" -F "fotos=@./thor2.jpg" \
  -F "dataFoto=2025-06-10"
```

### Regras

- Formatos aceitos: **JPEG, PNG e WebP**, até **5 MB** por imagem.
- A **primeira foto** do pet vira a principal automaticamente.
- O banco garante, com índice único parcial, **no máximo uma foto principal por pet**.
- Campos obrigatórios do pet: `nome`, `especie`, `responsavel`, `dataNascimento` (`raca` é opcional).
- CORS liberado para qualquer origem (uso em desenvolvimento).

## 🗄️ Modelo de dados

```mermaid
erDiagram
    PET ||--o{ FOTO : possui
    PET {
        int id PK
        string nome
        string especie
        string raca "opcional"
        string responsavel
        datetime dataNascimento
        datetime createdAt
        datetime updatedAt
    }
    FOTO {
        int id PK
        int petId FK
        string nomeArquivo
        string caminhoBucket
        string url
        boolean principal
        datetime dataFoto
        datetime createdAt
    }
```

Excluir um pet remove suas fotos em cascata.

## ☁️ Armazenamento de imagens

Os arquivos são salvos em `pets/{petId}/{data}/{uuid}.ext` e a URL pública é:

```
https://storage.googleapis.com/{bucket}/{caminho}
```

Ao excluir uma foto ou um pet, o arquivo é removido do bucket **antes** do banco; se o bucket falhar, o registro é mantido (nada fica órfão). No upload, se o banco falhar, o arquivo é apagado do bucket.

## 📁 Estrutura de pastas

```
backend/
├── prisma/
│   ├── schema.prisma        modelo de dados
│   ├── migrations/          histórico de migrations
│   └── seed.js              pets de exemplo
└── src/
    ├── server.js            inicialização
    ├── app.js               Express, CORS e tratamento de erros
    ├── config/              Prisma e Google Cloud Storage
    ├── routes/              rotas de pets e fotos
    ├── controllers/         camada HTTP
    ├── services/            regras de negócio e acesso ao bucket
    └── middlewares/         upload (multer) e validação de id
```

## 📦 Formato das respostas

Sucesso:

```json
{ "sucesso": true, "dados": { "id": 1, "nome": "Thor" } }
```

Erro:

```json
{ "sucesso": false, "erro": "Pet não encontrado" }
```

| Status | Quando |
|---|---|
| `400` | Dados inválidos, arquivo fora do formato ou maior que 5 MB |
| `404` | Pet, foto ou rota inexistente |
| `500` | Erro interno (detalhes só no log do servidor) |

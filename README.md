# Pet Shop — Backend (FATEC)

API em Node.js + Express + Prisma + PostgreSQL. As imagens ficam no Google Cloud Storage; o banco guarda apenas os metadados e a URL.

## 1. Instalar dependências
```bash
npm install
```

## 2. Configurar o PostgreSQL
Crie um banco (ex.: `petshop`) ou suba um com Docker:
```bash
docker run -d --name petshop-db -e POSTGRES_USER=petshop -e POSTGRES_PASSWORD=petshop \
  -e POSTGRES_DB=petshop -p 5432:5432 postgres:16-alpine
```

## 3. Variáveis de ambiente
```bash
cp .env.example .env
```
Edite o `.env`: `DATABASE_URL`, `PORT`, `GOOGLE_APPLICATION_CREDENTIALS` e `GCS_BUCKET_NAME`.

## 4. Prisma: client, migrations e seed
```bash
npm run generate   # gera o Prisma Client
npm run migrate    # aplica as migrations (cria as tabelas)
npm run seed       # cadastra 11 pets de exemplo
```

## 5. Credenciais do Google Cloud
Salve o JSON da Service Account em `credentials/service-account.json` (pasta ignorada pelo Git) e aponte `GOOGLE_APPLICATION_CREDENTIALS` para ele. O bucket do grupo vai em `GCS_BUCKET_NAME` (ex.: `fatec-2026-grupo-a`). Nunca envie o JSON para o Git.

## 6. Iniciar o servidor
```bash
npm run dev     # desenvolvimento (reinicia ao salvar)
npm start       # normal
```

## 7. Testar no Postman / Insomnia
Base: `http://localhost:3000`

| Método | Endpoint | Observação |
|---|---|---|
| POST | /pets | JSON: `nome`, `especie`, `raca` (opcional), `responsavel`, `dataNascimento` |
| GET | /pets | lista com `fotoPrincipalUrl` |
| GET | /pets/:id | pet + fotos ordenadas por data |
| PUT | /pets/:id | atualiza (campos parciais aceitos) |
| DELETE | /pets/:id | remove pet, fotos do banco e do bucket |
| POST | /pets/:id/fotos | `multipart/form-data`: campo `fotos` (1 a 10 arquivos) e `dataFoto` (ex.: `2025-06-10`; repita o campo para uma data por arquivo) |
| GET | /pets/:id/fotos | fotos do pet por data |
| PATCH | /fotos/:id/principal | define a foto principal |
| DELETE | /fotos/:id | remove do bucket e do banco |
| GET | /fotos/:id/download | baixa a imagem |
| GET | /fotos/bucket | lista objetos do bucket (`?prefixo=pets/1/`) |

Regras: JPEG, PNG ou WebP, até 5 MB por imagem. A primeira foto do pet vira a principal automaticamente. O banco garante (índice único parcial) no máximo uma foto principal por pet.

Os arquivos ficam em `pets/{petId}/{data}/{uuid}.ext` e a URL pública é `https://storage.googleapis.com/{bucket}/{caminho}`.

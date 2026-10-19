-- CreateTable
CREATE TABLE "Pet" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "raca" TEXT,
    "responsavel" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" SERIAL NOT NULL,
    "petId" INTEGER NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "caminhoBucket" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "dataFoto" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Foto_petId_dataFoto_idx" ON "Foto"("petId", "dataFoto");

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Garante no máximo uma foto principal por pet
CREATE UNIQUE INDEX "Foto_petId_principal_key" ON "Foto"("petId") WHERE "principal" = true;

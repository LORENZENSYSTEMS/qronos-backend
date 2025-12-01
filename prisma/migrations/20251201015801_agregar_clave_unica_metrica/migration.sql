/*
  Warnings:

  - A unique constraint covering the columns `[cliente_id]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresa_id]` on the table `Empresa` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cliente_id,empresa_id]` on the table `Metrica` will be added. If there are existing duplicate values, this will fail.
  - Made the column `cliente_id` on table `Metrica` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresa_id` on table `Metrica` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Metrica" DROP CONSTRAINT "Metrica_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "Metrica" DROP CONSTRAINT "Metrica_empresa_id_fkey";

-- AlterTable
ALTER TABLE "Metrica" ALTER COLUMN "cliente_id" SET NOT NULL,
ALTER COLUMN "empresa_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cliente_id_key" ON "Cliente"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_empresa_id_key" ON "Empresa"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "Metrica_cliente_id_empresa_id_key" ON "Metrica"("cliente_id", "empresa_id");

-- AddForeignKey
ALTER TABLE "Metrica" ADD CONSTRAINT "Metrica_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metrica" ADD CONSTRAINT "Metrica_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("empresa_id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[auth_uid]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[auth_uid]` on the table `Empresa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auth_uid` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auth_uid` to the `Empresa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "auth_uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "auth_uid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_auth_uid_key" ON "Cliente"("auth_uid");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_auth_uid_key" ON "Empresa"("auth_uid");

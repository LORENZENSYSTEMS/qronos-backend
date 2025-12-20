/*
  Warnings:

  - You are about to drop the `Notificacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notificacion" DROP CONSTRAINT "Notificacion_cliente_id_fkey";

-- DropTable
DROP TABLE "Notificacion";

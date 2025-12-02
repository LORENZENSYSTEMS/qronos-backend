-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('Admin', 'Regular');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "rol" "Rol" NOT NULL DEFAULT 'Regular';

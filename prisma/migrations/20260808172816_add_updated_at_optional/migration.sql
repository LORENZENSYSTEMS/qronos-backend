-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "categoria_id" INTEGER,
ADD COLUMN     "ciudad_id" INTEGER,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "destacada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pais_id" INTEGER,
ADD COLUMN     "popular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Pais" (
    "pais_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pais_pkey" PRIMARY KEY ("pais_id")
);

-- CreateTable
CREATE TABLE "Ciudad" (
    "ciudad_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "pais_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ciudad_pkey" PRIMARY KEY ("ciudad_id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "categoria_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("categoria_id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "notificacion_id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'general',
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_programada" TIMESTAMP(3),
    "enviada" BOOLEAN NOT NULL DEFAULT false,
    "filtros" JSONB,
    "empresa_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("notificacion_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pais_nombre_key" ON "Pais"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Pais_codigo_key" ON "Pais"("codigo");

-- CreateIndex
CREATE INDEX "Ciudad_pais_id_idx" ON "Ciudad"("pais_id");

-- CreateIndex
CREATE UNIQUE INDEX "Ciudad_nombre_pais_id_key" ON "Ciudad"("nombre", "pais_id");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE INDEX "Notificacion_empresa_id_idx" ON "Notificacion"("empresa_id");

-- CreateIndex
CREATE INDEX "Notificacion_enviada_idx" ON "Notificacion"("enviada");

-- CreateIndex
CREATE INDEX "Notificacion_fecha_programada_idx" ON "Notificacion"("fecha_programada");

-- AddForeignKey
ALTER TABLE "Ciudad" ADD CONSTRAINT "Ciudad_pais_id_fkey" FOREIGN KEY ("pais_id") REFERENCES "Pais"("pais_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_pais_id_fkey" FOREIGN KEY ("pais_id") REFERENCES "Pais"("pais_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_ciudad_id_fkey" FOREIGN KEY ("ciudad_id") REFERENCES "Ciudad"("ciudad_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria"("categoria_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("empresa_id") ON DELETE SET NULL ON UPDATE CASCADE;

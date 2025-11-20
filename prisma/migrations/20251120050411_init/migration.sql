-- CreateTable
CREATE TABLE "Cliente" (
    "cliente_id" SERIAL NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("cliente_id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "empresa_id" SERIAL NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("empresa_id")
);

-- CreateTable
CREATE TABLE "Metrica" (
    "metrica_id" SERIAL NOT NULL,
    "cliente_id" INTEGER,
    "empresa_id" INTEGER,
    "vecesScan" INTEGER NOT NULL,
    "puntos" INTEGER,

    CONSTRAINT "Metrica_pkey" PRIMARY KEY ("metrica_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_correo_key" ON "Cliente"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_correo_key" ON "Empresa"("correo");

-- AddForeignKey
ALTER TABLE "Metrica" ADD CONSTRAINT "Metrica_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("cliente_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metrica" ADD CONSTRAINT "Metrica_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("empresa_id") ON DELETE SET NULL ON UPDATE CASCADE;

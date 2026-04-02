-- CreateTable
CREATE TABLE "Producto" (
    "producto_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "descripcion" TEXT,
    "empresa_id" INTEGER NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("producto_id")
);

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("empresa_id") ON DELETE RESTRICT ON UPDATE CASCADE;

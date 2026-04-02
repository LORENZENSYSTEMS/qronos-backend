import { prisma } from "../../plugins/database.js";

export class ProductoService {
    constructor(fastify) {
        this.fastify = fastify;
    }

    async getProductosByEmpresa(empresaId) {
        try {
            const productos = await prisma.producto.findMany({
                where: { empresa_id: Number(empresaId) },
                take: 50,
            });
            return { code: 200, productos };
        } catch (error) {
            this.fastify.log.error(error);
            return { code: 500, message: "Error al obtener los productos de la empresa", error: error.message };
        }
    }

    async createProducto(data) {
        try {
            const nuevoProducto = await prisma.producto.create({
                data: {
                    nombre: data.nombre,
                    precio: Number(data.precio),
                    imagenUrl: data.imagenUrl,
                    descripcion: data.descripcion || null,
                    empresa_id: Number(data.empresa_id),
                },
            });
            return { code: 201, message: "Producto creado con éxito", producto: nuevoProducto };
        } catch (error) {
            this.fastify.log.error(error);
            return { code: 500, message: "Error al crear el producto", error: error.message };
        }
    }
}

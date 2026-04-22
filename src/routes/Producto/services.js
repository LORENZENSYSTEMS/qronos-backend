import { prisma } from "../../plugins/database.js";

export class ProductoService {
    constructor(fastify) {
        this.fastify = fastify;
    }

    // Obtener productos por empresa
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

    // Crear producto
    async createProducto(data) {
        try {
            const nuevoProducto = await prisma.producto.create({
                data: {
                    nombre: data.nombre,
                    precio: parseFloat(data.precio),
                    imagenUrl: data.imagenUrl,
                    descripcion: data.descripcion || null,
                    empresa_id: parseInt(data.empresa_id),
                },
            });
            return { code: 201, message: "Producto creado con éxito", producto: nuevoProducto };
        } catch (error) {
            this.fastify.log.error(error);
            return { code: 500, message: "Error al crear el producto en la base de datos", error: error.message };
        }
    }

    // Eliminar producto
    async deleteProducto(productoId) {
        try {
            const id = Number(productoId);
            const productoExistente = await prisma.producto.findUnique({
                where: { producto_id: id }
            });

            if (!productoExistente) {
                return { code: 404, message: "Producto no encontrado" };
            }

            await prisma.producto.delete({
                where: { producto_id: id }
            });

            return { code: 200, success: true, message: 'Producto eliminado' };

        } catch (error) {
            this.fastify.log.error(error);
            return { code: 500, message: "Error al eliminar el producto de la base de datos", error: error.message };
        }
    }

    // Actualizar producto
    async updateProducto(productoId, data) {
        try {
            const id = Number(productoId);
            const productoExistente = await prisma.producto.findUnique({
                where: { producto_id: id }
            });

            if (!productoExistente) {
                return { code: 404, message: "Producto no encontrado" };
            }

            const updateData = {};
            if (data.nombre) updateData.nombre = data.nombre;
            if (data.precio) updateData.precio = parseFloat(data.precio);
            if (data.imagenUrl) updateData.imagenUrl = data.imagenUrl;
            if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;

            const productoActualizado = await prisma.producto.update({
                where: { producto_id: id },
                data: updateData,
            });

            return { code: 200, message: "Producto actualizado con éxito", producto: productoActualizado };
        } catch (error) {
            this.fastify.log.error(error);
            return { code: 500, message: "Error al actualizar el producto en la base de datos", error: error.message };
        }
    }
}

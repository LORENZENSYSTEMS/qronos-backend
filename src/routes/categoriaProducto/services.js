import prisma from "../../plugins/database.js";

export class CategoriaProductoService {
    constructor(fastify) {
        this.fastify = fastify;
    }

    // Obtener todas las categorías (activas e inactivas, útil para el admin)
    async getCategorias() {
        try {
            const categorias = await prisma.categoriaProducto.findMany({
                orderBy: { nombre: 'asc' }
            });
            return { code: 200, categorias };
        } catch (error) {
            this.fastify.log.error(error);
            return { code: 500, message: "Error al obtener las categorías de productos", error: error.message };
        }
    }

    // Crear una nueva categoría (Solo Admin)
    async createCategoria(data) {
        try {
            const nuevaCategoria = await prisma.categoriaProducto.create({
                data: {
                    nombre: data.nombre,
                    activo: data.activo !== undefined ? data.activo : true
                },
            });
            return { code: 201, message: "Categoría creada con éxito", categoria: nuevaCategoria };
        } catch (error) {
            this.fastify.log.error(error);
            // P2002 es el código de Prisma para violación de restricción única (Unique constraint)
            if (error.code === 'P2002') {
                return { code: 400, message: "Ya existe una categoría con este nombre" };
            }
            return { code: 500, message: "Error al crear la categoría", error: error.message };
        }
    }

    // Actualizar una categoría (Solo Admin)
    async updateCategoria(categoriaId, data) {
        try {
            const id = Number(categoriaId);
            const categoriaExistente = await prisma.categoriaProducto.findUnique({
                where: { categoria_prod_id: id }
            });

            if (!categoriaExistente) {
                return { code: 404, message: "Categoría no encontrada" };
            }

            const categoriaActualizada = await prisma.categoriaProducto.update({
                where: { categoria_prod_id: id },
                data: {
                    nombre: data.nombre !== undefined ? data.nombre : categoriaExistente.nombre,
                    activo: data.activo !== undefined ? data.activo : categoriaExistente.activo
                },
            });

            return { code: 200, message: "Categoría actualizada con éxito", categoria: categoriaActualizada };
        } catch (error) {
            this.fastify.log.error(error);
            if (error.code === 'P2002') {
                return { code: 400, message: "Ya existe otra categoría con este nombre" };
            }
            return { code: 500, message: "Error al actualizar la categoría", error: error.message };
        }
    }

    // Eliminar una categoría (Solo Admin)
    async deleteCategoria(categoriaId) {
        try {
            const id = Number(categoriaId);
            const categoriaExistente = await prisma.categoriaProducto.findUnique({
                where: { categoria_prod_id: id }
            });

            if (!categoriaExistente) {
                return { code: 404, message: "Categoría no encontrada" };
            }

            await prisma.categoriaProducto.delete({
                where: { categoria_prod_id: id }
            });

            return { code: 200, success: true, message: 'Categoría eliminada correctamente' };
        } catch (error) {
            this.fastify.log.error(error);
            // P2003 es el error de Prisma si intentas borrar una categoría que ya tiene productos asociados
            if (error.code === 'P2003') {
                return { code: 400, message: "No se puede eliminar la categoría porque tiene productos asociados. Inactívala en su lugar." };
            }
            return { code: 500, message: "Error al eliminar la categoría", error: error.message };
        }
    }
}
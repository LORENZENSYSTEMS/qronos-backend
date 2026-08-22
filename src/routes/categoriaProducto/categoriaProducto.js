import { CategoriaProductoService } from "./services.js";

export default async function categoriaProductoRoutes(fastify) {
    const categoriaService = new CategoriaProductoService(fastify);

    // --- OBTENER TODAS LAS CATEGORÍAS ---
    // GET /api/categorias-productos
    fastify.get('/categorias-productos', async (request, reply) => {
        try {
            const result = await categoriaService.getCategorias();
            return reply.code(result.code).send(result.code === 200 ? result.categorias : result);
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ message: "Error interno del servidor", error: error.message });
        }
    });

    // --- CREAR CATEGORÍA ---
    // POST /api/categorias-productos
    fastify.post('/categorias-productos', async (request, reply) => {
        try {
            const { nombre } = request.body;
            
            if (!nombre) {
                return reply.code(400).send({ message: "El nombre de la categoría es obligatorio" });
            }

            const result = await categoriaService.createCategoria(request.body);
            return reply.code(result.code).send(result.code === 201 ? result.categoria : result);
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ message: "Error interno del servidor", error: error.message });
        }
    });

    // --- ACTUALIZAR CATEGORÍA ---
    // PUT /api/categorias-productos/:id
    fastify.put('/categorias-productos/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const categoriaId = parseInt(id, 10);

            if (isNaN(categoriaId)) {
                return reply.code(400).send({ message: "ID de categoría inválido." });
            }

            const result = await categoriaService.updateCategoria(categoriaId, request.body);
            return reply.code(result.code).send(result.code === 200 ? result.categoria : result);
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ message: "Error interno del servidor", error: error.message });
        }
    });

    // --- ELIMINAR CATEGORÍA ---
    // DELETE /api/categorias-productos/:id
    fastify.delete('/categorias-productos/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const categoriaId = parseInt(id, 10);

            if (isNaN(categoriaId)) {
                return reply.code(400).send({ message: "ID de categoría inválido." });
            }

            const result = await categoriaService.deleteCategoria(categoriaId);
            return reply.code(result.code).send(result);
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ message: "Error interno del servidor", error: error.message });
        }
    });
}
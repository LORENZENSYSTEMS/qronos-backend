// routes/paises/categorias.routes.js
import { AdminService } from './services/adminServices.js';

export default async function categoriasRoutes(fastify, options) {
  const adminService = new AdminService();

  // GET /api/categorias - Obtener todas las categorías
  fastify.get('/categorias', async (request, reply) => {
    try {
      const categorias = await adminService.getAllCategorias();
      return reply.send(categorias);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // POST /api/categorias - Agregar categoría
  fastify.post('/categorias', async (request, reply) => {
    try {
      const { nombre } = request.body;
      
      if (!nombre) {
        return reply.code(400).send({ error: 'El nombre es obligatorio' });
      }

      const categoria = await adminService.createCategoria({ nombre });
      return reply.code(201).send(categoria);
    } catch (error) {
      if (error.code === 'P2002') {
        return reply.code(400).send({ 
          error: 'La categoría ya existe' 
        });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // DELETE /api/categorias/:id - Eliminar categoría
  fastify.delete('/categorias/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const categoria = await adminService.deleteCategoria(parseInt(id));
      return reply.send(categoria);
    } catch (error) {
      if (error.message.includes('No se puede eliminar')) {
        return reply.code(400).send({ error: error.message });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });
}
// routes/paises/paises.routes.js

import { AdminService } from "./services/adminServices.js";

export default async function paisesRoutes(fastify, options) {
  const adminService = new AdminService();

  // GET /api/paises - Obtener todos los países
  fastify.get('/paises', async (request, reply) => {
    try {
      const paises = await adminService.getAllPaises();
      return reply.send(paises);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // POST /api/paises - Agregar país
  fastify.post('/paises', async (request, reply) => {
    try {
      const { nombre, codigo } = request.body;
      
      if (!nombre) {
        return reply.code(400).send({ error: 'El nombre es obligatorio' });
      }

      const pais = await adminService.createPais({ nombre, codigo });
      return reply.code(201).send(pais);
    } catch (error) {
      if (error.code === 'P2002') {
        return reply.code(400).send({ 
          error: 'El país ya existe o el código está duplicado' 
        });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // DELETE /api/paises/:id - Eliminar país (soft delete)
  fastify.delete('/paises/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const pais = await adminService.deletePais(parseInt(id));
      return reply.send(pais);
    } catch (error) {
      if (error.message.includes('No se puede eliminar')) {
        return reply.code(400).send({ error: error.message });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });
}
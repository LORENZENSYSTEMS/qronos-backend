// routes/paises/ciudades.routes.js
import { AdminService } from './services/adminServices.js';

export default async function ciudadesRoutes(fastify, options) {
  const adminService = new AdminService();

  // GET /api/ciudades - Obtener ciudades (con filtro por país)
  fastify.get('/ciudades', async (request, reply) => {
    try {
      const { pais_id } = request.query;
      const ciudades = await adminService.getCiudadesByPais(
        pais_id ? parseInt(pais_id) : null
      );
      return reply.send(ciudades);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // POST /api/ciudades - Agregar ciudad
  fastify.post('/ciudades', async (request, reply) => {
    try {
      const { nombre, pais_id } = request.body;
      
      if (!nombre || !pais_id) {
        return reply.code(400).send({ 
          error: 'Nombre y pais_id son obligatorios' 
        });
      }

      const ciudad = await adminService.createCiudad({ 
        nombre, 
        pais_id: parseInt(pais_id) 
      });
      return reply.code(201).send(ciudad);
    } catch (error) {
      if (error.code === 'P2002') {
        return reply.code(400).send({ 
          error: 'La ciudad ya existe en este país' 
        });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // DELETE /api/ciudades/:id - Eliminar ciudad
  fastify.delete('/ciudades/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const ciudad = await adminService.deleteCiudad(parseInt(id));
      return reply.send(ciudad);
    } catch (error) {
      if (error.message.includes('No se puede eliminar')) {
        return reply.code(400).send({ error: error.message });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });
}
import { ValidationError } from '../Services/services.js';
import { enviarError } from './enviarError.js';

export default async function ciudadControllerRoutes(fastify, options) {
  const { ciudadService } = options;

  fastify.get('/ciudades', async (request, reply) => {
    try {
      const { pais_id: paisId } = request.query;
      const ciudades = await ciudadService.getCiudadesByPais(
        paisId ? parseInt(paisId, 10) : null
      );
      return reply.send(ciudades);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.post('/ciudades', async (request, reply) => {
    try {
      const { nombre, pais_id: paisId } = request.body;

      if (!nombre || !paisId) {
        throw new ValidationError('Nombre y pais_id son obligatorios');
      }

      const ciudad = await ciudadService.createCiudad({
        nombre,
        pais_id: parseInt(paisId, 10),
      });
      return reply.code(201).send(ciudad);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.delete('/ciudades/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const ciudad = await ciudadService.deleteCiudad(parseInt(id, 10));
      return reply.send(ciudad);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });
}

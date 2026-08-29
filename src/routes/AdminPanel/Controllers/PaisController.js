import { ValidationError } from '../Services/services.js';
import { enviarError } from './enviarError.js';

export default async function paisControllerRoutes(fastify, options) {
  const { paisService } = options;

  fastify.get('/paises', async (request, reply) => {
    try {
      const paises = await paisService.getAllPaises();
      return reply.send(paises);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.post('/paises', async (request, reply) => {
    try {
      const { nombre, codigo } = request.body;

      if (!nombre) {
        throw new ValidationError('El nombre es obligatorio');
      }

      const pais = await paisService.createPais({ nombre, codigo });
      return reply.code(201).send(pais);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.delete('/paises/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const pais = await paisService.deletePais(parseInt(id, 10));
      return reply.send(pais);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });
}

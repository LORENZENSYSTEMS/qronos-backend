import { ValidationError } from '../Services/services.js';
import { enviarError } from './enviarError.js';

export default async function categoriaControllerRoutes(fastify, options) {
  const { categoriaService } = options;

  fastify.get('/categorias', async (request, reply) => {
    try {
      const categorias = await categoriaService.getAllCategorias();
      return reply.send(categorias);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.post('/categorias', async (request, reply) => {
    try {
      const { nombre } = request.body;

      if (!nombre) {
        throw new ValidationError('El nombre es obligatorio');
      }

      const categoria = await categoriaService.createCategoria({ nombre });
      return reply.code(201).send(categoria);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.delete('/categorias/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const categoria = await categoriaService.deleteCategoria(parseInt(id, 10));
      return reply.send(categoria);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });
}

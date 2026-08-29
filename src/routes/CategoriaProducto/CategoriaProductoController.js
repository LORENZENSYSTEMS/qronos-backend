import { CategoriaProductoService, AppError, ValidationError } from './Services/services.js';
import { CategoriaProductoRepository } from './Repositories/CategoriaProductoRepository.js';

function enviarError(reply, err) {
  if (err instanceof AppError) {
    return reply.code(err.status).send({ message: err.message, code: err.status });
  }
  console.error(err);
  return reply.code(500).send({ message: 'Error interno del servidor', error: err.message, code: 500 });
}

export default async function categoriaProductoRoutes(fastify) {
  const categoriaProductoRepository = new CategoriaProductoRepository();
  const categoriaService = new CategoriaProductoService({ repository: categoriaProductoRepository });

  // GET /api/categorias-productos
  fastify.get('/categorias-productos', async (request, reply) => {
    try {
      const result = await categoriaService.getCategorias();
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // POST /api/categorias-productos
  fastify.post('/categorias-productos', async (request, reply) => {
    try {
      if (!request.body?.nombre) {
        throw new ValidationError('El nombre de la categoría es obligatorio');
      }
      const result = await categoriaService.createCategoria(request.body);
      return reply.code(201).send({ ...result, code: 201 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // PUT /api/categorias-productos/:id
  fastify.put('/categorias-productos/:id', async (request, reply) => {
    try {
      const categoriaId = parseInt(request.params.id, 10);
      if (isNaN(categoriaId)) {
        throw new ValidationError('ID de categoría inválido.');
      }
      const result = await categoriaService.updateCategoria(categoriaId, request.body);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // DELETE /api/categorias-productos/:id
  fastify.delete('/categorias-productos/:id', async (request, reply) => {
    try {
      const categoriaId = parseInt(request.params.id, 10);
      if (isNaN(categoriaId)) {
        throw new ValidationError('ID de categoría inválido.');
      }
      const result = await categoriaService.deleteCategoria(categoriaId);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });
}

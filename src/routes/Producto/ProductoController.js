import { ProductoService, AppError, ValidationError } from './Services/services.js';
import { ProductoRepository } from './Repositories/ProductoRepository.js';
import { CategoriaProductoRepository } from '../CategoriaProducto/Repositories/CategoriaProductoRepository.js';
import { uploadToS3 } from '../../utils/s3Config.js';

function validarProductoId(id) {
  const productoId = parseInt(id, 10);
  if (isNaN(productoId)) {
    throw new ValidationError('ID de producto inválido. Debe ser un número.');
  }
  return productoId;
}

function enviarError(reply, err) {
  if (err instanceof AppError) {
    return reply.code(err.status).send({ message: err.message, code: err.status });
  }
  console.error(err);
  return reply.code(500).send({ message: 'Error interno del servidor', error: err.message, code: 500 });
}

async function leerMultipart(request) {
  const data = {};
  let fileBuffer = null;
  let fileName = '';
  let mimetype = '';

  const parts = request.parts();
  for await (const part of parts) {
    if (part.file) {
      fileBuffer = await part.toBuffer();
      fileName = part.filename;
      mimetype = part.mimetype;
    } else {
      data[part.fieldname] = part.value;
    }
  }

  return { data, fileBuffer, fileName, mimetype };
}

export default async function productoRoutes(fastify) {
  const productoRepository = new ProductoRepository();
  const categoriaProductoRepository = new CategoriaProductoRepository();
  const productoService = new ProductoService({ productoRepository, categoriaProductoRepository });

  fastify.get('/empresas/:id/productos', async (request, reply) => {
    try {
      const { id } = request.params;
      const result = await productoService.getProductosByEmpresa(id);
      return reply.code(200).send(result.productos);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.get('/empresas/:id/categorias-disponibles', async (request, reply) => {
    try {
      const { id } = request.params;
      const result = await productoService.getCategoriasConProductosByEmpresa(id);
      return reply.code(200).send(result.categorias);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.post('/productos', async (request, reply) => {
    if (!request.isMultipart()) {
      return reply.code(400).send({ message: 'La petición debe ser multipart/form-data' });
    }

    try {
      const { data, fileBuffer, fileName, mimetype } = await leerMultipart(request);

      if (!data.nombre || !data.precio || !data.empresa_id || !data.categoria_prod_id || !fileBuffer) {
        return reply.code(400).send({
          message:
            'Faltan campos obligatorios: nombre, precio, empresa_id, categoria_prod_id y la imagen del producto',
        });
      }

      const imageUrl = await uploadToS3(fileBuffer, fileName, mimetype, 'productos');

      const result = await productoService.createProducto({
        ...data,
        imagenUrl: imageUrl,
      });

      return reply.code(201).send(result.producto);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        message: 'Error al procesar la creación del producto',
        error: error.message,
      });
    }
  });

  fastify.delete('/productos/:id', async (request, reply) => {
    try {
      const productoId = validarProductoId(request.params.id);
      const result = await productoService.deleteProducto(productoId);
      return reply.code(200).send(result);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.put('/productos/:id', async (request, reply) => {
    try {
      const productoId = validarProductoId(request.params.id);
      const { data, fileBuffer, fileName, mimetype } = request.isMultipart()
        ? await leerMultipart(request)
        : { data: { ...request.body }, fileBuffer: null, fileName: '', mimetype: '' };

      let imageUrl = data.imagenUrl;
      if (fileBuffer) {
        imageUrl = await uploadToS3(fileBuffer, fileName, mimetype, 'productos');
      }

      const result = await productoService.updateProducto(productoId, {
        ...data,
        imagenUrl: imageUrl,
      });

      return reply.code(200).send(result.producto);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });
}

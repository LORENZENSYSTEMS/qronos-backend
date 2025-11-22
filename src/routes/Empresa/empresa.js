import { EmpresaService } from "./services.js"; // Asegúrate de que la ruta de importación sea correcta

export default async function empresaRoutes(fastify) {
  const empresaService = new EmpresaService(fastify);
  
  // Crear Empresa
  fastify.post('/', async (request, reply) => {
    const result = await empresaService.createEmpresa(request.body);
    
    if (result.code === 201) {
      return reply.code(201).send(result.empresa);
    } else {
      return reply.code(result.code).send(result);
    }
  });

  // Obtener todas
  fastify.get('/', async (request, reply) => {
    const result = await empresaService.getAllEmpresas();

    if (result.code === 200) {
      return reply.code(200).send(result.empresas);
    } else {
      return reply.code(result.code).send(result);
    }
  });

  // Obtener por ID
  fastify.get('/:id', async (request, reply) => {
    const result = await empresaService.getEmpresaById(request.params.id);

    if (result.code === 200) {
      return reply.code(200).send(result.empresa);
    } else {
      return reply.code(result.code).send(result);
    }
  });

  // Actualizar
  fastify.put('/:id', async (request, reply) => {
    const result = await empresaService.updateEmpresa(request.params.id, request.body);

    if (result.code === 200) {
      return reply.code(200).send(result.empresa);
    } else {
      return reply.code(result.code).send(result);
    }
  });

  // Eliminar
  fastify.delete('/:id', async (request, reply) => {
    const result = await empresaService.deleteEmpresa(request.params.id);

    if (result.code === 200) {
      return reply.code(200).send(result); // Devuelve mensaje de éxito y objeto eliminado
    } else {
      return reply.code(result.code).send(result);
    }
  });
}
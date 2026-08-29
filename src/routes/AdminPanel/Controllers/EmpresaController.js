import { enviarError } from './enviarError.js';

export default async function empresaControllerRoutes(fastify, options) {
  const { empresaService } = options;

  fastify.patch('/empresas/:id/destacar', async (request, reply) => {
    try {
      const { id } = request.params;
      const { destacada, popular } = request.body;

      const empresa = await empresaService.toggleDestacada(parseInt(id, 10), destacada, popular);
      return reply.send(empresa);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.get('/empresas/destacadas', async (request, reply) => {
    try {
      const empresas = await empresaService.getEmpresasDestacadas();
      return reply.send(empresas);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });
}

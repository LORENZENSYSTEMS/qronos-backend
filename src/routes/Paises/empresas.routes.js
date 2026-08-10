// routes/paises/empresas.routes.js
import { AdminService } from './services/adminServices.js';

export default async function empresasDestacadasRoutes(fastify, options) {
  const adminService = new AdminService();

  // PATCH /api/empresas/:id/destacar - Marcar/desmarcar como destacada
  fastify.patch('/empresas/:id/destacar', async (request, reply) => {
    try {
      const { id } = request.params;
      const { destacada, popular } = request.body;

      const empresa = await adminService.toggleDestacada(
        parseInt(id),
        destacada,
        popular
      );
      
      return reply.send(empresa);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // GET /api/empresas/destacadas - Obtener tiendas destacadas
  fastify.get('/empresas/destacadas', async (request, reply) => {
    try {
      const empresas = await adminService.getEmpresasDestacadas();
      return reply.send(empresas);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });
}
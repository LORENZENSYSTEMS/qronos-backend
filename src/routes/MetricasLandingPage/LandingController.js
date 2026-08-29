import { LandingPageService, AppError } from './Services/services.js';
import { LandingPageRepository } from './Repositories/LandingPageRepository.js';

function enviarError(reply, err) {
  if (err instanceof AppError) {
    return reply.code(err.status).send({ ok: false, message: err.message });
  }
  console.error(err);
  return reply
    .code(500)
    .send({ ok: false, message: 'Error al obtener las métricas de la base de datos' });
}

export default async function landingRoutes(fastify) {
  const repository = new LandingPageRepository();
  const landingService = new LandingPageService({ repository });

  fastify.get('/metricas', async (request, reply) => {
    try {
      const data = await landingService.getMetricasLandingPage();
      return data;
    } catch (err) {
      return enviarError(reply, err);
    }
  });
}

import {
  NotificacionService,
  ExpoPushService,
  AppError,
  ValidationError,
} from './Services/services.js';
import { ClienteTokenRepository } from './Repositories/ClienteTokenRepository.js';
import { NotificacionRepository } from './Repositories/NotificacionRepository.js';

function enviarError(reply, err) {
  if (err instanceof AppError) {
    return reply.code(err.status).send({ success: false, error: err.message });
  }
  console.error(err);
  return reply.code(500).send({ success: false, error: err.message });
}

export default async function notificacionRoutes(fastify) {
  const clienteTokenRepository = new ClienteTokenRepository();
  const notificacionRepository = new NotificacionRepository();
  const expoPushService = new ExpoPushService();
  const notificacionService = new NotificacionService({
    clienteTokenRepository,
    notificacionRepository,
    expoPushService,
  });

  fastify.post('/send-to-user', async (request, reply) => {
    try {
      const { userId, title, body, data } = request.body;

      if (!userId || !title || !body) {
        throw new ValidationError('Faltan campos: userId, title o body');
      }

      const result = await notificacionService.sendToUser({ userId, title, body, data });
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.post('/send-by-filters', async (request, reply) => {
    try {
      const { filters, title, body, data } = request.body;

      if (!title || !body) {
        throw new ValidationError('Faltan campos: title o body');
      }

      if (!filters || Object.keys(filters).length === 0) {
        throw new ValidationError('Debes proporcionar al menos un filtro');
      }

      const result = await notificacionService.sendByFilters({ filters, title, body, data });
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.post('/send-to-all', async (request, reply) => {
    try {
      const { title, body, data } = request.body;

      if (!title || !body) {
        throw new ValidationError('Faltan campos: title o body');
      }

      const result = await notificacionService.sendToAll({ title, body, data });
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.get('/history', async (request, reply) => {
    try {
      const { page = 1, limit = 20 } = request.query;
      const result = await notificacionService.getNotifications({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });

  fastify.get('/stats', async (request, reply) => {
    try {
      const result = await notificacionService.getStats();
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return enviarError(reply, error);
    }
  });
}

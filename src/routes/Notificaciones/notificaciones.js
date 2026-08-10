// notifications.js
import { NotificationService } from "./services.js";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function notificationRoutes(fastify, options) {
  const notificationService = new NotificationService();

  // ✅ 1. Enviar notificación a usuario específico
  fastify.post('/send-to-user', async (request, reply) => {
    try {
      const { userId, title, body, data } = request.body;

      if (!userId || !title || !body) {
        return reply.code(400).send({ 
          error: 'Faltan campos: userId, title o body' 
        });
      }

      // Obtener el token del usuario (1 query optimizada)
      const cliente = await prisma.cliente.findUnique({
        where: { cliente_id: userId },
        select: { pushToken: true }
      });

      if (!cliente?.pushToken) {
        return reply.code(404).send({ 
          error: 'Usuario no tiene token de notificación' 
        });
      }

      // Enviar notificación
      const result = await notificationService.sendToUser(
        cliente.pushToken, 
        title, 
        body, 
        data
      );

      // Guardar en historial
      await notificationService.saveNotification({
        titulo: title,
        mensaje: body,
        tipo: 'general',
        enviada: true,
        total_enviados: 1,
        filtros: { usuarios_especificos: [userId] }
      });

      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ✅ 2. Enviar por filtros (país, ciudad, categoría)
  fastify.post('/send-by-filters', async (request, reply) => {
    try {
      const { filters, title, body, data } = request.body;

      if (!title || !body) {
        return reply.code(400).send({ 
          error: 'Faltan campos: title o body' 
        });
      }

      // Validar filtros
      if (!filters || Object.keys(filters).length === 0) {
        return reply.code(400).send({ 
          error: 'Debes proporcionar al menos un filtro' 
        });
      }

      // Enviar notificaciones por filtros
      const result = await notificationService.sendByFilters(
        filters, 
        title, 
        body, 
        data
      );

      // Guardar en historial
      await notificationService.saveNotification({
        titulo: title,
        mensaje: body,
        tipo: 'promocion',
        enviada: true,
        total_enviados: result.usuarios_alcance || 0,
        filtros: filters
      });

      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ✅ 3. Enviar a todos los usuarios
  fastify.post('/send-to-all', async (request, reply) => {
    try {
      const { title, body, data } = request.body;

      if (!title || !body) {
        return reply.code(400).send({ 
          error: 'Faltan campos: title o body' 
        });
      }

      // Obtener todos los tokens (1 query optimizada)
      const clientes = await prisma.cliente.findMany({
        where: { pushToken: { not: null } },
        select: { pushToken: true }
      });

      const tokens = clientes.map(c => c.pushToken).filter(Boolean);

      if (tokens.length === 0) {
        return reply.code(404).send({ 
          error: 'No hay usuarios con tokens registrados' 
        });
      }

      const result = await notificationService.sendToMultiple(
        tokens, 
        title, 
        body, 
        data
      );

      // Guardar en historial
      await notificationService.saveNotification({
        titulo: title,
        mensaje: body,
        tipo: 'general',
        enviada: true,
        total_enviados: tokens.length,
        filtros: { todos: true }
      });

      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ✅ 4. Obtener historial de notificaciones
  fastify.get('/history', async (request, reply) => {
    try {
      const { page = 1, limit = 20 } = request.query;
      
      const result = await notificationService.getNotifications(
        parseInt(page), 
        parseInt(limit)
      );
      
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ✅ 5. Obtener estadísticas para el dashboard
  fastify.get('/stats', async (request, reply) => {
    try {
      const [totalNotificaciones, totalUsuarios, tokensValidos] = await Promise.all([
        prisma.notificacion.count(),
        prisma.cliente.count(),
        prisma.cliente.count({
          where: { pushToken: { not: null } }
        })
      ]);

      const ultimos7Dias = await prisma.notificacion.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });

      return reply.send({
        totalNotificaciones,
        totalUsuarios,
        tokensValidos,
        ultimos7Dias,
        porcentajeTokens: Math.round((tokensValidos / totalUsuarios) * 100)
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: error.message 
      });
    }
  });
}
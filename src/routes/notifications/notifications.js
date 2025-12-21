import { NotificationService } from "./services.js";

export default async function notificationRoutes(fastify, options) {
    
    const notificationService = new NotificationService();

  fastify.post('/send', async (request, reply) => {
    try {
      const { expoToken, title, body, data } = request.body;

      if (!expoToken || !title || !body) {
        return reply.code(400).send({ 
          error: 'Faltan campos obligatorios: expoToken, title o body' 
        });
      }

      const result = await notificationService.sendPushNotification(
        expoToken, 
        title, 
        body, 
        data
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

}
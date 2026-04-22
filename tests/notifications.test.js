import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import notificationRoutes from '../src/routes/notifications/notifications.js';

// Mock de Expo SDK
vi.mock('expo-server-sdk', () => {
  function Expo() {}
  Expo.prototype.chunkPushNotifications = vi.fn().mockReturnValue([[{ to: 'token' }]]);
  Expo.prototype.sendPushNotificationsAsync = vi.fn().mockResolvedValue([{ status: 'ok' }]);
  Expo.isExpoPushToken = vi.fn().mockReturnValue(true);
  return { Expo };
});

describe('Suite de Pruebas: Notificaciones', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(notificationRoutes);
    await app.ready();
  });

  describe('POST /send', () => {
    it('debe enviar una notificación exitosamente (Happy Path)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/send',
        payload: {
          expoToken: 'ExponentPushToken[xxx]',
          title: 'Hola',
          body: 'Prueba de notificación'
        },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).success).toBe(true);
    });

    it('debe retornar 400 si faltan campos obligatorios', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/send',
        payload: { title: 'Solo título' },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toContain('Faltan campos obligatorios');
    });
  });
});

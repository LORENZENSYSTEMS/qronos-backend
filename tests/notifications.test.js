import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import notificacionRoutes from '../src/routes/Notificaciones/NotificacionController.js';
import { prisma } from '../src/plugins/database.js';

vi.mock('../src/plugins/database.js', () => {
  const prisma = {
    cliente: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    notificacion: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  };
  return { prisma, default: prisma };
});

vi.mock('expo-server-sdk', () => {
  function Expo() {}
  Expo.prototype.chunkPushNotifications = vi.fn().mockImplementation((messages) => [messages]);
  Expo.prototype.sendPushNotificationsAsync = vi.fn().mockResolvedValue([{ status: 'ok' }]);
  Expo.isExpoPushToken = vi.fn().mockReturnValue(true);
  return { Expo };
});

describe('Suite de Pruebas: Notificaciones', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(notificacionRoutes);
    await app.ready();
  });

  describe('POST /send-to-user', () => {
    it('debe enviar una notificación a un usuario y guardar historial (Happy Path)', async () => {
      prisma.cliente.findUnique.mockResolvedValue({ pushToken: 'ExponentPushToken[abc]' });
      prisma.notificacion.create.mockResolvedValue({ notificacion_id: 1 });

      const response = await app.inject({
        method: 'POST',
        url: '/send-to-user',
        payload: { userId: 1, title: 'Hola', body: 'Mensaje' },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).success).toBe(true);
      expect(prisma.notificacion.create).toHaveBeenCalled();
    });

    it('debe retornar 400 si faltan campos obligatorios', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/send-to-user',
        payload: { title: 'Solo título' },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toContain('Faltan campos');
    });

    it('debe retornar 404 si el usuario no tiene token', async () => {
      prisma.cliente.findUnique.mockResolvedValue({ pushToken: null });

      const response = await app.inject({
        method: 'POST',
        url: '/send-to-user',
        payload: { userId: 1, title: 'Hola', body: 'Mensaje' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /send-to-all', () => {
    it('debe enviar a todos los usuarios con token (Happy Path)', async () => {
      prisma.cliente.findMany.mockResolvedValue([
        { pushToken: 'ExponentPushToken[a]' },
        { pushToken: 'ExponentPushToken[b]' },
      ]);
      prisma.notificacion.create.mockResolvedValue({ notificacion_id: 2 });

      const response = await app.inject({
        method: 'POST',
        url: '/send-to-all',
        payload: { title: 'Promo', body: 'Todos' },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).success).toBe(true);
    });

    it('debe retornar 404 si no hay usuarios con token', async () => {
      prisma.cliente.findMany.mockResolvedValue([]);

      const response = await app.inject({
        method: 'POST',
        url: '/send-to-all',
        payload: { title: 'Promo', body: 'Todos' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /stats', () => {
    it('debe retornar las estadísticas del dashboard', async () => {
      prisma.notificacion.count.mockResolvedValue(10);
      prisma.cliente.count.mockResolvedValue(100);

      const response = await app.inject({ method: 'GET', url: '/stats' });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.totalNotificaciones).toBe(10);
      expect(body.totalUsuarios).toBe(100);
    });
  });

  describe('GET /history', () => {
    it('debe retornar el historial paginado', async () => {
      prisma.notificacion.findMany.mockResolvedValue([{ titulo: 'A' }]);
      prisma.notificacion.count.mockResolvedValue(1);

      const response = await app.inject({ method: 'GET', url: '/history' });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.notifications).toHaveLength(1);
      expect(body.total).toBe(1);
    });
  });
});

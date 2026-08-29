import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import canchaController from '../src/routes/Cancha/CanchaController.js';
import { prisma } from '../src/plugins/database.js';

vi.mock('../src/plugins/database.js', () => ({
  prisma: {
    cancha: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    reservaCancha: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Suite de Pruebas: Canchas', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(canchaController);
    await app.ready();
  });

  describe('POST /', () => {
    it('debe crear una cancha y retornar 201', async () => {
      prisma.cancha.create.mockResolvedValue({
        cancha_id: 1,
        nombre: 'Cancha 1',
        tipo: 'General',
        empresa_id: 1,
        activo: true,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/',
        payload: { nombre: 'Cancha 1', empresa_id: 1 },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.code).toBe(201);
      expect(body.cancha.nombre).toBe('Cancha 1');
    });
  });

  describe('GET /', () => {
    it('debe retornar 400 si falta empresaId', async () => {
      const response = await app.inject({ method: 'GET', url: '/' });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain('empresaId');
    });

    it('debe retornar 200 y las canchas de la empresa con empresaId', async () => {
      prisma.cancha.findMany.mockResolvedValue([{ cancha_id: 1, nombre: 'Cancha 1' }]);

      const response = await app.inject({ method: 'GET', url: '/?empresaId=1' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).canchas).toHaveLength(1);
    });

    it('debe retornar 200 con empresa_id como respaldo', async () => {
      prisma.cancha.findMany.mockResolvedValue([{ cancha_id: 1, nombre: 'Cancha 1' }]);

      const response = await app.inject({ method: 'GET', url: '/?empresa_id=1' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).canchas).toHaveLength(1);
    });
  });

  describe('GET /empresa/:empresa_id', () => {
    it('debe retornar 200 y las canchas de la empresa', async () => {
      prisma.cancha.findMany.mockResolvedValue([{ cancha_id: 1, nombre: 'Cancha 1' }]);

      const response = await app.inject({ method: 'GET', url: '/empresa/1' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).canchas).toHaveLength(1);
    });
  });

  describe('GET /disponibles', () => {
    it('debe retornar todas las canchas activas sin fecha', async () => {
      prisma.cancha.findMany.mockResolvedValue([
        { cancha_id: 1, nombre: 'Cancha 1' },
        { cancha_id: 2, nombre: 'Cancha 2' },
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/disponibles?empresa_id=1',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).canchas).toHaveLength(2);
    });

    it('debe excluir las canchas ocupadas en el rango', async () => {
      prisma.cancha.findMany.mockResolvedValueOnce([
        { cancha_id: 1, nombre: 'Cancha 1' },
        { cancha_id: 2, nombre: 'Cancha 2' },
      ]);
      prisma.reservaCancha.findMany.mockResolvedValue([
        { cancha_id: 1, hora_inicio: '10:00', hora_fin: '11:00' },
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/disponibles?empresa_id=1&fecha=2026-08-28&hora_inicio=09:00&hora_fin=10:30',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).canchas).toHaveLength(1);
      expect(JSON.parse(response.body).canchas[0].cancha_id).toBe(2);
    });
  });

  describe('POST /reservar', () => {
    it('debe reservar la cancha y retornar 201', async () => {
      prisma.reservaCancha.findMany.mockResolvedValue([]);
      prisma.reservaCancha.create.mockResolvedValue({
        reserva_id: 1,
        cancha_id: 1,
        fecha: '2026-08-28',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        estado: 'pendiente',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/reservar',
        payload: {
          cancha_id: 1,
          fecha: '2026-08-28',
          hora_inicio: '10:00',
          hora_fin: '11:00',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.code).toBe(201);
      expect(body.reserva.cancha_id).toBe(1);
    });

    it('debe retornar 409 si hay solapamiento de horarios', async () => {
      prisma.reservaCancha.findMany.mockResolvedValue([
        { cancha_id: 1, fecha: '2026-08-28', hora_inicio: '10:00', hora_fin: '12:00' },
      ]);

      const response = await app.inject({
        method: 'POST',
        url: '/reservar',
        payload: {
          cancha_id: 1,
          fecha: '2026-08-28',
          hora_inicio: '11:00',
          hora_fin: '12:00',
        },
      });

      expect(response.statusCode).toBe(409);
      expect(JSON.parse(response.body).message).toContain('reservada');
    });

    it('debe retornar 400 si falta hora de fin', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/reservar',
        payload: { cancha_id: 1, fecha: '2026-08-28', hora_inicio: '10:00' },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain('hora');
    });
  });

  describe('PUT /reservas/:id', () => {
    it('debe actualizar una reserva existente', async () => {
      prisma.reservaCancha.findUnique.mockResolvedValue({
        reserva_id: 1,
        cancha_id: 1,
        fecha: '2026-08-28',
        hora_inicio: '10:00',
        hora_fin: '11:00',
      });
      prisma.reservaCancha.findMany.mockResolvedValue([]);
      prisma.reservaCancha.update.mockResolvedValue({
        reserva_id: 1,
        cancha_id: 1,
        fecha: '2026-08-28',
        hora_inicio: '11:00',
        hora_fin: '12:00',
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/reservas/1',
        payload: { hora_inicio: '11:00', hora_fin: '12:00' },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).reserva.hora_inicio).toBe('11:00');
    });

    it('debe retornar 404 si la reserva no existe', async () => {
      prisma.reservaCancha.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PUT',
        url: '/reservas/999',
        payload: { hora_inicio: '11:00', hora_fin: '12:00' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /reservas/:id', () => {
    it('debe eliminar una reserva', async () => {
      prisma.reservaCancha.delete.mockResolvedValue({ reserva_id: 1 });

      const response = await app.inject({ method: 'DELETE', url: '/reservas/1' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).message).toContain('eliminada');
    });

    it('debe retornar 404 si la reserva no existe', async () => {
      prisma.reservaCancha.delete.mockRejectedValue({ code: 'P2025', message: 'not found' });

      const response = await app.inject({ method: 'DELETE', url: '/reservas/999' });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /:id', () => {
    it('debe eliminar una cancha', async () => {
      prisma.cancha.delete.mockResolvedValue({ cancha_id: 1 });

      const response = await app.inject({ method: 'DELETE', url: '/1' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).message).toContain('eliminada');
    });

    it('debe retornar 404 si la cancha no existe', async () => {
      prisma.cancha.delete.mockRejectedValue({ code: 'P2025', message: 'not found' });

      const response = await app.inject({ method: 'DELETE', url: '/999' });

      expect(response.statusCode).toBe(404);
    });
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import mesaController from '../src/routes/Mesa/MesaController.js';
import { prisma } from '../src/plugins/database.js';

vi.mock('../src/plugins/database.js', () => ({
  prisma: {
    mesa: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    reservaMesa: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Suite de Pruebas: Mesas', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(mesaController);
    await app.ready();
  });

  describe('POST /', () => {
    it('debe crear una mesa y retornar 201', async () => {
      prisma.mesa.create.mockResolvedValue({
        mesa_id: 1,
        nombre: 'Mesa 1',
        capacidad: 4,
        empresa_id: 1,
        activo: true,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/',
        payload: { nombre: 'Mesa 1', empresa_id: 1 },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.code).toBe(201);
      expect(body.mesa.nombre).toBe('Mesa 1');
    });
  });

  describe('GET /', () => {
    it('debe retornar 400 si falta empresaId', async () => {
      const response = await app.inject({ method: 'GET', url: '/' });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain('empresaId');
    });

    it('debe retornar 200 y las mesas de la empresa con empresaId', async () => {
      prisma.mesa.findMany.mockResolvedValue([{ mesa_id: 1, nombre: 'Mesa 1' }]);

      const response = await app.inject({ method: 'GET', url: '/?empresaId=1' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).mesas).toHaveLength(1);
    });

    it('debe retornar 200 con empresa_id como respaldo', async () => {
      prisma.mesa.findMany.mockResolvedValue([{ mesa_id: 1, nombre: 'Mesa 1' }]);

      const response = await app.inject({ method: 'GET', url: '/?empresa_id=1' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).mesas).toHaveLength(1);
    });
  });

  describe('GET /empresa/:empresa_id', () => {
    it('debe retornar 200 y las mesas de la empresa', async () => {
      prisma.mesa.findMany.mockResolvedValue([{ mesa_id: 1, nombre: 'Mesa 1' }]);

      const response = await app.inject({ method: 'GET', url: '/empresa/1' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).mesas).toHaveLength(1);
    });
  });

  describe('GET /disponibles', () => {
    it('debe retornar todas las mesas activas sin hora', async () => {
      prisma.mesa.findMany.mockResolvedValue([
        { mesa_id: 1, nombre: 'Mesa 1' },
        { mesa_id: 2, nombre: 'Mesa 2' },
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/disponibles?empresa_id=1',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).mesas).toHaveLength(2);
    });

    it('debe excluir las mesas ocupadas en la fecha y hora', async () => {
      prisma.mesa.findMany.mockResolvedValueOnce([
        { mesa_id: 1, nombre: 'Mesa 1' },
        { mesa_id: 2, nombre: 'Mesa 2' },
      ]);
      prisma.reservaMesa.findMany.mockResolvedValue([{ mesa_id: 1 }]);

      const response = await app.inject({
        method: 'GET',
        url: '/disponibles?empresa_id=1&fecha=2026-08-28&hora=20:00',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).mesas).toHaveLength(1);
      expect(JSON.parse(response.body).mesas[0].mesa_id).toBe(2);
    });
  });

  describe('POST /reservar', () => {
    it('debe reservar la mesa y retornar 201', async () => {
      prisma.reservaMesa.findFirst.mockResolvedValue(null);
      prisma.reservaMesa.create.mockResolvedValue({
        reserva_id: 1,
        mesa_id: 1,
        fecha: '2026-08-28',
        hora: '20:00',
        estado: 'pendiente',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/reservar',
        payload: { mesa_id: 1, fecha: '2026-08-28', hora: '20:00' },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.code).toBe(201);
      expect(body.reserva.mesa_id).toBe(1);
    });

    it('debe retornar 409 si la mesa ya está reservada', async () => {
      prisma.reservaMesa.findFirst.mockResolvedValue({ reserva_id: 1, mesa_id: 1 });

      const response = await app.inject({
        method: 'POST',
        url: '/reservar',
        payload: { mesa_id: 1, fecha: '2026-08-28', hora: '20:00' },
      });

      expect(response.statusCode).toBe(409);
      expect(JSON.parse(response.body).message).toContain('reservada');
    });
  });

  describe('PUT /reservas/:id', () => {
    it('debe actualizar una reserva existente', async () => {
      prisma.reservaMesa.findUnique.mockResolvedValue({
        reserva_id: 1,
        mesa_id: 1,
        fecha: '2026-08-28',
        hora: '20:00',
      });
      prisma.reservaMesa.findFirst.mockResolvedValue(null);
      prisma.reservaMesa.update.mockResolvedValue({
        reserva_id: 1,
        mesa_id: 1,
        fecha: '2026-08-28',
        hora: '21:00',
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/reservas/1',
        payload: { hora: '21:00' },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).reserva.hora).toBe('21:00');
    });

    it('debe retornar 404 si la reserva no existe', async () => {
      prisma.reservaMesa.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PUT',
        url: '/reservas/999',
        payload: { hora: '21:00' },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /reservas/:id', () => {
    it('debe eliminar una reserva', async () => {
      prisma.reservaMesa.delete.mockResolvedValue({ reserva_id: 1 });

      const response = await app.inject({ method: 'DELETE', url: '/reservas/1' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).message).toContain('eliminada');
    });

    it('debe retornar 404 si la reserva no existe', async () => {
      prisma.reservaMesa.delete.mockRejectedValue({ code: 'P2025', message: 'not found' });

      const response = await app.inject({ method: 'DELETE', url: '/reservas/999' });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /:id', () => {
    it('debe eliminar una mesa', async () => {
      prisma.mesa.delete.mockResolvedValue({ mesa_id: 1 });

      const response = await app.inject({ method: 'DELETE', url: '/1' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).message).toContain('eliminada');
    });

    it('debe retornar 404 si la mesa no existe', async () => {
      prisma.mesa.delete.mockRejectedValue({ code: 'P2025', message: 'not found' });

      const response = await app.inject({ method: 'DELETE', url: '/999' });

      expect(response.statusCode).toBe(404);
    });
  });
});
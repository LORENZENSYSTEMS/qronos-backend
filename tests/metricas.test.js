import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import metricaRoutes from '../src/routes/metricasCliente/metrica.js';
import landingRoutes from '../src/routes/metricasLandingPage/landing.js';
import { prisma } from '../src/plugins/database.js';

// Mock de Prisma
vi.mock('../src/plugins/database.js', () => ({
  prisma: {
    metrica: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    cliente: { findUnique: vi.fn() },
    empresa: { findUnique: vi.fn(), count: vi.fn() },
    producto: { count: vi.fn() },
    metricaLandingPage: { findMany: vi.fn() },
  },
}));

describe('Suite de Pruebas: Métricas', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    app.decorate('authenticate', async (request, reply) => { return; });
    await app.register(metricaRoutes, { prefix: '/api/metricas' });
    await app.register(landingRoutes, { prefix: '/api/landing' });
    await app.ready();
  });

  describe('Metricas de Cliente', () => {
    it('GET /api/metricas debe retornar todas las métricas', async () => {
      prisma.metrica.findMany.mockResolvedValue([{ id: 1, puntos: 10 }]);
      const response = await app.inject({ method: 'GET', url: '/api/metricas' });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toHaveLength(1);
    });

    it('GET /api/metricas/cliente/:id debe retornar métricas de un cliente', async () => {
      prisma.metrica.findMany.mockResolvedValue([{ id: 1, cliente_id: 5 }]);
      const response = await app.inject({ method: 'GET', url: '/api/metricas/cliente/5' });
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toHaveLength(1);
    });
  });

  describe('Metricas de Landing Page', () => {
    it('GET /api/landing/metricas debe retornar datos globales', async () => {
      prisma.cliente.count = vi.fn().mockResolvedValue(100);
      prisma.empresa.count = vi.fn().mockResolvedValue(20);
      prisma.producto.count = vi.fn().mockResolvedValue(50);

      const response = await app.inject({ method: 'GET', url: '/api/landing/metricas' });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.totalUsuarios).toBe(120);
    });
  });
});

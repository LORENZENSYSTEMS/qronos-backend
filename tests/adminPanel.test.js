import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import adminPanelModule from '../src/routes/AdminPanel/index.js';
import { prisma } from '../src/plugins/database.js';

vi.mock('../src/plugins/database.js', () => {
  const prisma = {
    pais: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    ciudad: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    categoria: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    empresa: {
      count: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  };
  return { prisma, default: prisma };
});

describe('Suite de Pruebas: AdminPanel', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(adminPanelModule);
    await app.ready();
  });

  describe('Paises', () => {
    it('GET /api/paises retorna la lista de países (Happy Path)', async () => {
      const mockPaises = [{ pais_id: 1, nombre: 'México' }];
      prisma.pais.findMany.mockResolvedValue(mockPaises);

      const response = await app.inject({ method: 'GET', url: '/api/paises' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockPaises);
    });

    it('POST /api/paises crea un país (Happy Path)', async () => {
      const mockPais = { pais_id: 2, nombre: 'Perú', codigo: 'PE' };
      prisma.pais.create.mockResolvedValue(mockPais);

      const response = await app.inject({
        method: 'POST',
        url: '/api/paises',
        payload: { nombre: 'Perú', codigo: 'PE' },
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual(mockPais);
    });

    it('POST /api/paises retorna 400 si falta el nombre', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/paises',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it('DELETE /api/paises/:id retorna 400 si tiene empresas asociadas', async () => {
      prisma.empresa.count.mockResolvedValue(3);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/paises/1',
      });

      expect(response.statusCode).toBe(409);
    });

    it('DELETE /api/paises/:id desactiva el país (Happy Path)', async () => {
      prisma.empresa.count.mockResolvedValue(0);
      prisma.pais.update.mockResolvedValue({ pais_id: 1, activo: false });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/paises/1',
      });

      expect(response.statusCode).toBe(200);
      expect(prisma.pais.update).toHaveBeenCalled();
    });
  });

  describe('Ciudades', () => {
    it('GET /api/ciudades retorna ciudades (Happy Path)', async () => {
      const mockCiudades = [{ ciudad_id: 1, nombre: 'Lima' }];
      prisma.ciudad.findMany.mockResolvedValue(mockCiudades);

      const response = await app.inject({ method: 'GET', url: '/api/ciudades' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockCiudades);
    });

    it('POST /api/ciudades retorna 400 si faltan nombre o pais_id', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/ciudades',
        payload: { nombre: 'Lima' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('POST /api/ciudades crea una ciudad (Happy Path)', async () => {
      prisma.ciudad.create.mockResolvedValue({ ciudad_id: 1, nombre: 'Lima', pais_id: 1 });

      const response = await app.inject({
        method: 'POST',
        url: '/api/ciudades',
        payload: { nombre: 'Lima', pais_id: 1 },
      });

      expect(response.statusCode).toBe(201);
    });
  });

  describe('Categorías', () => {
    it('GET /api/categorias retorna categorías (Happy Path)', async () => {
      const mockCategorias = [{ categoria_id: 1, nombre: 'Restaurante' }];
      prisma.categoria.findMany.mockResolvedValue(mockCategorias);

      const response = await app.inject({ method: 'GET', url: '/api/categorias' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockCategorias);
    });

    it('POST /api/categorias retorna 400 si falta el nombre', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/categorias',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it('DELETE /api/categorias/:id retorna 409 si tiene empresas', async () => {
      prisma.empresa.count.mockResolvedValue(2);

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/categorias/1',
      });

      expect(response.statusCode).toBe(409);
    });
  });

  describe('Empresas destacadas', () => {
    it('GET /api/empresas/destacadas retorna tiendas destacadas (Happy Path)', async () => {
      const mockEmpresas = [{ empresa_id: 1, destacada: true }];
      prisma.empresa.findMany.mockResolvedValue(mockEmpresas);

      const response = await app.inject({ method: 'GET', url: '/api/empresas/destacadas' });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockEmpresas);
    });

    it('PATCH /api/empresas/:id/destacar actualiza la empresa (Happy Path)', async () => {
      const mockEmpresa = { empresa_id: 1, destacada: true, popular: false };
      prisma.empresa.update.mockResolvedValue(mockEmpresa);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/empresas/1/destacar',
        payload: { destacada: true },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockEmpresa);
    });
  });
});

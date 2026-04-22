import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import clienteRoutes from '../src/routes/Cliente/cliente.js';
import { prisma } from '../src/plugins/database.js';

// Mock del cliente Prisma
vi.mock('../src/plugins/database.js', () => ({
  prisma: {
    cliente: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    empresa: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock de bcrypt
vi.mock('../src/plugins/bcrypt.js', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
  verifyPassword: vi.fn().mockResolvedValue(true),
}));

describe('Suite de Pruebas: Clientes', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(fastifyJwt, { secret: 'test-secret' });
    await app.register(clienteRoutes);
    await app.ready();
  });

  describe('POST /login', () => {
    it('debe iniciar sesión exitosamente (Happy Path)', async () => {
      // Arrange
      prisma.cliente.findFirst.mockResolvedValue({ cliente_id: 1, correo: 'test@test.com', rol: 'Regular', nombreCompleto: 'Test User' });
      prisma.empresa.findFirst.mockResolvedValue(null);

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: { email: 'test@test.com' },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('jwt');
      expect(body.rol).toBe('Regular');
    });

    it('debe retornar 404 si el usuario no existe', async () => {
      // Arrange
      prisma.cliente.findFirst.mockResolvedValue(null);
      prisma.empresa.findFirst.mockResolvedValue(null);

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: { email: 'no-existe@test.com' },
      });

      // Assert
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).message).toContain('Perfil no encontrado');
    });
  });

  describe('GET /', () => {
    it('debe retornar 200 y lista de clientes', async () => {
      // Arrange
      prisma.cliente.findMany.mockResolvedValue([{ cliente_id: 1, nombreCompleto: 'Cliente 1' }]);

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).clientes).toHaveLength(1);
    });
  });

  describe('GET /:id', () => {
    it('debe retornar 200 y el cliente si existe', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue({ cliente_id: 1, correo: 'c1@test.com' });
      prisma.empresa.findFirst.mockResolvedValue(null);

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/1',
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).cliente.cliente.cliente_id).toBe(1);
    });

    it('debe retornar 404 si el cliente no existe', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue(null);

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/999',
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import empresaRoutes from '../src/routes/Empresa/empresa.js';
import { prisma } from '../src/plugins/database.js';

// Mock de Firebase Admin
vi.mock('../src/plugins/firebaseAdmin.js', () => ({
  firebaseAdminAuth: {
    createUser: vi.fn().mockResolvedValue({ uid: 'mock-uid' }),
    updateUser: vi.fn().mockResolvedValue({}),
    deleteUser: vi.fn().mockResolvedValue({}),
  },
}));

// Mock del cliente Prisma
vi.mock('../src/plugins/database.js', () => ({
  prisma: {
    empresa: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock de S3
vi.mock('../src/utils/s3Config.js', () => ({
  uploadToS3: vi.fn().mockResolvedValue('http://mock-s3-url.com/empresa.jpg'),
}));

describe('Suite de Pruebas: Empresas', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(empresaRoutes);
    await app.ready();
  });

  describe('POST /login', () => {
    it('debe iniciar sesión de empresa exitosamente (Happy Path)', async () => {
      // Arrange
      prisma.empresa.findFirst.mockResolvedValue({ empresa_id: 1, correo: 'empresa@test.com', nombreCompleto: 'Empresa Test', auth_uid: 'uid123' });

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: { email: 'empresa@test.com' },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).empresa).toBe('Empresa Test');
    });

    it('debe retornar 404 si la empresa no existe', async () => {
      // Arrange
      prisma.empresa.findFirst.mockResolvedValue(null);

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: { email: 'no-existe@test.com' },
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /', () => {
    it('debe retornar 200 y lista de empresas', async () => {
      // Arrange
      prisma.empresa.findMany.mockResolvedValue([{ empresa_id: 1, nombreCompleto: 'Empresa 1' }]);

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toHaveLength(1);
    });
  });

  describe('GET /:id', () => {
    it('debe retornar 200 y la empresa si existe', async () => {
      // Arrange
      prisma.empresa.findUnique.mockResolvedValue({ empresa_id: 1, nombreCompleto: 'Empresa 1' });

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/1',
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).empresa_id).toBe(1);
    });
  });
});

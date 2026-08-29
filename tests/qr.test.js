import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import qrRoutes from '../src/routes/Qr/QrController.js';
import { prisma } from '../src/plugins/database.js';

process.env.TOKEN = 'test_secret_key';

vi.mock('../src/plugins/database.js', () => {
  const prisma = {
    cliente: {
      findUnique: vi.fn(),
    },
  };
  return { prisma, default: prisma };
});

describe('Suite de Pruebas: QR', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();

    app = Fastify();

    app.decorate('authenticate', async (request, reply) => {
      request.user = { email: 'test@test.com' };
      return;
    });

    await app.register(qrRoutes);
    await app.ready();
  });

  describe('POST /generate', () => {
    it('debe generar un token QR (Happy Path)', async () => {
      prisma.cliente.findUnique.mockResolvedValue({ cliente_id: 1 });

      const response = await app.inject({
        method: 'POST',
        url: '/generate',
        payload: { client_id: 1 },
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toHaveProperty('qr_token');
    });

    it('debe retornar 404 si el cliente no existe', async () => {
      prisma.cliente.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'POST',
        url: '/generate',
        payload: { client_id: 999 },
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).message).toBe('Cliente no encontrado');
    });

    it('debe retornar 400 si falta el client_id', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/generate',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });
});

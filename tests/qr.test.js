import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import qrRoutes from '../src/routes/Qr/qr.router.js';
import { prisma } from '../src/plugins/database.js';

// Configurar variables de entorno para el servicio de QR
process.env.TOKEN = 'test_secret_key';

// Mock del cliente Prisma
vi.mock('../src/plugins/database.js', () => ({
  prisma: {
    cliente: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock del servicio de QR para evitar problemas con variables de entorno (TOKEN)
vi.mock('../src/routes/Qr/services.js', () => {
  function QrServices() {}
  QrServices.prototype.generateQrData = vi.fn().mockImplementation(async ({ client_id }) => {
      if (client_id === 999) return { code: 404, message: 'Cliente no encontrado' };
      return { code: 201, qr_token: 'mock_token_signed' };
  });
  return { QrServices };
});

describe('Suite de Pruebas: QR', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    
    // Mock de la decoración de autenticación
    app.decorate('authenticate', async (request, reply) => {
      request.user = { email: 'test@test.com' };
      return;
    });

    await app.register(qrRoutes);
    await app.ready();
  });

  describe('POST /generate', () => {
    it('debe generar un token QR (Happy Path)', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue({ cliente_id: 1 });
      // Nota: El servicio de QR usa variables de entorno para firmar. 
      // Si el servicio no está mockeado, usará la implementación real.
      
      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/generate',
        payload: { client_id: 1 },
      });

      // Assert
      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toHaveProperty('qr_token');
    });

    it('debe retornar 404 si el cliente no existe', async () => {
      // Arrange
      prisma.cliente.findUnique.mockResolvedValue(null);

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/generate',
        payload: { client_id: 999 },
      });

      // Assert
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).message).toBe('Cliente no encontrado');
    });

    it('debe retornar 400 si falta el client_id', async () => {
      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/generate',
        payload: {},
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });
});

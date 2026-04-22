import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import productoRoutes from '../src/routes/Producto/producto.js';
import { prisma } from '../src/plugins/database.js';

// Mock del cliente Prisma
vi.mock('../src/plugins/database.js', () => ({
  prisma: {
    producto: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock de S3 para evitar llamadas externas
vi.mock('../src/utils/s3Config.js', () => ({
  uploadToS3: vi.fn().mockResolvedValue('http://mock-s3-url.com/image.jpg'),
}));

describe('Suite de Pruebas: Productos (Unitarias e Integración)', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(multipart);
    await app.register(productoRoutes);
    await app.ready();
  });

  // --- PRUEBAS DE INTEGRACIÓN (ENDPOINTS) ---

  describe('GET /empresas/:id/productos', () => {
    it('debe retornar 200 y lista de productos (Happy Path)', async () => {
      // Arrange
      const mockProductos = [{ producto_id: 1, nombre: 'Producto A', precio: 10 }];
      prisma.producto.findMany.mockResolvedValue(mockProductos);

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/empresas/1/productos',
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockProductos);
    });

    it('debe retornar 500 si falla la base de datos (Server Error)', async () => {
      // Arrange
      prisma.producto.findMany.mockRejectedValue(new Error('DB Error'));

      // Act
      const response = await app.inject({
        method: 'GET',
        url: '/empresas/1/productos',
      });

      // Assert
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).message).toBe('Error al obtener los productos de la empresa');
    });
  });

  describe('POST /productos', () => {
    it('debe retornar 400 si faltan datos obligatorios (Bad Request)', async () => {
      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/productos',
        payload: {}, // Payload vacío
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toBe('La petición debe ser multipart/form-data');
    });

    // Nota: El test de éxito (201) en multipart es complejo de simular con inject sin librerías extra,
    // se recomienda probar la lógica del servicio para el Happy Path de creación.
  });

  describe('DELETE /productos/:id', () => {
    it('debe retornar 200 si el producto se elimina correctamente (Happy Path)', async () => {
      // Arrange
      prisma.producto.findUnique.mockResolvedValue({ producto_id: 10 });
      prisma.producto.delete.mockResolvedValue({});

      // Act
      const response = await app.inject({
        method: 'DELETE',
        url: '/productos/10',
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).success).toBe(true);
    });

    it('debe retornar 404 si el producto no existe (Not Found)', async () => {
      // Arrange
      prisma.producto.findUnique.mockResolvedValue(null);

      // Act
      const response = await app.inject({
        method: 'DELETE',
        url: '/productos/999',
      });

      // Assert
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).message).toBe('Producto no encontrado');
    });

    it('debe retornar 400 si el ID no es válido (Bad Request)', async () => {
      // Act
      const response = await app.inject({
        method: 'DELETE',
        url: '/productos/abc',
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain('ID de producto inválido');
    });
  });

  describe('PUT /productos/:id', () => {
    it('debe retornar 200 y el producto actualizado (Happy Path - JSON)', async () => {
      // Arrange
      const productoId = 10;
      const updatedProducto = { producto_id: productoId, nombre: 'Producto Editado', precio: 25.5 };
      prisma.producto.findUnique.mockResolvedValue({ producto_id: productoId });
      prisma.producto.update.mockResolvedValue(updatedProducto);

      // Act
      const response = await app.inject({
        method: 'PUT',
        url: `/productos/${productoId}`,
        payload: { nombre: 'Producto Editado', precio: 25.5 },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(updatedProducto);
      expect(prisma.producto.update).toHaveBeenCalled();
    });

    it('debe retornar 404 si el producto a editar no existe', async () => {
      // Arrange
      prisma.producto.findUnique.mockResolvedValue(null);

      // Act
      const response = await app.inject({
        method: 'PUT',
        url: '/productos/999',
        payload: { nombre: 'Inexistente' },
      });

      // Assert
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).message).toBe('Producto no encontrado');
    });

    it('debe retornar 400 si el ID es inválido', async () => {
      // Act
      const response = await app.inject({
        method: 'PUT',
        url: '/productos/invalido',
        payload: { nombre: 'Test' },
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain('ID de producto inválido');
    });

    it('debe retornar 500 si falla la base de datos al actualizar', async () => {
      // Arrange
      prisma.producto.findUnique.mockResolvedValue({ producto_id: 1 });
      prisma.producto.update.mockRejectedValue(new Error('DB Error'));

      // Act
      const response = await app.inject({
        method: 'PUT',
        url: '/productos/1',
        payload: { nombre: 'Falla' },
      });

      // Assert
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).message).toContain('Error al procesar la edición');
    });
  });
});

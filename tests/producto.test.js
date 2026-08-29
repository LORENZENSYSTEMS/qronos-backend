import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import productoRoutes from '../src/routes/Producto/ProductoController.js';
import { prisma } from '../src/plugins/database.js';

vi.mock('../src/plugins/database.js', () => {
  const prisma = {
    producto: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    categoriaProducto: {
      findMany: vi.fn(),
    },
  };
  return { prisma, default: prisma };
});

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

  describe('GET /empresas/:id/productos', () => {
    it('debe retornar 200 y lista de productos (Happy Path)', async () => {
      const mockProductos = [{ producto_id: 1, nombre: 'Producto A', precio: 10 }];
      prisma.producto.findMany.mockResolvedValue(mockProductos);

      const response = await app.inject({
        method: 'GET',
        url: '/empresas/1/productos',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockProductos);
    });

    it('debe retornar 500 si falla la base de datos (Server Error)', async () => {
      prisma.producto.findMany.mockRejectedValue(new Error('DB Error'));

      const response = await app.inject({
        method: 'GET',
        url: '/empresas/1/productos',
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).code).toBe(500);
    });
  });

  describe('GET /empresas/:id/categorias-disponibles', () => {
    it('debe retornar 200 con las categorías usadas por la empresa', async () => {
      prisma.producto.findMany.mockResolvedValue([{ categoria_prod_id: 7 }]);
      const mockCategorias = [{ categoria_prod_id: 7, nombre: 'Bebidas' }];
      prisma.categoriaProducto.findMany.mockResolvedValue(mockCategorias);

      const response = await app.inject({
        method: 'GET',
        url: '/empresas/1/categorias-disponibles',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockCategorias);
    });
  });

  describe('POST /productos', () => {
    it('debe retornar 400 si la petición no es multipart (Bad Request)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/productos',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toBe('La petición debe ser multipart/form-data');
    });
  });

  describe('DELETE /productos/:id', () => {
    it('debe retornar 200 si el producto se elimina correctamente (Happy Path)', async () => {
      prisma.producto.findUnique.mockResolvedValue({ producto_id: 10 });
      prisma.producto.delete.mockResolvedValue({});

      const response = await app.inject({
        method: 'DELETE',
        url: '/productos/10',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).success).toBe(true);
    });

    it('debe retornar 404 si el producto no existe (Not Found)', async () => {
      prisma.producto.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: '/productos/999',
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).message).toBe('Producto no encontrado');
    });

    it('debe retornar 400 si el ID no es válido (Bad Request)', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/productos/abc',
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain('ID de producto inválido');
    });
  });

  describe('PUT /productos/:id', () => {
    it('debe retornar 200 y el producto actualizado (Happy Path - JSON)', async () => {
      const productoId = 10;
      const updatedProducto = { producto_id: productoId, nombre: 'Producto Editado', precio: 25.5 };
      prisma.producto.findUnique.mockResolvedValue({ producto_id: productoId });
      prisma.producto.update.mockResolvedValue(updatedProducto);

      const response = await app.inject({
        method: 'PUT',
        url: `/productos/${productoId}`,
        payload: { nombre: 'Producto Editado', precio: 25.5 },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(updatedProducto);
      expect(prisma.producto.update).toHaveBeenCalled();
    });

    it('debe retornar 404 si el producto a editar no existe', async () => {
      prisma.producto.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PUT',
        url: '/productos/999',
        payload: { nombre: 'Inexistente' },
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).message).toBe('Producto no encontrado');
    });

    it('debe retornar 400 si el ID es inválido', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/productos/invalido',
        payload: { nombre: 'Test' },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain('ID de producto inválido');
    });

    it('debe retornar 500 si falla la base de datos al actualizar', async () => {
      prisma.producto.findUnique.mockResolvedValue({ producto_id: 1 });
      prisma.producto.update.mockRejectedValue(new Error('DB Error'));

      const response = await app.inject({
        method: 'PUT',
        url: '/productos/1',
        payload: { nombre: 'Falla' },
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).code).toBe(500);
    });
  });
});

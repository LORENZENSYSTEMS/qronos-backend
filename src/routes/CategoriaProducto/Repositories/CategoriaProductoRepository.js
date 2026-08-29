import prisma from '../../../plugins/database.js';
import { NotFoundError } from '../Services/errors.js';

export class CategoriaProductoRepository {
  async findAll() {
    return prisma.categoriaProducto.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findById(categoriaId) {
    return prisma.categoriaProducto.findUnique({
      where: { categoria_prod_id: Number(categoriaId) },
    });
  }

  async create(data) {
    return prisma.categoriaProducto.create({ data });
  }

  async update(categoriaId, data) {
    return prisma.categoriaProducto.update({
      where: { categoria_prod_id: Number(categoriaId) },
      data,
    });
  }

  async delete(categoriaId) {
    try {
      return await prisma.categoriaProducto.delete({
        where: { categoria_prod_id: Number(categoriaId) },
      });
    } catch (err) {
      if (err?.code === 'P2025') {
        throw new NotFoundError('Categoría no encontrada');
      }
      throw err;
    }
  }
}

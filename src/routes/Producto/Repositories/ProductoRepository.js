import prisma from '../../../plugins/database.js';

export class ProductoRepository {
  async findByEmpresa(empresaId) {
    return prisma.producto.findMany({
      where: { empresa_id: Number(empresaId) },
      include: { categoria_rel: true },
      take: 50,
    });
  }

  async findDistinctCategoriaIdsByEmpresa(empresaId) {
    return prisma.producto.findMany({
      where: {
        empresa_id: Number(empresaId),
        categoria_prod_id: { not: null },
      },
      select: { categoria_prod_id: true },
      distinct: ['categoria_prod_id'],
    });
  }

  async findById(productoId) {
    return prisma.producto.findUnique({
      where: { producto_id: Number(productoId) },
    });
  }

  async create(data) {
    return prisma.producto.create({ data });
  }

  async update(productoId, data) {
    return prisma.producto.update({
      where: { producto_id: Number(productoId) },
      data,
    });
  }

  async delete(productoId) {
    return prisma.producto.delete({
      where: { producto_id: Number(productoId) },
    });
  }
}

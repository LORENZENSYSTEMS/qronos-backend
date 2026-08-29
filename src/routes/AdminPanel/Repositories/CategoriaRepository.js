import prisma from '../../../plugins/database.js';

export class CategoriaRepository {
  async findAllActivas() {
    return prisma.categoria.findMany({
      where: { activo: true },
      include: {
        _count: {
          select: { empresas: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async create(data) {
    return prisma.categoria.create({
      data: {
        nombre: data.nombre,
      },
    });
  }

  async countEmpresas(categoriaId) {
    return prisma.empresa.count({
      where: { categoria_id: Number(categoriaId) },
    });
  }

  async softDelete(categoriaId) {
    return prisma.categoria.update({
      where: { categoria_id: Number(categoriaId) },
      data: { activo: false },
    });
  }
}

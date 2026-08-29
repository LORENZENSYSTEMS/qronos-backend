import prisma from '../../../plugins/database.js';

export class PaisRepository {
  async findAllActivos() {
    return prisma.pais.findMany({
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
    return prisma.pais.create({
      data: {
        nombre: data.nombre,
        codigo: data.codigo,
      },
    });
  }

  async countEmpresas(paisId) {
    return prisma.empresa.count({
      where: { pais_id: Number(paisId) },
    });
  }

  async softDelete(paisId) {
    return prisma.pais.update({
      where: { pais_id: Number(paisId) },
      data: { activo: false },
    });
  }
}

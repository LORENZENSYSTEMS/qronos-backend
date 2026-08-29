import prisma from '../../../plugins/database.js';

export class CiudadRepository {
  async findAll({ paisId } = {}) {
    const where = { activo: true };

    if (paisId) {
      where.pais_id = paisId;
    }

    return prisma.ciudad.findMany({
      where,
      include: {
        pais: {
          select: { nombre: true },
        },
        _count: {
          select: { empresas: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async create(data) {
    return prisma.ciudad.create({
      data: {
        nombre: data.nombre,
        pais_id: data.pais_id,
      },
    });
  }

  async countEmpresas(ciudadId) {
    return prisma.empresa.count({
      where: { ciudad_id: Number(ciudadId) },
    });
  }

  async softDelete(ciudadId) {
    return prisma.ciudad.update({
      where: { ciudad_id: Number(ciudadId) },
      data: { activo: false },
    });
  }
}

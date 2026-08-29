import { prisma } from '../../../plugins/database.js';
import { NotFoundError } from '../Services/errors.js';

export class CanchaRepository {
  async findById(canchaId) {
    return prisma.cancha.findUnique({
      where: { cancha_id: Number(canchaId) },
    });
  }

  async findByEmpresa(empresaId) {
    return prisma.cancha.findMany({
      where: { empresa_id: Number(empresaId) },
    });
  }

  async findActiveByEmpresa(empresaId) {
    return prisma.cancha.findMany({
      where: {
        empresa_id: Number(empresaId),
        activo: true,
      },
    });
  }

  async create(data) {
    return prisma.cancha.create({ data });
  }

  async delete(canchaId) {
    try {
      return await prisma.cancha.delete({
        where: { cancha_id: Number(canchaId) },
      });
    } catch (err) {
      if (err?.code === 'P2025') {
        throw new NotFoundError('Cancha no encontrada');
      }
      throw err;
    }
  }
}
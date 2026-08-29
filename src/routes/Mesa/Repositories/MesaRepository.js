import { prisma } from '../../../plugins/database.js';
import { NotFoundError } from '../../../utils/errors.js';

export class MesaRepository {
  async findById(mesaId) {
    return prisma.mesa.findUnique({
      where: { mesa_id: Number(mesaId) },
    });
  }

  async findByEmpresa(empresaId) {
    return prisma.mesa.findMany({
      where: { empresa_id: Number(empresaId) },
    });
  }

  async findActiveByEmpresa(empresaId) {
    return prisma.mesa.findMany({
      where: {
        empresa_id: Number(empresaId),
        activo: true,
      },
    });
  }

  async create(data) {
    return prisma.mesa.create({ data });
  }

  async delete(mesaId) {
    try {
      return await prisma.mesa.delete({
        where: { mesa_id: Number(mesaId) },
      });
    } catch (err) {
      if (err?.code === 'P2025') {
        throw new NotFoundError('Mesa no encontrada');
      }
      throw err;
    }
  }
}
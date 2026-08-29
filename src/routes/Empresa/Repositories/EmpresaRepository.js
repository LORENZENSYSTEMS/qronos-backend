import { prisma } from '../../../plugins/database.js';
import { NotFoundError } from '../../../utils/errors.js';

export class EmpresaRepository {
  async findByEmail(email) {
    return prisma.empresa.findFirst({
      where: {
        correo: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
  }

  async findById(id) {
    return prisma.empresa.findUnique({
      where: { empresa_id: Number(id) },
    });
  }

  async findAll() {
    return prisma.empresa.findMany({
      orderBy: [
        { destacada: 'desc' },
        { created_at: 'desc' },
      ],
    });
  }

  async create(data) {
    return prisma.empresa.create({ data });
  }

  async update(id, data) {
    try {
      return await prisma.empresa.update({
        where: { empresa_id: Number(id) },
        data,
      });
    } catch (err) {
      if (err?.code === 'P2025') {
        throw new NotFoundError('Empresa no encontrada');
      }
      throw err;
    }
  }

  async deleteWithRelated(empresaId) {
    const [productosEliminados, metricasEliminadas, empresaEliminada] =
      await prisma.$transaction([
        prisma.producto.deleteMany({ where: { empresa_id: empresaId } }),
        prisma.metrica.deleteMany({ where: { empresa_id: empresaId } }),
        prisma.empresa.delete({ where: { empresa_id: empresaId } }),
      ]);

    return {
      empresa: empresaEliminada,
      productosBorrados: productosEliminados.count,
      metricasBorradas: metricasEliminadas.count,
    };
  }
}

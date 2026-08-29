import prisma from '../../../plugins/database.js';

const DETALLES_EMPRESA = {
  select: {
    pais: { nombre: true },
    ciudad: { nombre: true },
    categoria: { nombre: true },
  },
};

export class EmpresaRepository {
  async toggleDestacada(empresaId, destacada, popular) {
    return prisma.empresa.update({
      where: { empresa_id: Number(empresaId) },
      data: {
        destacada: destacada ?? false,
        popular: popular ?? false,
      },
      include: DETALLES_EMPRESA,
    });
  }

  async findDestacadas() {
    return prisma.empresa.findMany({
      where: {
        destacada: true,
        activo: true,
      },
      include: DETALLES_EMPRESA,
      orderBy: { updated_at: 'desc' },
    });
  }
}

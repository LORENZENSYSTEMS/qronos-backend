import { prisma } from '../../../plugins/database.js';
import { NotFoundError } from '../../../utils/errors.js';

export class MetricaRepository {
  async upsertScan({ clienteId, empresaId, puntos }) {
    return prisma.metrica.upsert({
      where: {
        cliente_id_empresa_id: {
          cliente_id: clienteId,
          empresa_id: empresaId,
        },
      },
      update: {
        vecesScan: { increment: 1 },
        puntos: { increment: puntos },
      },
      create: {
        cliente_id: clienteId,
        empresa_id: empresaId,
        vecesScan: 1,
        puntos,
      },
    });
  }

  async create({ clienteId, empresaId, vecesScan, puntos }) {
    return prisma.metrica.create({
      data: {
        cliente_id: clienteId,
        empresa_id: empresaId,
        vecesScan,
        puntos,
      },
    });
  }

  async findAll() {
    return prisma.metrica.findMany({
      include: {
        empresa: {
          select: { nombreCompleto: true },
        },
      },
    });
  }

  async findByCliente(clienteId) {
    return prisma.metrica.findMany({
      where: { cliente_id: clienteId },
      include: { empresa: true },
    });
  }

  async findByEmpresa(empresaId) {
    return prisma.metrica.findMany({
      where: { empresa_id: empresaId },
      include: { cliente: true },
    });
  }

  async findById(metricaId) {
    const metrica = await prisma.metrica.findUnique({
      where: { metrica_id: metricaId },
    });
    if (!metrica) {
      throw new NotFoundError('Métrica no encontrada');
    }
    return metrica;
  }
}

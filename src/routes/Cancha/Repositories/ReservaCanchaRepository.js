import { prisma } from '../../../plugins/database.js';
import { NotFoundError } from '../Services/errors.js';

export class ReservaCanchaRepository {
  async findById(reservaId) {
    return prisma.reservaCancha.findUnique({
      where: { reserva_id: Number(reservaId) },
    });
  }

  async findActiveByEmpresa(empresaId) {
    return prisma.reservaCancha.findMany({
      where: {
        cancha: {
          empresa_id: Number(empresaId),
        },
      },
      include: {
        cancha: {
          select: { nombre: true, tipo: true },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findActiveByCanchaAndDate(canchaId, fecha) {
    return prisma.reservaCancha.findMany({
      where: {
        cancha_id: Number(canchaId),
        fecha,
        estado: { not: 'cancelada' },
      },
    });
  }

  async findActiveByCanchaAndDateExcluding(canchaId, fecha, excluirReservaId) {
    return prisma.reservaCancha.findMany({
      where: {
        cancha_id: Number(canchaId),
        fecha,
        estado: { not: 'cancelada' },
        reserva_id: { not: Number(excluirReservaId) },
      },
    });
  }

  async findActiveByFechaAndEmpresa(fecha, empresaId) {
    return prisma.reservaCancha.findMany({
      where: {
        fecha,
        estado: { not: 'cancelada' },
        cancha: {
          empresa_id: Number(empresaId),
        },
      },
      select: {
        cancha_id: true,
        hora_inicio: true,
        hora_fin: true,
      },
    });
  }

  async create(data) {
    return prisma.reservaCancha.create({ data });
  }

  async update(reservaId, data) {
    try {
      return await prisma.reservaCancha.update({
        where: { reserva_id: Number(reservaId) },
        data,
      });
    } catch (err) {
      if (err?.code === 'P2025') {
        throw new NotFoundError('Reserva no encontrada');
      }
      throw err;
    }
  }

  async delete(reservaId) {
    try {
      return await prisma.reservaCancha.delete({
        where: { reserva_id: Number(reservaId) },
      });
    } catch (err) {
      if (err?.code === 'P2025') {
        throw new NotFoundError('Reserva no encontrada');
      }
      throw err;
    }
  }
}
import { prisma } from '../../../plugins/database.js';
import { NotFoundError } from '../../../utils/errors.js';

export class ReservaMesaRepository {
  async findById(reservaId) {
    return prisma.reservaMesa.findUnique({
      where: { reserva_id: Number(reservaId) },
    });
  }

  async findActiveByEmpresa(empresaId) {
    return prisma.reservaMesa.findMany({
      where: {
        mesa: {
          empresa_id: Number(empresaId),
        },
      },
      include: {
        mesa: {
          select: { nombre: true, capacidad: true },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findActiveByMesaAndFechaHora(mesaId, fecha, hora) {
    return prisma.reservaMesa.findFirst({
      where: {
        mesa_id: Number(mesaId),
        fecha,
        hora,
        estado: { not: 'cancelada' },
      },
    });
  }

  async findActiveByMesaAndFechaHoraExcluding(mesaId, fecha, hora, excluirReservaId) {
    return prisma.reservaMesa.findFirst({
      where: {
        mesa_id: Number(mesaId),
        fecha,
        hora,
        estado: { not: 'cancelada' },
        reserva_id: { not: Number(excluirReservaId) },
      },
    });
  }

  async findActiveByFechaHoraYEmpresa(fecha, hora, empresaId) {
    return prisma.reservaMesa.findMany({
      where: {
        fecha,
        hora,
        estado: { not: 'cancelada' },
        mesa: {
          empresa_id: Number(empresaId),
        },
      },
      select: {
        mesa_id: true,
      },
    });
  }

  async create(data) {
    return prisma.reservaMesa.create({ data });
  }

  async update(reservaId, data) {
    try {
      return await prisma.reservaMesa.update({
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
      return await prisma.reservaMesa.delete({
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
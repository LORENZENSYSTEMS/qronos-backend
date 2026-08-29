import prisma from '../../../plugins/database.js';

export class NotificacionRepository {
  async create(notificationData) {
    return prisma.notificacion.create({
      data: notificationData,
    });
  }

  async findPaginated({ page, limit }) {
    const skip = (page - 1) * limit;

    return prisma.notificacion.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        empresa: {
          select: {
            nombreCompleto: true,
          },
        },
      },
    });
  }

  async countAll() {
    return prisma.notificacion.count();
  }

  async countRecent({ since }) {
    return prisma.notificacion.count({
      where: {
        created_at: { gte: since },
      },
    });
  }
}

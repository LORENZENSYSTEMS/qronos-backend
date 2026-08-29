import prisma from '../../../plugins/database.js';

export class ClienteTokenRepository {
  async findPushTokenById(clienteId) {
    return prisma.cliente.findUnique({
      where: { cliente_id: Number(clienteId) },
      select: { pushToken: true },
    });
  }

  async findPushTokensByFilters(filters) {
    const where = {};

    if (filters.paises?.length > 0) {
      where.pais_id = { in: filters.paises };
    }

    if (filters.ciudades?.length > 0) {
      where.ciudad_id = { in: filters.ciudades };
    }

    if (filters.categorias?.length > 0) {
      where.categoria_id = { in: filters.categorias };
    }

    where.pushToken = { not: null };

    return prisma.cliente.findMany({
      where,
      select: {
        pushToken: true,
        cliente_id: true,
      },
    });
  }

  async findAllPushTokens() {
    return prisma.cliente.findMany({
      where: { pushToken: { not: null } },
      select: { pushToken: true },
    });
  }

  async countTotal() {
    return prisma.cliente.count();
  }

  async countWithPushToken() {
    return prisma.cliente.count({
      where: { pushToken: { not: null } },
    });
  }
}

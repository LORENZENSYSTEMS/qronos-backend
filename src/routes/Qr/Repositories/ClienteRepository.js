import prisma from '../../../plugins/database.js';

export class ClienteRepository {
  async findById(clienteId) {
    return prisma.cliente.findUnique({
      where: { cliente_id: Number(clienteId) },
      select: { cliente_id: true },
    });
  }
}

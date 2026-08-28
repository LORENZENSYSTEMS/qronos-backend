import { prisma } from '../../../plugins/database.js';
import { NotFoundError } from '../Services/errors.js';

export class ClienteRepository {
  async findByEmail(email) {
    return prisma.cliente.findFirst({
      where: {
        correo: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
  }

  async existsByEmail(email) {
    const cliente = await prisma.cliente.findFirst({
      where: { correo: email },
    });
    return cliente !== null;
  }

  async findById(id) {
    return prisma.cliente.findUnique({
      where: { cliente_id: id },
      omit: {
        contrasena: true,
      },
    });
  }

  async findAll() {
    return prisma.cliente.findMany({
      omit: {
        contrasena: true,
      },
    });
  }

  async create(data) {
    return prisma.cliente.create({ data });
  }

  async update(id, data) {
    try {
      return await prisma.cliente.update({
        where: { cliente_id: id },
        data,
      });
    } catch (err) {
      if (err?.code === 'P2025') {
        throw new NotFoundError('Cliente no encontrado');
      }
      throw err;
    }
  }

  async delete(id) {
    try {
      await prisma.cliente.delete({
        where: { cliente_id: id },
      });
    } catch (err) {
      if (err?.code === 'P2025') {
        throw new NotFoundError('Cliente no encontrado');
      }
      throw err;
    }
  }

  async findPushTokens() {
    const clientes = await prisma.cliente.findMany({
      where: { pushToken: { not: null } },
      select: { pushToken: true },
    });
    return clientes.map((c) => c.pushToken);
  }
}
import { prisma } from '../../../plugins/database.js';

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

  async findByCorreo(correo) {
    return prisma.empresa.findFirst({
      where: { correo },
      omit: {
        contrasena: true,
      },
    });
  }

  async update(id, data) {
    return prisma.empresa.update({
      where: { empresa_id: id },
      data,
    });
  }

  async findPushTokens() {
    const empresas = await prisma.empresa.findMany({
      where: { pushToken: { not: null } },
      select: { pushToken: true },
    });
    return empresas.map((e) => e.pushToken);
  }
}
import { prisma } from '../../../plugins/database.js';

export class LandingPageRepository {
  async getTotalClientes() {
    return prisma.cliente.count();
  }

  async getTotalEmpresas() {
    return prisma.empresa.count();
  }
}

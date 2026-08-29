export class CanchaService {
  constructor({ repository }) {
    this.repository = repository;
  }

  async createCancha(data) {
    const cancha = await this.repository.create({
      nombre: data.nombre,
      tipo: data.tipo || 'General',
      empresa_id: Number(data.empresa_id),
      activo: data.activo !== undefined ? data.activo : true,
    });

    return { message: 'Cancha creada exitosamente', cancha };
  }

  async getCanchasByEmpresa(empresaId) {
    const canchas = await this.repository.findByEmpresa(empresaId);
    return { canchas };
  }

  async deleteCancha(canchaId) {
    await this.repository.delete(canchaId);
    return { message: 'Cancha eliminada correctamente' };
  }
}
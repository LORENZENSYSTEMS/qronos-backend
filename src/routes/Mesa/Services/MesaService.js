export class MesaService {
  constructor({ repository }) {
    this.repository = repository;
  }

  async createMesa(data) {
    const mesa = await this.repository.create({
      nombre: data.nombre,
      capacidad: data.capacidad ? Number(data.capacidad) : 4,
      empresa_id: Number(data.empresa_id),
      activo: data.activo !== undefined ? data.activo : true,
    });

    return { message: 'Mesa creada exitosamente', mesa };
  }

  async getMesasByEmpresa(empresaId) {
    const mesas = await this.repository.findByEmpresa(empresaId);
    return { mesas };
  }

  async deleteMesa(mesaId) {
    await this.repository.delete(mesaId);
    return { message: 'Mesa eliminada correctamente' };
  }
}
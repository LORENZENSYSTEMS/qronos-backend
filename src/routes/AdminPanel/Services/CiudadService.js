import { ConflictError } from './errors.js';

export class CiudadService {
  constructor({ repository }) {
    this.repository = repository;
  }

  async getCiudadesByPais(paisId) {
    return this.repository.findAll({ paisId });
  }

  async createCiudad(data) {
    try {
      return await this.repository.create(data);
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictError('La ciudad ya existe en este país');
      }
      throw error;
    }
  }

  async deleteCiudad(ciudadId) {
    const empresas = await this.repository.countEmpresas(ciudadId);

    if (empresas > 0) {
      throw new ConflictError(
        `No se puede eliminar la ciudad porque tiene ${empresas} empresas asociadas`
      );
    }

    return this.repository.softDelete(ciudadId);
  }
}

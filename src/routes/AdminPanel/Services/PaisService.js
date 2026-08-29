import { ConflictError } from '../../../utils/errors.js';

export class PaisService {
  constructor({ repository }) {
    this.repository = repository;
  }

  async getAllPaises() {
    return this.repository.findAllActivos();
  }

  async createPais(data) {
    try {
      return await this.repository.create(data);
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictError('El país ya existe o el código está duplicado');
      }
      throw error;
    }
  }

  async deletePais(paisId) {
    const empresas = await this.repository.countEmpresas(paisId);

    if (empresas > 0) {
      throw new ConflictError(
        `No se puede eliminar el país porque tiene ${empresas} empresas asociadas`
      );
    }

    return this.repository.softDelete(paisId);
  }
}

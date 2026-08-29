import { ConflictError } from './errors.js';

export class CategoriaService {
  constructor({ repository }) {
    this.repository = repository;
  }

  async getAllCategorias() {
    return this.repository.findAllActivas();
  }

  async createCategoria(data) {
    try {
      return await this.repository.create(data);
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictError('La categoría ya existe');
      }
      throw error;
    }
  }

  async deleteCategoria(categoriaId) {
    const empresas = await this.repository.countEmpresas(categoriaId);

    if (empresas > 0) {
      throw new ConflictError(
        `No se puede eliminar la categoría porque tiene ${empresas} empresas asociadas`
      );
    }

    return this.repository.softDelete(categoriaId);
  }
}

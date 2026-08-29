import { ConflictError, NotFoundError } from './errors.js';

export class CategoriaProductoService {
  constructor({ repository }) {
    this.repository = repository;
  }

  async getCategorias() {
    const categorias = await this.repository.findAll();
    return { categorias };
  }

  async createCategoria(data) {
    try {
      const nuevaCategoria = await this.repository.create({
        nombre: data.nombre,
        activo: data.activo !== undefined ? data.activo : true,
      });
      return { message: 'Categoría creada con éxito', categoria: nuevaCategoria };
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictError('Ya existe una categoría con este nombre');
      }
      throw error;
    }
  }

  async updateCategoria(categoriaId, data) {
    const categoriaExistente = await this.repository.findById(categoriaId);

    if (!categoriaExistente) {
      throw new NotFoundError('Categoría no encontrada');
    }

    try {
      const categoriaActualizada = await this.repository.update(categoriaId, {
        nombre: data.nombre !== undefined ? data.nombre : categoriaExistente.nombre,
        activo: data.activo !== undefined ? data.activo : categoriaExistente.activo,
      });
      return { message: 'Categoría actualizada con éxito', categoria: categoriaActualizada };
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictError('Ya existe otra categoría con este nombre');
      }
      throw error;
    }
  }

  async deleteCategoria(categoriaId) {
    const categoriaExistente = await this.repository.findById(categoriaId);

    if (!categoriaExistente) {
      throw new NotFoundError('Categoría no encontrada');
    }

    try {
      await this.repository.delete(categoriaId);
      return { success: true, message: 'Categoría eliminada correctamente' };
    } catch (error) {
      if (error?.code === 'P2003') {
        throw new ConflictError(
          'No se puede eliminar la categoría porque tiene productos asociados. Inactívala en su lugar.'
        );
      }
      throw error;
    }
  }
}

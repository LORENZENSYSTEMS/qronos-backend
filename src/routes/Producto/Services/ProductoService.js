import { NotFoundError } from '../../../utils/errors.js';

export class ProductoService {
  constructor({ productoRepository, categoriaProductoRepository }) {
    this.productoRepository = productoRepository;
    this.categoriaProductoRepository = categoriaProductoRepository;
  }

  async getProductosByEmpresa(empresaId) {
    const productos = await this.productoRepository.findByEmpresa(empresaId);
    return { productos };
  }

  async getCategoriasConProductosByEmpresa(empresaId) {
    const productos = await this.productoRepository.findDistinctCategoriaIdsByEmpresa(empresaId);
    const categoriaIds = productos.map((producto) => producto.categoria_prod_id).filter(Boolean);

    const categorias = await this.categoriaProductoRepository.findByIds(categoriaIds);

    return { categorias };
  }

  async createProducto(data) {
    const nuevoProducto = await this.productoRepository.create({
      nombre: data.nombre,
      precio: parseFloat(data.precio),
      imagenUrl: data.imagenUrl,
      descripcion: data.descripcion || null,
      empresa_id: parseInt(data.empresa_id, 10),
      categoria_prod_id: data.categoria_prod_id ? parseInt(data.categoria_prod_id, 10) : null,
    });

    return { message: 'Producto creado con éxito', producto: nuevoProducto };
  }

  async deleteProducto(productoId) {
    const productoExistente = await this.productoRepository.findById(productoId);

    if (!productoExistente) {
      throw new NotFoundError('Producto no encontrado');
    }

    await this.productoRepository.delete(productoId);

    return { success: true, message: 'Producto eliminado' };
  }

  async updateProducto(productoId, data) {
    const productoExistente = await this.productoRepository.findById(productoId);

    if (!productoExistente) {
      throw new NotFoundError('Producto no encontrado');
    }

    const updateData = {};

    if (data.nombre) updateData.nombre = data.nombre;
    if (data.precio) updateData.precio = parseFloat(data.precio);
    if (data.imagenUrl) updateData.imagenUrl = data.imagenUrl;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.categoria_prod_id !== undefined) {
      updateData.categoria_prod_id = data.categoria_prod_id
        ? parseInt(data.categoria_prod_id, 10)
        : null;
    }

    const productoActualizado = await this.productoRepository.update(productoId, updateData);

    return { message: 'Producto actualizado con éxito', producto: productoActualizado };
  }
}

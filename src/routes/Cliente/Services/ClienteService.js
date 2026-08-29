import { ConflictError, NotFoundError } from '../../../utils/errors.js';

export class ClienteService {
  constructor({ repository, empresaRepository, passwordService }) {
    this.repository = repository;
    this.empresaRepository = empresaRepository;
    this.passwordService = passwordService;
  }

  async createCliente(clientData) {
    const contrasena = await this.passwordService.hash(clientData.contrasena);

    if (await this.repository.existsByEmail(clientData.correo)) {
      throw new ConflictError('El cliente ya existe');
    }

    const cliente = await this.repository.create({
      nombreCompleto: clientData.nombreCompleto,
      correo: clientData.correo,
      auth_uid: clientData.auth_uid,
      contrasena,
      rol: clientData.rol || 'Regular',
    });

    return { message: 'Cliente creado exitosamente', cliente };
  }

  async getAllClientes() {
    const clientes = await this.repository.findAll();
    return { clientes };
  }

  async getClientesWithToken() {
    const clientes = await this.repository.findWithToken();
    return { clientes };
  }

  async getClienteById(id) {
    const cliente = await this.repository.findById(id);
    if (!cliente) {
      throw new NotFoundError('Cliente no encontrado');
    }

    const empresa = await this.empresaRepository.findByCorreo(cliente.correo);
    return { data: { empresa, cliente } };
  }

  async updateCliente(id, updateData) {
    if (updateData.contrasena) {
      updateData.contrasena = await this.passwordService.hash(updateData.contrasena);
    }

    const cliente = await this.repository.update(id, updateData);
    return { message: 'Cliente actualizado exitosamente', cliente };
  }

  async deleteCliente(id) {
    await this.repository.delete(id);
    return { message: 'Cliente eliminado exitosamente' };
  }
}
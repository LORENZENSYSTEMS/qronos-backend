import { normalizeEmail } from '../../../utils/validate.js';
import { ConflictError, NotFoundError } from './errors.js';

export class EmpresaService {
  constructor({ repository, firebaseService }) {
    this.repository = repository;
    this.firebaseService = firebaseService;
  }

  async login(email) {
    const safeEmail = normalizeEmail(email);

    const empresa = await this.repository.findByEmail(safeEmail);

    if (!empresa) {
      throw new NotFoundError('Perfil de empresa no encontrado en la base de datos.');
    }

    return {
      message: 'Inicio de sesión de empresa exitoso',
      empresa: empresa.nombreCompleto,
      token_empresa: empresa.empresa_id,
      auth_uid: empresa.auth_uid,
    };
  }

  async createEmpresa(data) {
    const safeEmail = normalizeEmail(data.correo);

    if (await this.repository.findByEmail(safeEmail)) {
      throw new ConflictError('El correo ya está registrado en Firebase.');
    }

    const firebaseUser = await this.firebaseService.createUser({
      email: safeEmail,
      password: data.contrasena,
      displayName: data.nombreCompleto,
    });

    const empresa = await this.repository.create({
      nombreCompleto: data.nombreCompleto,
      correo: safeEmail,
      contrasena: data.contrasena,
      auth_uid: firebaseUser.uid,
    });

    return {
      message: 'Tienda (Empresa) registrada con éxito y verificada.',
      empresa,
    };
  }

  async getAllEmpresas() {
    return this.repository.findAll();
  }

  async getEmpresaById(id) {
    const empresa = await this.repository.findById(id);
    if (!empresa) {
      throw new NotFoundError('Empresa no encontrada');
    }
    return empresa;
  }

  async updateEmpresa(id, data) {
    return this.repository.update(id, data);
  }

  async updateUbicacion(id, lat, lng) {
    return this.repository.update(id, { lat, lng });
  }

  async deleteEmpresa(email) {
    const safeEmail = normalizeEmail(email);

    const empresa = await this.repository.findByEmail(safeEmail);
    if (!empresa) {
      throw new NotFoundError('Empresa no encontrada con ese correo.');
    }

    if (empresa.auth_uid) {
      await this.firebaseService.deleteUser(empresa.auth_uid);
    }

    const resultado = await this.repository.deleteWithRelated(empresa.empresa_id);

    return {
      message:
        'Empresa y todos sus productos y métricas asociados han sido eliminados.',
      empresa: resultado.empresa,
      productosBorrados: resultado.productosBorrados,
      metricasBorradas: resultado.metricasBorradas,
    };
  }

  async verifyEmpresaManually(auth_uid) {
    await this.firebaseService.verifyUser(auth_uid);
    return { message: 'Usuario verificado manualmente en Firebase.' };
  }
}

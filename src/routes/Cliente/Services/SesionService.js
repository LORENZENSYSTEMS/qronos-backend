import { NotFoundError } from '../../../utils/errors.js';

export class SesionService {
  constructor({ authService, pushTokenService, jwtService }) {
    this.authService = authService;
    this.pushTokenService = pushTokenService;
    this.jwtService = jwtService;
  }

  async login(email, pushToken) {
    const { cliente, empresa } = await this.authService.buscarPerfilPorEmail(email);

    if (!cliente && !empresa) {
      throw new NotFoundError('Perfil no encontrado en la base de datos local.');
    }

    if (pushToken) {
      await this.pushTokenService.updatePushTokens(
        { clienteId: cliente?.cliente_id, empresaId: empresa?.empresa_id },
        pushToken
      );
    }

    let payload = { email };
    let rol = 'Guest';

    if (cliente) {
      payload.cliente_id = cliente.cliente_id;
      payload.rol = cliente.rol;
      rol = cliente.rol;
    }

    if (empresa) {
      payload.empresa_id = empresa.empresa_id;
      payload.rol = 'Empresa';
      rol = 'Empresa';
    }

    const jwt = this.jwtService.signAccessToken(payload);

    return {
      jwt,
      rol,
      token: cliente ? cliente.cliente_id : null,
      cliente: cliente ? cliente.nombreCompleto : null,
      token_empresa: empresa ? empresa.empresa_id : null,
      empresa: empresa ? empresa.nombreCompleto : null,
    };
  }
}
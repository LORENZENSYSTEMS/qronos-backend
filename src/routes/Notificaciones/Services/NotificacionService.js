import { NotFoundError } from '../../../utils/errors.js';

const ULTIMOS_7_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

export class NotificacionService {
  constructor({ clienteTokenRepository, notificacionRepository, expoPushService }) {
    this.clienteTokenRepository = clienteTokenRepository;
    this.notificacionRepository = notificacionRepository;
    this.expoPushService = expoPushService;
  }

  async sendToUser({ userId, title, body, data = {} }) {
    const cliente = await this.clienteTokenRepository.findPushTokenById(userId);

    if (!cliente?.pushToken) {
      throw new NotFoundError('Usuario no tiene token de notificación');
    }

    const result = await this.expoPushService.sendToUser(cliente.pushToken, title, body, data);

    await this.notificacionRepository.create({
      titulo: title,
      mensaje: body,
      tipo: 'general',
      enviada: true,
      total_enviados: 1,
      filtros: { usuarios_especificos: [userId] },
    });

    return result;
  }

  async sendByFilters({ filters, title, body, data = {} }) {
    const clientes = await this.clienteTokenRepository.findPushTokensByFilters(filters);
    const tokens = clientes.map((cliente) => cliente.pushToken).filter(Boolean);

    if (tokens.length === 0) {
      throw new NotFoundError('No hay usuarios con tokens para estos filtros');
    }

    const result = await this.expoPushService.sendToMultiple(tokens, title, body, data);

    await this.notificacionRepository.create({
      titulo: title,
      mensaje: body,
      tipo: 'promocion',
      enviada: true,
      total_enviados: tokens.length,
      filtros: filters,
    });

    return {
      ...result,
      usuarios_alcance: tokens.length,
      filtros_aplicados: filters,
    };
  }

  async sendToAll({ title, body, data = {} }) {
    const clientes = await this.clienteTokenRepository.findAllPushTokens();
    const tokens = clientes.map((cliente) => cliente.pushToken).filter(Boolean);

    if (tokens.length === 0) {
      throw new NotFoundError('No hay usuarios con tokens registrados');
    }

    const result = await this.expoPushService.sendToMultiple(tokens, title, body, data);

    await this.notificacionRepository.create({
      titulo: title,
      mensaje: body,
      tipo: 'general',
      enviada: true,
      total_enviados: tokens.length,
      filtros: { todos: true },
    });

    return result;
  }

  async getNotifications({ page = 1, limit = 20 }) {
    const [notifications, total] = await Promise.all([
      this.notificacionRepository.findPaginated({ page, limit }),
      this.notificacionRepository.countAll(),
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats() {
    const [totalNotificaciones, totalUsuarios, tokensValidos, ultimos7Dias] = await Promise.all([
      this.notificacionRepository.countAll(),
      this.clienteTokenRepository.countTotal(),
      this.clienteTokenRepository.countWithPushToken(),
      this.notificacionRepository.countRecent({ since: new Date(Date.now() - ULTIMOS_7_DIAS_MS) }),
    ]);

    const porcentajeTokens =
      totalUsuarios > 0 ? Math.round((tokensValidos / totalUsuarios) * 100) : 0;

    return {
      totalNotificaciones,
      totalUsuarios,
      tokensValidos,
      ultimos7Dias,
      porcentajeTokens,
    };
  }
}

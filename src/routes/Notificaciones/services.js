// services.js
import { Expo } from 'expo-server-sdk';
import prisma from '../../plugins/database.js'

export class NotificationService {
  constructor() {
    this.expo = new Expo();
  }

  // ✅ 1. Enviar a un solo usuario
  async sendToUser(expoToken, title, body, data = {}) {
    if (!Expo.isExpoPushToken(expoToken)) {
      console.error(`Token inválido: ${expoToken}`);
      throw new Error('El token no es válido');
    }

    const messages = [{
      to: expoToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    }];

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (let chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      return { success: true, tickets };
    } catch (error) {
      console.error('Error enviando notificación:', error);
      throw error;
    }
  }

  // ✅ 2. Enviar a múltiples usuarios (con validación)
  async sendToMultiple(tokens, title, body, data = {}) {
    const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));
    
    if (validTokens.length === 0) {
      return { success: false, error: 'No hay tokens válidos' };
    }

    const messages = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    }));

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (let chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      return { 
        success: true, 
        sentCount: messages.length, 
        tickets,
        invalidTokens: tokens.length - validTokens.length 
      };
    } catch (error) {
      console.error('Error enviando notificaciones masivas:', error);
      throw error;
    }
  }

  // ✅ 3. Enviar por filtros (país, ciudad, categoría)
  async sendByFilters(filters, title, body, data = {}) {
    // Construir el WHERE dinámicamente
    const where = {};
    
    if (filters.paises?.length > 0) {
      where.pais_id = { in: filters.paises };
    }
    
    if (filters.ciudades?.length > 0) {
      where.ciudad_id = { in: filters.ciudades };
    }
    
    if (filters.categorias?.length > 0) {
      where.categoria_id = { in: filters.categorias };
    }

    // Solo usuarios con pushToken
    where.pushToken = { not: null };

    // Obtener los tokens (1 sola query optimizada)
    const clientes = await prisma.cliente.findMany({
      where,
      select: {
        pushToken: true,
        cliente_id: true,
      },
    });

    const tokens = clientes.map(c => c.pushToken).filter(Boolean);
    
    if (tokens.length === 0) {
      return { success: false, error: 'No hay usuarios con tokens para estos filtros' };
    }

    // Enviar notificaciones
    const result = await this.sendToMultiple(tokens, title, body, data);
    
    return {
      ...result,
      usuarios_alcance: tokens.length,
      filtros_aplicados: filters,
    };
  }

  // ✅ 4. Procesar tickets fallidos (para limpiar tokens)
  async processReceipts(ticketIds) {
    const receipts = await this.expo.getPushNotificationReceiptsAsync(ticketIds);
    
    const invalidTokens = [];
    
    for (let ticketId of ticketIds) {
      const receipt = receipts[ticketId];
      if (receipt && receipt.status === 'error') {
        if (receipt.details && receipt.details.error === 'DeviceNotRegistered') {
          invalidTokens.push(ticketId);
        }
      }
    }

    return { invalidTokens };
  }

  // ✅ 5. Guardar notificación en base de datos
  async saveNotification(notificationData) {
    return await prisma.notificacion.create({
      data: notificationData,
    });
  }

  // ✅ 6. Obtener todas las notificaciones (para el dashboard)
  async getNotifications(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      prisma.notificacion.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          empresa: {
            select: {
              nombreCompleto: true,
            },
          },
        },
      }),
      prisma.notificacion.count(),
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
import { Expo } from 'expo-server-sdk';
import { NotificationError } from '../../../utils/errors.js';

export class ExpoPushService {
  constructor() {
    this.expo = new Expo();
  }

  async sendToUser(expoToken, title, body, data = {}) {
    if (!Expo.isExpoPushToken(expoToken)) {
      throw new NotificationError('El token no es válido');
    }

    const messages = [
      {
        to: expoToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
      },
    ];

    const tickets = await this._sendMessages(messages).catch((error) => {
      throw new NotificationError(`Error enviando notificación: ${error.message}`);
    });

    return { success: true, tickets };
  }

  async sendToMultiple(tokens, title, body, data = {}) {
    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
      throw new NotificationError('No hay tokens válidos');
    }

    const messages = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    }));

    const tickets = await this._sendMessages(messages).catch((error) => {
      throw new NotificationError(`Error enviando notificaciones masivas: ${error.message}`);
    });

    return {
      success: true,
      sentCount: messages.length,
      tickets,
      invalidTokens: tokens.length - validTokens.length,
    };
  }

  async _sendMessages(messages) {
    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    return tickets;
  }
}

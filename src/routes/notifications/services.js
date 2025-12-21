import { Expo } from 'expo-server-sdk';

export class NotificationService {
  constructor() {
    this.expo = new Expo();
  }

  async sendToMultiple(tokens, title, body, data = {}) {
    let messages = [];

    for (let pushToken of tokens) {
      // 1. Validar cada token antes de intentar enviar
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Token inválido saltado: ${pushToken}`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
      });
    }

    // 3. Dividir los mensajes en "chunks" (trozos) automáticos (máximo 100 por vez)
    let chunks = this.expo.chunkPushNotifications(messages);
    let tickets = [];

    try {
      for (let chunk of chunks) {
        let ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }
      return { success: true, sentCount: messages.length, tickets };
    } catch (error) {
      console.error('Error enviando notificaciones masivas:', error);
      throw error;
    }
  }



  async sendPushNotification(expoToken, title, body, data = {}) {
    // 1. Validar que sea un token de Expo real
    if (!Expo.isExpoPushToken(expoToken)) {
      console.error(`Token inválido: ${expoToken}`);
      throw new Error('El token proporcionado no es un token de Expo válido');
    }

    // 2. Construir el mensaje
    const messages = [{
      to: expoToken,
      sound: 'default',
      title: title,
      body: body,
      data: data, 
      priority: 'high'
    }];

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (let chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      console.log('Notificación enviada con éxito:', tickets);
      return { success: true, tickets };
    } catch (error) {
      console.error('Error en Expo Service:', error);
      throw new Error('No se pudo enviar la notificación a través de Expo');
    }
  }
}


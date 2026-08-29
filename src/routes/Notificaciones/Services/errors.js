export class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Datos inválidos') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotificationError extends AppError {
  constructor(message = 'No se pudo enviar la notificación') {
    super(message, 500, 'NOTIFICATION_ERROR');
  }
}

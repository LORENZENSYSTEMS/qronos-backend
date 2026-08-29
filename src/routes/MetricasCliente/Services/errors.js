export class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto') {
    super(message, 400, 'CONFLICT');
  }
}

export class InvalidTokenError extends AppError {
  constructor(message = 'Token inválido') {
    super(message, 400, 'INVALID_TOKEN');
  }
}

export class UnauthorizedTokenError extends AppError {
  constructor(message = 'Token no autorizado') {
    super(message, 401, 'UNAUTHORIZED_TOKEN');
  }
}

export class ExpiredTokenError extends AppError {
  constructor(message = 'El código QR ha expirado') {
    super(message, 401, 'EXPIRED_TOKEN');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Datos inválidos') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

import crypto from 'crypto';
import {
  InvalidTokenError,
  UnauthorizedTokenError,
  ExpiredTokenError,
} from './errors.js';

const HASH_ALGORITHM = 'sha256';
const EXPIRATION_MS = 300000;

export class QrTokenValidator {
  constructor({ secretKey, expirationMs = EXPIRATION_MS, hashAlgorithm = HASH_ALGORITHM }) {
    this.secretKey = secretKey;
    this.expirationMs = expirationMs;
    this.hashAlgorithm = hashAlgorithm;
  }

  validate(qrToken) {
    if (!this.secretKey) {
      throw new Error('process.env.TOKEN no está definido.');
    }

    const parts = qrToken.split('.');
    if (parts.length !== 2) {
      throw new InvalidTokenError('Formato de token inválido.');
    }

    const [encodedPayload, receivedSignature] = parts;

    const payloadString = Buffer.from(encodedPayload, 'base64').toString('utf8');
    const expectedSignature = crypto
      .createHmac(this.hashAlgorithm, this.secretKey)
      .update(payloadString)
      .digest('hex');

    if (expectedSignature !== receivedSignature) {
      throw new UnauthorizedTokenError('Firma inválida. El código QR ha sido manipulado.');
    }

    const payload = JSON.parse(payloadString);

    if (Date.now() - payload.iat > this.expirationMs) {
      throw new ExpiredTokenError('El código QR ha expirado. Genere uno nuevo.');
    }

    return { clienteId: Number(payload.client_id), iat: payload.iat };
  }
}

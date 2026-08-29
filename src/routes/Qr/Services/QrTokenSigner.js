import crypto from 'crypto';
import { ValidationError } from '../../../utils/errors.js';

const HASH_ALGORITHM = 'sha256';

export class QrTokenSigner {
  constructor({ secretKey, hashAlgorithm = HASH_ALGORITHM }) {
    this.secretKey = secretKey;
    this.hashAlgorithm = hashAlgorithm;
  }

  sign({ clientId }) {
    if (!this.secretKey) {
      throw new ValidationError('TOKEN (QR_SECRET_KEY) no definido');
    }

    const payload = {
      client_id: Number(clientId),
      nonce: crypto.randomUUID(),
      iat: Date.now(),
    };

    const payloadString = JSON.stringify(payload);
    const hmac = crypto
      .createHmac(this.hashAlgorithm, this.secretKey)
      .update(payloadString)
      .digest('hex');

    const encodedPayload = Buffer.from(payloadString).toString('base64');

    return `${encodedPayload}.${hmac}`;
  }
}

import { NotFoundError, ValidationError } from '../../../utils/errors.js';

export class QrService {
  constructor({ qrTokenSigner, clienteRepository }) {
    this.qrTokenSigner = qrTokenSigner;
    this.clienteRepository = clienteRepository;
  }

  async generateQrData({ clientId }) {
    if (!clientId) {
      throw new ValidationError('El client_id es obligatorio');
    }

    const cliente = await this.clienteRepository.findById(clientId);

    if (!cliente) {
      throw new NotFoundError('Cliente no encontrado');
    }

    const qrToken = this.qrTokenSigner.sign({ clientId });

    return {
      message: 'Token de QR generado con firma HMAC',
      qr_token: qrToken,
    };
  }
}

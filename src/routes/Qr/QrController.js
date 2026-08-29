import { QrService, QrTokenSigner, AppError } from './Services/services.js';
import { ClienteRepository } from './Repositories/ClienteRepository.js';

const generateQrSchema = {
  body: {
    type: 'object',
    required: ['client_id'],
    properties: {
      client_id: { type: 'number', description: 'ID del cliente a otorgar los puntos' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        qr_token: {
          type: 'string',
          description: 'Token firmado HMAC codificado en Base64 para generar el QR',
        },
      },
    },
    400: { type: 'object', properties: { message: { type: 'string' } } },
    404: { type: 'object', properties: { message: { type: 'string' } } },
    500: { type: 'object', properties: { message: { type: 'string' }, error: { type: 'string' } } },
  },
};

function enviarError(reply, err) {
  if (err instanceof AppError) {
    return reply.code(err.status).send({ message: err.message, code: err.status });
  }
  console.error(err);
  return reply.code(500).send({ message: err.message, error: err.message });
}

export default async function qrRoutes(fastify, options) {
  const clienteRepository = new ClienteRepository();
  const qrTokenSigner = new QrTokenSigner({ secretKey: process.env.TOKEN });
  const qrService = new QrService({ qrTokenSigner, clienteRepository });

  fastify.post(
    '/generate',
    {
      schema: generateQrSchema,
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const { client_id: clientId } = request.body;
        const result = await qrService.generateQrData({ clientId });
        return reply.code(201).send(result);
      } catch (error) {
        fastify.log.error(error);
        return enviarError(reply, error);
      }
    }
  );
}

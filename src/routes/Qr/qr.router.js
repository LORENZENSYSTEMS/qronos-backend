import { QrServices } from "./services.js";


const generateQrSchema = {
    body: {
        type: 'object',
        required: ['client_id'],
        properties: {
            client_id: { type: 'number', description: 'ID del cliente a otorgar los puntos' },
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                qr_token: { type: 'string', description: 'Token firmado HMAC codificado en Base64 para generar el QR' }
            }
        },
        400: { type: 'object', properties: { message: { type: 'string' } } },
        404: { type: 'object', properties: { message: { type: 'string' } } },
        500: { type: 'object', properties: { message: { type: 'string' }, error: { type: 'string' } } }
    }
}

export default async function metricaRoutes(fastify, options) {
    const qrService = new QrServices();
    // Generar datos para Código QR
    fastify.post('/generate', { schema: generateQrSchema }, async (request, reply) => {
        const { client_id } = request.body;

        const result = await qrService.generateQrData({ client_id });
        
        if (result.code === 201) {
            return reply.code(201).send({
                message: result.message,
                qr_token: result.qr_token
            });
        }
        
        return reply.code(result.code).send({
            message: result.message,
            error: result.error
        });
    });

    

}
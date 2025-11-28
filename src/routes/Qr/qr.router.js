import { QrServices } from "./services.js";

const registerScanSchema = {
    body: {
        type: 'object',
        required: ['cliente_id', 'qr_token'],
        properties: {
            cliente_id: { type: 'number', description: 'ID del cliente que escaneó el QR' },
            qr_token: { type: 'string', description: 'Token firmado extraído del Código QR' }
        }
    }
}

const generateQrSchema = {
    body: {
        type: 'object',
        required: ['empresa_id', 'puntos'],
        properties: {
            empresa_id: { type: 'number', description: 'ID de la empresa que otorga los puntos' },
            puntos: { type: 'number', description: 'Cantidad de puntos a otorgar' }
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
    
    fastify.post('/', async (request, reply) => {
        const result = await qrService.createMetrica(request.body);
        return reply.code(result.code).send(result.code === 201 ? result.metrica : result);
    });

    fastify.post('/register-scan', { schema: registerScanSchema }, async (request, reply) => {
        const { cliente_id, qr_token } = request.body;
        
        const result = await qrService.registerScan({ cliente_id, qr_token });
        
        if (result.code === 201) {
            return reply.code(201).send({
                message: "Puntos registrados con éxito",
                metrica: result.metrica
            });
        }
        
        return reply.code(result.code).send({
            message: result.message,
            error: result.error
        });
    });

    fastify.post('/generate', { schema: generateQrSchema }, async (request, reply) => {
        const { empresa_id, puntos } = request.body;

        const result = await qrService.generateQrData({ empresa_id, puntos });
        
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
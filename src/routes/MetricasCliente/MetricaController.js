import {
  MetricaService,
  QrTokenValidator,
  AppError,
} from './Services/services.js';
import { MetricaRepository } from './Repositories/MetricaRepository.js';

const registerScanSchema = {
  body: {
    type: 'object',
    required: ['empresa_id', 'puntos', 'qr_token'],
    properties: {
      empresa_id: { type: 'number', description: 'ID de la empresa que otorga los puntos' },
      puntos: { type: 'number', description: 'Cantidad de puntos a otorgar' },
      qr_token: { type: 'string', description: 'Token QR del cliente' },
    },
  },
};

function enviarError(reply, err) {
  if (err instanceof AppError) {
    return reply.code(err.status).send({ message: err.message, error: err.message });
  }
  console.error(err);
  return reply.code(500).send({ message: 'Error interno del servidor', error: err.message });
}

export default async function metricaRoutes(fastify) {
  const repository = new MetricaRepository();
  const qrTokenValidator = new QrTokenValidator({ secretKey: process.env.TOKEN });
  const metricaService = new MetricaService({ repository, qrTokenValidator });

  fastify.post(
    '/register-scan',
    {
      schema: registerScanSchema,
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { empresa_id: empresaId, puntos, qr_token: qrToken } = request.body;
      try {
        const result = await metricaService.registerScan({ empresaId, puntos, qrToken });
        return reply.code(result.isNew ? 201 : 200).send({
          message: result.isNew
            ? 'Métrica creada: Puntos registrados con éxito'
            : 'Métrica actualizada: Puntos sumados con éxito',
          metrica: result.metrica,
        });
      } catch (err) {
        return enviarError(reply, err);
      }
    }
  );

  fastify.post('/', async (request, reply) => {
    try {
      const result = await metricaService.createMetrica(request.body);
      return reply.code(201).send(result.metrica);
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  fastify.get(
    '/',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const metricas = await metricaService.getAllMetricas();
        return reply.code(200).send(metricas);
      } catch (err) {
        return enviarError(reply, err);
      }
    }
  );

  fastify.get('/cliente/:clienteId', async (request, reply) => {
    try {
      const metricas = await metricaService.getMetricasByCliente(request.params.clienteId);
      return reply.code(200).send(metricas);
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  fastify.get('/empresa/:empresaId', async (request, reply) => {
    try {
      const metricas = await metricaService.getMetricasByEmpresa(request.params.empresaId);
      return reply.code(200).send(metricas);
    } catch (err) {
      return enviarError(reply, err);
    }
  });
}

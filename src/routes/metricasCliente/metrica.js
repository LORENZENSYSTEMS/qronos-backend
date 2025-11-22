import { MetricaService } from "./services.js";

export default async function metricaRoutes(fastify, options) {
  const metricaService = new MetricaService();
  // Crear métrica
  fastify.post('/', async (request, reply) => {
    const result = await metricaService.createMetrica(request.body);
    return reply.code(result.code).send(result.code === 201 ? result.metrica : result);
  });

  // Obtener TODAS las métricas (sin filtro)
  fastify.get('/', async (request, reply) => {
    const result = await metricaService.getAllMetricas();
    return reply.code(result.code).send(result.code === 200 ? result.metricas : result);
  });

  // --- NUEVA RUTA: Obtener métricas de un CLIENTE específico ---
  fastify.get('/cliente/:clienteId', async (request, reply) => {
    const result = await metricaService.getMetricasByCliente(request.params.clienteId);
    return reply.code(result.code).send(result.code === 200 ? result.metricas : result);
  });

  // --- NUEVA RUTA: Obtener métricas de una EMPRESA específica ---
  fastify.get('/empresa/:empresaId', async (request, reply) => {
    const result = await metricaService.getMetricasByEmpresa(request.params.empresaId);
    return reply.code(result.code).send(result.code === 200 ? result.metricas : result);
  });

  // Obtener una métrica específica por su ID (metrica_id)
  fastify.get('/:id', async (request, reply) => {
    const result = await metricaService.getMetricaById(request.params.id);
    return reply.code(result.code).send(result.code === 200 ? result.metrica : result);
  });

  // Actualizar métrica
  fastify.put('/:id', async (request, reply) => {
    const result = await metricaService.updateMetrica(request.params.id, request.body);
    return reply.code(result.code).send(result.code === 200 ? result.metrica : result);
  });

  // Eliminar métrica
  fastify.delete('/:id', async (request, reply) => {
    const result = await metricaService.deleteMetrica(request.params.id);
    return reply.code(result.code).send(result);
  });

}
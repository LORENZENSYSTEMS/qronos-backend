import metricaService from "./services/metricaService.js";

export default async function metricaRoutes(fastify, options) {

  // Crear métrica
  fastify.post('/metrica', async (request, reply) => {
    const result = await metricaService.createMetrica(request.body);
    
    if (result.code === 201) {
      return reply.code(201).send(result.metrica);
    } else {
      return reply.code(result.code).send(result);
    }
  });

  // Obtener todas
  fastify.get('/metrica', async (request, reply) => {
    const result = await metricaService.getAllMetricas();

    if (result.code === 200) {
      return reply.code(200).send(result.metricas);
    } else {
      return reply.code(result.code).send(result);
    }
  });

  // Obtener por ID
  fastify.get('/metrica/:id', async (request, reply) => {
    const result = await metricaService.getMetricaById(request.params.id);

    if (result.code === 200) {
      return reply.code(200).send(result.metrica);
    } else {
      return reply.code(result.code).send(result);
    }
  });

  // Actualizar
  fastify.put('/metrica/:id', async (request, reply) => {
    const result = await metricaService.updateMetrica(request.params.id, request.body);

    if (result.code === 200) {
      return reply.code(200).send(result.metrica);
    } else {
      return reply.code(result.code).send(result);
    }
  });

  // Eliminar
  fastify.delete('/metrica/:id', async (request, reply) => {
    const result = await metricaService.deleteMetrica(request.params.id);

    if (result.code === 200) {
      return reply.code(200).send(result); // Retorna mensaje y objeto eliminado
    } else {
      return reply.code(result.code).send(result);
    }
  });

}
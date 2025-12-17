import { MetricaService } from "./services.js";

const registerScanSchema = {
    body: {
       type: 'object',
        required: ['empresa_id', 'puntos', 'qr_token'], 
        properties: {
            empresa_id: { type: 'number', description: 'ID de la empresa que otorga los puntos' },
            puntos: { type: 'number', description: 'Cantidad de puntos a otorgar' },
            qr_token: { type: 'string', description: 'Token QR del cliente' }
        }
    }
}


export default async function metricaRoutes(fastify, options) {
  const metricaService = new MetricaService();
  fastify.post('/register-scan', 
    { 
      schema: registerScanSchema,
      preHandler: [fastify.authenticate]
    }, async (request, reply) => {
    // 1. Desestructuración de datos de la solicitud
    const { empresa_id, puntos, qr_token } = request.body;
    
    // 2. Ejecutar el servicio (que ahora usa upsert)
    const result = await metricaService.registerScan({ empresa_id, puntos, qr_token });
    
    // 3. Evaluar el Código de Respuesta
    
    // CASO 1: Éxito (Creación 201 o Actualización 200)
    // NOTA: El servicio registerScan ahora devuelve 201 si crea, y 200 si actualiza.
    if (result.code >= 200 && result.code < 300) {
        
        // El código 201 (Created) se usa cuando la métrica se CREA por primera vez.
        if (result.code === 201) {
            return reply.code(201).send({
                message: "Métrica creada: Puntos registrados con éxito",
                metrica: result.metrica
            });
        }

        // El código 200 (OK) se usa cuando la métrica se ACTUALIZA.
        return reply.code(200).send({
            message: "Métrica actualizada: Puntos sumados con éxito",
            metrica: result.metrica
        });
    }

    // CASO 2: Error (4xx o 5xx)
    // Esto captura errores de validación (400), expiración/firma (401), etc.
    const httpStatusCode = result.code || 500; // Si el código es indefinido, default a 500

    return reply.code(httpStatusCode).send({
        message: result.message || 'Error desconocido al procesar la solicitud.',
        // Solo incluimos 'error' si existe, ya que a veces 'message' es suficiente.
        error: result.error
    });
  });

  // Crear métrica
  fastify.post('/', async (request, reply) => {
    const result = await metricaService.createMetrica(request.body);
    return reply.code(result.code).send(result.code === 201 ? result.metrica : result);
  });

  fastify.get('/',
    {
      // preHandler: [fastify.authenticate]  <-- COMENTA O BORRA ESTA LÍNEA
    }, async (request, reply) => {
    const result = await metricaService.getAllMetricas();
    // Nota: El servicio devuelve { code: 200, metricas: [...] }
    // Tu código actual en metrica.js envía el array directo:
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
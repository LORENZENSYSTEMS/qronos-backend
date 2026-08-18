import { CanchaService } from "./services.js";

export default async function canchaRoutes(fastify) {
  const canchaService = new CanchaService();

  // 1. Crear cancha desde el panel admin
  fastify.post('/', async (request, reply) => {
    const result = await canchaService.createCancha(request.body);
    return reply.code(result.code).send(result);
  });

  // Soportar GET /api/canchas?empresaId=X
  fastify.get('/', async (request, reply) => {
    const empresaId = request.query.empresaId || request.query.empresa_id;
    if (!empresaId) {
      return reply.code(400).send({ message: "Se requiere el empresaId" });
    }
    const result = await canchaService.getCanchasByEmpresa(empresaId);
    return reply.code(result.code).send(result);
  });

  // 2. Listar todas las canchas de una empresa por URL param (Panel Admin)
  fastify.get('/empresa/:empresa_id', async (request, reply) => {
    const result = await canchaService.getCanchasByEmpresa(request.params.empresa_id);
    return reply.code(result.code).send(result);
  });

  // 3. Listar todas las reservas de las canchas de la empresa (Para el panel admin)
  fastify.get('/reservas/empresa/:empresa_id', async (request, reply) => {
    const result = await canchaService.getReservasByEmpresa(request.params.empresa_id);
    return reply.code(result.code).send(result);
  });

  // 4. Consultar canchas disponibles enviando ?empresa_id=X&fecha=YYYY-MM-DD&hora_inicio=HH:mm&hora_fin=HH:mm
  fastify.get('/disponibles', async (request, reply) => {
    const { empresa_id, fecha, hora_inicio, hora_fin, hora } = request.query;
    const hInicio = hora_inicio || hora;
    const result = await canchaService.getCanchasDisponibles(empresa_id, fecha, hInicio, hora_fin);
    return reply.code(result.code).send(result);
  });

  // 5. Registrar la reserva de la cancha seleccionada
  fastify.post('/reservar', async (request, reply) => {
    const result = await canchaService.reservarCancha(request.body);
    return reply.code(result.code).send(result);
  });

  // 6. Actualizar reserva existente
  fastify.put('/reservas/:id', async (request, reply) => {
    const result = await canchaService.updateReserva(request.params.id, request.body);
    return reply.code(result.code).send(result);
  });

  // 7. Eliminar / Cancelar reserva
  fastify.delete('/reservas/:id', async (request, reply) => {
    const result = await canchaService.deleteReserva(request.params.id);
    return reply.code(result.code).send(result);
  });

  // 8. Eliminar cancha
  fastify.delete('/:id', async (request, reply) => {
    const result = await canchaService.deleteCancha(request.params.id);
    return reply.code(result.code).send(result);
  });
}
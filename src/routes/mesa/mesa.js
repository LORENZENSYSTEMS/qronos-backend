import { MesaService } from "./services.js";

export default async function mesaRoutes(fastify) {
  const mesaService = new MesaService();

  // 1. Crear mesa desde el panel admin
  fastify.post('/', async (request, reply) => {
    const result = await mesaService.createMesa(request.body);
    return reply.code(result.code).send(result);
  });

  // Soportar GET /api/mesas?empresaId=X (para que coincida con el frontend)
  fastify.get('/', async (request, reply) => {
    const empresaId = request.query.empresaId || request.query.empresa_id;
    if (!empresaId) {
      return reply.code(400).send({ message: "Se requiere el empresaId" });
    }
    const result = await mesaService.getMesasByEmpresa(empresaId);
    return reply.code(result.code).send(result);
  });

  // 2. Listar todas las mesas de una empresa por URL param (Panel Admin)
  fastify.get('/empresa/:empresa_id', async (request, reply) => {
    const result = await mesaService.getMesasByEmpresa(request.params.empresa_id);
    return reply.code(result.code).send(result);
  });

  // 3. Listar todas las reservas de las mesas de la empresa (Para el panel admin)
  fastify.get('/reservas/empresa/:empresa_id', async (request, reply) => {
    const result = await mesaService.getReservasByEmpresa(request.params.empresa_id);
    return reply.code(result.code).send(result);
  });

  // 4. Consultar mesas disponibles enviando ?empresa_id=X&fecha=YYYY-MM-DD&hora=HH:mm
  fastify.get('/disponibles', async (request, reply) => {
    const { empresa_id, fecha, hora } = request.query;
    const result = await mesaService.getMesasDisponibles(empresa_id, fecha, hora);
    return reply.code(result.code).send(result);
  });

  // 5. Registrar la reserva de la mesa seleccionada
  fastify.post('/reservar', async (request, reply) => {
    const result = await mesaService.reservarMesa(request.body);
    return reply.code(result.code).send(result);
  });

  // 6. Actualizar reserva existente
  fastify.put('/reservas/:id', async (request, reply) => {
    const result = await mesaService.updateReserva(request.params.id, request.body);
    return reply.code(result.code).send(result);
  });

  // 7. Eliminar / Cancelar reserva
  fastify.delete('/reservas/:id', async (request, reply) => {
    const result = await mesaService.deleteReserva(request.params.id);
    return reply.code(result.code).send(result);
  });

  // 8. Eliminar mesa (Ojo: elimina la mesa del local, no la reserva)
  fastify.delete('/:id', async (request, reply) => {
    const result = await mesaService.deleteMesa(request.params.id);
    return reply.code(result.code).send(result);
  });
}
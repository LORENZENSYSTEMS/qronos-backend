import {
  CanchaService,
  ReservaCanchaService,
  DisponibilidadService,
  SlotConflictChecker,
  AppError,
} from './Services/services.js';
import { CanchaRepository } from './Repositories/CanchaRepository.js';
import { ReservaCanchaRepository } from './Repositories/ReservaCanchaRepository.js';

function enviarError(reply, err) {
  if (err instanceof AppError) {
    return reply.code(err.status).send({ message: err.message, code: err.status });
  }
  console.error(err);
  return reply.code(500).send({ message: 'Error interno del servidor', error: err.message, code: 500 });
}

export default async function canchaRoutes(fastify) {
  const canchaRepository = new CanchaRepository();
  const reservaCanchaRepository = new ReservaCanchaRepository();
  const slotConflictChecker = new SlotConflictChecker();

  const canchaService = new CanchaService({ repository: canchaRepository });
  const reservaService = new ReservaCanchaService({
    repository: reservaCanchaRepository,
    slotConflictChecker,
  });
  const disponibilidadService = new DisponibilidadService({
    canchaRepository,
    reservaRepository: reservaCanchaRepository,
    slotConflictChecker,
  });

  // 1. Crear cancha desde el panel admin
  fastify.post('/', async (request, reply) => {
    try {
      const result = await canchaService.createCancha(request.body);
      return reply.code(201).send({ ...result, code: 201 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // Soportar GET /api/canchas?empresaId=X
  fastify.get('/', async (request, reply) => {
    const empresaId = request.query.empresaId || request.query.empresa_id;
    if (!empresaId) {
      return reply.code(400).send({ message: 'Se requiere el empresaId', code: 400 });
    }
    try {
      const result = await canchaService.getCanchasByEmpresa(empresaId);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // 2. Listar todas las canchas de una empresa por URL param (Panel Admin)
  fastify.get('/empresa/:empresa_id', async (request, reply) => {
    try {
      const result = await canchaService.getCanchasByEmpresa(request.params.empresa_id);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // 3. Listar todas las reservas de las canchas de la empresa (Para el panel admin)
  fastify.get('/reservas/empresa/:empresa_id', async (request, reply) => {
    try {
      const result = await reservaService.getReservasByEmpresa(request.params.empresa_id);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // 4. Consultar canchas disponibles enviando ?empresa_id=X&fecha=YYYY-MM-DD&hora_inicio=HH:mm&hora_fin=HH:mm
  fastify.get('/disponibles', async (request, reply) => {
    const empresaId = request.query.empresa_id;
    const fecha = request.query.fecha;
    const horaInicio = request.query.hora_inicio || request.query.hora;
    const horaFin = request.query.hora_fin;

    try {
      const result = await disponibilidadService.getCanchasDisponibles(empresaId, fecha, horaInicio, horaFin);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // 5. Registrar la reserva de la cancha seleccionada
  fastify.post('/reservar', async (request, reply) => {
    try {
      const result = await reservaService.reservarCancha(request.body);
      return reply.code(201).send({ ...result, code: 201 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // 6. Actualizar reserva existente
  fastify.put('/reservas/:id', async (request, reply) => {
    try {
      const result = await reservaService.updateReserva(request.params.id, request.body);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // 7. Eliminar / Cancelar reserva
  fastify.delete('/reservas/:id', async (request, reply) => {
    try {
      const result = await reservaService.deleteReserva(request.params.id);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // 8. Eliminar cancha
  fastify.delete('/:id', async (request, reply) => {
    try {
      const result = await canchaService.deleteCancha(request.params.id);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });
}
import {
  MesaService,
  ReservaMesaService,
  DisponibilidadService,
  AppError,
} from './Services/services.js';
import { MesaRepository } from './Repositories/MesaRepository.js';
import { ReservaMesaRepository } from './Repositories/ReservaMesaRepository.js';

function enviarError(reply, err) {
  if (err instanceof AppError) {
    return reply.code(err.status).send({ message: err.message, code: err.status });
  }
  console.error(err);
  return reply.code(500).send({ message: 'Error interno del servidor', error: err.message, code: 500 });
}

export default async function mesaRoutes(fastify) {
  const mesaRepository = new MesaRepository();
  const reservaMesaRepository = new ReservaMesaRepository();

  const mesaService = new MesaService({ repository: mesaRepository });
  const reservaService = new ReservaMesaService({ repository: reservaMesaRepository });
  const disponibilidadService = new DisponibilidadService({
    mesaRepository,
    reservaRepository: reservaMesaRepository,
  });

  // 1. Crear mesa desde el panel admin
  fastify.post('/', async (request, reply) => {
    try {
      const result = await mesaService.createMesa(request.body);
      return reply.code(201).send({ ...result, code: 201 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // Soportar GET /api/mesas?empresaId=X para que coincida con el frontend
  fastify.get('/', async (request, reply) => {
    const empresaId = request.query.empresaId || request.query.empresa_id;
    if (!empresaId) {
      return reply.code(400).send({ message: 'Se requiere el empresaId', code: 400 });
    }
    try {
      const result = await mesaService.getMesasByEmpresa(empresaId);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // 2. Listar todas las mesas de una empresa por URL param (Panel Admin)
  fastify.get('/empresa/:empresa_id', async (request, reply) => {
    try {
      const result = await mesaService.getMesasByEmpresa(request.params.empresa_id);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // 3. Listar todas las reservas de las mesas de la empresa (Para el panel admin)
  fastify.get('/reservas/empresa/:empresa_id', async (request, reply) => {
    try {
      const result = await reservaService.getReservasByEmpresa(request.params.empresa_id);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // 4. Consultar mesas disponibles enviando ?empresa_id=X&fecha=YYYY-MM-DD&hora=HH:mm
  fastify.get('/disponibles', async (request, reply) => {
    const empresaId = request.query.empresa_id;
    const fecha = request.query.fecha;
    const hora = request.query.hora;

    try {
      const result = await disponibilidadService.getMesasDisponibles(empresaId, fecha, hora);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // 5. Registrar la reserva de la mesa seleccionada
  fastify.post('/reservar', async (request, reply) => {
    try {
      const result = await reservaService.reservarMesa(request.body);
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

  // 8. Eliminar mesa (Ojo: elimina la mesa del local, no la reserva)
  fastify.delete('/:id', async (request, reply) => {
    try {
      const result = await mesaService.deleteMesa(request.params.id);
      return reply.code(200).send({ ...result, code: 200 });
    } catch (err) {
      return enviarError(reply, err);
    }
  });
}
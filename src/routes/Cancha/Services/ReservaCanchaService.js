import { ConflictError, NotFoundError } from './errors.js';

export class ReservaCanchaService {
  constructor({ repository, slotConflictChecker }) {
    this.repository = repository;
    this.slotConflictChecker = slotConflictChecker;
  }

  async getReservasByEmpresa(empresaId) {
    const reservas = await this.repository.findActiveByEmpresa(empresaId);

    const reservasFormat = reservas.map((reserva) => ({
      reserva_id: reserva.reserva_id,
      cancha_nombre: reserva.cancha?.nombre || 'Cancha',
      cliente_nombre: reserva.clienteNombre || 'Sin nombre',
      fecha: reserva.fecha,
      hora_inicio: reserva.hora_inicio,
      hora_fin: reserva.hora_fin,
      personas: reserva.personas,
      estado: reserva.estado,
    }));

    return { reservas: reservasFormat };
  }

  async reservarCancha(data) {
    const horaInicio = data.hora_inicio || data.hora;
    const horaFin = data.hora_fin;

    if (!horaInicio || !horaFin) {
      throw new ConflictError('Se requiere hora de inicio y hora de fin para la reserva.');
    }

    const canchaId = Number(data.cancha_id);
    const reservasExistentes = await this.repository.findActiveByCanchaAndDate(canchaId, data.fecha);

    if (this.slotConflictChecker.findOverlap({ horaInicio, horaFin }, reservasExistentes)) {
      throw new ConflictError('Lo sentimos, esta cancha ya se encuentra reservada en ese horario.');
    }

    const reserva = await this.repository.create({
      cancha_id: canchaId,
      fecha: data.fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      personas: Number(data.personas || 1),
      clienteNombre: data.clienteNombre || data.cliente_nombre || 'Cliente',
      estado: 'pendiente',
    });

    return { message: 'Reserva de cancha registrada con éxito', reserva };
  }

  async updateReserva(reservaId, data) {
    const reservaActual = await this.repository.findById(reservaId);
    if (!reservaActual) {
      throw new NotFoundError('Reserva no encontrada');
    }

    const targetCanchaId = data.cancha_id ? Number(data.cancha_id) : reservaActual.cancha_id;
    const targetFecha = data.fecha || reservaActual.fecha;
    const targetHoraInicio = data.hora_inicio || data.hora || reservaActual.hora_inicio;
    const targetHoraFin = data.hora_fin || reservaActual.hora_fin;

    if (data.cancha_id || data.fecha || data.hora_inicio || data.hora_fin || data.hora) {
      const otrasReservas = await this.repository.findActiveByCanchaAndDateExcluding(
        targetCanchaId,
        targetFecha,
        Number(reservaId),
      );

      if (this.slotConflictChecker.findOverlap({ horaInicio: targetHoraInicio, horaFin: targetHoraFin }, otrasReservas)) {
        throw new ConflictError('Lo sentimos, la cancha ya está reservada en ese horario.');
      }
    }

    const reservaActualizada = await this.repository.update(reservaId, {
      ...(data.cancha_id && { cancha_id: Number(data.cancha_id) }),
      ...(data.fecha && { fecha: data.fecha }),
      ...(data.hora_inicio && { hora_inicio: data.hora_inicio }),
      ...(data.hora_fin && { hora_fin: data.hora_fin }),
      ...(data.personas && { personas: Number(data.personas) }),
      ...(data.clienteNombre && { clienteNombre: data.clienteNombre }),
      ...(data.cliente_nombre && { clienteNombre: data.cliente_nombre }),
      ...(data.estado && { estado: data.estado }),
    });

    return { message: 'Reserva actualizada con éxito', reserva: reservaActualizada };
  }

  async deleteReserva(reservaId) {
    await this.repository.delete(reservaId);
    return { message: 'Reserva eliminada correctamente' };
  }
}
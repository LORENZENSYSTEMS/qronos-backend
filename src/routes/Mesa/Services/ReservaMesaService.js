import { ConflictError, NotFoundError } from '../../../utils/errors.js';

export class ReservaMesaService {
  constructor({ repository }) {
    this.repository = repository;
  }

  async getReservasByEmpresa(empresaId) {
    const reservas = await this.repository.findActiveByEmpresa(empresaId);

    const reservasFormat = reservas.map((reserva) => ({
      reserva_id: reserva.reserva_id,
      mesa_nombre: reserva.mesa?.nombre || 'Mesa',
      cliente_nombre: reserva.clienteNombre || 'Sin nombre',
      fecha: reserva.fecha,
      hora: reserva.hora,
      personas: reserva.personas,
      estado: reserva.estado,
    }));

    return { reservas: reservasFormat };
  }

  async reservarMesa(data) {
    const mesaId = Number(data.mesa_id);

    const ocupada = await this.repository.findActiveByMesaAndFechaHora(mesaId, data.fecha, data.hora);
    if (ocupada) {
      throw new ConflictError('Lo sentimos, esta mesa acaba de ser reservada para esa hora.');
    }

    const reserva = await this.repository.create({
      mesa_id: mesaId,
      fecha: data.fecha,
      hora: data.hora,
      personas: Number(data.personas || 1),
      clienteNombre: data.clienteNombre || 'Cliente',
      estado: 'pendiente',
    });

    return { message: 'Reserva de mesa registrada con éxito', reserva };
  }

  async updateReserva(reservaId, data) {
    const reservaActual = await this.repository.findById(reservaId);
    if (!reservaActual) {
      throw new NotFoundError('Reserva no encontrada');
    }

    if (data.mesa_id || data.fecha || data.hora) {
      const targetMesaId = data.mesa_id ? Number(data.mesa_id) : reservaActual.mesa_id;
      const targetFecha = data.fecha || reservaActual.fecha;
      const targetHora = data.hora || reservaActual.hora;

      const ocupada = await this.repository.findActiveByMesaAndFechaHoraExcluding(
        targetMesaId,
        targetFecha,
        targetHora,
        Number(reservaId),
      );

      if (ocupada) {
        throw new ConflictError('Lo sentimos, la mesa ya está reservada en ese horario.');
      }
    }

    const reservaActualizada = await this.repository.update(reservaId, {
      ...(data.mesa_id && { mesa_id: Number(data.mesa_id) }),
      ...(data.fecha && { fecha: data.fecha }),
      ...(data.hora && { hora: data.hora }),
      ...(data.personas && { personas: Number(data.personas) }),
      ...(data.clienteNombre && { clienteNombre: data.clienteNombre }),
      ...(data.estado && { estado: data.estado }),
    });

    return { message: 'Reserva actualizada con éxito', reserva: reservaActualizada };
  }

  async deleteReserva(reservaId) {
    await this.repository.delete(reservaId);
    return { message: 'Reserva eliminada correctamente' };
  }
}
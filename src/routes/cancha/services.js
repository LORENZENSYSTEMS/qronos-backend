import prisma from "../../plugins/database.js";

export class CanchaService {
  
  // --- CREAR CANCHA (Panel Administrador) ---
  async createCancha(data) {
    try {
      const nuevaCancha = await prisma.cancha.create({
        data: {
          nombre: data.nombre,
          tipo: data.tipo || 'General',
          empresa_id: Number(data.empresa_id),
          activo: data.activo !== undefined ? data.activo : true
        }
      });
      return { code: 201, message: "Cancha creada exitosamente", cancha: nuevaCancha };
    } catch (err) {
      console.error("Error al crear cancha:", err);
      return { code: 500, message: "Error al crear la cancha", error: err.message };
    }
  }

  // --- OBTENER TODAS LAS CANCHAS DE UNA EMPRESA (Panel Admin) ---
  async getCanchasByEmpresa(empresa_id) {
    try {
      const canchas = await prisma.cancha.findMany({
        where: { empresa_id: Number(empresa_id) }
      });
      return { code: 200, canchas };
    } catch (err) {
      return { code: 500, message: "Error al obtener las canchas", error: err.message };
    }
  }

  // --- OBTENER TODAS LAS RESERVAS DE UNA EMPRESA (Panel Admin) ---
  async getReservasByEmpresa(empresa_id) {
    try {
      const reservas = await prisma.reservaCancha.findMany({
        where: {
          cancha: {
            empresa_id: Number(empresa_id)
          }
        },
        include: {
          cancha: {
            select: { nombre: true, tipo: true }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      const reservasFormat = reservas.map(r => ({
        reserva_id: r.reserva_id,
        cancha_nombre: r.cancha?.nombre || 'Cancha',
        cliente_nombre: r.clienteNombre || 'Sin nombre',
        fecha: r.fecha,
        hora_inicio: r.hora_inicio,
        hora_fin: r.hora_fin,
        personas: r.personas,
        estado: r.estado
      }));

      return { code: 200, reservas: reservasFormat };
    } catch (err) {
      console.error("Error al obtener reservas:", err);
      return { code: 500, message: "Error al obtener las reservas", error: err.message };
    }
  }

  // --- OBTENER CANCHAS DISPONIBLES POR RANGO ---
  async getCanchasDisponibles(empresa_id, fecha, hora_inicio, hora_fin) {
    try {
      const todasLasCanchas = await prisma.cancha.findMany({
        where: { 
          empresa_id: Number(empresa_id),
          activo: true
        }
      });

      if (!fecha || !hora_inicio || !hora_fin) {
        return { code: 200, canchas: todasLasCanchas };
      }

      // Obtener reservas activas para la fecha y empresa
      const reservasExistentes = await prisma.reservaCancha.findMany({
        where: {
          fecha: fecha,
          estado: { not: 'cancelada' },
          cancha: {
            empresa_id: Number(empresa_id)
          }
        },
        select: { cancha_id: true, hora_inicio: true, hora_fin: true }
      });

      // Filtrar las canchas cuyos horarios se solapen con el rango solicitado
      const canchasOcupadasIds = reservasExistentes.filter(res => {
        return hora_inicio < res.hora_fin && hora_fin > res.hora_inicio;
      }).map(r => r.cancha_id);

      const canchasDisponibles = todasLasCanchas.filter(cancha => !canchasOcupadasIds.includes(cancha.cancha_id));

      return { code: 200, canchas: canchasDisponibles };
    } catch (err) {
      console.error("Error al consultar disponibilidad:", err);
      return { code: 500, message: "Error al consultar canchas disponibles", error: err.message };
    }
  }

  // --- REGISTRAR RESERVA DE CANCHA CON RANGO ---
  async reservarCancha(data) {
    try {
      const hora_inicio = data.hora_inicio || data.hora;
      const hora_fin = data.hora_fin;

      if (!hora_inicio || !hora_fin) {
        return { code: 400, message: "Se requiere hora de inicio y hora de fin para la reserva." };
      }

      const reservasCancha = await prisma.reservaCancha.findMany({
        where: {
          cancha_id: Number(data.cancha_id),
          fecha: data.fecha,
          estado: { not: 'cancelada' }
        }
      });

      // Validar solapamiento estricto de intervalos
      const ocupada = reservasCancha.find(res => {
        return hora_inicio < res.hora_fin && hora_fin > res.hora_inicio;
      });

      if (ocupada) {
        return { code: 400, message: "Lo sentimos, esta cancha ya se encuentra reservada en ese horario." };
      }

      const nuevaReserva = await prisma.reservaCancha.create({
        data: {
          cancha_id: Number(data.cancha_id),
          fecha: data.fecha,
          hora_inicio: hora_inicio,
          hora_fin: hora_fin,
          personas: Number(data.personas || 1),
          clienteNombre: data.clienteNombre || data.cliente_nombre || 'Cliente',
          estado: 'pendiente'
        }
      });

      return { code: 201, message: "Reserva de cancha registrada con éxito", reserva: nuevaReserva };
    } catch (err) {
      console.error("Error al reservar cancha:", err);
      return { code: 500, message: "Error al procesar la reserva", error: err.message };
    }
  }

  // --- ACTUALIZAR RESERVA ---
  async updateReserva(reserva_id, data) {
    try {
      const reservaActual = await prisma.reservaCancha.findUnique({
        where: { reserva_id: Number(reserva_id) }
      });

      if (!reservaActual) {
        return { code: 404, message: "Reserva no encontrada" };
      }

      const targetCanchaId = data.cancha_id ? Number(data.cancha_id) : reservaActual.cancha_id;
      const targetFecha = data.fecha || reservaActual.fecha;
      const targetHoraInicio = data.hora_inicio || data.hora || reservaActual.hora_inicio;
      const targetHoraFin = data.hora_fin || reservaActual.hora_fin;

      if (data.cancha_id || data.fecha || data.hora_inicio || data.hora_fin || data.hora) {
        const otrasReservas = await prisma.reservaCancha.findMany({
          where: {
            cancha_id: targetCanchaId,
            fecha: targetFecha,
            estado: { not: 'cancelada' },
            reserva_id: { not: Number(reserva_id) }
          }
        });

        const ocupada = otrasReservas.find(res => {
          return targetHoraInicio < res.hora_fin && targetHoraFin > res.hora_inicio;
        });

        if (ocupada) {
          return { code: 400, message: "Lo sentimos, la cancha ya está reservada en ese horario." };
        }
      }

      const reservaActualizada = await prisma.reservaCancha.update({
        where: { reserva_id: Number(reserva_id) },
        data: {
          ...(data.cancha_id && { cancha_id: Number(data.cancha_id) }),
          ...(data.fecha && { fecha: data.fecha }),
          ...(data.hora_inicio && { hora_inicio: data.hora_inicio }),
          ...(data.hora_fin && { hora_fin: data.hora_fin }),
          ...(data.personas && { personas: Number(data.personas) }),
          ...(data.clienteNombre && { clienteNombre: data.clienteNombre }),
          ...(data.cliente_nombre && { clienteNombre: data.cliente_nombre }),
          ...(data.estado && { estado: data.estado })
        }
      });

      return { code: 200, message: "Reserva actualizada con éxito", reserva: reservaActualizada };
    } catch (err) {
      console.error("Error al actualizar reserva:", err);
      return { code: 500, message: "Error al actualizar la reserva", error: err.message };
    }
  }

  // --- ELIMINAR RESERVA ---
  async deleteReserva(reserva_id) {
    try {
      await prisma.reservaCancha.delete({
        where: { reserva_id: Number(reserva_id) }
      });
      return { code: 200, message: "Reserva eliminada correctamente" };
    } catch (err) {
      console.error("Error al eliminar reserva:", err);
      return { code: 500, message: "Error al eliminar la reserva", error: err.message };
    }
  }

  // --- ELIMINAR CANCHA ---
  async deleteCancha(cancha_id) {
    try {
      await prisma.cancha.delete({
        where: { cancha_id: Number(cancha_id) }
      });
      return { code: 200, message: "Cancha eliminada correctamente" };
    } catch (err) {
      return { code: 500, message: "Error al eliminar la cancha", error: err.message };
    }
  }
}
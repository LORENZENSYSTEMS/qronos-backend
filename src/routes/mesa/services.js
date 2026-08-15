import prisma from "../../plugins/database.js";

export class MesaService {
  
  // --- CREAR MESA (Panel Administrador) ---
  async createMesa(data) {
    try {
      const nuevaMesa = await prisma.mesa.create({
        data: {
          nombre: data.nombre,
          capacidad: data.capacidad ? Number(data.capacidad) : 4,
          empresa_id: Number(data.empresa_id),
          activo: data.activo !== undefined ? data.activo : true
        }
      });
      return { code: 201, message: "Mesa creada exitosamente", mesa: nuevaMesa };
    } catch (err) {
      console.error("Error al crear mesa:", err);
      return { code: 500, message: "Error al crear la mesa", error: err.message };
    }
  }

  // --- OBTENER TODAS LAS MESAS DE UNA EMPRESA (Panel Admin) ---
  async getMesasByEmpresa(empresa_id) {
    try {
      const mesas = await prisma.mesa.findMany({
        where: { empresa_id: Number(empresa_id) }
      });
      return { code: 200, mesas };
    } catch (err) {
      return { code: 500, message: "Error al obtener las mesas", error: err.message };
    }
  }

  // --- OBTENER TODAS LAS RESERVAS DE UNA EMPRESA (Panel Admin) ---
  async getReservasByEmpresa(empresa_id) {
    try {
      const reservas = await prisma.reservaMesa.findMany({
        where: {
          mesa: {
            empresa_id: Number(empresa_id)
          }
        },
        include: {
          mesa: {
            select: { nombre: true, capacidad: true }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      const reservasFormat = reservas.map(r => ({
        reserva_id: r.reserva_id,
        mesa_nombre: r.mesa?.nombre || 'Mesa',
        cliente_nombre: r.clienteNombre || 'Sin nombre',
        fecha: r.fecha,
        hora: r.hora,
        personas: r.personas,
        estado: r.estado
      }));

      return { code: 200, reservas: reservasFormat };
    } catch (err) {
      console.error("Error al obtener reservas:", err);
      return { code: 500, message: "Error al obtener las reservas", error: err.message };
    }
  }

  // --- OBTENER MESAS DISPONIBLES (Filtra las que ya tienen reserva en esa fecha/hora) ---
  async getMesasDisponibles(empresa_id, fecha, hora) {
    try {
      // 1. Obtener todas las mesas activas de la empresa
      const todasLasMesas = await prisma.mesa.findMany({
        where: { 
          empresa_id: Number(empresa_id),
          activo: true
        }
      });

      if (!fecha || !hora) {
        return { code: 200, mesas: todasLasMesas };
      }

      // 2. Buscar las mesas que ya están reservadas en esa fecha y hora exacta
      const reservasExistentes = await prisma.reservaMesa.findMany({
        where: {
          fecha: fecha,
          hora: hora,
          estado: { not: 'cancelada' },
          mesa: {
            empresa_id: Number(empresa_id)
          }
        },
        select: { mesa_id: true }
      });

      const mesasOcupadasIds = reservasExistentes.map(r => r.mesa_id);

      // 3. Excluir las mesas ocupadas del listado total
      const mesasDisponibles = todasLasMesas.filter(mesa => !mesasOcupadasIds.includes(mesa.mesa_id));

      return { code: 200, mesas: mesasDisponibles };
    } catch (err) {
      console.error("Error al consultar disponibilidad:", err);
      return { code: 500, message: "Error al consultar mesas disponibles", error: err.message };
    }
  }

  // --- REGISTRAR RESERVA DE MESA (Bloquea la mesa en el horario) ---
  async reservarMesa(data) {
    try {
      // Doble validación por seguridad antes de guardar
      const ocupada = await prisma.reservaMesa.findFirst({
        where: {
          mesa_id: Number(data.mesa_id),
          fecha: data.fecha,
          hora: data.hora,
          estado: { not: 'cancelada' }
        }
      });

      if (ocupada) {
        return { code: 400, message: "Lo sentimos, esta mesa acaba de ser reservada para esa hora." };
      }

      const nuevaReserva = await prisma.reservaMesa.create({
        data: {
          mesa_id: Number(data.mesa_id),
          fecha: data.fecha,
          hora: data.hora,
          personas: Number(data.personas || 1),
          clienteNombre: data.clienteNombre || 'Cliente',
          estado: 'pendiente'
        }
      });

      return { code: 201, message: "Reserva de mesa registrada con éxito", reserva: nuevaReserva };
    } catch (err) {
      console.error("Error al reservar mesa:", err);
      return { code: 500, message: "Error al procesar la reserva", error: err.message };
    }
  }

  // --- ACTUALIZAR RESERVA ---
  async updateReserva(reserva_id, data) {
    try {
      // Si se está cambiando de mesa, fecha u hora, validamos que no esté ocupada
      if (data.mesa_id || data.fecha || data.hora) {
        const reservaActual = await prisma.reservaMesa.findUnique({
          where: { reserva_id: Number(reserva_id) }
        });

        if (!reservaActual) {
          return { code: 404, message: "Reserva no encontrada" };
        }

        const targetMesaId = data.mesa_id ? Number(data.mesa_id) : reservaActual.mesa_id;
        const targetFecha = data.fecha || reservaActual.fecha;
        const targetHora = data.hora || reservaActual.hora;

        const ocupada = await prisma.reservaMesa.findFirst({
          where: {
            mesa_id: targetMesaId,
            fecha: targetFecha,
            hora: targetHora,
            estado: { not: 'cancelada' },
            reserva_id: { not: Number(reserva_id) } // Excluir la reserva actual
          }
        });

        if (ocupada) {
          return { code: 400, message: "Lo sentimos, la mesa ya está reservada en ese horario." };
        }
      }

      const reservaActualizada = await prisma.reservaMesa.update({
        where: { reserva_id: Number(reserva_id) },
        data: {
          ...(data.mesa_id && { mesa_id: Number(data.mesa_id) }),
          ...(data.fecha && { fecha: data.fecha }),
          ...(data.hora && { hora: data.hora }),
          ...(data.personas && { personas: Number(data.personas) }),
          ...(data.clienteNombre && { clienteNombre: data.clienteNombre }),
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
      await prisma.reservaMesa.delete({
        where: { reserva_id: Number(reserva_id) }
      });
      return { code: 200, message: "Reserva eliminada correctamente" };
    } catch (err) {
      console.error("Error al eliminar reserva:", err);
      return { code: 500, message: "Error al eliminar la reserva", error: err.message };
    }
  }

  // --- ELIMINAR MESA ---
  async deleteMesa(mesa_id) {
    try {
      await prisma.mesa.delete({
        where: { mesa_id: Number(mesa_id) }
      });
      return { code: 200, message: "Mesa eliminada correctamente" };
    } catch (err) {
      return { code: 500, message: "Error al eliminar la mesa", error: err.message };
    }
  }
}
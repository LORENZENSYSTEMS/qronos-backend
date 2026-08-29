export class DisponibilidadService {
  constructor({ canchaRepository, reservaRepository, slotConflictChecker }) {
    this.canchaRepository = canchaRepository;
    this.reservaRepository = reservaRepository;
    this.slotConflictChecker = slotConflictChecker;
  }

  async getCanchasDisponibles(empresaId, fecha, horaInicio, horaFin) {
    const todasLasCanchas = await this.canchaRepository.findActiveByEmpresa(empresaId);

    if (!fecha || !horaInicio || !horaFin) {
      return { canchas: todasLasCanchas };
    }

    const reservasExistentes = await this.reservaRepository.findActiveByFechaAndEmpresa(fecha, empresaId);

    const canchasOcupadasIds = reservasExistentes
      .filter((reserva) => this.slotConflictChecker.overlaps({ horaInicio, horaFin }, reserva))
      .map((reserva) => reserva.cancha_id);

    const canchasDisponibles = todasLasCanchas.filter(
      (cancha) => !canchasOcupadasIds.includes(cancha.cancha_id),
    );

    return { canchas: canchasDisponibles };
  }
}
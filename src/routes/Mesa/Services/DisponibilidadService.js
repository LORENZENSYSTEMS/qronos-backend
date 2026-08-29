export class DisponibilidadService {
  constructor({ mesaRepository, reservaRepository }) {
    this.mesaRepository = mesaRepository;
    this.reservaRepository = reservaRepository;
  }

  async getMesasDisponibles(empresaId, fecha, hora) {
    const todasLasMesas = await this.mesaRepository.findActiveByEmpresa(empresaId);

    if (!fecha || !hora) {
      return { mesas: todasLasMesas };
    }

    const reservasExistentes = await this.reservaRepository.findActiveByFechaHoraYEmpresa(fecha, hora, empresaId);

    const mesasOcupadasIds = reservasExistentes.map((reserva) => reserva.mesa_id);

    const mesasDisponibles = todasLasMesas.filter(
      (mesa) => !mesasOcupadasIds.includes(mesa.mesa_id),
    );

    return { mesas: mesasDisponibles };
  }
}
export class SlotConflictChecker {
  overlaps(slot, existing) {
    return slot.horaInicio < existing.hora_fin && slot.horaFin > existing.hora_inicio;
  }

  findOverlap(slot, existingSlots) {
    return existingSlots.find((existing) => this.overlaps(slot, existing));
  }
}
export class PushTokenService {
  constructor(clienteRepository, empresaRepository) {
    this.clienteRepository = clienteRepository;
    this.empresaRepository = empresaRepository;
  }

  async updatePushTokenForCliente(clienteId, pushToken) {
    if (!clienteId) {
      return { success: false, message: "El ID del cliente es requerido para actualizar el push token." };
    }
    if (!pushToken) {
      return { success: false, message: "El push token es requerido para actualizarlo." };
    }
    try {
      const updatedCliente = await this.clienteRepository.update(clienteId, { pushToken });
      return { success: true, message: "Push token actualizado correctamente.", cliente: updatedCliente };
    } catch (error) {
      console.error("Error al actualizar el push token del cliente:", error);
      return { success: false, message: "Error al actualizar el push token del cliente." };
    }
  }

  async updatePushTokenForEmpresa(empresaId, pushToken) {
    if (!empresaId) {
      return { success: false, message: "El ID de la empresa es requerido para actualizar el push token." };
    }
    if (!pushToken) {
      return { success: false, message: "El push token es requerido para actualizarlo." };
    }
    try {
      const updatedEmpresa = await this.empresaRepository.update(empresaId, { pushToken });
      return { success: true, message: "Push token actualizado correctamente.", empresa: updatedEmpresa };
    } catch (error) {
      console.error("Error al actualizar el push token de la empresa:", error);
      return { success: false, message: "Error al actualizar el push token de la empresa." };
    }
  }

  async updatePushTokens(entidades, pushToken) {
    if (!pushToken) return;

    const tareas = [];
    if (entidades.clienteId) {
      tareas.push(this.updatePushTokenForCliente(entidades.clienteId, pushToken));
    }
    if (entidades.empresaId) {
      tareas.push(this.updatePushTokenForEmpresa(entidades.empresaId, pushToken));
    }
    if (tareas.length > 0) {
      await Promise.all(tareas);
    }
  }

  async getAllTokens() {
    const [clienteTokens, empresaTokens] = await Promise.all([
      this.clienteRepository.findPushTokens(),
      this.empresaRepository.findPushTokens(),
    ]);

    return [...clienteTokens, ...empresaTokens];
  }
}
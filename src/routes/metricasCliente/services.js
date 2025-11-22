import { prisma } from "../../plugins/database.js";

export class MetricaService {

  // Crear métrica (General)
  async createMetrica(data) {
    try {
      const nuevaMetrica = await prisma.metrica.create({
        data: {
          cliente_id: data.cliente_id ? Number(data.cliente_id) : null,
          empresa_id: data.empresa_id ? Number(data.empresa_id) : null,
          vecesScan: Number(data.vecesScan),
          puntos: data.puntos ? Number(data.puntos) : null
        }
      });
      return { code: 201, message: "Métrica creada con éxito", metrica: nuevaMetrica };
    } catch (err) {
      return { code: 500, message: "Error al crear la métrica", error: err.message };
    }
  }

  // Obtener todas (General)
  async getAllMetricas() {
    try {
      const metricas = await prisma.metrica.findMany();
      return { code: 200, metricas: metricas };
    } catch (err) {
      return { code: 500, message: "Error al obtener las métricas", error: err.message };
    }
  }

  // --- NUEVO: Obtener métricas filtradas por CLIENTE ---
  async getMetricasByCliente(clienteId) {
    try {
      const metricas = await prisma.metrica.findMany({
        where: { cliente_id: Number(clienteId) },
        include: { cliente: true }
      });
      return { code: 200, metricas: metricas };
    } catch (err) {
      return { code: 500, message: "Error al obtener métricas del cliente", error: err.message };
    }
  }

  // --- NUEVO: Obtener métricas filtradas por EMPRESA ---
  async getMetricasByEmpresa(empresaId) {
    try {
      const metricas = await prisma.metrica.findMany({
        where: { empresa_id: Number(empresaId) },
        include: { empresa: true } 
      });
      return { code: 200, metricas: metricas };
    } catch (err) {
      return { code: 500, message: "Error al obtener métricas de la empresa", error: err.message };
    }
  }

  // Obtener métrica individual por ID (metrica_id)
  async getMetricaById(id) {
    try {
      const metrica = await prisma.metrica.findUnique({
        where: { metrica_id: Number(id) }
      });

      if (!metrica) {
        return { code: 404, message: "Métrica no encontrada" };
      }
      return { code: 200, metrica: metrica };
    } catch (err) {
      return { code: 500, message: "Error al obtener la métrica", error: err.message };
    }
  }

  // Actualizar métrica
  async updateMetrica(id, data) {
    try {
      const metricaActualizada = await prisma.metrica.update({
        where: { metrica_id: Number(id) },
        data: data
      });
      return { code: 200, message: "Métrica actualizada", metrica: metricaActualizada };
    } catch (err) {
      if (err.code === 'P2025') {
        return { code: 404, message: "Métrica no encontrada para actualizar", error: err.message };
      }
      return { code: 500, message: "Error al actualizar la métrica", error: err.message };
    }
  }

  // Eliminar métrica
  async deleteMetrica(id) {
    try {
      const metricaEliminada = await prisma.metrica.delete({
        where: { metrica_id: Number(id) }
      });
      return { code: 200, message: "Métrica eliminada", metrica: metricaEliminada };
    } catch (err) {
      if (err.code === 'P2025') {
        return { code: 404, message: "Métrica no encontrada para eliminar", error: err.message };
      }
      return { code: 500, message: "Error al eliminar la métrica", error: err.message };
    }
  }
}

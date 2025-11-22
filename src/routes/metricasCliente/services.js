import { prisma } from "../../plugins/database.js";

class MetricaService {

  // Crear métrica
  async createMetrica(data) {
    try {
      const nuevaMetrica = await prisma.metrica.create({
        data: data
      });
      return { code: 201, message: "Métrica creada con éxito", metrica: nuevaMetrica };
    } catch (err) {
      return { code: 500, message: "Error al crear la métrica", error: err.message };
    }
  }

  // Obtener todas
  async getAllMetricas() {
    try {
      const metricas = await prisma.metrica.findMany();
      return { code: 200, metricas: metricas };
    } catch (err) {
      return { code: 500, message: "Error al obtener las métricas", error: err.message };
    }
  }

  // Obtener por ID
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

  // Actualizar
  async updateMetrica(id, data) {
    try {
      const metricaActualizada = await prisma.metrica.update({
        where: { metrica_id: Number(id) },
        data: data
      });
      return { code: 200, message: "Métrica actualizada con éxito", metrica: metricaActualizada };
    } catch (err) {
      // Código de error P2025 de Prisma: Registro no encontrado
      if (err.code === 'P2025') {
        return { code: 404, message: "Métrica no encontrada para actualizar", error: err.message };
      }
      return { code: 500, message: "Error al actualizar la métrica", error: err.message };
    }
  }

  // Eliminar
  async deleteMetrica(id) {
    try {
      const metricaEliminada = await prisma.metrica.delete({
        where: { metrica_id: Number(id) }
      });
      return { code: 200, message: "Métrica eliminada con éxito", metrica: metricaEliminada };
    } catch (err) {
      if (err.code === 'P2025') {
        return { code: 404, message: "Métrica no encontrada para eliminar", error: err.message };
      }
      return { code: 500, message: "Error al eliminar la métrica", error: err.message };
    }
  }
}

export default new MetricaService();
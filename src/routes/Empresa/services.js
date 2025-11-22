import { prisma } from "../../plugins/database.js";

class EmpresaService {

  // Crear Empresa
  async createEmpresa(data) {
    try {
      const nuevaEmpresa = await prisma.empresa.create({
        data: {
          nombreCompleto: data.nombreCompleto,
          correo: data.correo,
          contrasena: data.contrasena
        }
      });
      return { code: 201, message: "Empresa creada con éxito", empresa: nuevaEmpresa };
    } catch (err) {
      return { code: 500, message: "Error al crear la empresa", error: err.message };
    }
  }

  // Obtener todas
  async getAllEmpresas() {
    try {
      const empresas = await prisma.empresa.findMany();
      return { code: 200, empresas: empresas };
    } catch (err) {
      return { code: 500, message: "Error al obtener las empresas", error: err.message };
    }
  }

  // Obtener por ID
  async getEmpresaById(id) {
    try {
      const empresa = await prisma.empresa.findUnique({
        where: { empresa_id: Number(id) }
      });

      if (!empresa) {
        return { code: 404, message: "Empresa no encontrada" };
      }

      return { code: 200, empresa: empresa };
    } catch (err) {
      return { code: 500, message: "Error al obtener la empresa", error: err.message };
    }
  }

  // Actualizar
  async updateEmpresa(id, data) {
    try {
      const empresaActualizada = await prisma.empresa.update({
        where: { empresa_id: Number(id) },
        data: data
      });
      return { code: 200, message: "Empresa actualizada", empresa: empresaActualizada };
    } catch (err) {
      // Prisma lanza error si el ID no existe al intentar actualizar
      if (err.code === 'P2025') {
          return { code: 404, message: "Empresa no encontrada para actualizar", error: err.message };
      }
      return { code: 500, message: "Error al actualizar la empresa", error: err.message };
    }
  }

  // Eliminar
  async deleteEmpresa(id) {
    try {
      const empresaEliminada = await prisma.empresa.delete({
        where: { empresa_id: Number(id) }
      });
      return { code: 200, message: "Empresa eliminada", empresa: empresaEliminada };
    } catch (err) {
      if (err.code === 'P2025') {
        return { code: 404, message: "Empresa no encontrada para eliminar", error: err.message };
    }
      return { code: 500, message: "Error al eliminar la empresa", error: err.message };
    }
  }
}

export default new EmpresaService();
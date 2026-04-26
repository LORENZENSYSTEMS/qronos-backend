import { prisma } from "../../plugins/database.js";
import { firebaseAdminAuth } from "../../plugins/firebaseAdmin.js"; // 👈 Importa tu configuración Admin

export class EmpresaService {

  async login(email) {
    // 1. Buscar la empresa por correo para obtener el ID de tu DB y el nombre
    const empresa = await prisma.empresa.findFirst({
      where: { correo: email }
      // Nota: Aquí podrías usar findUnique si 'correo' es @unique
    });

    if (!empresa) {
      // Este error será capturado por el frontend
      return { code: 404, message: "Perfil de empresa no encontrado en la base de datos." };
    }

    // 2. Respuesta de login exitoso
    return {
      code: 200,
      message: "Inicio de sesión de empresa exitoso",
      empresa: empresa.nombreCompleto,
      token_empresa: empresa.empresa_id,
      // Aquí puedes añadir el auth_uid si el frontend lo necesita
      auth_uid: empresa.auth_uid
    };
  }

  // Crear Empresa (Lógica Backend completa - Transparente para el Admin)
  async createEmpresa(data) {
    try {
      // 1. CREAR USUARIO EN FIREBASE (Desde el Backend)
      // Forzamos emailVerified: true para que no deban verificar manualmente
      const firebaseUser = await firebaseAdminAuth.createUser({
        email: data.correo,
        password: data.contrasena,
        displayName: data.nombreCompleto,
        emailVerified: true, // ✅ Ahora se crea verificado automáticamente
        disabled: false
      });

      const authUidGenerado = firebaseUser.uid;

      // 2. GUARDAR EN LA BASE DE DATOS (PRISMA)
      const nuevaEmpresa = await prisma.empresa.create({
        data: {
          nombreCompleto: data.nombreCompleto,
          correo: data.correo,
          contrasena: data.contrasena,
          auth_uid: authUidGenerado
        }
      });

      return {
        code: 201,
        message: "Tienda (Empresa) registrada con éxito y verificada.",
        empresa: nuevaEmpresa
      };

    } catch (err) {
      console.error("Error Backend:", err);

      // Manejo de errores específicos de Firebase Admin
      if (err.code === 'auth/email-already-exists') {
        return { code: 409, message: "El correo ya está registrado en Firebase.", error: err.message };
      }

      return { code: 500, message: "Error al crear la empresa", error: err.message };
    }
  }

  // Obtener todas (Sin cambios)
  async getAllEmpresas() {
    try {
      const empresas = await prisma.empresa.findMany();
      return { code: 200, empresas: empresas };
    } catch (err) {
      return { code: 500, message: "Error al obtener las empresas", error: err.message };
    }
  }

  // Obtener por ID (Sin cambios)
  async getEmpresaById(id) {
    try {
      const empresa = await prisma.empresa.findUnique({
        where: { empresa_id: Number(id) }
      });
      if (!empresa) return { code: 404, message: "Empresa no encontrada" };
      return { code: 200, empresa: empresa };
    } catch (err) {
      return { code: 500, message: "Error al obtener la empresa", error: err.message };
    }
  }

  // Actualizar (Sin cambios)
  async updateEmpresa(id, data) {
    try {
      const empresaActualizada = await prisma.empresa.update({
        where: { empresa_id: Number(id) },
        data: data
      });
      return { code: 200, message: "Empresa actualizada", empresa: empresaActualizada };
    } catch (err) {
      if (err.code === 'P2025') return { code: 404, message: "Empresa no encontrada", error: err.message };
      return { code: 500, message: "Error al actualizar", error: err.message };
    }
  }

  // Eliminar por Correo
  async deleteEmpresa(email) {
    try {
      // 1. Primero obtenemos la empresa por correo para tener su ID y su auth_uid
      const empresa = await prisma.empresa.findUnique({ where: { correo: email } });

      if (!empresa) {
        return { code: 404, message: "Empresa no encontrada con ese correo." };
      }

      const empresaId = empresa.empresa_id;

      // 2. Borrar de Firebase si tiene auth_uid
      if (empresa.auth_uid) {
        try {
          await firebaseAdminAuth.deleteUser(empresa.auth_uid);
        } catch (e) { 
          console.log("Usuario no encontrado en Firebase o ya eliminado:", e.message); 
        }
      }

      // 3. Usamos una transacción para asegurar que se borren los productos, métricas y la empresa de forma atómica
      const [productosEliminados, metricasEliminadas, empresaEliminada] = await prisma.$transaction([
        prisma.producto.deleteMany({ where: { empresa_id: empresaId } }),
        prisma.metrica.deleteMany({ where: { empresa_id: empresaId } }),
        prisma.empresa.delete({ where: { empresa_id: empresaId } })
      ]);

      return { 
        code: 200, 
        message: "Empresa y todos sus productos y métricas asociados han sido eliminados.", 
        empresa: empresaEliminada,
        productosBorrados: productosEliminados.count,
        metricasBorradas: metricasEliminadas.count
      };
    } catch (err) {
      console.error("Error al eliminar empresa:", err);
      return { code: 500, message: "Error al eliminar la empresa y sus datos", error: err.message };
    }
  }

  // NUEVO MÉTODO PARA PRUEBAS
  async verifyEmpresaManually(auth_uid) {
    try {
      await firebaseAdminAuth.updateUser(auth_uid, {
        emailVerified: true
      });
      return { code: 200, message: "Usuario verificado manualmente en Firebase." };
    } catch (err) {
      return { code: 500, message: "Error al verificar usuario en Firebase Admin", error: err.message };
    }
  }
}

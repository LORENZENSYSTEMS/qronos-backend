// services/adminService.js
import prisma from "../../../plugins/database.js";

export class AdminService {
  
  // ---------- PAÍSES ----------
  
  async getAllPaises() {
    return await prisma.pais.findMany({
      where: { activo: true },
      include: {
        _count: {
          select: { empresas: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });
  }

  async createPais(data) {
    return await prisma.pais.create({
      data: {
        nombre: data.nombre,
        codigo: data.codigo
      }
    });
  }

  async deletePais(id) {
    // Verificar si tiene empresas asociadas
    const empresas = await prisma.empresa.count({
      where: { pais_id: id }
    });

    if (empresas > 0) {
      throw new Error(`No se puede eliminar el país porque tiene ${empresas} empresas asociadas`);
    }

    return await prisma.pais.update({
      where: { pais_id: id },
      data: { activo: false }
    });
  }

  // ---------- CIUDADES ----------
  
  async getCiudadesByPais(paisId) {
    const where = { activo: true };
    if (paisId) {
      where.pais_id = paisId;
    }

    return await prisma.ciudad.findMany({
      where,
      include: {
        pais: {
          select: { nombre: true }
        },
        _count: {
          select: { empresas: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });
  }

  async createCiudad(data) {
    return await prisma.ciudad.create({
      data: {
        nombre: data.nombre,
        pais_id: data.pais_id
      }
    });
  }

  async deleteCiudad(id) {
    const empresas = await prisma.empresa.count({
      where: { ciudad_id: id }
    });

    if (empresas > 0) {
      throw new Error(`No se puede eliminar la ciudad porque tiene ${empresas} empresas asociadas`);
    }

    return await prisma.ciudad.update({
      where: { ciudad_id: id },
      data: { activo: false }
    });
  }

  // ---------- CATEGORÍAS ----------
  
  async getAllCategorias() {
    return await prisma.categoria.findMany({
      where: { activo: true },
      include: {
        _count: {
          select: { empresas: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });
  }

  async createCategoria(data) {
    return await prisma.categoria.create({
      data: {
        nombre: data.nombre
      }
    });
  }

  async deleteCategoria(id) {
    const empresas = await prisma.empresa.count({
      where: { categoria_id: id }
    });

    if (empresas > 0) {
      throw new Error(`No se puede eliminar la categoría porque tiene ${empresas} empresas asociadas`);
    }

    return await prisma.categoria.update({
      where: { categoria_id: id },
      data: { activo: false }
    });
  }

  // ---------- TIENDAS DESTACADAS ----------
  
  async toggleDestacada(empresaId, destacada, popular) {
    return await prisma.empresa.update({
      where: { empresa_id: empresaId },
      data: {
        destacada: destacada ?? false,
        popular: popular ?? false
      },
      include: {
        pais_rel: { select: { nombre: true } },
        ciudad_rel: { select: { nombre: true } },
        categoria_rel: { select: { nombre: true } }
      }
    });
  }

  async getEmpresasDestacadas() {
    return await prisma.empresa.findMany({
      where: {
        destacada: true,
        activo: true
      },
      include: {
        pais_rel: { select: { nombre: true } },
        ciudad_rel: { select: { nombre: true } },
        categoria_rel: { select: { nombre: true } }
      },
      orderBy: { updated_at: 'desc' }
    });
  }

  // ---------- MIGRACIÓN GRADUAL ----------
  
  // Migrar datos de strings a relaciones (para el script de migración)
  async migrarDatosExistentes() {
    // Obtener todas las empresas con datos en strings
    const empresas = await prisma.empresa.findMany({
      where: {
        OR: [
          { pais: { not: null } },
          { ciudad: { not: null } },
          { categoria: { not: null } }
        ]
      }
    });

    const resultados = {
      actualizados: 0,
      errores: 0
    };

    for (const empresa of empresas) {
      try {
        // Buscar o crear país
        let paisId = null;
        if (empresa.pais) {
          const pais = await prisma.pais.upsert({
            where: { nombre: empresa.pais.trim() },
            update: {},
            create: { nombre: empresa.pais.trim() }
          });
          paisId = pais.pais_id;
        }

        // Buscar o crear ciudad
        let ciudadId = null;
        if (empresa.ciudad && paisId) {
          const ciudad = await prisma.ciudad.upsert({
            where: {
              nombre_pais_id: {
                nombre: empresa.ciudad.trim(),
                pais_id: paisId
              }
            },
            update: {},
            create: {
              nombre: empresa.ciudad.trim(),
              pais_id: paisId
            }
          });
          ciudadId = ciudad.ciudad_id;
        }

        // Buscar o crear categoría
        let categoriaId = null;
        if (empresa.categoria) {
          const categoria = await prisma.categoria.upsert({
            where: { nombre: empresa.categoria.trim() },
            update: {},
            create: { nombre: empresa.categoria.trim() }
          });
          categoriaId = categoria.categoria_id;
        }

        // Actualizar empresa
        await prisma.empresa.update({
          where: { empresa_id: empresa.empresa_id },
          data: {
            pais_id: paisId,
            ciudad_id: ciudadId,
            categoria_id: categoriaId
          }
        });

        resultados.actualizados++;
      } catch (error) {
        console.error(`Error migrando empresa ${empresa.empresa_id}:`, error);
        resultados.errores++;
      }
    }

    return resultados;
  }
}
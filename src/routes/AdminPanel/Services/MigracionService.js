import prisma from '../../../plugins/database.js';

export class MigracionService {
  constructor() {
    this.prisma = prisma;
  }

  async migrarDatosExistentes() {
    const empresas = await this.prisma.empresa.findMany({
      where: {
        OR: [
          { pais: { not: null } },
          { ciudad: { not: null } },
          { categoria: { not: null } },
        ],
      },
    });

    const resultados = {
      actualizados: 0,
      errores: 0,
    };

    for (const empresa of empresas) {
      try {
        let paisId = null;
        if (empresa.pais) {
          const pais = await this.prisma.pais.upsert({
            where: { nombre: empresa.pais.trim() },
            update: {},
            create: { nombre: empresa.pais.trim() },
          });
          paisId = pais.pais_id;
        }

        let ciudadId = null;
        if (empresa.ciudad && paisId) {
          const ciudad = await this.prisma.ciudad.upsert({
            where: {
              nombre_pais_id: {
                nombre: empresa.ciudad.trim(),
                pais_id: paisId,
              },
            },
            update: {},
            create: {
              nombre: empresa.ciudad.trim(),
              pais_id: paisId,
            },
          });
          ciudadId = ciudad.ciudad_id;
        }

        let categoriaId = null;
        if (empresa.categoria) {
          const categoria = await this.prisma.categoria.upsert({
            where: { nombre: empresa.categoria.trim() },
            update: {},
            create: { nombre: empresa.categoria.trim() },
          });
          categoriaId = categoria.categoria_id;
        }

        await this.prisma.empresa.update({
          where: { empresa_id: empresa.empresa_id },
          data: {
            pais_id: paisId,
            ciudad_id: ciudadId,
            categoria_id: categoriaId,
          },
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

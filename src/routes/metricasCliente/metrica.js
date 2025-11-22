import { prisma } from "../../plugins/database.js";

export default async function metricaRoutes(fastify, options) {

  // Crear métrica
  fastify.post('/metrica', async (request) => {
    return prisma.metrica.create({
      data: request.body
    });
  });

  // Obtener todas
  fastify.get('/metrica', async () => {
    return prisma.metrica.findMany();
  });

  // Obtener por ID
  fastify.get('/metrica/:id', async (request) => {
    return prisma.metrica.findUnique({
      where: { metrica_id: Number(request.params.id) }
    });
  });

  // Actualizar
  fastify.put('/metrica/:id', async (request) => {
    return prisma.metrica.update({
      where: { metrica_id: Number(request.params.id) },
      data: request.body
    });
  });

  // Eliminar
  fastify.delete('/metrica/:id', async (request) => {
    return prisma.metrica.delete({
      where: { metrica_id: Number(request.params.id) }
    });
  });

}

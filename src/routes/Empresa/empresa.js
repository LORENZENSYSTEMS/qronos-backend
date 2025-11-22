import { prisma } from "../../plugins/database.js";

export default async function empresaRoutes(fastify) {

  fastify.post('/empresa', async (request, reply) => {
    const data = request.body;

    const nuevaEmpresa = await prisma.empresa.create({
      data: {
        nombreCompleto: data.nombreCompleto,
        correo: data.correo,
        contrasena: data.contrasena
      }
    });

    return reply.send(nuevaEmpresa);
  });

  fastify.get('/empresa', async () => {
    return prisma.empresa.findMany();
  });

  fastify.get('/empresa/:id', async (request) => {
    return prisma.empresa.findUnique({
      where: { empresa_id: Number(request.params.id) }
    });
  });

  fastify.put('/empresa/:id', async (request) => {
    return prisma.empresa.update({
      where: { empresa_id: Number(request.params.id) },
      data: request.body
    });
  });

  fastify.delete('/empresa/:id', async (request) => {
    return prisma.empresa.delete({
      where: { empresa_id: Number(request.params.id) }
    });
  });

}

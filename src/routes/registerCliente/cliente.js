import { prisma } from "../../plugins/database.js";

export default async function clienteRoutes(fastify, options) {

  // Crear cliente
  fastify.post('/cliente', async (request, reply) => {
    const data = request.body;

    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombreCompleto: data.nombreCompleto,
        correo: data.correo,
        contrasena: data.contrasena
      }
    });

    return reply.send(nuevoCliente);
  });

  // Obtener todos
  fastify.get('/cliente', async () => {
    return prisma.cliente.findMany();
  });

  // Obtener 1 por ID
  fastify.get('/cliente/:id', async (request) => {
    return prisma.cliente.findUnique({
      where: { cliente_id: Number(request.params.id) }
    });
  });

  // Actualizar
  fastify.put('/cliente/:id', async (request) => {
    return prisma.cliente.update({
      where: { cliente_id: Number(request.params.id) },
      data: request.body
    });
  });

  // Eliminar
  fastify.delete('/cliente/:id', async (request) => {
    return prisma.cliente.delete({
      where: { cliente_id: Number(request.params.id) }
    });
  });

}

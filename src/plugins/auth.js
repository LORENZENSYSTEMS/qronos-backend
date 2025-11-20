import fastifyJwt from '@fastify/jwt';

const authPlugin  = async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT,
  });

  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'No autorizado' });
    }
  });
};
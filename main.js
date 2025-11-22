import Fastify from 'fastify';

import clienteRoutes from './src/routes/Cliente/cliente.js';


const app = Fastify({ logger: true });


app.register(clienteRoutes, { prefix: '/api/cliente' }); 


const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Servidor corriendo en http://0.0.0.0:3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
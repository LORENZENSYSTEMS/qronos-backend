
import Fastify from 'fastify'
import RegisterRoutes from './src/routes/registerCliente/router.js';
const app = Fastify({ logger: true })

app.register(RegisterRoutes, { prefix: '/api/client' });

const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Servidor corriendo en http://localhost:3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
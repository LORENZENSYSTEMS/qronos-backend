import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt'
import clienteRoutes from './src/routes/Cliente/cliente.js';
import EmpresaRouter from './src/routes/Empresa/empresa.js';
import metricaRoutes from './src/routes/metricasCliente/metrica.js';
import qrRoutes from './src/routes/Qr/qr.router.js';

const app = Fastify({ logger: true });

app.register(fastifyJwt, { secret: process.env.TOKEN});
app.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

app.register(clienteRoutes, { prefix: '/api/cliente' }); 
app.register(EmpresaRouter, { prefix: '/api/empresa' });
app.register(metricaRoutes, { prefix: '/api/metricas' });
app.register(qrRoutes, { prefix: '/api/qr' });


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
import 'dotenv/config';
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt'
import cors from '@fastify/cors';
import multipart from '@fastify/multipart'; // 👈 IMPORTANTE: Nueva librería
import clienteRoutes from './src/routes/Cliente/cliente.js';
import EmpresaRouter from './src/routes/Empresa/empresa.js';
import metricaRoutes from './src/routes/metricasCliente/metrica.js';
import qrRoutes from './src/routes/Qr/qr.router.js';
import notificationRoutes from './src/routes/notifications/notifications.js';
import landingRoutes from './src/routes/MetricasLandingPage/landing.js';
import productoRoutes from './src/routes/Producto/producto.js';

const app = Fastify({ logger: true });

// Configuración de CORS
await app.register(cors, {
  origin: (origin, cb) => {
    // Permitimos peticiones sin origen (como React Native, Postman o dispositivos móviles)
    // y peticiones de dominios específicos (tu frontend de Astro)
    if (!origin || /localhost/.test(origin) || origin === 'https://qronos.co') {
      cb(null, true);
      return;
    }
    cb(new Error("Not allowed by CORS"), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Configuración de Multipart (Para subir imágenes)
await app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB por archivo
  }
});

app.register(fastifyJwt, { secret: process.env.TOKEN });
app.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

app.get('/', async (request, reply) => { return { status: "running", uptime: process.uptime() } });
app.register(notificationRoutes, { prefix: '/api/notifications' });
app.register(clienteRoutes, { prefix: '/api/cliente' });
app.register(EmpresaRouter, { prefix: '/api/empresa' });
app.register(metricaRoutes, { prefix: '/api/metricas' });
app.register(qrRoutes, { prefix: '/api/qr' });
app.register(landingRoutes, { prefix: '/api/landing' });
app.register(productoRoutes, { prefix: '/api/productos' });

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
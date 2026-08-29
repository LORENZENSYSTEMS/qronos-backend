import 'dotenv/config';
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt'
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import clienteController from './src/routes/Cliente/ClienteController.js';
import EmpresaController from './src/routes/Empresa/EmpresaController.js';
import metricaRoutes from './src/routes/MetricasCliente/metrica.js';
import qrRoutes from './src/routes/Qr/qr.router.js';
import landingRoutes from './src/routes/MetricasLandingPage/landing.js';
import productoRoutes from './src/routes/Producto/producto.js';
import paisesModule from './src/routes/Paises/index.js';
import notificationRoutes from './src/routes/Notificaciones/notificaciones.js';
import mesaRoutes from './src/routes/Mesa/MesaController.js';
import canchaRoutes from './src/routes/Cancha/CanchaController.js';
// 👇 NUEVO: Importamos las rutas de categorías de productos
import categoriaProductoRoutes from './src/routes/categoriaProducto/categoriaProducto.js'; 

// Configuración del logger según entorno
const environment = process.env.NODE_ENV || 'development';

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true,
        singleLine: false,
        levelFirst: true,
        messageFormat: '{msg}',
      }
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.token',
        'req.body.refreshToken',
        'req.query.token'
      ],
      censor: '***'
    },
    level: process.env.LOG_LEVEL || 'info',
  },
  production: {
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.token',
        'req.body.refreshToken'
      ],
      censor: '***'
    }
  },
  test: {
    level: 'silent'
  }
};

// Crear la instancia de Fastify con el logger configurado
const app = Fastify({
  logger: envToLogger[environment] || envToLogger.development,
});

// Configuración de CORS
await app.register(cors, {
  origin: (origin, cb) => {
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

// Agregar un middleware para loggear todas las peticiones automáticamente
app.addHook('onRequest', async (request) => {
  request.log.info({
    method: request.method,
    url: request.url,
    ip: request.ip
  }, 'Incoming request');
});

// Log de respuestas completadas
app.addHook('onResponse', async (request, reply) => {
  request.log.info({
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    responseTime: reply.elapsedTime
  }, 'Request completed');
});

// Log de errores
app.addHook('onError', async (request, reply, error) => {
  request.log.error({
    method: request.method,
    url: request.url,
    error: error.message,
    stack: error.stack
  }, 'Request error');
});

app.get('/', async (request, reply) => {
  request.log.info('Root endpoint accessed');
  return { status: "running", uptime: process.uptime() };
});

app.register(paisesModule);
app.register(notificationRoutes, { prefix: '/api/notifications' });
app.register(clienteController, { prefix: '/api/cliente' });
app.register(EmpresaController, { prefix: '/api/empresa' });
app.register(metricaRoutes, { prefix: '/api/metricas' });
app.register(qrRoutes, { prefix: '/api/qr' });
app.register(landingRoutes, { prefix: '/api/landing' });
app.register(productoRoutes, { prefix: '/api' });
app.register(mesaRoutes, { prefix: '/api/mesas' });
app.register(canchaRoutes, { prefix: '/api/canchas' });
// 👇 NUEVO: Registramos la ruta en Fastify
app.register(categoriaProductoRoutes, { prefix: '/api' }); 

const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    
    app.log.info(`Servidor corriendo en http://0.0.0.0:3000`);
    app.log.info(`Entorno: ${environment}`);
    app.log.info(`Nivel de logs: ${app.log.level}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
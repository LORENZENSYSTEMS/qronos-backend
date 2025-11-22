

import Fastify from 'fastify';

// Importamos ÚNICAMENTE el módulo de rutas centralizado que contiene todo el CRUD
import RegisterRoutes from './src/routes/registerCliente/router.js';


const app = Fastify({ logger: true });


// Registramos el archivo 'router.js'. 
// Este archivo ahora contiene TODAS las rutas CRUD (Cliente, Empresa, Métrica).
// Las rutas internas estarán prefijadas con '/api'.

// Ejemplo: Si dentro de router.js una ruta es Fastify.get('/cliente'), 
// al registrar con el prefijo '/api', el endpoint final será: /api/cliente.
app.register(RegisterRoutes, { prefix: '/api' }); 


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
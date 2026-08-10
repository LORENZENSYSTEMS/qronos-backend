// routes/paises/index.js
import paisesRoutes from './paises.routes.js';
import categoriasRoutes from './categorias.routes.js';
import empresasDestacadasRoutes from './empresas.routes.js';
import ciudadesRoutes from './ciudades.routes.js';

export default async function paisesModule(fastify, options) {
  await fastify.register(paisesRoutes, { prefix: '/api' });
  await fastify.register(ciudadesRoutes, { prefix: '/api' });
  await fastify.register(categoriasRoutes, { prefix: '/api' });
  await fastify.register(empresasDestacadasRoutes, { prefix: '/api' });
}
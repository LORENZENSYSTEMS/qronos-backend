import paisesControllerRoutes from './Controllers/PaisController.js';
import ciudadesControllerRoutes from './Controllers/CiudadController.js';
import categoriasControllerRoutes from './Controllers/CategoriaController.js';
import empresasControllerRoutes from './Controllers/EmpresaController.js';
import { PaisService, CiudadService, CategoriaService, EmpresaService } from './Services/services.js';
import { PaisRepository } from './Repositories/PaisRepository.js';
import { CiudadRepository } from './Repositories/CiudadRepository.js';
import { CategoriaRepository } from './Repositories/CategoriaRepository.js';
import { EmpresaRepository } from './Repositories/EmpresaRepository.js';

export default async function adminPanelController(fastify, options) {
  const paisRepository = new PaisRepository();
  const ciudadRepository = new CiudadRepository();
  const categoriaRepository = new CategoriaRepository();
  const empresaRepository = new EmpresaRepository();

  const paisService = new PaisService({ repository: paisRepository });
  const ciudadService = new CiudadService({ repository: ciudadRepository });
  const categoriaService = new CategoriaService({ repository: categoriaRepository });
  const empresaService = new EmpresaService({ repository: empresaRepository });

  await fastify.register(paisesControllerRoutes, { prefix: '/api', paisService });
  await fastify.register(ciudadesControllerRoutes, { prefix: '/api', ciudadService });
  await fastify.register(categoriasControllerRoutes, { prefix: '/api', categoriaService });
  await fastify.register(empresasControllerRoutes, { prefix: '/api', empresaService });
}

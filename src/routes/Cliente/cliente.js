// archivo: cliente.js
import { normalizeEmail } from '../../utils/validate.js';
import {
  ClienteService,
  SesionService,
  AuthService,
  PushTokenService,
  JwtService,
  PasswordService,
  AppError,
} from './Services/services.js';
import { ClienteRepository } from './Repositories/ClienteRepository.js';
import { EmpresaRepository } from './Repositories/EmpresaRepository.js';

function enviarError(reply, err) {
  if (err instanceof AppError) {
    return reply.code(err.status).send({ message: err.message });
  }
  console.error(err);
  return reply.code(500).send({ message: 'Error interno del servidor', error: err.message });
}

export default async function clienteRoutes(fastify) {
  const passwordService = new PasswordService();
  const jwtService = new JwtService(fastify.jwt);
  const clienteRepository = new ClienteRepository();
  const empresaRepository = new EmpresaRepository();
  const authService = new AuthService(clienteRepository, empresaRepository);
  const pushTokenService = new PushTokenService(clienteRepository, empresaRepository);
  const sesionService = new SesionService({ authService, pushTokenService, jwtService });
  const clienteService = new ClienteService({
    repository: clienteRepository,
    empresaRepository,
    passwordService,
  });

  // Inicio de sesion
  fastify.post('/login', async (request, reply) => {
    try {
      // Recibimos pushToken desde el body que enviamos en el frontend
      const { email, pushToken } = request.body;

      // Normalizamos el correo eliminando espacios y forzando minúsculas
      const emailNormalizado = normalizeEmail(email);

      const res = await sesionService.login(emailNormalizado, pushToken);

      return reply.code(200).send({
        message: 'Inicio de sesión exitoso',
        token: res.token,
        cliente: res.cliente,
        code: 200,
        empresa: res.empresa,
        token_empresa: res.token_empresa,
        jwt: res.jwt,
        rol: res.rol,
      });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // Crear cliente
  fastify.post('/', async (request, reply) => {
    try {
      const res = await clienteService.createCliente(request.body);
      return reply.code(201).send({ message: res.message, cliente: res.cliente });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // Obtener todos
  fastify.get('/', async (request, reply) => {
    try {
      const res = await clienteService.getAllClientes();
      return reply.code(200).send({ clientes: res.clientes });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // Obtener 1 por ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const res = await clienteService.getClienteById(Number(request.params.id));
      return reply.code(200).send({ cliente: res.data });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // Actualizar
  fastify.put('/:id', async (request, reply) => {
    try {
      const res = await clienteService.updateCliente(Number(request.params.id), request.body);
      return reply.code(200).send({ message: res.message, cliente: res.cliente });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // Eliminar
  fastify.delete('/:id', async (request, reply) => {
    try {
      const res = await clienteService.deleteCliente(Number(request.params.id));
      return reply.code(200).send({ message: res.message });
    } catch (err) {
      return enviarError(reply, err);
    }
  });
}
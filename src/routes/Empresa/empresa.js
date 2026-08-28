import { normalizeEmail } from '../../utils/validate.js';
import {
  EmpresaService,
  EmpresaUpdateService,
  FirebaseService,
  AppError,
} from './Services/services.js';
import { EmpresaRepository } from './Repositories/EmpresaRepository.js';

function enviarError(reply, err) {
  if (err instanceof AppError) {
    return reply.code(err.status).send({ message: err.message });
  }
  console.error(err);
  return reply.code(500).send({ message: 'Error interno del servidor', error: err.message });
}

export default async function empresaRoutes(fastify) {
  const empresaRepository = new EmpresaRepository();
  const firebaseService = new FirebaseService();
  const empresaService = new EmpresaService({
    repository: empresaRepository,
    firebaseService,
  });
  const empresaUpdateService = new EmpresaUpdateService();

  // --- LOGIN ---
  fastify.post('/login', async (request, reply) => {
    try {
      const res = await empresaService.login(request.body?.email);

      return reply.code(200).send({
        message: res.message,
        code: 200,
        empresa: res.empresa,
        token_empresa: res.token_empresa,
        auth_uid: res.auth_uid,
      });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // --- CREAR EMPRESA ---
  fastify.post('/', async (request, reply) => {
    try {
      const res = await empresaService.createEmpresa(request.body);
      return reply.code(201).send({ message: res.message, empresa: res.empresa });
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // --- OBTENER TODAS ---
  fastify.get('/', async (request, reply) => {
    try {
      const empresas = await empresaService.getAllEmpresas();
      return reply.code(200).send(empresas);
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // --- OBTENER POR ID ---
  fastify.get('/:id', async (request, reply) => {
    try {
      const empresa = await empresaService.getEmpresaById(request.params.id);
      return reply.code(200).send(empresa);
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // --- ACTUALIZAR (Lógica FormData para imágenes, texto y WhatsApp) ---
  fastify.put('/:id', async (request, reply) => {
    console.log('Headers recibidos:', request.headers['content-type']);

    try {
      const dataToUpdate = await empresaUpdateService.parseAndUpload(request);

      if (Object.keys(dataToUpdate).length === 0) {
        return reply.code(400).send({
          message: 'No se enviaron datos válidos para actualizar.',
          fields_sent: Object.keys(dataToUpdate),
        });
      }

      const result = await empresaService.updateEmpresa(request.params.id, dataToUpdate);
      return reply.code(200).send(result);
    } catch (err) {
      if (err instanceof AppError) {
        return enviarError(reply, err);
      }
      console.error('Error crítico procesando multipart:', err);
      return reply.code(500).send({
        message: 'Error interno procesando la subida de datos.',
        error: err.message,
      });
    }
  });

  // --- ACTUALIZAR UBICACIÓN (lat/lng) ---
  fastify.patch('/:id/ubicacion', async (request, reply) => {
    const { lat, lng } = request.body;

    if (lat === undefined || lng === undefined) {
      return reply.code(400).send({ message: "Los campos 'lat' y 'lng' son obligatorios." });
    }

    if (typeof lat !== 'number' || typeof lng !== 'number' ||
        lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return reply.code(400).send({ message: "Valores de 'lat' y 'lng' inválidos." });
    }

    try {
      const result = await empresaService.updateUbicacion(request.params.id, lat, lng);
      return reply.code(200).send(result);
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // --- ELIMINAR POR CORREO ---
  fastify.delete('/:correo', async (request, reply) => {
    const correoNormalizado = normalizeEmail(
      request.params.correo ? decodeURIComponent(request.params.correo) : ''
    );

    try {
      const result = await empresaService.deleteEmpresa(correoNormalizado);
      return reply.code(200).send(result);
    } catch (err) {
      return enviarError(reply, err);
    }
  });

  // --- VERIFICACIÓN MANUAL ---
  fastify.put('/verify/:auth_uid', async (request, reply) => {
    try {
      const result = await empresaService.verifyEmpresaManually(request.params.auth_uid);
      return reply.code(200).send(result);
    } catch (err) {
      return enviarError(reply, err);
    }
  });
}

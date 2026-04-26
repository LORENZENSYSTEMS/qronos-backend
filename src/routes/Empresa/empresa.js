import { EmpresaService } from "./services.js";
// Asegúrate de que esta ruta sea correcta según tu estructura de carpetas
import { uploadToS3 } from "../../utils/s3Config.js";

export default async function empresaRoutes(fastify) {
  const empresaService = new EmpresaService(fastify);

  // --- LOGIN ---
  fastify.post('/login', async (request, reply) => {
    const { email } = request.body;
    const res = await empresaService.login(email);

    if (res.code >= 400) {
      return reply.code(res.code).send({ message: res.message });
    }

    return reply.code(res.code).send({
      message: res.message,
      code: res.code,
      empresa: res.empresa,
      token_empresa: res.token_empresa,
      auth_uid: res.auth_uid
    });
  });

  // --- CREAR EMPRESA ---
  fastify.post('/', async (request, reply) => {
    const result = await empresaService.createEmpresa(request.body);
    return reply.code(result.code).send(result.code === 201 ? result.empresa : result);
  });

  // --- OBTENER TODAS ---
  fastify.get('/', async (request, reply) => {
    const result = await empresaService.getAllEmpresas();
    return reply.code(result.code).send(result.code === 200 ? result.empresas : result);
  });

  // --- OBTENER POR ID ---
  fastify.get('/:id', async (request, reply) => {
    const result = await empresaService.getEmpresaById(request.params.id);
    return reply.code(result.code).send(result.code === 200 ? result.empresa : result);
  });

  // --- ACTUALIZAR (Lógica FormData para imágenes, texto y WhatsApp) ---
  fastify.put('/:id', async (request, reply) => {
    console.log("Headers recibidos:", request.headers['content-type']);

    // Lista de campos permitidos en el modelo Empresa (Incluyendo 'whatsapp')
    const allowedFields = [
      'nombreCompleto', 'correo', 'contrasena', 'pushToken',
      'fotoPerfil', 'fotoDescripcion1', 'fotoDescripcion2', 'fotoDescripcion3',
      'ubicacionMaps', 'whatsapp', 'descuento', 'descripcion', 'pais', 'ciudad', 'categoria'
    ];

    try {
      const dataToUpdate = {};
      const parts = request.parts();

      for await (const part of parts) {
        if (part.file) {
          // --- ES UN ARCHIVO (IMAGEN) ---
          try {
            const buffer = await part.toBuffer();

            if (buffer && buffer.length > 0) {
              // Verificamos que el fieldname sea uno de los campos de imagen permitidos
              if (allowedFields.includes(part.fieldname)) {
                const url = await uploadToS3(buffer, part.filename, part.mimetype);
                dataToUpdate[part.fieldname] = url;
                console.log(`Imagen subida: ${part.fieldname} -> ${url}`);
              } else {
                console.warn(`Campo de archivo no permitido: ${part.fieldname}`);
              }
            }
          } catch (err) {
            console.error(`Error subiendo imagen ${part.fieldname}:`, err);
          }
        } else {
          // --- ES UN CAMPO DE TEXTO ---
          if (allowedFields.includes(part.fieldname)) {
            // No procesamos valores que vengan como 'null' o 'undefined' en string desde el FormData
            if (part.value !== 'undefined' && part.value !== 'null') {
              dataToUpdate[part.fieldname] = part.value;
            }
          } else {
            console.warn(`Campo de texto ignorado (no en whitelist): ${part.fieldname}`);
          }
        }
      }

      // Validación de datos
      if (Object.keys(dataToUpdate).length === 0) {
        return reply.code(400).send({
          message: "No se enviaron datos válidos para actualizar.",
          fields_sent: Object.keys(dataToUpdate)
        });
      }

      // Llamamos al servicio para actualizar en Prisma
      const result = await empresaService.updateEmpresa(request.params.id, dataToUpdate);

      return reply.code(result.code).send(result.code === 200 ? result.empresa : result);

    } catch (error) {
      console.error("Error crítico procesando multipart:", error);
      return reply.code(500).send({
        message: "Error interno procesando la subida de datos.",
        error: error.message
      });
    }
  });

  // --- ELIMINAR POR CORREO ---
  fastify.delete('/:correo', async (request, reply) => {
    const result = await empresaService.deleteEmpresa(request.params.correo);
    return reply.code(result.code).send(result);
  });

  // --- VERIFICACIÓN MANUAL ---
  fastify.put('/verify/:auth_uid', async (request, reply) => {
    const { auth_uid } = request.params;
    const result = await empresaService.verifyEmpresaManually(auth_uid);
    return reply.code(result.code).send(result);
  });
}
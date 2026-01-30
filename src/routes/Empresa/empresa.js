import { EmpresaService } from "./services.js";
// 👇 Asegúrate de que esta ruta sea correcta según tu estructura de carpetas
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
  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const result = await empresaService.getAllEmpresas();
    return reply.code(result.code).send(result.code === 200 ? result.empresas : result);
  });

  // --- OBTENER POR ID ---
  fastify.get('/:id', async (request, reply) => {
    const result = await empresaService.getEmpresaById(request.params.id);
    return reply.code(result.code).send(result.code === 200 ? result.empresa : result);
  });
  
  // --- ACTUALIZAR (Lógica FormData para imágenes y texto) ---
  fastify.put('/:id', async (request, reply) => {
    console.log("Headers recibidos:", request.headers['content-type']);
    try {
        // Objeto donde acumularemos los datos limpios para enviar al servicio
        const dataToUpdate = {};
        
        // request.parts() devuelve un iterador asíncrono.
        // Es la forma más eficiente de manejar subidas de archivos en Fastify.
        const parts = request.parts();

        for await (const part of parts) {
            if (part.file) {
                // --- ES UN ARCHIVO (IMAGEN) ---
                try {
                    // Convertimos el stream a buffer para poder subirlo a S3
                    const buffer = await part.toBuffer();
                    
                    // Solo subimos si el buffer tiene contenido
                    if (buffer.length > 0) {
                        const url = await uploadToS3(buffer, part.filename, part.mimetype);
                        // Guardamos la URL resultante en el objeto de actualización
                        dataToUpdate[part.fieldname] = url; 
                    }
                } catch (err) {
                    console.error(`Error subiendo imagen ${part.fieldname}:`, err);
                    // Opcional: Podrías lanzar error o continuar con el resto de campos
                }
            } else {
                // --- ES UN CAMPO DE TEXTO (descripcion, pais, etc.) ---
                // FormData convierte todo a string. Filtramos "undefined" o "null" textuales.
                if (part.value !== 'undefined' && part.value !== 'null') {
                    // Convertimos 'true'/'false' strings a booleanos si es necesario, 
                    // o lo dejamos como string según tu DB.
                    dataToUpdate[part.fieldname] = part.value;
                }
            }
        }

        // Si no llegó ningún dato válido, devolvemos error (opcional)
        if (Object.keys(dataToUpdate).length === 0) {
            return reply.code(400).send({ message: "No se enviaron datos para actualizar." });
        }

        // Llamamos al servicio con los datos ya procesados (URLs y textos)
        const result = await empresaService.updateEmpresa(request.params.id, dataToUpdate);

        return reply.code(result.code).send(result.code === 200 ? result.empresa : result);

    } catch (error) {
        console.error("Error procesando multipart:", error);
        return reply.code(500).send({ message: "Error interno procesando la subida de archivos." });
    }
  });

  // --- ELIMINAR ---
  fastify.delete('/:id', async (request, reply) => {
    const result = await empresaService.deleteEmpresa(request.params.id);
    return reply.code(result.code).send(result); 
  });
  
  // --- VERIFICACIÓN MANUAL ---
  fastify.put('/verify/:auth_uid', async (request, reply) => {
      const { auth_uid } = request.params;
      const result = await empresaService.verifyEmpresaManually(auth_uid); 
      return reply.code(result.code).send(result);
  });
}
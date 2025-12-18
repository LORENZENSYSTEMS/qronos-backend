import { EmpresaService } from "./services.js"; // Asegúrate de que la ruta de importación sea correcta

export default async function empresaRoutes(fastify) {
  // Inicializamos el servicio dentro del alcance de la función
  const empresaService = new EmpresaService(fastify);


  // --- NUEVA RUTA DE LOGIN PARA EMPRESA ---
    fastify.post('/login', async (request, reply) => {
        // 💡 Asumo que el Frontend envía { email, password }
        const { email } = request.body; 
        
        // La autenticación (contraseña) la hizo Firebase. Solo necesitamos buscar el perfil por email.
        const res = await empresaService.login(email); 
        
        // Ajuste de respuesta
        if (res.code >= 400) {
            // 404/500/etc.
            reply.code(res.code).send({ message: res.message });
        } else {
            // 200 OK
            reply.code(res.code).send({
                message: res.message, 
                code: res.code,
                empresa: res.empresa, 
                token_empresa: res.token_empresa,
                auth_uid: res.auth_uid // Opcional, pero útil
            });
        }
    });
    
  // --- RUTAS PRINCIPALES (POST y GET) ---
  
  // Crear Empresa
  fastify.post('/', async (request, reply) => {
    const result = await empresaService.createEmpresa(request.body);
    
    if (result.code === 201) {
      // Nota: Si el servicio devuelve el URL de verificación, asegúrate de que esté incluido aquí si lo necesitas.
      return reply.code(201).send(result.empresa); 
    } else {
      return reply.code(result.code).send(result);
    }
  });

  // Obtener todas
  fastify.get('/', 
    {
      preHandler: [fastify.authenticate]
    },async (request, reply) => {
    const result = await empresaService.getAllEmpresas();

    if (result.code === 200) {
      return reply.code(200).send(result.empresas);
    } else {
      return reply.code(result.code).send(result);
    }
  });

  // Obtener por ID
  fastify.get('/:id', async (request, reply) => {
    const result = await empresaService.getEmpresaById(request.params.id);

    if (result.code === 200) {
      return reply.code(200).send(result.empresa);
    } else {
      return reply.code(result.code).send(result);
    }
  });
  
  // --- RUTAS QUE ESTABAN FUERA DE ÁMBITO ---

  // Actualizar
  fastify.put('/:id', async (request, reply) => {
    const result = await empresaService.updateEmpresa(request.params.id, request.body);

    if (result.code === 200) {
      return reply.code(200).send(result.empresa);
    } else {
      return reply.code(result.code).send(result);
    }
  });

  // Eliminar
  fastify.delete('/:id', async (request, reply) => {
    const result = await empresaService.deleteEmpresa(request.params.id);

    if (result.code === 200) {
      return reply.code(200).send(result); 
    } else {
      return reply.code(result.code).send(result);
    }
  });
  
  // RUTA TEMPORAL DE VERIFICACIÓN MANUAL
  // Esta ruta también debe estar DENTRO de la función principal
  fastify.put('/verify/:auth_uid', async (request, reply) => {
      const { auth_uid } = request.params;
      // Asume que verifyEmpresaManually está definido en EmpresaService
      const result = await empresaService.verifyEmpresaManually(auth_uid); 

      return reply.code(result.code).send(result);
  });
  
  // NOTA: El cierre de la función principal debe ser AQUÍ
}
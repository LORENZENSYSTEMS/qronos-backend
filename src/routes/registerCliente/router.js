import { prisma } from "../../plugins/database.js";

/**
 * Registra todas las rutas CRUD para Cliente, Empresa, y Métrica.
 * @param {import('fastify').FastifyInstance} Fastify
 */
const RegisterRoutes = async (Fastify) => {
    
    // ===============================================
    //               CRUD DE CLIENTE (/cliente)
    // ===============================================
    
    // POST /api/cliente: Crear (Registrar)
    Fastify.post('/api/cliente', async (request, reply) => {
        const data = request.body;
        try {
            const nuevoCliente = await prisma.cliente.create({
                data: {
                    nombreCompleto: data.nombreCompleto,
                    correo: data.correo,
                    contrasena: data.contrasena // Deberías hashear esta contraseña
                }
            });
            return reply.code(201).send(nuevoCliente);
        } catch (error) {
            if (error.code === 'P2002') {
                return reply.code(409).send({ message: "El correo electrónico ya está registrado." });
            }
            Fastify.log.error(error);
            return reply.code(500).send({ message: "Error al crear el cliente." });
        }
    });

    // GET /api/cliente: Obtener todos
    Fastify.get('/api/cliente', async () => {
        return prisma.cliente.findMany();
    });

    // GET /api/cliente/:id: Obtener 1 por ID
    Fastify.get('/api/cliente/:id', async (request) => {
        return prisma.cliente.findUnique({
            where: { cliente_id: Number(request.params.id) }
        });
    });

    // PUT /api/cliente/:id: Actualizar
    Fastify.put('/api/cliente/:id', async (request) => {
        return prisma.cliente.update({
            where: { cliente_id: Number(request.params.id) },
            data: request.body
        });
    });

    // DELETE /api/cliente/:id: Eliminar
    Fastify.delete('/api/cliente/:id', async (request) => {
        return prisma.cliente.delete({
            where: { cliente_id: Number(request.params.id) }
        });
    });

    // ===============================================
    //               CRUD DE EMPRESA (/empresa)
    // ===============================================
    
    // POST /api/empresa: Crear (Registrar)
    Fastify.post('/api/empresa', async (request, reply) => {
        const data = request.body;
        try {
            const nuevaEmpresa = await prisma.empresa.create({
                data: {
                    nombreCompleto: data.nombreCompleto,
                    correo: data.correo,
                    contrasena: data.contrasena // Deberías hashear esta contraseña
                }
            });
            return reply.code(201).send(nuevaEmpresa);
        } catch (error) {
            if (error.code === 'P2002') {
                return reply.code(409).send({ message: "El correo electrónico ya está registrado." });
            }
            Fastify.log.error(error);
            return reply.code(500).send({ message: "Error al crear la empresa." });
        }
    });

    // GET /api/empresa: Obtener todos
    Fastify.get('/api/empresa', async () => {
        return prisma.empresa.findMany();
    });

    // GET /api/empresa/:id: Obtener 1 por ID
    Fastify.get('/api/empresa/:id', async (request) => {
        return prisma.empresa.findUnique({
            where: { empresa_id: Number(request.params.id) }
        });
    });

    // PUT /api/empresa/:id: Actualizar
    Fastify.put('/api/empresa/:id', async (request) => {
        return prisma.empresa.update({
            where: { empresa_id: Number(request.params.id) },
            data: request.body
        });
    });

    // DELETE /api/empresa/:id: Eliminar
    Fastify.delete('/api/empresa/:id', async (request) => {
        return prisma.empresa.delete({
            where: { empresa_id: Number(request.params.id) }
        });
    });
    
    // ===============================================
    //               CRUD DE MÉTRICA (/metrica)
    // ===============================================

    // POST /api/metrica: Crear
    Fastify.post('/api/metrica', async (request, reply) => {
        try {
            const nuevaMetrica = await prisma.metrica.create({
                data: request.body
                // Asegúrate de que request.body incluya Cliente_ID y/o Empresa_ID
            });
            return reply.code(201).send(nuevaMetrica);
        } catch (error) {
            // Manejo de errores de FK si Cliente_ID o Empresa_ID no existen
            Fastify.log.error(error);
            return reply.code(500).send({ message: "Error al crear la métrica. Verifique las IDs de cliente/empresa." });
        }
    });

    // GET /api/metrica: Obtener todas
    Fastify.get('/api/metrica', async () => {
        return prisma.metrica.findMany();
    });

    // GET /api/metrica/:id: Obtener 1 por ID
    Fastify.get('/api/metrica/:id', async (request) => {
        // Asumiendo que Metrica tiene un PK llamado metrica_id
        return prisma.metrica.findUnique({
            where: { metrica_id: Number(request.params.id) }
        });
    });

    // PUT /api/metrica/:id: Actualizar
    Fastify.put('/api/metrica/:id', async (request) => {
        return prisma.metrica.update({
            where: { metrica_id: Number(request.params.id) },
            data: request.body
        });
    });

    // DELETE /api/metrica/:id: Eliminar
    Fastify.delete('/api/metrica/:id', async (request) => {
        return prisma.metrica.delete({
            where: { metrica_id: Number(request.params.id) }
        });
    });

}

export default RegisterRoutes;
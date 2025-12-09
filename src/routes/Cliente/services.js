import {prisma} from '../../plugins/database.js';
import {hashPassword,verifyPassword} from '../../plugins/bcrypt.js';
export class ClienteService {
    fastify;
    constructor(Fastify) {
        this.fastify = Fastify
    }

<<<<<<< HEAD
    async login(email) { // 💡 Ya no necesitamos 'password' aquí, solo el 'email'
        // 1. Buscar el cliente por correo para obtener el ID de tu DB y el nombre
        const cliente = await prisma.cliente.findFirst({
            where: { correo: email }
=======
    async login(email, password) {
        const cliente =  await prisma.cliente.findFirst({
            where: { correo: email },
>>>>>>> c715978d0377d317e54958e6036d2ba00df4577d
        });

        if (!cliente) {
            // Este error se produce si Firebase Auth tiene el usuario, 
            // pero tu DB local no. Esto es lo que causa el error en el frontend.
            return {code:404, message:"Perfil de cliente no encontrado en la base de datos."};
        }

        // 2. Buscar la empresa (si existe)
        const empresa = await prisma.empresa.findFirst({
            where:{
                correo:cliente.correo
            },
            // Como eliminaste 'contrasena' del esquema, el 'omit' no es necesario
            // pero lo dejamos por si acaso:
            // omit:{ contrasena:true } 
        })
        
        // 3. Respuesta de login exitoso
        if(!empresa){
<<<<<<< HEAD
            // Usamos el cliente_id como token (como lo hacías antes)
            return {code:200, message:"Inicio de sesion exitoso", token:cliente.cliente_id, cliente:cliente.nombreCompleto};
        }
        
        return {code:200, message:"Inicio de sesion exitoso", token:cliente.cliente_id, cliente:cliente.nombreCompleto, empresa:empresa.nombreCompleto, token_empresa:empresa.empresa_id};
=======
            const payload = {
                token:cliente.cliente_id,
                cliente:cliente.nombreCompleto,
                rol:cliente.rol
            }

            const jwt = this.fastify.jwt.sign(payload , {expiresIn:'1d'})

            return {code:200, message:"Inicio de sesion exitoso", token:cliente.cliente_id,cliente:cliente.nombreCompleto,rol:cliente.rol,jwt:jwt};
        }

        const payload = {
               token:cliente.cliente_id,
               cliente:cliente.nombreCompleto,
               empresa:empresa.nombreCompleto,
               token_empresa:empresa.empresa_id,
               rol:cliente.rol,
            }

        const jwt = this.fastify.jwt.sign(payload, {expiresIn:'1d'})

        return {code:200, message:"Inicio de sesion exitoso", token:cliente.cliente_id,cliente:cliente.nombreCompleto,empresa:empresa.nombreCompleto,token_empresa:empresa.empresa_id,rol:cliente.rol,jwt:jwt};
>>>>>>> c715978d0377d317e54958e6036d2ba00df4577d
    }

    async createCliente(clientData) {
        
        // 1. Verificar si el cliente ya existe por correo.
        const existingCliente = await prisma.cliente.findFirst({
            where: { correo: clientData.correo }
        });
        
        if(existingCliente){
            return {code:409, message:"El cliente ya existe en la base de datos"};
        }
        
        // 2. Crear el nuevo cliente.
        try {
            // 🔥 CAMBIO CRÍTICO: Usar clientData.contrasena
            // Si el frontend envía 'password', debe ser renombrado en el frontend.
            const newCliente = await prisma.cliente.create({
                data: {
                    nombreCompleto: clientData.nombreCompleto,
                    correo: clientData.correo,
                    auth_uid: clientData.auth_uid,
                    // Aseguramos que la contraseña se guarde, asumiendo que el frontend la envía.
                    contrasena: clientData.contrasena 
                }
            });
            return {code:201, message:"Cliente creado exitosamente", cliente:newCliente};
        } catch (error) {
            console.error("Error FATAL de Prisma al crear cliente:", error);
            return {
                code: 500, 
                message: "Error interno al guardar el cliente.", 
                internalError: error.message 
            };
        }
    }

    async getAllClientes() {
        try {
            const clientes = await prisma.cliente.findMany(); // Ya no necesita 'omit: {contrasena: true}'
            return {code:200, clientes:clientes};
        }catch (err) {
            return {code:500, message:"Error al obtener los clientes", error: err.message};
        }
    }

    async getClienteById(id) {
        try {
            const cliente = await prisma.cliente.findUnique({
                where: { cliente_id: id },
            });
            const empresa = await prisma.empresa.findFirst({
                where: { correo: cliente.correo },
            });
            if (!cliente) {
                return {code:404, message:"Cliente no encontrado"};
            }
            return {code:200, data:{empresa:empresa,cliente:cliente}};
        } catch (err) {
            return {code:500, message:"Error al obtener el cliente", error: err.message};
        }
    }

    async updateCliente(id, updateData) {
        try {
            const updatedCliente = await prisma.cliente.update({
                where: { cliente_id: id },
                data: updateData
            });
            return {code:200, message:"Cliente actualizado exitosamente", cliente:updatedCliente};
        } catch (err) {
            return {code:500, message:"Error al actualizar el cliente", error: err.message};
        }
    }

    async deleteCliente(id) {
        try {
            await prisma.cliente.delete({
                where: { cliente_id: id }
            });
            return {code:200, message:"Cliente eliminado exitosamente"};
        } catch (err) {
            return {code:500, message:"Error al eliminar el cliente", error: err.message};
        }
    }
}
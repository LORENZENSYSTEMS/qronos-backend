import {prisma} from '../../plugins/database.js';
// Ya no necesitamos verifyPassword ni hashPassword aquí si solo buscamos
import {hashPassword,verifyPassword} from '../../plugins/bcrypt.js'; 

// ...
export class ClienteService {
    fastify;
    constructor(Fastify) {
        this.fastify = Fastify
    }

    async login(email) { // ¡Ya no se necesita la contraseña aquí!
        // 1. Buscar Cliente
        const cliente = await prisma.cliente.findFirst({
            where: { correo: email },
        });

        // 2. Buscar Empresa (basada en el mismo correo)
        const empresa = await prisma.empresa.findFirst({
            where: { correo: email },
            omit: { contrasena: true } // Evitar exponer la contraseña
        });

        if (!cliente && !empresa) {
            // Ningún perfil encontrado en DB (aunque Firebase pasó)
            return { 
                code: 404, 
                message: "Perfil no encontrado en la base de datos local (Cliente o Empresa).",
                jwt: null 
            };
    }

        // 3. Preparar Payload del JWT
        let payload = { email: email };
        let rol = 'Guest'; // Rol por defecto

        if (cliente) {
            payload.cliente_id = cliente.cliente_id;
            payload.rol = cliente.rol; 
            rol = cliente.rol;
        }

        if (empresa) {
            payload.empresa_id = empresa.empresa_id;
            payload.rol = 'Empresa';
            rol = 'Empresa';
        }

        // 4. Generar el JWT
        const jwt = this.fastify.jwt.sign(payload, { expiresIn: '1d' });

        // 5. Devolver Respuesta Completa
        return {
            code: 200, 
            message: "Inicio de sesión exitoso", 
            jwt: jwt,
            rol: rol,
            // Devolvemos los IDs y Nombres para SecureStore en el frontend
            token: cliente ? cliente.cliente_id : null, 
            cliente: cliente ? cliente.nombreCompleto : null,
            token_empresa: empresa ? empresa.empresa_id : null,
            empresa: empresa ? empresa.nombreCompleto : null,
        };
    }

    async createCliente(clientData) {
    // ✅ CORRECCIÓN 1: Descomentar esta línea
    const password = await hashPassword(clientData.contrasena);
    
    // Verificar si existe por correo...
    const data = await prisma.cliente.findFirst({
        where: { correo: clientData.correo }
    });
        
    if(data){
        return {code:409, message:"El cliente ya existe"};
    }
    
    // Crear nuevo cliente
    const newCliente = await prisma.cliente.create({
        data: {
            nombreCompleto: clientData.nombreCompleto,
            correo: clientData.correo,
            auth_uid: clientData.auth_uid, 
            contrasena: password, // Ahora 'password' sí tiene un valor (el hash)
            rol: clientData.rol || 'Regular',
        }
    });
    return {code:201, message:"Cliente creado exitosamente", cliente:newCliente};
    }

    async getAllClientes() {
        try {
            const clientes = await prisma.cliente.findMany({
                omit: {
                    contrasena: true
                }
            });
            return {code:200, clientes:clientes};
        }catch (err) {
            return {code:500, message:"Error al obtener los clientes", error: err.message};
        }
    }

    async getClienteById(id) {
        try {
            const cliente = await prisma.cliente.findUnique({
                where: { cliente_id: id },
                omit: {
                    contrasena: true
                }
            });
            if (!cliente) { 
                return {code:404, message:"Cliente no encontrado"};
            }
            
            const empresa = await prisma.empresa.findFirst({
                where: { correo: cliente.correo },
                omit: {
                    contrasena: true
                }
            });
            
            return {code:200, data:{empresa:empresa,cliente:cliente}};
        } catch (err) {
            return {code:500, message:"Error al obtener el cliente", error: err.message};
        }
    }

    async updateCliente(id, updateData) {
        try {
            if (updateData.contrasena) {
                updateData.contrasena = await hashPassword(updateData.contrasena);
            }
            
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
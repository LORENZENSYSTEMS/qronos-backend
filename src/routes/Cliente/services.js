import {prisma} from '../../plugins/database.js';
import {hashPassword,verifyPassword} from '../../plugins/bcrypt.js';
export class ClienteService {
    fastify;
    constructor(Fastify) {
        this.fastify = Fastify
    }

    async login(email, password) {
        const cliente =  await prisma.cliente.findFirst({
            where: { correo: email },
        });

        const empresa = await prisma.empresa.findFirst({
            where:{
                correo:cliente.correo
            },
            omit:{
                contrasena:true
            }
        })

        if (!cliente) {
            return {code:404, message:"Cliente no encontrado"};
        }
        const isPasswordValid = await verifyPassword(password, cliente.contrasena);
        if (!isPasswordValid) {
            return {code:401, message:"Contraseña incorrecta"};
        }
        if(!empresa){
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
    }

    async createCliente(clientData) {
        const password = await hashPassword(clientData.contrasena);
        const data = await prisma.cliente.findFirst({
            where: {
                correo: clientData.correo}
            })
        if(data){
            const verify = await verifyPassword(clientData.contrasena, data.contrasena);
            if(verify){
                return {code:409, message:"El cliente ya existe"}
            }
        }
        const newCliente = await prisma.cliente.create({
            data: {
                nombreCompleto: clientData.nombreCompleto,
                correo: clientData.correo,
                contrasena:password,
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
            const empresa = await prisma.empresa.findFirst({
                where: { correo: cliente.correo },
                omit: {
                    contrasena: true
                }
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
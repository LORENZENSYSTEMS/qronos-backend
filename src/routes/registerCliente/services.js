import {prisma} from '../../plugins/database.js';
import {hashPassword,verifyPassword} from '../../plugins/bcrypt.js';
export class RegisterClienteService {
    constructor(Fastify) {}

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
}
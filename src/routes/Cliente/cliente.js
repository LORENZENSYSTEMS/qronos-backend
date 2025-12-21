// archivo: cliente.js

import {ClienteService} from './services.js';

export default async function clienteRoutes(fastify) {
    const clienteService = new ClienteService(fastify);


    // Inicio de sesion 
   fastify.post('/login', async (request, reply) => {
    // Recibimos pushToken desde el body que enviamos en el frontend
    const { email, pushToken } = request.body; 
    
    // Pasamos el pushToken al service
    const res = await clienteService.login(email, pushToken); 
    
    if (res.code >= 400) {
        reply.code(res.code).send({ message: res.message });
    } else {
        reply.code(res.code).send({
                message: res.message, 
                token: res.token, 
                cliente: res.cliente, 
                code: res.code,
                empresa: res.empresa, 
                token_empresa: res.token_empresa,
                jwt: res.jwt, 
                rol: res.rol, 
            });
        }
    });


    
    // Crear cliente
    fastify.post('/', async (request, reply) => {
        const data = request.body;
        const res = await clienteService.createCliente(data);

        if (res.code >= 400) {
            reply.code(res.code).send({ message: res.message, error: res.internalError });
        } else {
            reply.code(res.code).send({ message: res.message, cliente: res.cliente });
        }
    });

    // Obtener todos
    fastify.get('/', async (resquest,reply) => {
        await clienteService.getAllClientes().then(res=>{
            reply.code(res.code).send({clientes:res.clientes});
        }).catch(err=>{
            reply.code(500).send({message:"Error al obtener los clientes", error: err.message});
        });
    });

    // Obtener 1 por ID
    fastify.get('/:id', async (request,reply) => {
        await clienteService.getClienteById(Number(request.params.id)).then(res=>{
            reply.code(res.code).send({cliente:res.data,});
        }).catch(err=>{
            reply.code(500).send({message:"Error al obtener el cliente", error: err.message});
        }); 
    });

    // Actualizar
    fastify.put('/:id', async (request,reply) => {
        const data = request.body;
        await clienteService.updateCliente(Number(request.params.id), data).then(res=>{
            reply.code(res.code).send({message:res.message, cliente:res.cliente});
        }).catch(err=>{
            reply.code(401).send({message:"Error al actualizar el cliente", error: err.message});
        });
    });

    // Eliminar
    fastify.delete('/:id', async (request,reply) => {
        await clienteService.deleteCliente(Number(request.params.id)).then(res=>{
            reply.code(res.code).send({message:res.message});
        }).catch(err=>{
            reply.code(401).send({message:"Error al eliminar el cliente", error: err.message});
        });
    });
}
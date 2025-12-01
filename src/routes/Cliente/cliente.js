import {ClienteService} from './services.js';

export default async function clienteRoutes(fastify) {
  const clienteService = new ClienteService(fastify);

  //Inicio de sesion 
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;
    await clienteService.login(email, password).then((res)=>{
        if(!res.empresa){
          reply.code(res.code).send({message:res.message, token:res.token,cliente:res.cliente,code:res.code});
        }
        reply.code(res.code).send({message:res.message, token:res.token,cliente:res.cliente,code:res.code,empresa:res.empresa,token_empresa:res.token_empresa});
    }).catch((err)=>{
        reply.code(401).send({message:"Error en el inicio de sesion", error: err.message});
    });
  });


  // Crear cliente
  fastify.post('/', async (request, reply) => {
    const data = request.body;
    await clienteService.createCliente(data).then((res)=>{
        reply.code(res.code).send({message:res.message, cliente:res.cliente});
    }).catch((err)=>{
        reply.code(401).send({message:"Error al crear el cliente", error: err.message});
    });
  });

  // Obtener todos
  fastify.get('/', async (resquest,reply) => {
      await clienteService.getAllClientes().then(res=>{
        reply.code(res.code).send({clientes:res.clientes});
    }).catch(err=>{
        reply.code(res.code).send({message:"Error al obtener los clientes", error: err.message});
    });
  });

  // Obtener 1 por ID
  fastify.get('/:id', async (request,reply) => {
   await clienteService.getClienteById(Number(request.params.id)).then(res=>{
        reply.code(res.code).send({cliente:res.data,});
    }).catch(err=>{
        reply.code(res.code).send({message:"Error al obtener el cliente", error: err.message});
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

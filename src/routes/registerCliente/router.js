import { RegisterClienteService } from "./services.js";

const RegisterRoutes = async (Fastify) => {
    const service = new RegisterClienteService(Fastify);

    Fastify.post('/register',
        async (request, reply) => {
            const clientData = request.body;
            // console.log(clientData);
            const result = await service.createCliente(clientData).then((data)=>{
                reply.code(data.code).send({message:data.message, cliente:data.cliente});
            })
            
        }
    )
}
export default RegisterRoutes;
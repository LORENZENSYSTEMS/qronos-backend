import { ProductoService } from "./services.js";

export default async function productoRoutes(fastify) {
    const productoService = new ProductoService(fastify);

    // --- OBTENER PRODUCTOS POR EMPRESA ---
    // GET /api/productos/empresas/:id
    fastify.get('/empresas/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const result = await productoService.getProductosByEmpresa(id);
            return reply.code(result.code).send(result.code === 200 ? result.productos : result);
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ message: "Error interno del servidor", error: error.message });
        }
    });

    // --- CREAR PRODUCTO ---
    // POST /api/productos
    fastify.post('/', async (request, reply) => {
        const { nombre, precio, imagenUrl, descripcion, empresa_id } = request.body;

        // Validación básica y parseo
        if (!nombre || !precio || !imagenUrl || !empresa_id) {
            return reply.code(400).send({ message: "Faltan campos obligatorios: nombre, precio, imagenUrl, empresa_id" });
        }

        const data = {
            nombre,
            precio: parseFloat(precio),
            imagenUrl,
            descripcion,
            empresa_id: parseInt(empresa_id),
        };

        if (isNaN(data.precio) || isNaN(data.empresa_id)) {
            return reply.code(400).send({ message: "El precio y el empresa_id deben ser números válidos" });
        }

        try {
            const result = await productoService.createProducto(data);
            return reply.code(result.code).send(result.code === 201 ? result.producto : result);
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ message: "Error interno del servidor", error: error.message });
        }
    });
}

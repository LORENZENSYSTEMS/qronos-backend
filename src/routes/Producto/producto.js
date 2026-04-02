import { ProductoService } from "./services.js";
import { uploadToS3 } from "../../utils/s3Config.js";

export default async function productoRoutes(fastify) {
    const productoService = new ProductoService(fastify);

    // --- OBTENER PRODUCTOS POR EMPRESA ---
    // GET /api/empresas/:id/productos
    fastify.get('/empresas/:id/productos', async (request, reply) => {
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
    fastify.post('/productos', async (request, reply) => {
        try {
            const data = {};
            let fileBuffer = null;
            let fileName = '';
            let mimetype = '';

            // Procesar el multipart
            const parts = request.parts();
            for await (const part of parts) {
                if (part.file) {
                    fileBuffer = await part.toBuffer();
                    fileName = part.filename;
                    mimetype = part.mimetype;
                } else {
                    data[part.fieldname] = part.value;
                }
            }

            // Validación básica
            if (!data.nombre || !data.precio || !data.empresa_id || !fileBuffer) {
                return reply.code(400).send({
                    message: "Faltan campos obligatorios: nombre, precio, empresa_id y la imagen del producto"
                });
            }

            // Subir imagen a S3 (en carpeta 'productos')
            const imageUrl = await uploadToS3(fileBuffer, fileName, mimetype, "productos");

            // Crear producto en la base de datos
            const result = await productoService.createProducto({
                ...data,
                imagenUrl: imageUrl
            });

            return reply.code(result.code).send(result.code === 201 ? result.producto : result);

        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                message: "Error al procesar la creación del producto",
                error: error.message
            });
        }
    });
}

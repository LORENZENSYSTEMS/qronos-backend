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
        if (!request.isMultipart()) {
            return reply.code(400).send({ message: "La petición debe ser multipart/form-data" });
        }
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

    // --- ELIMINAR PRODUCTO ---
    // DELETE /api/productos/:id
    fastify.delete('/productos/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const productoId = parseInt(id, 10);

            if (isNaN(productoId)) {
                return reply.code(400).send({ message: "ID de producto inválido. Debe ser un número." });
            }

            const result = await productoService.deleteProducto(productoId);

            if (result.code === 200) {
                return reply.code(result.code).send({ success: result.success, message: result.message });
            }
            
            return reply.code(result.code).send(result);
            
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                message: "Error interno del servidor",
                error: error.message
            });
        }
    });

    // --- EDITAR PRODUCTO ---
    // PUT /api/productos/:id
    fastify.put('/productos/:id', async (request, reply) => {
        const { id } = request.params;
        const productoId = parseInt(id, 10);

        if (isNaN(productoId)) {
            return reply.code(400).send({ message: "ID de producto inválido. Debe ser un número." });
        }

        try {
            const data = {};
            let fileBuffer = null;
            let fileName = '';
            let mimetype = '';

            if (request.isMultipart()) {
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
            } else {
                Object.assign(data, request.body);
            }

            let imageUrl = data.imagenUrl;
            if (fileBuffer) {
                imageUrl = await uploadToS3(fileBuffer, fileName, mimetype, "productos");
            }

            const result = await productoService.updateProducto(productoId, {
                ...data,
                imagenUrl: imageUrl
            });

            return reply.code(result.code).send(result.code === 200 ? result.producto : result);

        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                message: "Error al procesar la edición del producto",
                error: error.message
            });
        }
    });
}

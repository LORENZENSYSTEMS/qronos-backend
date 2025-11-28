// metrics/services.js

import { prisma } from "../../plugins/database.js";
import crypto from 'crypto'; 

// --- Configuración de Seguridad (Debe coincidir con qr/qr.service.js) ---
const QR_SECRET_KEY = process.env.TOKEN; 
const HASH_ALGORITHM = 'sha256';
const EXPIRATION_MS = 300000; // 5 minutos

export class MetricaService {

    // 1. Crea una nueva entrada en la tabla 'metrica'
    async createMetrica(data) {
        try {
            const nuevaMetrica = await prisma.metrica.create({
                data: {
                    cliente_id: data.cliente_id ? Number(data.cliente_id) : null,
                    empresa_id: data.empresa_id ? Number(data.empresa_id) : null,
                    vecesScan: Number(data.vecesScan),
                    puntos: data.puntos ? Number(data.puntos) : null
                }
            });
            // NOTA: Aquí podrías añadir la lógica para actualizar el total de puntos del cliente
            return { code: 201, message: "Métrica creada con éxito", metrica: nuevaMetrica };
        } catch (err) {
            return { code: 500, message: "Error al crear la métrica", error: err.message };
        }
    }

    // 2. Registra el escaneo del QR, validando su seguridad.
    async registerScan({ cliente_id, qr_token }) {
        
        if (!QR_SECRET_KEY) {
            return { code: 500, message: "Error de configuración: La clave secreta (TOKEN) no está definida." };
        }

        try {
            const parts = qr_token.split('.');
            if (parts.length !== 2) {
                return { code: 400, message: "Formato de token QR inválido. Debe contener firma." };
            }

            const [encodedPayload, receivedSignature] = parts;
            
            // 1. Verificar la Firma HMAC (Integridad)
            const payloadString = Buffer.from(encodedPayload, 'base64').toString('utf8');
            
            const expectedSignature = crypto.createHmac(HASH_ALGORITHM, QR_SECRET_KEY)
                                            .update(payloadString)
                                            .digest('hex');

            if (expectedSignature !== receivedSignature) {
                // El token fue manipulado: la firma no coincide.
                return { code: 401, message: "Firma de QR no válida. El token ha sido alterado." };
            }

            // 2. Decodificar y Validar Datos
            const payload = JSON.parse(payloadString);
            
            // 2a. Validar Expiración
            if (Date.now() - payload.iat > EXPIRATION_MS) {
                return { code: 401, message: "Código QR expirado. Solicite uno nuevo." };
            }

            // 2b. Validar Unicidad del Nonce (Lógica anti-fraude)
            
            // 3. Crear Métrica (La validación de seguridad ha sido exitosa)
            const metricaData = {
                cliente_id: cliente_id,
                empresa_id: payload.empresa_id,
                vecesScan: 1, 
                puntos: payload.puntos
            };
            
            const result = await this.createMetrica(metricaData); 
            return result;
        } catch (err) {
            return { code: 500, message: "Error interno al procesar el escaneo", error: err.message };
        }
    }


    // Obtener todas (General)
    async getAllMetricas() {
        try {
            const metricas = await prisma.metrica.findMany();
            return { code: 200, metricas: metricas };
        } catch (err) {
            return { code: 500, message: "Error al obtener las métricas", error: err.message };
        }
    }

    // Obtener métricas filtradas por CLIENTE
    async getMetricasByCliente(clienteId) {
        try {
            const metricas = await prisma.metrica.findMany({
                where: { cliente_id: Number(clienteId) },
                include: { cliente: true }
            });
            return { code: 200, metricas: metricas };
        } catch (err) {
            return { code: 500, message: "Error al obtener métricas del cliente", error: err.message };
        }
    }

    // Obtener métricas filtradas por EMPRESA
    async getMetricasByEmpresa(empresaId) {
        try {
            const metricas = await prisma.metrica.findMany({
                where: { empresa_id: Number(empresaId) },
                include: { empresa: true } 
            });
            return { code: 200, metricas: metricas };
        } catch (err) {
            return { code: 500, message: "Error al obtener métricas de la empresa", error: err.message };
        }
    }

    // Obtener métrica individual por ID (metrica_id)
    async getMetricaById(id) {
        try {
            const metrica = await prisma.metrica.findUnique({
                where: { metrica_id: Number(id) }
            });

            if (!metrica) {
                return { code: 404, message: "Métrica no encontrada" };
            }
            return { code: 200, metrica: metrica };
        } catch (err) {
            return { code: 500, message: "Error al obtener la métrica", error: err.message };
        }
    }

    // Actualizar métrica
    async updateMetrica(id, data) {
        try {
            const metricaActualizada = await prisma.metrica.update({
                where: { metrica_id: Number(id) },
                data: data
            });
            return { code: 200, message: "Métrica actualizada", metrica: metricaActualizada };
        } catch (err) {
            if (err.code === 'P2025') {
                return { code: 404, message: "Métrica no encontrada para actualizar", error: err.message };
            }
            return { code: 500, message: "Error al actualizar la métrica", error: err.message };
        }
    }

    // Eliminar métrica
    async deleteMetrica(id) {
        try {
            const metricaEliminada = await prisma.metrica.delete({
                where: { metrica_id: Number(id) }
            });
            return { code: 200, message: "Métrica eliminada", metrica: metricaEliminada };
        } catch (err) {
            if (err.code === 'P2025') {
                return { code: 404, message: "Métrica no encontrada para eliminar", error: err.message };
            }
            return { code: 500, message: "Error al eliminar la métrica", error: err.message };
        }
    }
}
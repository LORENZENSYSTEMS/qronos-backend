import { prisma } from "../../plugins/database.js";
import crypto from 'crypto';

// --- CONFIGURACIÓN DE SEGURIDAD ---
// Asegúrate de que esta variable 'TOKEN' esté definida en tu archivo .env
const QR_SECRET_KEY = process.env.TOKEN; 
const HASH_ALGORITHM = 'sha256';
const EXPIRATION_MS = 300000; // 5 minutos

export class MetricaService {

    // 1. Registrar Escaneo (Lógica Principal con Seguridad y Upsert)
    async registerScan({ empresa_id, puntos, qr_token }) {
        
        // Validación de configuración del servidor
        if (!QR_SECRET_KEY) {
            console.error("CRITICAL: process.env.TOKEN no está definido.");
            return { code: 500, message: "Error interno: Falta configuración de seguridad." };
        }

        try {
            // --- A. VALIDACIÓN DEL TOKEN QR (Manejo Igual al Generador) ---
            const parts = qr_token.split('.');
            if (parts.length !== 2) {
                return { code: 400, message: "Formato de token inválido." };
            }

            const [encodedPayload, receivedSignature] = parts;
            
            // Decodificar payload para verificar la firma
            // Nota: Se valida la firma contra el payload en texto plano según tu lógica original
            const payloadString = Buffer.from(encodedPayload, 'base64').toString('utf8');
            
            // Recrear la firma
            const expectedSignature = crypto.createHmac(HASH_ALGORITHM, QR_SECRET_KEY)
                                            .update(payloadString)
                                            .digest('hex');

            // Comparar firmas
            if (expectedSignature !== receivedSignature) {
                return { code: 401, message: "Firma inválida. El código QR ha sido manipulado." };
            }

            // Parsear datos
            const payload = JSON.parse(payloadString);
            
            // Validar expiración
            if (Date.now() - payload.iat > EXPIRATION_MS) {
                return { code: 401, message: "El código QR ha expirado. Genere uno nuevo." };
            }

            // Mapeo de IDs (Asegúrate que payload.client_id es lo que envía el QR)
            const cliente_id = Number(payload.client_id); 
            const empresaIdNum = Number(empresa_id);

            if (!cliente_id || !empresaIdNum) {
                return { code: 400, message: "Datos de cliente o empresa inválidos en el token." };
            }

            // --- B. OPERACIÓN EN BASE DE DATOS (UPSERT) ---
            // Requiere @@unique([cliente_id, empresa_id]) en schema.prisma
            const metricaResult = await prisma.metrica.upsert({
                where: {
                    cliente_id_empresa_id: {
                        cliente_id: cliente_id,
                        empresa_id: empresaIdNum
                    }
                },
                update: {
                    vecesScan: { increment: 1 },
                    puntos: { increment: Number(puntos) }
                },
                create: {
                    cliente_id: cliente_id,
                    empresa_id: empresaIdNum,
                    vecesScan: 1,
                    puntos: Number(puntos)
                }
            });

            // Respuesta
            const isNew = metricaResult.vecesScan === 1;
            return { 
                code: isNew ? 201 : 200, 
                message: isNew ? "Primer escaneo registrado" : "Puntos sumados correctamente",
                metrica: metricaResult 
            };

        } catch (err) {
            console.error("Error en registerScan:", err);
            return { code: 500, message: "Error al procesar el escaneo.", error: err.message };
        }
    }

    // 2. Crear Métrica Manualmente (Opcional/Admin)
    async createMetrica(data) {
        try {
            const nuevaMetrica = await prisma.metrica.create({
                data: {
                    cliente_id: Number(data.cliente_id),
                    empresa_id: Number(data.empresa_id),
                    vecesScan: Number(data.vecesScan || 0),
                    puntos: Number(data.puntos || 0)
                }
            });
            return { code: 201, message: "Métrica creada", metrica: nuevaMetrica };
        } catch (err) {
            return { code: 500, message: "Error al crear métrica", error: err.message };
        }
    }

    // 3. Obtener todas las métricas
    async getAllMetricas() {
        try {
            const metricas = await prisma.metrica.findMany({
                include: {
                    empresa: {
                        select: { nombreCompleto: true }
                    }
                }
            });
            return { code: 200, metricas: metricas };
        } catch (err) {
            return { code: 500, message: "Error al obtener métricas", error: err.message };
        }
    }

    // 4. Métricas por Cliente
    async getMetricasByCliente(clienteId) {
        try {
            const metricas = await prisma.metrica.findMany({
                where: { cliente_id: Number(clienteId) },
                include: { empresa: true }
            });
            return { code: 200, metricas: metricas };
        } catch (err) {
            return { code: 500, message: "Error leyendo métricas del cliente", error: err.message };
        }
    }

    // 5. Métricas por Empresa
    async getMetricasByEmpresa(empresaId) {
        try {
            const metricas = await prisma.metrica.findMany({
                where: { empresa_id: Number(empresaId) },
                include: { cliente: true } // Opcional: traer datos del cliente
            });
            return { code: 200, metricas: metricas };
        } catch (err) {
            return { code: 500, message: "Error leyendo métricas de la empresa", error: err.message };
        }
    }
}
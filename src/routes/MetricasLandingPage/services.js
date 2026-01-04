import { prisma } from "../../plugins/database.js";

export class LandingPageService {
    async getMetricasLandingPage() {
        try {
            // Consultamos ambos conteos simultáneamente
            const [totalClientes, totalEmpresas] = await Promise.all([
                prisma.cliente.count(),
                prisma.empresa.count()
            ]);

            return {
                totalClientes,
                totalEmpresas,
                totalUsuarios: totalClientes + totalEmpresas,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            // Fastify maneja mejor los errores si los lanzas con información útil
            throw new Error("Error al obtener las métricas de la base de datos");
        }
    }
}
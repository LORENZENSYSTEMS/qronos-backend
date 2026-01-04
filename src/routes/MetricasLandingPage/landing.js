import { LandingPageService } from "./services.js";

export default async function landingRoutes(fastify, options) {
    const landingService = new LandingPageService();

    fastify.get("/metricas", async (request, reply) => {
        try {
            const data = await landingService.getMetricasLandingPage();
            return data; // Fastify serializa automáticamente a JSON
        } catch (error) {
            reply.status(500).send({ 
                ok: false, 
                message: error.message 
            });
        }
    });
}
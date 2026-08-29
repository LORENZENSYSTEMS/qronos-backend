import adminPanelController from './AdminPanelController.js';

export default async function adminPanelModule(fastify, options) {
  await fastify.register(adminPanelController);
}

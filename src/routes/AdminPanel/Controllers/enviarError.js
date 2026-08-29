import { AppError } from '../Services/services.js';

export function enviarError(reply, err) {
  if (err instanceof AppError) {
    return reply.code(err.status).send({ error: err.message });
  }
  console.error(err);
  return reply.code(500).send({ error: err.message });
}

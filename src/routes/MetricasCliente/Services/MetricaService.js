import { ValidationError } from './errors.js';

export class MetricaService {
  constructor({ repository, qrTokenValidator }) {
    this.repository = repository;
    this.qrTokenValidator = qrTokenValidator;
  }

  async registerScan({ empresaId, puntos, qrToken }) {
    const { clienteId } = this.qrTokenValidator.validate(qrToken);
    const empresaIdNum = Number(empresaId);

    if (!clienteId || !empresaIdNum) {
      throw new ValidationError('Datos de cliente o empresa inválidos en el token.');
    }

    const metrica = await this.repository.upsertScan({
      clienteId,
      empresaId: empresaIdNum,
      puntos: Number(puntos),
    });

    const isNew = metrica.vecesScan === 1;
    return {
      message: isNew ? 'Primer escaneo registrado' : 'Puntos sumados correctamente',
      isNew,
      metrica,
    };
  }

  async createMetrica({ clienteId, empresaId, vecesScan = 0, puntos = 0 }) {
    const metrica = await this.repository.create({
      clienteId: Number(clienteId),
      empresaId: Number(empresaId),
      vecesScan: Number(vecesScan),
      puntos: Number(puntos),
    });
    return { message: 'Métrica creada', metrica };
  }

  async getAllMetricas() {
    return this.repository.findAll();
  }

  async getMetricasByCliente(clienteId) {
    return this.repository.findByCliente(Number(clienteId));
  }

  async getMetricasByEmpresa(empresaId) {
    return this.repository.findByEmpresa(Number(empresaId));
  }
}

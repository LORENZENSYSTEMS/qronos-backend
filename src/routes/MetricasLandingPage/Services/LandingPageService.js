export class LandingPageService {
  constructor({ repository }) {
    this.repository = repository;
  }

  async getMetricasLandingPage() {
    const [totalClientes, totalEmpresas] = await Promise.all([
      this.repository.getTotalClientes(),
      this.repository.getTotalEmpresas(),
    ]);

    return {
      totalClientes,
      totalEmpresas,
      totalUsuarios: totalClientes + totalEmpresas,
      timestamp: new Date().toISOString(),
    };
  }
}

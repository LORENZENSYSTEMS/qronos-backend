export class EmpresaService {
  constructor({ repository }) {
    this.repository = repository;
  }

  async toggleDestacada(empresaId, destacada, popular) {
    return this.repository.toggleDestacada(empresaId, destacada, popular);
  }

  async getEmpresasDestacadas() {
    return this.repository.findDestacadas();
  }
}

export class AuthService {
  constructor(clienteRepository, empresaRepository) {
    this.buscadores = [
      {
        rol: 'Cliente',
        buscar: (email) => clienteRepository.findByEmail(email),
      },
      {
        rol: 'Empresa',
        buscar: (email) => empresaRepository.findByEmail(email),
      },
    ];
  }

  async buscarPerfilPorEmail(email) {
    const resultados = await Promise.all(
      this.buscadores.map(async (buscador) => {
        const usuario = await buscador.buscar(email);
        return { rol: buscador.rol, usuario };
      })
    );

    const perfilEncontrado = resultados.find((resultado) => resultado.usuario !== null);

    if (!perfilEncontrado) {
      return { cliente: null, empresa: null };
    }

    return {
      cliente: perfilEncontrado.rol === 'Cliente' ? perfilEncontrado.usuario : null,
      empresa: perfilEncontrado.rol === 'Empresa' ? perfilEncontrado.usuario : null,
    };
  }
}
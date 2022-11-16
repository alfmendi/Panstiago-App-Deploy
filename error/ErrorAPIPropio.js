class ErrorAPIPropio extends Error {
  constructor(codigoEstado, mensaje) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
  }
}

export default ErrorAPIPropio;

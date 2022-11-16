import chalk from "chalk";

// Importante: Si elimino el next, parece que no funciona correctamente
// (no muestra los mensajes personalizados sino los standard)
const manejarErroresMiddleware = (err, req, res, next) => {
  console.log("");
  console.log(chalk.red("-------------------------------------------------"));
  console.log(chalk.red("----------COMIENZO DEL MANEJADOR ERRORES---------"));
  console.log(chalk.red("El valor de err es...", JSON.stringify(err)));
  console.log(chalk.red("El valor de err.message vale..." + err.message));
  console.log(chalk.red("El valor de err.name vale..." + err.name));
  console.log(chalk.red("El valor de err.code vale..." + err.code));
  console.log(chalk.red("------------FIN DEL MANEJADOR ERRORES------------"));
  console.log(chalk.red("-------------------------------------------------"));
  console.log("");

  // Creo un error personalizado para devolver a la aplicación cliente
  let errorPersonalizado = {
    codigoEstado: err.codigoEstado || 500,
    mensaje: err.message || "Error en el servidor",
  };

  // Si se produce un error de time out, se genera un error
  if (err.message?.includes("buffering timed out after 10000ms")) {
    errorPersonalizado.mensaje = "Excedido el tiempo de espera";
  }

  // Si existe un error de validación desde express-validator, genero un error
  if (err.errors && !err.name && Array.isArray([err.errors])) {
    errorPersonalizado.mensaje = err.errors.map((elemento) => elemento.msg);
    errorPersonalizado.codigoEstado = 400;
  }

  // Si existe un error de validación desde Mongoose, genero un error
  if (err.name === "ValidationError") {
    errorPersonalizado.mensaje = Object.values(err.errors).map(
      (elemento) => elemento.message
    );
    errorPersonalizado.codigoEstado = 400;
  }

  // Si existe un error de jwt expired, genero un error
  if (err.name === "TokenExpiredError") {
    errorPersonalizado.mensaje = "La sesión ha expirado";
    errorPersonalizado.codigoEstado = 401;
  }

  // Si existe un error de jwt malformed, genero un error
  if (err.message === "jwt malformed" || err.message === "invalid signature") {
    errorPersonalizado.mensaje = "Credenciales no válidas";
    errorPersonalizado.codigoEstado = 401;
  }

  // Si existe un error de valor duplicado, genero un error
  if (err.code && err.code === 11000) {
    if (err.message.includes("proyectoElectrica.empleados")) {
      errorPersonalizado.mensaje = `Ya existe un cliente con ese ${Object.keys(
        err.keyValue
      )}`;
    }
    errorPersonalizado.codigoEstado = 400;
  }

  // Si existe un error de cast, genero un error
  // Esto funciona bien porque no hay más modelos que puedan generar
  // este tipo de error. En el momento que haya algún otro modelo
  // que pueda genera este error, será necesario comprobar también
  // que modelo ha generado ese error.
  // COMPROBAR...
  if (err.name === "CastError") {
    errorPersonalizado.mensaje = `No existe la solicitud de trabajo con id: ${err.value}`;
    errorPersonalizado.codigoEstado = 404;
  }

  return res
    .status(errorPersonalizado.codigoEstado)
    .json({ mensaje: errorPersonalizado.mensaje });
};

export default manejarErroresMiddleware;

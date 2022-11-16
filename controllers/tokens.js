import jwt from "jsonwebtoken";

import Cliente from "../model/Cliente.js";

import ErrorAPIPropio from "../error/ErrorAPIPropio.js";

// ---------------------------------------------------
// Función para refrescar el Access Token que emplea -
// el cliente para hacer las peticiones al servidor  -
// ---------------------------------------------------
export const refrescarAccessToken = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      throw new ErrorAPIPropio(401, "Credenciales no válidas");
    }
    const refreshToken = cookies.jwt;
    const cliente = await Cliente.findOne({ refreshToken });
    if (!cliente) {
      throw new ErrorAPIPropio(401, "Credenciales no válidas");
    }
    const tokenDecodificado = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRETO
    );
    if (
      !tokenDecodificado ||
      tokenDecodificado.clienteId !== cliente.id.toString()
    ) {
      throw new ErrorAPIPropio(401, "Credenciales no válidas");
    }
    // Genero el accessToken
    const accessToken = jwt.sign(
      { clienteId: cliente.id },
      process.env.JWT_ACCESS_TOKEN_SECRETO,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRACION }
    );

    return res.status(200).json({
      clienteId: cliente.id,
      nombre: cliente.nombre,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------------------
// Función para borrar el Refresh Token empleado para refrescar el Access Token -
// ------------------------------------------------------------------------------
export const borrarRefreshToken = async (req, res, next) => {
  // En el cliente se debe borrar el Access Token
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.sendStatus(204); //No content
    }
    const refreshToken = cookies.jwt;
    await Cliente.findOneAndUpdate(
      { refreshToken },
      { $unset: { refreshToken: "" } }
    );
    // Envio el Refresh Token como una httpOnly cookie. Una cookie
    // definida como httpOnly no es accesible por JavaScript,
    // por lo tanto no es accesible a los ataques. Access Token se envía normal.
    // Para hacer pruebas con Postman o Thunder Client se debe deshabilitar secure:true.
    // ES MUY IMPORTANTE HABILITAR SECURE:TRUE YA QUE SI NO SE HACE, EL REFRESH TOKEN NO SE ACTUALIZA
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

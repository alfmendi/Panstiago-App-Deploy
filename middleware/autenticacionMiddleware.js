import jwt from "jsonwebtoken";

// La voy a dejar síncrona a ver que pasa...
const autenticacionMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  // console.log(token);
  jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRETO, (err, decoded) => {
    if (err) return res.sendStatus(403); //invalid token
    // En el payload al hacer el jwt sign solamente puse
    // el valor { clienteId: cliente.id } por lo tanto
    // esa será la única información a almacenar en req.
    // Creo un nuevo campo en req llamado usuario en el
    // que almaceno el clienteId
    req.clienteId = decoded.clienteId;
    next();
  });
};

export default autenticacionMiddleware;

// Versión propia de otro autenticacionMiddleware
// try {
//   const autorizacion = req.headers.authorization;
//   if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
//     throw new ErrorAPIPropio(401, "Credenciales no válidas");
//   }
//   const token = autorizacion.split(" ")[1];
//   const tokenDecodificado = jwt.verify(
//     token,
//     process.env.JWT_ACCESS_TOKEN_SECRETO
//   );
//   if (!tokenDecodificado) {
//     throw new ErrorAPIPropio(401, "Credenciales no válidas");
//   }
//   const empleado = await Empleado.findById(tokenDecodificado.empleadoId);
//   req.empleado = empleado.id;
//   next();
// } catch (error) {
//   next(error);
// }

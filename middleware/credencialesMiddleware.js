import origenesPermitidos from "../config/origenesPermitidos.js";

const credencialesMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  if (origenesPermitidos.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
};

export default credencialesMiddleware;

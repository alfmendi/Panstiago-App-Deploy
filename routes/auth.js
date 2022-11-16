import express from "express";
const router = express.Router();

import { validadorLogin, validadorRegistro } from "../validator/auth.js";
import { login, registro } from "../controllers/auth.js";

// Llevo a cabo la validación con express-validator
// He optado por esta opción y no por dejar que mongoose haga la validación
// porque el password se usa antes de llevar a cabo la validación con mongoose
// (se usa con bcryptjs)
router.post("/login", validadorLogin, login);
router.post("/registro", validadorRegistro, registro);

export default router;

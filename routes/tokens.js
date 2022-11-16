import express from "express";
const router = express.Router();

import {
  refrescarAccessToken,
  borrarRefreshToken,
} from "../controllers/tokens.js";

router.get("/refrescarAccessToken", refrescarAccessToken);
router.get("/borrarRefreshToken", borrarRefreshToken);

export default router;

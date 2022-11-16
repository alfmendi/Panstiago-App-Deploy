import express from "express";
const router = express.Router();

import autenticacionMiddleware from "../middleware/autenticacionMiddleware.js";

import Pedido from "../model/Pedido.js";

router.get("/:clienteId", autenticacionMiddleware, async (req, res, next) => {
  try {
    const pedidos = await Pedido.find({ cliente: req.params.clienteId }).sort(
      "-updatedAt"
    );
    return res.status(200).json(pedidos);
  } catch (error) {
    next(error);
  }
});

export default router;

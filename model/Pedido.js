import mongoose from "mongoose";

const pedidoSchema = new mongoose.Schema(
  {
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    clienteStripeId: { type: String, required: true },
    payment_intent: { type: String, required: true },
    productos: [
      {
        productoId: { type: String, required: true },
        precioProducto: { type: Number, required: true },
        cantidadProducto: { type: Number, default: 1 },
      },
    ],
    precioTotal: { type: Number, required: true },
    direccionEnvio: { type: Object, required: true },
    envioEstado: { type: String, default: "enviado" },
    pagoEstado: { type: String, required: true },
  },
  { timestamps: true }
);

pedidoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export default mongoose.model("Pedido", pedidoSchema);

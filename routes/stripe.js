// He tenido que colocar dotenv también aquí porque no funcionaba??????
import dotenv from "dotenv";
dotenv.config();

import express from "express";
const router = express.Router();

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import autenticacionMiddleware from "../middleware/autenticacionMiddleware.js";

import Pedido from "../model/Pedido.js";

router.post(
  "/create-checkout-session",
  autenticacionMiddleware,
  async (req, res) => {
    const cart = req.body.productos.map((elemento) => {
      return {
        productoId: elemento.producto.productoId,
        precioProducto: elemento.producto.precio,
        cantidadProducto: elemento.cantidadProducto,
      };
    });
    const customer = await stripe.customers.create({
      metadata: {
        clienteId: req.clienteId,
        cart: JSON.stringify(cart),
      },
    });

    const line_items = req.body.productos.map((elemento) => {
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: elemento.producto.nombre,
            // images: [elemento.producto.imagen],
            metadata: {
              id: elemento.producto.productoId,
            },
          },
          unit_amount: Math.ceil(elemento.producto.precio * 100),
        },
        quantity: elemento.cantidadProducto,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["ES"],
      },
      phone_number_collection: {
        enabled: true,
      },
      customer: customer.id,
      line_items,
      mode: "payment",
      success_url: `${process.env.URL_CLIENTE}/checkoutCorrecto`,
      cancel_url: `${process.env.URL_CLIENTE}/checkoutCancelado`,
    });

    // res.redirect(303, session.url);
    res.send({ url: session.url });
  }
);

// --------------------------------
// - Función para crear un pedido -
// --------------------------------
const crearPedido = async (customer, data) => {
  const Items = JSON.parse(customer.metadata.cart);

  const productos = Items.map((item) => {
    return {
      productoId: item.productoId,
      precioProducto: item.precioProducto,
      cantidadProducto: item.cantidadProducto,
    };
  });

  const nuevoPedido = new Pedido({
    cliente: customer.metadata.clienteId,
    clienteStripeId: data.customer,
    payment_intent: data.payment_intent,
    productos,
    precioTotal: data.amount_total,
    direccionEnvio: data.customer_details,
    pagoEstado: data.payment_status,
  });

  try {
    const pedidoGuardado = await nuevoPedido.save();
    // console.log("Pedido procesado:", pedidoGuardado);
    // Enviar un email al cliente con los detalles del pedido
  } catch (err) {
    console.log(err);
  }
};

// Stripe webhook
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      // console.log("Webhook verificado");
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    // switch (event.type) {
    //   case "payment_intent.succeeded":
    //     const paymentIntent = event.data.object;
    //     // Then define and call a function to handle the event payment_intent.succeeded
    //     break;
    //   // ... handle other event types
    //   default:
    //     console.log(`Unhandled event type ${event.type}`);
    // }

    //
    // Handle the checkout.session.completed event
    const data = event.data.object;
    if (event.type === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          try {
            // console.log("Customer...", customer);
            // console.log("Data...", data);
            // CREAR PEDIDO
            crearPedido(customer, data);
          } catch (err) {
            // console.log(typeof createOrder);
            console.log(err);
          }
        })
        .catch((err) => console.log(err.message));
    }
    //

    // Return a 200 response to acknowledge receipt of the event
    // Aparentemente, si no se coloca el .end() da error
    // response.send();
    response.send().end();
  }
);

export default router;

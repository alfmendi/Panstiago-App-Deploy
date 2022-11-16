// import Cliente from "../model/Cliente.js";
// // import bcryptjs from "bcryptjs"
// // import jwt from "jsonwebtoken"

// export const login = async (req, res, next) => {
//   const { email, password } = req.body;
//   return res.status(200).json({ email, password });
//   // try {
//   //   if (!email || !password)
//   //     return res
//   //       .status(400)
//   //       .json({ message: "Username and password are required." });

//   //   const foundUser = await User.findOne({ username: user }).exec();
//   //   if (!foundUser) return res.sendStatus(401); //Unauthorized
//   //   // Evaluar password
//   //   const match = await bcrypt.compare(pwd, foundUser.password);
//   //   if (match) {
//   //     const roles = Object.values(foundUser.roles).filter(Boolean);
//   //     // Crear JWTs
//   //     const accessToken = jwt.sign(
//   //       {
//   //         UserInfo: {
//   //           username: foundUser.username,
//   //           roles: roles,
//   //         },
//   //       },
//   //       process.env.ACCESS_TOKEN_SECRET,
//   //       { expiresIn: "10s" }
//   //     );
//   //     const refreshToken = jwt.sign(
//   //       { username: foundUser.username },
//   //       process.env.REFRESH_TOKEN_SECRET,
//   //       { expiresIn: "1d" }
//   //     );
//   //     // Guardar refreshToken con el usuario actual
//   //     foundUser.refreshToken = refreshToken;
//   //     const result = await foundUser.save();
//   //     console.log(result);
//   //     console.log(roles);

//   //     // Crea Secure Cookie con refresh token
//   //     res.cookie("jwt", refreshToken, {
//   //       httpOnly: true,
//   //       secure: true,
//   //       sameSite: "None",
//   //       maxAge: 24 * 60 * 60 * 1000,
//   //     });
//   //     // Envia access token al usuario
//   //     res.json({ accessToken });
//   //   } else {
//   //     res.sendStatus(401);
//   //   }
//   // } catch (error) {
//   //   next(error);
//   // }
// };

// //
// export const registro = async (req, res, next) => {
//   const { nombre, email, password } = req.body;
//   return res.status(200).json({ nombre, email, password });
//   // if (!user || !pwd)
//   //   return res
//   //     .status(400)
//   //     .json({ message: "Username and password are required." });

//   // // Comprueba si el usuario ya existe
//   // const duplicate = await User.findOne({ username: user }).exec();
//   // if (duplicate) return res.sendStatus(409); //Conflict
//   // try {
//   //   // Encripta el password
//   //   const hashedPwd = await bcrypt.hash(pwd, 10);

//   //   // Crea y almacena el nuevo usuario
//   //   const result = await User.create({
//   //     username: user,
//   //     password: hashedPwd,
//   //   });
//   //   console.log(result);
//   //   res.status(201).json({ success: `New user ${user} created!` });
//   // } catch (error) {
//   //   next(error);
//   //   // res.status(500).json({ message: err.message });
//   // }
// };

import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import Cliente from "../model/Cliente.js";

import ErrorAPIPropio from "../error/ErrorAPIPropio.js";

// -----------------------------------------------------
// POST /api/auth/login                                -
// Público                                             -
// Controlador para gestionar el login de los clientes -
// -----------------------------------------------------
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Compruebo si el cliente no existe
    const cliente = await Cliente.findOne({ email });
    if (!cliente) {
      throw new ErrorAPIPropio(401, "Credenciales no válidas");
    }

    // Compruebo que el password es válido
    const passwordValido = await bcryptjs.compare(password, cliente.password);
    if (!passwordValido) {
      throw new ErrorAPIPropio(401, "Credenciales no válidas");
    }

    // Genero el accessToken
    const accessToken = jwt.sign(
      { clienteId: cliente.id },
      process.env.JWT_ACCESS_TOKEN_SECRETO,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRACION }
    );

    // Genero el refreshToken
    const refreshToken = jwt.sign(
      { clienteId: cliente.id },
      process.env.JWT_REFRESH_TOKEN_SECRETO,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRACION }
    );

    // Guardo el refreshToken en el documento del cliente dentro de la base de datos
    cliente.refreshToken = refreshToken;
    await cliente.save();

    // Envio el Refresh Token como una httpOnly cookie. Una cookie
    // definida como httpOnly no es accesible por JavaScript,
    // por lo tanto no es accesible a los ataques. Access Token se envía normal.
    // Para hacer pruebas con Postman o Thunder Client se debe deshabilitar secure:true.
    // ES MUY IMPORTANTE HABILITAR SECURE:TRUE YA QUE SI NO SE HACE, EL REFRESH TOKEN NO SE ACTUALIZA
    return res
      .status(200)
      .cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: process.env.JWT_REFRESH_TOKEN_MAXAGE * 60 * 60 * 1000,
      })
      .json({
        clienteId: cliente.id,
        nombre: cliente.nombre,
        accessToken,
      });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------------
// POST /api/auth/registro                                -
// Público                                                -
// Controlador para gestionar el registro de los clientes -
// --------------------------------------------------------
export const registro = async (req, res, next) => {
  const { nombre, email, password } = req.body;
  try {
    // Compruebo si el cliente ya existe. Realmente, esta comprobación
    // aquí no haría falta ya que también lo comprueba en el middleware
    // manejarErrores.
    const cliente = await Cliente.findOne({ email });
    if (cliente) {
      throw new ErrorAPIPropio(400, "Ya existe ese email");
    }

    // Genero el hash para el password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Creo el nuevo cliente
    const nuevoCliente = await Cliente.create({
      nombre,
      email,
      password: passwordHash,
    });

    // Genero el accessToken. Realmente este token no sería necesario
    // crearlo en el registro ya que en mi caso, despues de hacer el registro voy
    // a la página de login. Si tras el registro fuese directamente a la zona privada
    // de la aplicación sí que sería necesario.
    const accessToken = jwt.sign(
      { clienteId: nuevoCliente.id },
      process.env.JWT_ACCESS_TOKEN_SECRETO,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRACION }
    );

    // Genero el refreshToken. Realmente este token no sería necesario
    // crearlo en el registro ya que en mi caso, despues de hacer el registro voy
    // a la página de login. Si tras el registro fuese directamente a la zona privada
    // de la aplicación sí que sería necesario.
    const refreshToken = jwt.sign(
      { clienteId: nuevoCliente.id },
      process.env.JWT_REFRESH_TOKEN_SECRETO,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRACION }
    );

    // Guardo el refreshToken en el documento del cliente dentro de la base de datos
    nuevoCliente.refreshToken = refreshToken;
    await nuevoCliente.save();

    // Envio el refreshToken como una httpOnly cookie. Una cookie
    // definida como httpOnly no es accesible por JavaScript,
    // por lo tanto no es accesible a los ataques. Access Token se envía normal
    // En producción se debe activar secure: true.
    // Para hacer pruebas con Postman o Thunder Client se debe deshabilitar secure:true.
    // ES MUY IMPORTANTE HABILITAR SECURE:TRUE YA QUE SI NO SE HACE, EL REFRESH TOKEN NO SE ACTUALIZA
    return res
      .status(201)
      .cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: process.env.JWT_REFRESH_TOKEN_MAXAGE * 60 * 60 * 1000,
      })
      .json({
        clienteId: nuevoCliente.id,
        nombre: nuevoCliente.nombre,
        token: accessToken,
      });
  } catch (error) {
    next(error);
  }
};

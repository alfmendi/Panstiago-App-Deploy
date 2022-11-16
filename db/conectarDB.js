import chalk from "chalk";

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const conectarDB = mongoose
  .connect(MONGODB_URI)
  .then((resultado) => {
    console.log("");
    console.log(
      chalk.green("-------------------------------------------------")
    );
    console.log(
      chalk.green("------------------CONEXIÓN BBDD------------------")
    );
    console.log(chalk.green("  Conexión con la BBDD realizada correctamente"));
    console.log(
      chalk.green("-------------------------------------------------")
    );
    console.log("");
  })
  .catch((error) => {
    console.log("");
    console.log(chalk.red("-------------------------------------------------"));
    console.log(chalk.red("------------------CONEXIÓN BBDD------------------"));
    console.log(chalk.red("      No se ha podido conectar con la BBDD"));
    console.log(chalk.red("-------------------------------------------------"));
    console.log("");
  });

export default conectarDB;

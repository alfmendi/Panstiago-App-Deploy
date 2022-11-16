import chalk from "chalk";

const loggerMiddleware = (req, res, next) => {
  console.log("");
  console.log(
    chalk.yellow("-------------------------------------------------")
  );
  console.log(
    chalk.yellow("---------------COMIENZO DEL LOGGER---------------")
  );
  console.log(
    chalk.yellow(req.method + " " + req.url + " " + JSON.stringify(req.body))
  );
  console.log(
    chalk.yellow("-----------------FIN DEL LOGGER------------------")
  );
  console.log(
    chalk.yellow("-------------------------------------------------")
  );
  console.log("");
  next();
};

export default loggerMiddleware;

require("dotenv").config();

function getPort(env) {
  const port = Number(env.PORT) || 3000;

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Invalid PORT");
  }

  return port;
}

module.exports = { getPort };
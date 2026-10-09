function logLine(method, url, statusCode) {
  return `${method} ${url} ${statusCode}`;
}

module.exports = { logLine };

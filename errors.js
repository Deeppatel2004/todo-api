function errorBody(status, message) {
  const defaultMessage =
    status >= 500 ? "server error" : "request failed";

  return {
    error: {
      status,
      message: message || defaultMessage
    }
  };
}

module.exports = { errorBody };

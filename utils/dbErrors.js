function statusForDbError(err) {
  if (err.code === 11000) return 409;
  if (err.name === 'ValidationError') return 400;
  if (err.name === 'CastError') return 404;

  return 500;
}

module.exports = { statusForDbError };
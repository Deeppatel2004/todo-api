function normalizeEmail(email) {
  return typeof email === 'string'
    ? email.trim().toLowerCase()
    : '';
}

function tokenPayload(user) {
  return {
    id: user._id.toString(),
    email: user.email,
  };
}

module.exports = { normalizeEmail, tokenPayload };
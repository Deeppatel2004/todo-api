function validateSignup(body = {}) {
  const email =
    typeof body.email === 'string' ? body.email.trim() : '';

  const password =
    typeof body.password === 'string' ? body.password : '';

  const atIndex = email.indexOf('@');

  if (
    atIndex <= 0 ||
    atIndex !== email.lastIndexOf('@') ||
    atIndex === email.length - 1
  ) {
    return { ok: false, error: 'Invalid email' };
  }

  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters' };
  }

  return { ok: true };
}

module.exports = { validateSignup };
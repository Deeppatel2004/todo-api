const jwt = require('jsonwebtoken');

// Extract token from Authorization header
function bearerToken(header) {
  if (!header || typeof header !== 'string') {
    return null;
  }

  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

// Authentication middleware
function requireAuth(req, res, next) {
  const token = bearerToken(req.headers.authorization);

  // 1. Check whether token exists
  if (!token) {
    return res.status(401).json({
      error: 'Not logged in'
    });
  }

  // 2. Verify token
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach logged-in user to request
    req.user = {
      id: payload.sub,
      email: payload.email
    };

    // 4. Continue to route
    next();

  } catch (err) {
     console.error('JWT ERROR:', err.name, err.message);

    return res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
}

module.exports = requireAuth;
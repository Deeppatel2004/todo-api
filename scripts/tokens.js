// make a token
const jwt = require('jsonwebtoken');

const SECRET = 'my-test-secret';

const token = jwt.sign(
  { sub: 'user123', email: 'a@b.com' },
  SECRET,
  { expiresIn: '7d' }
);

console.log(token);

//READ it without the secret
const parts = token.split('.');

console.log(
  JSON.parse(
    Buffer.from(parts[1], 'base64').toString()
  )
);


// verify
console.log(jwt.verify(token, SECRET));

//verify with the WRONG secret
try {
  jwt.verify(token, 'wrong-secret');
} catch (err) {
  console.log(err.name, '|', err.message);
}


// Try to cheat
const fake = Buffer.from(
  JSON.stringify({ sub: 'admin' })
).toString('base64');

const hacked = parts[0] + '.' + fake + '.' + parts[2];

try {
  jwt.verify(hacked, SECRET);
} catch (err) {
  console.log('hacked token:', err.message);
}


// Expiry
const short = jwt.sign(
  { sub: 'u1' },
  SECRET,
  { expiresIn: '1s' }
);

setTimeout(() => {
  try {
    jwt.verify(short, SECRET);
  } catch (err) {
    console.log('after 1s:', err.name);
  }
}, 2000);
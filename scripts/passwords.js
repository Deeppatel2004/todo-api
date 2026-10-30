/*
      //what a hash looks like
const bcrypt = require('bcryptjs');

async function main() {
  const hash = await bcrypt.hash('mypassword123', 10);
  console.log(hash);
}

main();
*/


//the same password twice
const bcrypt = require('bcryptjs');

async function main() {
  const a = await bcrypt.hash('mypassword123', 10);
  const b = await bcrypt.hash('mypassword123', 10);

  console.log(a);
  console.log(b);

  console.log('same?', a === b);

  // Step 3 - Checking a password
  console.log(
    await bcrypt.compare('mypassword123', a)
  );

  console.log(
    await bcrypt.compare('wrongpassword', a)
  );

// Step 4 - Why slow is good

console.time('rounds10');
await bcrypt.hash('x', 10);
console.timeEnd('rounds10');

console.time('rounds12');
await bcrypt.hash('x', 12);
console.timeEnd('rounds12');

}

main();


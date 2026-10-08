// =====================================================
//   API TESTER  -  rename to:  test-api.js
//
//   HOW TO USE
//   1. Terminal 1:   node server.js      (keep it running)
//   2. Terminal 2:   node test-api.js
//
//   It calls YOUR server and tells you PASS or FAIL.
//   (Open a 2nd terminal in VS Code with the + button.)
// =====================================================

const BASE = 'http://localhost:3000';

const results = [];
async function check(name, fn) {
  try {
    const ok = await fn();
    results.push([name, ok === true ? true : (typeof ok === 'string' ? ok : false)]);
  } catch (e) {
    results.push([name, 'ERROR: ' + e.message]);
  }
}

async function run() {
  // 1. server is running?
  let first;
  try {
    first = await fetch(BASE + '/todos');
  } catch (e) {
    console.log('\n   Cannot reach ' + BASE);
    console.log('   Is the server running?  node server.js\n');
    return;
  }

  await check('1  GET /todos answers 200', async () => {
    const res = await fetch(BASE + '/todos');
    return res.status === 200 ? true : 'got status ' + res.status;
  });

  await check('2  GET /todos gives an array', async () => {
    const res = await fetch(BASE + '/todos');
    const data = await res.json();
    return Array.isArray(data) ? true : 'body is not an array';
  });

  let created = null;

  await check('3  POST /todos creates (201)', async () => {
    const res = await fetch(BASE + '/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'test item' })
    });
    if (res.status !== 201) return 'got status ' + res.status + ' (should be 201)';
    created = await res.json();
    if (!created || created.id === undefined) return 'answer has no id';
    if (created.text !== 'test item') return 'text is wrong';
    if (created.done !== false) return 'done should be false';
    return true;
  });

  await check('4  POST with empty text gives 400', async () => {
    const res = await fetch(BASE + '/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '   ' })
    });
    return res.status === 400 ? true : 'got status ' + res.status + ' (should be 400)';
  });

  await check('5  GET /todos/:id gives the one todo', async () => {
    if (!created) return 'POST did not work, so this cannot be tested';
    const res = await fetch(BASE + '/todos/' + created.id);
    if (res.status !== 200) return 'got status ' + res.status;
    const one = await res.json();
    return one.id === created.id ? true : 'wrong todo came back';
  });

  await check('6  GET /todos/99999 gives 404', async () => {
    const res = await fetch(BASE + '/todos/99999');
    return res.status === 404 ? true : 'got status ' + res.status + ' (should be 404)';
  });

  await check('7  PATCH marks it done', async () => {
    if (!created) return 'POST did not work, so this cannot be tested';
    const res = await fetch(BASE + '/todos/' + created.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true })
    });
    if (res.status !== 200) return 'got status ' + res.status;
    const one = await res.json();
    return one.done === true ? true : 'done did not change';
  });

  await check('8  PATCH on 99999 gives 404', async () => {
    const res = await fetch(BASE + '/todos/99999', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true })
    });
    return res.status === 404 ? true : 'got status ' + res.status + ' (should be 404)';
  });

  await check('9  DELETE removes it (204)', async () => {
    if (!created) return 'POST did not work, so this cannot be tested';
    const res = await fetch(BASE + '/todos/' + created.id, { method: 'DELETE' });
    if (res.status !== 204) return 'got status ' + res.status + ' (should be 204)';
    const after = await fetch(BASE + '/todos/' + created.id);
    return after.status === 404 ? true : 'it is still there after delete';
  });

  await check('10 DELETE on 99999 gives 404', async () => {
    const res = await fetch(BASE + '/todos/99999', { method: 'DELETE' });
    return res.status === 404 ? true : 'got status ' + res.status + ' (should be 404)';
  });

  console.log('\n=============================');
  console.log('        API TEST RESULT');
  console.log('=============================\n');

  let score = 0;
  for (const [name, ok] of results) {
    if (ok === true) { console.log('   PASS    ' + name); score++; }
    else console.log('   FAIL    ' + name + (typeof ok === 'string' ? '   (' + ok + ')' : ''));
  }
  console.log('\n   Score:  ' + score + ' / ' + results.length + '\n');
  if (score === results.length) {
    console.log('   Your API is complete. Send me this screenshot.\n');
  } else {
    console.log('   Fix the FAIL ones one by one. Read the ( ) message.\n');
  }
}

run();
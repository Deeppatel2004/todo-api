       const fs = require('fs');
       const FILE = 'todos.json';

       function load() {
        try {
         if (!fs.existsSync(FILE)) return [];
         return JSON.parse(fs.readFileSync(FILE, 'utf8'));
        } catch (e) {
         return [];
        }
       }

       function save(todos) {
         fs.writeFileSync(FILE, JSON.stringify(todos, null, 2));
       }

       module.exports = { load, save };
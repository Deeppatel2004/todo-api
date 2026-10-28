require('dotenv').config();

const mongoose = require('mongoose');
const Todo = require('../models/Todo');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('connected');

    /*
   // STEP 3 - Find all todos
    const allTodos = await Todo.find();
    console.log('All Todos:', allTodos);

    // Find todos where done is false
    const activeTodos = await Todo.find({ done: false });
    console.log('Active Todos:', activeTodos);

    // Count all todos
    const total = await Todo.countDocuments();
    console.log('Total Todos:', total);

    // Find one todo by text
    const oneTodo = await Todo.findOne({
      text: 'from playground'
    });
    console.log('One Todo:', oneTodo);
    */


    /*
     // STEP 4 - Create one todo
    const doc = await Todo.create({
      text: 'from playground'
    });

    console.log('Before Update:', doc);

    // Update done from false to true
    const updated = await Todo.findByIdAndUpdate(
      doc._id,
      { done: true },
      { new: true }
    );

    console.log('After Update:', updated);
    */


      /*
        // STEP 5 - Create one Todo
    const doc = await Todo.create({
      text: 'from playground'
    });

    console.log('Created:', doc);

    // Count documents before deletion
    const before = await Todo.countDocuments();
    console.log('Before Delete:', before);

    // Delete the Todo using its ID
    const deleted = await Todo.findByIdAndDelete(doc._id);
    console.log('Deleted Todo:', deleted);

    // Count documents after deletion
    const after = await Todo.countDocuments();
    console.log('After Delete:', after)
    */

      /*
       // STEP 6 - Test validation
    try {
      await Todo.create({});
    } catch (err) {
      console.log('name:', err.name);
      console.log('message:', err.message);

    }
    */

        // STEP 7 - Invalid ObjectId
    try {
      await Todo.findById('123');
    } catch (err) {
      console.log('name:', err.name);
      console.log('message:', err.message);
    }


  } catch (err) {
    console.log('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('closed');
  }
}

main();
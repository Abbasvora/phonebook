const mongoose = require('mongoose');

const url = `mongodb+srv://abbas:${process.argv[2]}@nodeexpressproject.xq4nknp.mongodb.net/Persons?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: Number,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  mongoose.connect(url).then((result) => {
    Person.find({})
      .then((result) => {
        console.log('Phonebook:');
        result.forEach((person) => {
          console.log(person.name, person.number);
        });
        return mongoose.connection.close();
      })
      .catch((error) => console.log(error));
  });
} else if (process.argv.length === 5) {
  mongoose
    .connect(url)
    .then((result) => {
      console.log('connected');
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
      });
      return person.save();
    })
    .then((result) => {
      console.log(`added ${result.name} number ${result.number} to phonebook`);
      return mongoose.connection.close();
    })
    .catch((error) => console.log(error));
} else {
  console.log('Please provide following params');
  console.log('node mongo.js <password>  to view all persons');
  console.log('node mongo.js <password> <name> <number> to add person to DB');
}

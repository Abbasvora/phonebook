require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.use(express.static('./build'));
morgan.token('data', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
  return '';
});
morgan(':method :url :status :res[content-length] - :response-time ms :data');

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.data(req, res),
    ].join(' ');
  })
);

// Routes

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then((result) => {
      res.json(result);
    })
    .catch((error) => res.status(401).json({ msg: error }));
});

app.post('/api/persons', (req, res, next) => {
  if (req.body.name && req.body.number) {
    Person.find({})
      .then((persons) => {
        const personNotPresent = persons.every(
          (person) => person.name.toLowerCase() !== req.body.name.toLowerCase()
        );
        return personNotPresent;
      })
      .then((personNotPresent) => {
        if (personNotPresent) {
          const person = new Person({
            name: req.body.name,
            number: req.body.number,
          });
          person
            .save()
            .then((savedPerson) => res.status(200).json(savedPerson));
        } else {
          return res
            .status(400)
            .json({ error: `${req.body.name} is present in Phonebook.` });
        }
      })
      .catch((error) => next(error));
  } else {
    return res.status(400).json({ error: 'name and number must be provided' });
  }
  // res.status(200).end('person added')
});

app.get('/api/info', (req, res, next) => {
  Person.find({})
    .then((result) => {
      const time = new Date();
      res.send(
        `<p>Phonebook has info for ${result.length} people</p><p>${time}</p>`
      );
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const person = {
    name: req.body.name,
    number: req.body.number,
  };
  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedPerson) => res.json(updatedPerson))
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => res.status(204).end())
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

const errorHandler = (error, req, res, next) => {
  console.log(error.message);
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'malformated id' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});

const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/posts', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;

  posts[id] = {
    id,
    title
  };

  const eventBusUrl = process.env.EVENT_BUS_URL || 'http://localhost:4005';
  await axios.post(`${eventBusUrl}/events`, {
    type: 'PostCreated',
    data: {
      id,
      title
    }
  }).catch((err) => {
    console.log(err.message);
  });

  res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
  console.log('Received Event', req.body.type);

  res.send({});
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(4000, () => {
    console.log('Posts service listening on port 4000');
  });
}

module.exports = app;
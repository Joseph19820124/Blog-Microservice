const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  res.send(commentsByPostId[postId] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;
  const postId = req.params.id;

  const comments = commentsByPostId[postId] || [];
  
  const newComment = {
    id: commentId,
    content,
    status: 'pending'
  };

  comments.push(newComment);
  commentsByPostId[postId] = comments;

  const eventBusUrl = process.env.EVENT_BUS_URL || 'http://localhost:4005';
  await axios.post(`${eventBusUrl}/events`, {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId,
      status: 'pending'
    }
  }).catch((err) => {
    console.log(err.message);
  });

  res.status(201).send(comments);
});

app.post('/events', (req, res) => {
  console.log('Received Event', req.body.type);

  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    const { postId, id, status, content } = data;
    
    const comments = commentsByPostId[postId];
    
    if (comments) {
      const comment = comments.find(comment => comment.id === id);
      if (comment) {
        comment.status = status;
      }
    }
  }

  res.send({});
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(4001, () => {
    console.log('Comments service listening on port 4001');
  });
}

module.exports = app;
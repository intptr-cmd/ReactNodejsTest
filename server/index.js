const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET = 'mysecretkey';
const USER = { email: 'admin@gmail.com', password: 'admin123' };
let meetings = [];
let nextId = 1;

// Auth endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email === USER.email && password === USER.password) {
    const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Invalid credentials' });
});

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// CRUD for meetings
app.get('/api/meetings', auth, (req, res) => {
  res.json(meetings);
});

app.post('/api/meetings', auth, (req, res) => {
  const meeting = { id: nextId++, ...req.body };
  meetings.push(meeting);
  res.status(201).json(meeting);
});

app.put('/api/meetings/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = meetings.findIndex(m => m.id === id);
  if (idx === -1) return res.sendStatus(404);
  meetings[idx] = { ...meetings[idx], ...req.body };
  res.json(meetings[idx]);
});

app.delete('/api/meetings/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = meetings.findIndex(m => m.id === id);
  if (idx === -1) return res.sendStatus(404);
  meetings.splice(idx, 1);
  res.sendStatus(204);
});

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});

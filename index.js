const express = require('express');
const app = express();
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const usersFile = 'users.json';
let users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile)) : [];

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/signup', (req, res) => res.sendFile(__dirname + '/public/signup.html'));
app.get('/dashboard', (req, res) => res.sendFile(__dirname + '/public/dashboard.html'));
app.get('/admin', (req, res) => res.sendFile(__dirname + '/public/admin.html'));

app.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  const existing = users.find(u => u.username === username);
  if (existing) return res.send('User already exists.');

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed, role: role || 'user' });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res.redirect('/');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.send('Invalid login.');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.send('Invalid login.');

  if (user.role === 'admin') return res.redirect('/admin');
  return res.redirect('/dashboard');
});

app.get('/api/users', (req, res) => {
  const allUsers = users.map(u => ({ username: u.username, role: u.role }));
  res.json(allUsers);
});

app.listen(3000, () => console.log('OVER STARS running on port 3000'));

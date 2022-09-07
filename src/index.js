const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const username = req.headers.username;

  const user = users.find(
    (user) => user.username === username
  );

  if(!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  req.user = user;
  next();
}

app.post('/users', (req, res) => {
  const { name, username } = req.body
  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return res.status(400).json({ error: 'User already exists' })
  }
  const newUser = { id: uuidv4(), name, username, todos: [] }
  users.push(newUser);

  return res.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  res.status(200).json(req.user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const {title, deadline} = req.body;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline,
    done:false, 
    deadline: new Date(req.body.deadline),
    created_at: new Date() 
  };

  req.user.todos.push(newTodo);

  return res.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const todo = req.user.todos.find(
    (todo) => todo.id === req.params.id
  );

  if(!todo) return res.status(404).json({ error: 'Todo not found' }); 

  todo.title = req.body.title;
  todo.deadline = new Date(req.body.deadline);

  res.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const todo = req.user.todos.find(
    (todo) => todo.id === req.params.id
  );

  if(!todo) return res.status(404).json({ error: 'Todo not found' }); 

  todo.done = true;

  res.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const todo = req.user.todos.findIndex(
    (todo) => todo.id === req.params.id
  );

  if(todo === -1) return res.status(404).json({ error: 'Todo not found' }); 

  req.user.todos.splice(todo, 1);

  return res.status(204).json(users);
});

module.exports = app;
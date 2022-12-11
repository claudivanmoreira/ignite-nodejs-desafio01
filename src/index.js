const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function getUser(username) {
  return users.find(user => user.username === username)
}

function getTodo(user, todoId) {
  return user.todos.find(todo => todo.id === todoId)
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = getUser(username)
  if (user) {
    request.user = user
    return next()
  } else {
    return response.status(404).json({ error: "User [" + username + "] not found" })
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const userExists = getUser(username)
  if (userExists) {
    return response.status(400).json({ error: "User already exists with username " + username })
  } else {
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
    users.push(user)
    return response.status(201).json(user)
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo)
  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = getTodo(user, id)
  if (todo) {
    const { title, deadline } = request.body
    
    todo.title = title
    todo.deadline = new Date(deadline)

    return response.status(201).json(todo)
  } else {
    return response.status(404).json({ error: "Todo " + id + " not found." })
  }
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = getTodo(user, id)
  if (todo) {
    todo.done = true
    return response.status(201).json(todo)
  } else {
    return response.status(404).json({ error: "Todo " + id + " not found." })
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = getTodo(user, id)
  if (todo) {
    user.todos.splice(todo, 1)
    return response.status(204).json(todo)
  } else {
    return response.status(404).json({ error: "Todo " + id + " not found." })
  }
});

module.exports = app;
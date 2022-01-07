const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(404).json({
      error: 'O usuário não existe'
    })
  }

  request.user = user

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.find(user => user.username === username)

  if(userAlreadyExists) {
    return response.status(400).json({
      error: 'Já existe um usuário com este username'
    })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers

  const { todos } = users.find(user => user.username === username)

  return response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { title, deadline } = request.body
  
  const userIndex = users.findIndex(user => user.username === username)

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), // Usar ANO-MÊS-DIA no deadline
    created_at: new Date()
  }

  users[userIndex].todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { title, deadline } = request.body
  const { id } = request.params

  console.log(id)

  const userIndex = users.findIndex(user => user.username === username)
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1) {
    return response.status(404).json({
      error: 'Tarefa inexistente'
    })
  }

  users[userIndex].todos[todoIndex].title = title
  users[userIndex].todos[todoIndex].deadline = new Date(deadline)

  return response.status(201).json({
    title: users[userIndex].todos[todoIndex].title,
    deadline: users[userIndex].todos[todoIndex].deadline,
    done: users[userIndex].todos[todoIndex].done
  })
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { id } = request.params

  const userIndex = users.findIndex(user => user.username === username)
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1) {
    return response.status(404).json({
      error: 'Tarefa inexistente'
    })
  }

  users[userIndex].todos[todoIndex].done = true

  return response.status(201).json(users[userIndex].todos[todoIndex])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { id } = request.params

  const userIndex = users.findIndex(user => user.username === username)
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1) {
    return response.status(404).json({
      error: 'Tarefa inexistente'
    })
  }

  users[userIndex].todos.splice(users[userIndex].todos.indexOf(todoIndex))

  return response.status(204).send()
});

module.exports = app;
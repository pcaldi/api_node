//Incluir Biblioteca
//Gerencia as requisições, rotas e URLS, entre outras funcionalidades
const express = require('express');
//Chamar a função express
const app = express();

// Criar o middleware para receber os dados  no corpo da requisição;
app.use(express.json());



// Incluir as CONTROLLERS
const users = require('./controllers/users');
const situations = require('./controllers/situations');

// Criar as rotas
app.use("/", users);
app.use("/", situations);

// Iniciar o servidor na porta 8080, criar a função utilizando arrow function para retornar a mensagem de sucesso.
const PORT = 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

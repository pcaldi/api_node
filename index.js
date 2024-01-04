//Incluir Biblioteca
//Gerencia as requisições, rotas e URLS, entre outras funcionalidades
const express = require('express');
//Chamar a função express
const app = express();

// Criar a rota Listar, é a rota raiz
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/
app.get("/", (req, res) => {

  // Retornar texto como resposta.
  res.send('Welcome!');
});

// Criar a rota Usuários
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users/1?sit=2
app.get("/users/:id", (req, res) => {

  // http://localhost:8080/users/1
  const { id } = req.params;
  // http://localhost:8080/users/1?sit=2
  const { sit } = req.query;

  // retornar como resposta um objeto
  return res.json({
    id,
    name: "Paulo",
    email: "paulo@gmail.com",
    sit
  })


});


// Iniciar o servidor na porta 8080, criar a função utilizando modelo Arrow function para retornar a mensagem de sucesso.

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

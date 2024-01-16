//Incluir Biblioteca
//Gerencia as requisições, rotas e URLS, entre outras funcionalidades
const express = require('express');
//Chamar a função express
const router = express.Router();

// Criar a rota Listar, é a rota raiz
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/
router.get("/", (req, res) => {

  // Retornar texto como resposta.
  res.send('Listar Usuários');
});

// Criar a rota Usuários
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users/1?sit=2
router.get("/users/:id", (req, res) => {

  // http://localhost:8080/users/1
  const { id } = req.params;

  // http://localhost:8080/users/1?sit=2
  const { sit } = req.query;

  // retornar como resposta um objeto
  return res.json({
    id,
    name: "Paulo",
    email: "paulo@gmail.com",
    idade: 37,
    sit
  })
});

// Criar a rota Cadastro
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users/
/* A aplicação externa deve indicar que está enviando os dados em formato de objeto:
{
  "name": "Paulo",
  "email": "paulo@email.com",
  "subject": "Assunto",
  "content": "Conteúdo"
}
*/
router.post("/users", (req, res) => {
  //receber os dados enviados no corpo da requisição
  var { name, email, situationId } = req.body;

  // Implementar os dados no banco de dados

  // Retornar o objeto como resposta
  return res.json({
    name,
    email,
    situationId
  });
});

// Criar a rota Editar
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users/1
router.put("/users/:id", (req, res) => {

  //Receber o parâmetro enviado na URL
  const { id } = req.params;

  //Receber os dados enviados no corpo da requisição
  const { _id, name, email, situationId } = req.body;

  // Implementar os regra para editar no banco de dados

  // Retornar o objeto como resposta
  return res.json({
    _id,
    id,
    name,
    email,
    situationId
  });
});

// Criar a rota Apagar
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users/5

router.delete("/users/:id", (req, res) => {

  //Receber o parâmetro enviado na URL
  const { id } = req.params;

  // Implementar os regra para apagar registro no banco de dados

  // Retornar o objeto como resposta
  return res.json({ id });
});


// Exportar a instrução que está dentro da constante router
module.exports = router;

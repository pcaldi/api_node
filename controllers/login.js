//Incluir Biblioteca
//Gerencia as requisições, rotas e URLS, entre outras funcionalidades
const express = require('express');
//Chamar a função express
const router = express.Router();

// Incluir a conexão com o banco de dados
const db = require("../db/models");

// Criptografar a senha
const bcrypt = require('bcrypt');

// Criar a rota Login
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/login/
router.post("/login", async (req, res) => {

  // Receber os dados enviados no corpo da requisição
  var data = req.body;
  //console.log(data);

  // Recupera o registro no banco de dados
  const user = await db.Users.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id', 'name', 'email', 'password'],
    // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados.
    where: { email: data.email }
  });

  // Acessa o IF se (!NÃO) encontrar o user no banco de dados
  if (!user) {
    // Retorna objeto como resposta
    return res.status(401).json({
      error: true,
      message: 'Error: Usuário ou password incorretos!'
    })
  }
  // Comparar a senha do usuário com a senha salva no banco de dados
  if (!(await bcrypt.compare(String(data.password), String(user.password)))) {
    // Retorna objeto como resposta
    return res.status(401).json({
      error: true,
      message: 'Error: Usuário ou password incorretos!'
    })
  }

  // Retorna objeto como resposta
  return res.json({
    error: false,
    message: 'Login realizado com sucesso!'
  })

})


// Exportar a instrução que está dentro da constante router
module.exports = router;

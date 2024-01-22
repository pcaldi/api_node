//Incluir Bibliotecas
//Gerencia as requisições, rotas e URLS, entre outras funcionalidades
const express = require('express');
//Chamar a função express
const router = express.Router();
// Incluir a conexão com o banco de dados
const db = require("../db/models");
// Criptografar a senha
const bcrypt = require('bcrypt');
// Gerar o token de autenticação
const JWT = require('jsonwebtoken');
// Incluir arquivo com variáveis de ambiente
require('dotenv').config()
//Validar formulários
const yup = require('yup');

// Criar a rota Login
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/login/
router.post("/login", async (req, res) => {

  // Receber os dados enviados no corpo da requisição
  var data = req.body;
  //console.log(data);

  // Validar os campos utilizando YUP
  const schema = yup.object().shape({
    password: yup.string().required('Necessário preenchimento do campo senha.').min(6, 'A senha deve ter no mínimo 6 caracteres!'),
    email: yup.string().required('Necessário preenchimento do campo e-mail.').email('Informe um e-mail válido.')
  });

  try {
    await schema.validate(data);
  } catch (error) {
    //Retorno objeto como resposta
    return res.status(401).json({
      error: true,
      message: error.errors
    })
  }


  // Recupera o registro no banco de dados
  const user = await db.Users.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id', 'name', 'email', 'password'],
    // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados.
    where: { email: data.email }
  });
  //console.log(user);

  // Acessa o IF se (!diferente de true) encontrar o user no banco de dados
  if (!user) {
    // Retorna objeto como resposta
    return res.status(401).json({
      error: true,
      message: 'Error: Usuário ou password incorretos!'
    });
  }
  // Comparar a senha do usuário com a senha salva no banco de dados
  if (!(await bcrypt.compare(String(data.password), String(user.password)))) {
    // Retorna objeto como resposta
    return res.status(401).json({
      error: true,
      message: 'Error: Usuário ou password incorretos!'
    });
  }
  // Gerar o token de autenticação
  const token = JWT.sign({ id: user.id, /* name: user.name  */ }, process.env.SECRET_KEY, {
    expiresIn: 600 // 10 minutes
    //expiresIn: '7d'// 7 dias
  });

  // Retorna objeto como resposta
  return res.json({
    error: false,
    message: '✅ Login realizado com sucesso!',
    user: {
      token
    }
  });

});


// Exportar a instrução que está dentro da constante router
module.exports = router;

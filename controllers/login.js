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
require('dotenv').config();
//Validar formulários
const yup = require('yup');
// Arquivo responsável por salvar logs
const logger = require('../services/loggerService');

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

    // Salvar o log no nível warn
    logger.warn({
      message: 'Tentativa de login com email incorreto.',
      email: data.email,
      date: new Date()
    });

    // Retorna objeto como resposta
    return res.status(401).json({
      error: true,
      message: 'Error: Usuário ou password incorretos!'
    });
  }
  // Comparar a senha do usuário com a senha salva no banco de dados
  if (!(await bcrypt.compare(String(data.password), String(user.password)))) {

    // Salvar o log no nível warn
    logger.warn({
      message: 'Tentativa de login com senha incorreta.',
      email: data.email,
      date: new Date()
    });

    // Retorna objeto como resposta
    return res.status(401).json({
      error: true,
      message: 'Error: Usuário ou senha incorretas!'
    });
  }
  // Gerar o token de autenticação
  const token = JWT.sign({ id: user.id, /* name: user.name  */ }, process.env.SECRET_KEY, {
    expiresIn: 1800 // 30 minutes
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

// Criar a rota recuperar senha
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/recover-password
router.post("/recover-password", async (req, res) => {

  // Receber os dados enviados no corpo da requisição
  var data = req.body;
  //console.log(data);

  // Validar os campos utilizando YUP
  const schema = yup.object().shape({
    urlRecoverPassword: yup.string('Erro: Necessário enviar a URL!.').required('Erro: Necessário enviar a URL!.'),
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
    attributes: ['id', 'email',],

    // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados.
    where: { email: data.email }
  });

  // Acessa o IF se (!diferente de true) encontrar o user no banco de dados
  if (!user) {

    // Salvar o log no nível info
    logger.info({
      message: 'Tentativa de recuperação de senha com e-mail incorreto.',
      email: data.email,
      date: new Date()
    });


    // Retorna objeto como resposta
    return res.status(401).json({
      error: true,
      message: 'Error: E-mail não está cadastrado!'
    });
  }

  // Gerar a chave para recuperar senha
  var recoverPassword = (await bcrypt.hash(data.email, 8)).replace(/\./g, "").replace(/\//g, "");
  //console.log(recoverPassword);

  // Editar o registro no banco de dados
  await db.Users.update(
    { recoverPassword },
    { where: { id: user.id } }
  ).then(() => {
    // Retorna objeto como resposta
    return res.json({
      error: false,
      message: 'Enviado e-mail com instruções para recuperar a senha. Acesse a sua caixa de e-mail para recuperar a senha!',
    });
  }).catch(() => {

    // Salvar o log no nível warn
    logger.warn({
      message: 'E-mail recuperar senha não enviado.Erro editar usuário banco de dados.',
      email: data.email,
      date: new Date()
    });


    // Retorna objeto como resposta
    return res.status(400).json({
      error: true,
      message: 'Erro: Link recuperar senha não enviado, entre em contato com o e-mail de suporte: ' + process.env.EMAIL_ADM,
    });
  })


})


// Exportar a instrução que está dentro da constante router
module.exports = router;

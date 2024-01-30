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
// Enviar E-mail
const nodemailer = require('nodemailer');
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
    attributes: ['id', 'name',],

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

    // Criar a variável com as credencias do servidor para enviar o e-mail
    var transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Criar a variável com o conteúdo do e-mail
    var message_content = {
      from: process.env.EMAIL_FROM_PASS, // Remetente
      to: data.email, // E-mail do destinatário
      subject: 'Recuperar senha', // Assunto do E-mail

      text: `Prezado(a) ${user.name} \n\nInformamos que a sua solicitação de alteração de senha foi recebida com sucesso.\n\nClique no link abaixo para criar uma nova senha em nosso sistema: ${data.urlRecoverPassword}${recoverPassword}\n\nEsta mensagem foi enviada a você pela empresa ${process.env.NAME_EMP}.\n\nVocê está recebendo porque está cadastrado no banco de dados da empresa ${process.env.NAME_EMP}.Nenhum e-mail enviado pela empresa ${process.env.NAME_EMP} tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.\n\n`, // Conteúdo do e-mail somente texto

      html: `Prezado(a) ${user.name} <br><br>Informamos que a sua solicitação de alteração de senha foi recebida com sucesso.<br><br>Clique no link abaixo para criar uma nova senha em nosso sistema: <a href='${data.urlRecoverPassword}${recoverPassword}'>${data.urlRecoverPassword}${recoverPassword}</a><br><br>Esta mensagem foi enviada a você pela empresa ${process.env.NAME_EMP}.<br><br>Você está recebendo porque está cadastrado no banco de dados da empresa ${process.env.NAME_EMP}.Nenhum e-mail enviado pela empresa ${process.env.NAME_EMP} tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.<br><br>`, // Conteúdo do e-mail com HTML
    };

    // Enviar e-mail
    transport.sendMail(message_content, function (error) {
      if (error) {

        // Salvar o log no nível warn
        logger.warn({
          message: "E-mail recuperar senha não enviado.",
          email: data.email,
          date: new Date()
        });

        // Retornar objeto como resposta
        return res.status(400).json({
          error: true,
          message: `Erro: E-mail com as instruções para recuperar a senha não enviado, tente novamente ou entre em contato com o e-mail:  ${process.env.EMAIL_ADM}`
        });


      } else {

        // Salvar o log no nível info
        logger.info({
          message: "Enviado e-mail com instruções para recuperar a senha.",
          email: data.email,
          date: new Date()
        });

        // Retornar objeto como resposta
        return res.json({
          error: false,
          message: "Enviado e-mail com instruções para recuperar a senha. Acesse a sua caixa de e-mail para recuperar a senha!"
        });
      }
    })


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
  });

});

// Criar a rota validar a chave recuperada
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/validate-recover-password
router.post("/validate-recover-password", async (req, res) => {

  // Receber os dados enviados no corpo da requisição
  var data = req.body;


  // Validar os campos utilizando YUP
  const schema = yup.object().shape({
    recoverPassword: yup.string('Erro: Necessário enviar a Chave!.').required('Erro: Necessário enviar a Chave!.'),
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
    attributes: ['id'],

    // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados.
    where: {
      recoverPassword: data.recoverPassword
    }

  });

  // Acessa o IF se encontrar o registro "user" no banco de dados
  if (user) {

    // Salvar o log no nível info
    logger.info({
      message: "Validar chave recuperar senha, chave válida.",
      date: new Date()
    });

    // Retorna objeto como resposta
    return res.json({
      error: false,
      message: 'Chave recuperar senha válida',
    });
  } else {

    // Salvar o log no nível info
    logger.info({
      message: "Validar chave recuperar senha, chave inválida.",
      date: new Date()
    });

    // Retorna objeto como resposta
    return res.status(400).json({
      error: true,
      message: 'Erro: Chave recuperar senha inválida.',
    });
  }



})


// Exportar a instrução que está dentro da constante router
module.exports = router;

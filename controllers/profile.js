//Incluir Biblioteca
//Gerencia as requisições, rotas e URLS, entre outras funcionalidades
const express = require('express');

//Chamar a função express
const router = express.Router();

// Criptografar a senha
const bcrypt = require('bcrypt');

// Validar Formulários
const yup = require('yup');

//Operador Sequelize
const { Op } = require('sequelize');

// O módulo fs permite interagir com o sistema de arquivos
const fs = require('fs');

// Incluir a conexão com o banco de dados
const db = require("../db/models");

// Arquivo para validar token
const { eAdmin } = require('../services/authService');

// Arquivo com a função de upload
const upload = require('../services/uploadImgUserService');

// Arquivo responsável por salvar logs
const logger = require('../services/loggerService');



// Criar a rota Visualizar
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/profile
router.get("/profile", eAdmin, async (req, res) => {

  // Recuperar o registro do banco de dados
  const user = await db.Users.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id', 'name', 'email', 'image', 'situationId', 'updatedAt', 'createdAt'],

    // Buscar dados na tabela secundária
    include: [{
      model: db.Situations,
      // No sequelize colunas é indicado como "attributes", Logo quero recuperar as seguintes colunas
      attributes: ['nameSituation']
    }],

    // Acrescentar condição para indicar qual registro dever ser retornado do banco de dados
    where: { id: req.userId }
  });

  // Acessa o if se encontrar o registo no banco de dados
  if (user) {

    // Salvar log no nível info
    logger.info({
      message: 'Perfil visualizado.',
      id: req.userId,
      userId: req.userId,
      date: new Date()
    });

    // Acessa o IF se o usuário possuir imagem
    if (user.dataValues.image) {
      //console.log(user.dataValues.image);

      // Criar caminho da imagem
      user.dataValues['image'] = `${process.env.URL_ADM}/images/users/${user.dataValues.image}`;
    } else {
      //console.log("Usuário não possui imagem!")
      // Criar caminho da imagem
      user.dataValues['image'] = `${process.env.URL_ADM}/images/users/icon_default.png`;
    }

    // Retornar o objeto como resposta
    return res.json({
      error: false,
      user
    });
  } else {

    // Salvar log no nível info
    logger.info({
      message: 'Perfil não encontrado.',
      id: req.userId,
      userId: req.userId,
      date: new Date()
    });

    // Retornar o objeto como resposta
    return res.status(400).json({
      error: true,
      message: "Erro: Perfil não encontrado.",
    });
  }

});

// Criar a rota Editar
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/profile
// A aplicação externa deve indicar que está enviado os dados em formato de objeto Content-Type: application/json
// Dados em formato de objeto
/*
{
    "name": "Paulo",
    "email": "paulo@email.com"
}
*/
router.put("/profile", eAdmin, async (req, res) => {

  //Receber os dados enviados no corpo da requisição
  const data = req.body;

  // Validar os campos utilizando YUP
  const schema = yup.object().shape({
    email: yup.string().email('Error: Necessário preencher com e-mail válido.').required('Error: Necessário preencher com e-mail.'),
    name: yup.string().required('Error: Necessário preencher o campo nome.')
  });

  //Verificar se todos os campos passaram pela validação
  try {
    await schema.validate(data);
  } catch (error) {
    // Retornar objeto como resposta
    return res.status(401).json({
      error: true,
      message: error.errors
    });
  }

  // Recuperar o registro no banco de dados
  const user = await db.Users.findOne({

    //Indicar a coluna para recuperar
    attributes: ['id'],

    // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
    where: {
      email: data.email,
      id: {
        // Operador de negação para ignorar o registro do usuário que está sendo editado
        [Op.ne]: Number(req.userId) //Id do usuário logado.
      }
    }

  });

  // Acessa o IF se encontrar o registo no bando de dados
  if (user) {

    // Salvar log no nível info
    logger.info({
      message: 'Tentativa de utilizar e-mail já cadastrado em outro usuário.',
      id: req.userId, //Id do usuário logado.
      name: data.name,
      email: data.email,
      situationId: data.situationId,
      userId: req.userId,
      date: new Date()
    });

    // Retorna objeto como resposta
    return res.status(400).json({
      error: true,
      message: 'Error: E-mail já cadastrado!'
    })
  };


  // Editar no banco de dados
  await db.Users.update(data, { where: { id: req.userId } }) //Id do usuário logado.
    .then(() => {

      // Salvar log no nível info
      logger.info({
        message: 'Perfil editado com sucesso.',
        id: req.userId, //Id do usuário logado.
        name: data.name,
        email: data.email,
        userId: req.userId,
        date: new Date()
      });

      // Retorno objeto como resposta
      return res.json({
        error: false,
        message: 'Perfil editado com sucesso.'
      });
    }).catch(() => {

      // Salvar log no nível info
      logger.info({
        message: 'Perfil não editado.',
        id: req.userId, //Id do usuário logado.
        name: data.name,
        email: data.email,
        userId: req.userId,
        date: new Date()
      });

      // Retorno objeto como resposta
      return res.status(400).json({
        error: true,
        message: 'Error: Perfil não editado.'
      })
    })

});



// Exportar a instrução que está dentro da constante router
module.exports = router;

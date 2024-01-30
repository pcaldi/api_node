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



// Exportar a instrução que está dentro da constante router
module.exports = router;

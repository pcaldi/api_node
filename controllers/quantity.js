//Incluir Biblioteca
//Gerencia as requisições, rotas e URLS, entre outras funcionalidades
const express = require('express');
//Chamar a função express
const router = express.Router();
// Incluir a conexão com o banco de dados
const db = require("../db/models");
// Arquivo para validar o token
const { eAdmin } = require("../services/authService");
// Arquivo responsável por salvar logs
const logger = require('../services/loggerService');

// Criar a rota quantidade de usuários
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/quantityReport
router.get("/quantity", eAdmin, async (req, res) => {

  // Contar a quantidade de registros no banco de dados
  const counterUsers = await db.Users.count();

  // Acessa o if quando encontrar o registro no banco de dados
  if (counterUsers !== 0) {

    // Calcular a última página
    // Salvar no log
    logger.info({
      message: "Quantidade de usuários.",
      userId: req.userId,
      date: new Date()
    });

    // Retornar o objeto como resposta
    return res.json({
      error: false,
      counterUsers
    })

  } else {
    // Salvar no log
    logger.info({
      message: "Quantidade de usuários.",
      userId: req.userId,
      date: new Date()
    });

    // Retornar o objeto como resposta
    return res.status(400).json({
      error: true,
      counterUsers: 0,
      message: "Nenhum usuário encontrado.",
    })
  }
})


// Exportar a instrução que está dentro da constante router
module.exports = router;


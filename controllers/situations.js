//Incluir Biblioteca
//Gerencia as requisições, rotas e URLS, entre outras funcionalidades
const express = require('express');
//Chamar a função express
const router = express.Router();
// Incluir a conexão com o banco de dados
const db = require("../db/models");


// Criar a rota Listar, é a rota raiz
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/situation
router.get("/situations", async (req, res) => {

  // Recuperar todos as situations do banco de dados
  const situations = await db.Situations.findAll({

    // Indicar quais colunas recuperar
    attributes: ['id', 'nameSituation'],

  });

  // Acessa o if se encontrar o registo no banco de dados
  if (situations) {
    // Retornar o objeto como resposta
    return res.json(
      {
        error: false,
        situations
      }
    );
  } else {
    return res.status(400).json(
      {
        error: true,
        message: "Error: Nenhuma situação encontrada!",
      }
    );
  }
});


// Criar a rota Cadastro
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/situations
/* A aplicação externa deve indicar que está enviando os dados em formato de objeto:
{
  "nameSituation: "Ativo",
}
*/
router.post("/situations", async (req, res) => {
  //receber os dados enviados no corpo da requisição
  var data = req.body;

  // Salvar no banco de dados
  await db.Situations.create(data).then((dataSituation) => {
    // Retornar o objeto como resposta
    return res.json(
      {
        error: false,
        message: "Situação cadastrada com sucesso!",
        dataSituation
      }
    );
  }).catch(() => {
    // Retornar o objeto como resposta
    return res.status(400).json(
      {
        error: true,
        message: "Situação não cadastrada com sucesso!",
      }
    );
  });
});

// Exportar a instrução que está dentro da constante router
module.exports = router;

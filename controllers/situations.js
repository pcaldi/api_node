//Incluir Biblioteca
//Gerencia as requisições, rotas e URLS, entre outras funcionalidades
const express = require('express');
//Chamar a função express
const router = express.Router();
// Incluir a conexão com o banco de dados
const db = require("../db/models");


// Criar a rota Listar, é a rota raiz
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/situation?page=1
router.get("/situations", async (req, res) => {

  // Receber o número da página, quando não é enviado o número da página é atribuído página 1.
  const { page = 1 } = req.query;

  // Limitar o número de registros de cada página
  const limit = 10;

  // Variável com o número da última página
  var lastPage = 1;

  // Contar o número de registro no banco de dados
  const countSituations = await db.Situations.count()

  // Acessar o IF quando encontrar a registro no banco de dados
  if (countSituations !== 0) {

    // Calcular a última página
    lastPage = Math.ceil(countSituations / limit);

  } else {
    // Retornar o objeto como resposta
    return res.status(400).json(
      {
        error: true,
        message: "Error: Nenhuma situação encontrada!",
      })
  }



  // Recuperar todos as situations do banco de dados
  const situations = await db.Situations.findAll({

    // Indicar quais colunas recuperar
    attributes: ['id', 'nameSituation'],

    // Calcular a partir de qual registro deve retornar e o limite de registros
    offset: Number((page * limit) - limit),
    limit: limit,

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
    // Retornar o objeto como resposta
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

//Incluir Biblioteca
//Gerencia as requisições, rotas e URLS, entre outras funcionalidades
const express = require('express');
//Chamar a função express
const router = express.Router();
// Incluir a conexão com o banco de dados
const db = require("../db/models");
// Arquivo para validar o token
const { eAdmin } = require("../services/authService");


// Criar a rota Listar, é a rota raiz
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/situation?page=1
router.get("/situations", eAdmin, async (req, res) => {

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

// Criar a rota Visualizar Situations
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/situations/1
router.get("/situations/:id", eAdmin, async (req, res) => {

  // Receber o parâmetro enviado na URL
  // http://localhost:8080/users/1
  const { id } = req.params;

  // Recuperar o registro no banco de dados
  const situation = await db.Situations.findOne({

    // Indicar qual colunas recuperar
    attributes: ['id', 'nameSituation'],

    // Acrescentar condição para indicar qual registro dever ser retornado do banco de dados
    where: { id },
  });

  // Acessa o if se encontrar o registo no banco de dados
  if (situation) {
    // Retornar o objeto como resposta
    return res.json({
      error: false,
      situation
    })
  } else {
    // Retornar objeto como resposta
    return res.status(400).json({
      error: true,
      message: "Error: Situação não encontrada."
    })
  }

});

// Criar a rota Cadastro
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/situations
/* A aplicação externa deve indicar que está enviando os dados em formato de objeto:
{
  "nameSituation: "Ativo",
}
*/
router.post("/situations", eAdmin, async (req, res) => {
  //receber os dados enviados no corpo da requisição
  var data = req.body;

  // Salvar no banco de dados
  await db.Situations.create(data)
    .then((dataSituation) => {
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
          message: "Error: Situação não cadastrada com sucesso!",
        }
      );
    });
});

// Rota de EDITAR registro no banco de dados
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/situations/
/* A aplicação externa deve indicar que está enviando os dados em formato de objeto:
{
  "id": 1,
  "nameSituation: "Ativo",
}
*/
router.put("/situations/", eAdmin, async (req, res) => {

  // Receber os dados enviados no corpo da requisição
  const data = req.body;

  // Editar o registro no banco de dados
  await db.Situations.update(data, { where: { id: data.id } })
    .then(() => {
      // Retornar o objeto como resposta
      return res.json({
        error: false,
        message: 'Situação editada com sucesso.'
      })
    })
    .catch(() => {
      // Retorno o objeto como resposta
      return res.status(400).json({
        error: true,
        message: 'Error: Situação não editada.'
      })
    })
});

// Rota Apagar registro no banco de dados
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/situations/5
router.delete("/situations/:id", eAdmin, async (req, res) => {

  //Receber o parâmetro enviado na URL
  const { id } = req.params;

  // Apagar situação no banco de dados utilizando a MODELS Situations
  await db.Situations.destroy({

    // Acrescento WHERE na instrução SQL indicando qual registro excluir no banco de dados
    where: { id }

  }).then(() => {
    // Retornar o objeto como resposta
    return res.json({
      error: false,
      message: 'Apagado com sucesso.'
    });
  }).catch(() => {
    // Retornar o objeto como resposta
    return res.status(400).json({
      error: true,
      message: 'Error: Não apagado.'
    })
  })

});


// Exportar a instrução que está dentro da constante router
module.exports = router;

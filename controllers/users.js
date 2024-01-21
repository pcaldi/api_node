//Incluir Biblioteca
//Gerencia as requisições, rotas e URLS, entre outras funcionalidades
const express = require('express');
//Chamar a função express
const router = express.Router();

// Criptografar a senha
const bcrypt = require('bcrypt');

// Validar Formulários
const yup = require('yup');

// Incluir a conexão com o banco de dados
const db = require("../db/models");
// Arquivo para validar token
const { eAdmin } = require('../services/authService');

// Criar a rota Listar, é a rota raiz
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users?page=1
router.get("/users", eAdmin, async (req, res) => {

  // Receber o número da página, quando não é enviado o número da página é atribuído página 1.
  const { page = 1 } = req.query;

  // Limite de registro em cada página.
  const limitPage = 40;

  // Recuperar os valores que estavam no token, tratado em authService.js
  // console.log(req.userId)
  // console.log(req.userName)

  // Variável com o número da última página
  var lastPage = 1;

  // Contar a quantidade de registro no banco de dados
  const countUser = await db.Users.count();

  // Acessa o IF quando encontrar o registro no banco de dados
  if (countUser !== 0) {

    // Calcular a última página
    lastPage = Math.ceil(countUser / limitPage);

  } else {
    // Retornar o objeto como resposta
    return res.status(400).json({
      error: true,
      message: "Erro: Nenhum usuário não encontrado.",
    });
  }

  // Recuperar todos os usuários do banco de dados
  const users = await db.Users.findAll({

    // Indicar quais colunas recuperar
    attributes: ['id', 'name', 'email', 'situationId'],

    // Ordenar os registros pela coluna id na forma decrescente.
    order: [['id', 'DESC']],

    // Buscar dados na tabela secundária
    include: [{
      model: db.Situations,
      // No sequelize colunas é indicado como "attributes", Logo quero recuperar as seguintes colunas
      attributes: ['nameSituation']
    }],

    // Calcular a partir de qual registro deve retornar e o limite de registros
    offset: Number((page * limitPage) - limitPage),
    limit: limitPage

  });

  // Acessa o if se encontrar o registo no banco de dados
  if (users) {
    // Retornar o objeto como resposta
    return res.json({
      error: false,
      users
    });
  } else {
    // Retornar o objeto como resposta
    return res.status(400).json({
      error: true,
      message: "Erro: Nenhum usuário encontrado.",
    });
  }

});

// Criar a rota Usuários
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users/1
router.get("/users/:id", eAdmin, async (req, res) => {

  // Receber o parâmetro enviado na URL
  // http://localhost:8080/users/1
  const { id } = req.params;

  // Recuperar o registro do banco de dados
  const user = await db.Users.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id', 'name', 'email', 'password', 'situationId', 'updatedAt', 'createdAt'],

    // Buscar dados na tabela secundária
    include: [{
      model: db.Situations,
      // No sequelize colunas é indicado como "attributes", Logo quero recuperar as seguintes colunas
      attributes: ['nameSituation']
    }],


    // Acrescentar condição para indicar qual registro dever ser retornado do banco de dados
    where: { id }
  });

  // Acessa o if se encontrar o registo no banco de dados
  if (user) {
    // Retornar o objeto como resposta
    return res.json({
      error: false,
      user
    });
  } else {
    // Retornar o objeto como resposta
    return res.status(400).json({
      error: true,
      message: "Erro: Usuário não encontrado.",
    });
  }

});

// Criar a rota Cadastro
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users/
/* A aplicação externa deve indicar que está enviando os dados em formato de objeto:
{
  "name": "Paulo",
  "email": "paulo@email.com",
  "situationId": 1,
}
*/
router.post("/users", eAdmin, async (req, res) => {
  //receber os dados enviados no corpo da requisição
  var data = req.body;

  // Validar os campos utilizando YUP
  const schema = yup.object().shape({
    situationId: yup.number()
      .required('Error: Necessário preencher o campo situação!').max(4, 'Número máximo de situações.'),
    password: yup.string()
      .required('Error: Necessário preencher o campo senha!').min(6, 'A senha deve ter no mínimo 6 caracteres'),
    email: yup.string().required('Error: Necessário preencher o campo e-mail!')
      .email('Error: Necessário preencher com e-mail válido.!'),
    name: yup.string().required('Error: Necessário preencher o campo nome!')
  });

  // Verifico se todos os campos passaram pela validação
  try {
    await schema.validate(data);
  } catch (error) {
    // Retorno objeto como resposta
    return res.status(401).json({
      error: true,
      message: error.errors
    })
  }

  // Criptografar a senha
  data.password = await bcrypt.hash(String(data.password), 8);

  // Salvar os dados no banco de dados
  await db.Users.create(data).then((dataUser) => {
    // Retornar o objeto como resposta
    return res.json({
      error: false,
      message: "Usuário cadastrado com sucesso!",
      dataUser
    });
  }).catch(() => {
    // Retornar o objeto como resposta
    return res.status(400).json({
      error: true,
      message: "Error: Usuário não cadastrado.",
    });
  });

});

// Criar a rota Editar
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users/
// A aplicação externa deve indicar que está enviado os dados em formato de objeto Content-Type: application/json
// Dados em formato de objeto
/*{
    "id": 1,
    "name": "Paulo",
    "email": "paulo@email.com",
    "situationId": 1
}
*/
router.put("/users/", eAdmin, async (req, res) => {

  //Receber os dados enviados no corpo da requisição
  const data = req.body;

  // Validar os campos utilizando YUP
  const schema = yup.object().shape({
    situationId: yup.number()
      .required('Error: Necessário preencher o campo situação!').max(4, 'Número máximo de situações.'),
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
    })
  }

  // Editar no banco de dados
  await db.Users.update(data, { where: { id: data.id } })
    .then(() => {
      // Retorno objeto como resposta
      return res.json({
        error: false,
        message: 'Usuário editado com sucesso.'
      });
    }).catch(() => {
      // Retorno objeto como resposta
      return res.status(400).json({
        error: true,
        message: 'Error: Usuário não editado.'
      })
    })


});

// Criar a rota Apagar
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users/5
router.delete("/users/:id", eAdmin, async (req, res) => {

  //Receber o parâmetro enviado na URL
  const { id } = req.params;

  // Apagar usuário no banco de dados utilizando a MODELS User
  await db.Users.destroy({

    // Acrescento WHERE na instrução SQL indicando qual registro excluir no banco de dados
    where: { id }

  }).then(() => {
    // Retorno objeto como resposta
    return res.json({
      error: false,
      message: 'Usuário apagado com sucesso.'
    })
  }).catch(() => {
    // Retorno objeto como resposta
    return res.status(400).json({
      error: true,
      message: 'Error: Usuário não apagado.'
    })
  })
  // Retornar o objeto como resposta
  return res.json({ id });
});


// Exportar a instrução que está dentro da constante router
module.exports = router;

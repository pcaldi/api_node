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


// Criar a rota Listar, é a rota raiz
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users?page=1
router.get("/users", eAdmin, async (req, res) => {

  // Receber o número da página, quando não é enviado o número da página é atribuído página 1.
  const { page = 1 } = req.query;

  // Limite de registro em cada página.
  const limitPage = 10;

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

    // Salvar log no nível info
    logger.info({
      message: 'Listar Usuário.',
      userId: req.userId,
      date: new Date()
    });


    // Retornar o objeto como resposta
    return res.json({
      error: false,
      users,
      lastPage,
      countUser
    });
  } else {

    // Salvar log no nível info
    logger.info({
      message: 'Listar Usuário não executada corretamente.',
      userId: req.userId,
      date: new Date()
    });

    // Retornar o objeto como resposta
    return res.status(400).json({
      error: true,
      message: "Erro: Nenhum usuário encontrado.",
    });
  }

});

// Criar a rota Visualizar
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users/1
router.get("/users/:id", eAdmin, async (req, res) => {

  // Receber o parâmetro enviado na URL
  // http://localhost:8080/users/1
  const { id } = req.params;

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
    where: { id }
  });

  // Acessa o if se encontrar o registo no banco de dados
  if (user) {

    // Salvar log no nível info
    logger.info({
      message: 'Usuário visualizado.',
      id,
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
      message: 'Usuário não encontrado.',
      id,
      userId: req.userId,
      date: new Date()
    });

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
    });
  }
  // Recuperar o registro do banco de dados
  const user = await db.Users.findOne({

    // Indicar quais colunas recuperar
    attributes: ['id'],

    // Acrescentando condição para indicar qual registro deve ser retornado do banco de dados
    where: {
      email: data.email,
    }
  });
  //console.log(user);

  // Acessa o IF se encontrar o registro no banco de dados
  if (user) {

    // Salvar log no nível info
    logger.info({
      message: 'Tentativa de cadastro com e-mail já cadastrado.',
      name: data.name,
      email: data.email,
      situationId: data.situationId,
      userId: req.userId,
      date: new Date()
    });

    // Retorno objeto como resposta
    return res.status(400).json({
      error: true,
      message: 'Error: E-mail já cadastrado!'
    });
  }

  // Criptografar a senha
  data.password = await bcrypt.hash(String(data.password), 8);

  // Salvar os dados no banco de dados
  await db.Users.create(data).then((dataUser) => {

    // Salvar log no nível info
    logger.info({
      message: 'Usuário cadastrado com sucesso.',
      name: data.name,
      email: data.email,
      situationId: data.situationId,
      userId: req.userId,
      date: new Date()
    });

    // Retornar o objeto como resposta
    return res.json({
      error: false,
      message: "Usuário cadastrado com sucesso!",
      dataUser
    });
  }).catch(() => {

    // Salvar log no nível info
    logger.info({
      message: 'Usuário não cadastrado.',
      name: data.name,
      email: data.email,
      situationId: data.situationId,
      userId: req.userId,
      date: new Date()
    });

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
        [Op.ne]: Number(data.id)
      }
    }

  });

  // Acessa o IF se encontrar o registo no bando de dados
  if (user) {

    // Salvar log no nível info
    logger.info({
      message: 'Tentativa de utilizar e-mail já cadastrado em outro usuário.',
      id: data.id,
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
    });
  };


  // Editar no banco de dados
  await db.Users.update(data, { where: { id: data.id } })
    .then(() => {

      // Salvar log no nível info
      logger.info({
        message: 'Usuário editado com sucesso.',
        id: data.id,
        name: data.name,
        email: data.email,
        situationId: data.situationId,
        userId: req.userId,
        date: new Date()
      });

      // Retorno objeto como resposta
      return res.json({
        error: false,
        message: 'Usuário editado com sucesso.'
      });
    }).catch(() => {

      // Salvar log no nível info
      logger.info({
        message: 'Usuário não editado.',
        id: data.id,
        name: data.name,
        email: data.email,
        situationId: data.situationId,
        userId: req.userId,
        date: new Date()
      });

      // Retorno objeto como resposta
      return res.status(400).json({
        error: true,
        message: 'Error: Usuário não editado.'
      });
    })

});

// Criar a rota Editar Senha
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/users-password
// A aplicação externa deve indicar que está enviado os dados em formato de objeto Content-Type: application/json
// Dados em formato de objeto
/*
{
    "id": "1",
    "password": "123456"
}
*/
router.put("/users-password", eAdmin, async (req, res) => {

  //Receber os dados enviados no corpo da requisição
  const data = req.body;

  // Validar os campos utilizando YUP
  const schema = yup.object().shape({
    id: yup.string('Erro: Necessário enviar o id do usuário').required('Erro: Necessário enviar o id do usuário'),
    password: yup.string('Error: Necessário preencher o campo senha.').required('Error: Necessário preencher o campo senha.').min(6, 'A senha deve ter no mínimo 6 caracteres')
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

  // Criptografar a senha
  data.password = await bcrypt.hash(String(data.password), 8);

  // Editar no banco de dados
  await db.Users.update(data, { where: { id: req.userId } }) //Id do usuário logado.
    .then(() => {

      // Salvar log no nível info
      logger.info({
        message: 'Senha do usuário editada com sucesso.',
        id: req.userId, //Id do usuário logado.
        userId: req.userId,
        date: new Date()
      });

      // Retorno objeto como resposta
      return res.json({
        error: false,
        message: 'Senha do usuário editada com sucesso.'
      });
    }).catch(() => {

      // Salvar log no nível info
      logger.info({
        message: 'Senha do usuário não editada.',
        id: req.userId, //Id do usuário logado.
        userId: req.userId,
        date: new Date()
      });

      // Retorno objeto como resposta
      return res.status(400).json({
        error: true,
        message: 'Error: Senha do usuário não editada.'
      })
    })

});


// Criar a rota editar imagem e receber o parâmetro id enviado na URL
// Endereço para acessar através da aplicação externa http://localhost:8080/user-image/1

router.put("/users-image/:id", eAdmin, upload.single('image'), async (req, res) => {

  // Receber o id enviado no URL
  const { id } = req.params;
  //console.log(id);

  // Acessa o IF quando a extensão da imagem é inválida
  //console.log(req.file)
  if (!req.file) {

    // Salvar log no nível info
    logger.info({
      message: 'Enviado extensão da imagem inválida no editar imagem do usuário.',
      id,
      userId: req.userId,
      date: new Date()
    });

    // Retorno objeto como resposta
    return res.status(400).json({
      error: true,
      message: 'Erro: Selecione uma imagem válida JPEG ou PNG!'
    });
  }

  // Recuperar registro no bando de dados
  const user = await db.Users.findOne({

    // Indicar quais colunas recuperar
    attributes: ['id', 'image'],

    // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
    where: { id }
  });

  // Verificar se o usuário tem a imagem salva no banco de dados
  //console.log(user);
  if (user.dataValues.image) {
    // Criar o caminho da imagem que o usuário tem no banco de dados
    var imgOld = `./public/images/users/${user.dataValues.image}`;

    // fs.access usado para testar as permissões do arquivo
    fs.access(imgOld, (error) => {

      // Acessar o IF quando não houver erro
      if (!error) {

        // Apagar a imagem antiga
        fs.unlink(imgOld, () => { })
      }
    });
  };

  // Editar no banco de dados
  db.Users.update(
    { image: req.file.filename },
    { where: { id } })
    .then(() => {

      // Salvar log no nível info
      logger.info({
        message: 'Imagem do usuário editada com sucesso.',
        image: req.file.filename,
        id,
        userId: req.userId,
        date: new Date()
      });

      // Retornar objeto como resposta
      return res.json({
        error: false,
        message: 'Imagem do usuário editada com sucesso.'
      });
    }).catch(() => {

      // Salvar log no nível info
      logger.info({
        message: 'Imagem do usuário não editada.',
        image: req.file.filename,
        id,
        userId: req.userId,
        date: new Date()
      });

      // Retornar objeto como resposta
      return res.status(400).json({
        error: false,
        message: 'Imagem do usuário não editada.'
      });
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

    // Salvar log no nível info
    logger.info({
      message: 'Usuário apagado com sucesso.',
      id,
      userId: req.userId,
      date: new Date()
    });

    // Retorno objeto como resposta
    return res.json({
      error: false,
      message: 'Usuário apagado com sucesso.'
    });
  }).catch(() => {

    // Salvar log no nível info
    logger.info({
      message: 'Usuário não apagado.',
      id,
      userId: req.userId,
      date: new Date()
    });

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

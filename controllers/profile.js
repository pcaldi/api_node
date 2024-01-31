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

// Criar a rota Editar Senha
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/profile-password
// A aplicação externa deve indicar que está enviado os dados em formato de objeto Content-Type: application/json
// Dados em formato de objeto
/*
{
    "password": "123456"
}
*/
router.put("/profile-password", eAdmin, async (req, res) => {

  //Receber os dados enviados no corpo da requisição
  const data = req.body;

  // Validar os campos utilizando YUP
  const schema = yup.object().shape({
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
        message: 'Senha do perfil editada com sucesso.',
        id: req.userId, //Id do usuário logado.
        userId: req.userId,
        date: new Date()
      });

      // Retorno objeto como resposta
      return res.json({
        error: false,
        message: 'Senha do perfil editada com sucesso.'
      });
    }).catch(() => {

      // Salvar log no nível info
      logger.info({
        message: 'Senha do perfil não editada.',
        id: req.userId, //Id do usuário logado.
        userId: req.userId,
        date: new Date()
      });

      // Retorno objeto como resposta
      return res.status(400).json({
        error: true,
        message: 'Error: Senha do perfil não editada.'
      })
    })

});



// Criar a rota editar imagem do profile
// Endereço para acessar através da aplicação externa http://localhost:8080/profile-image

router.put("/profile-image", eAdmin, upload.single('image'), async (req, res) => {


  // Acessa o IF quando a extensão da imagem é inválida
  //console.log(req.file)
  if (!req.file) {

    // Salvar log no nível info
    logger.info({
      message: 'Enviado extensão da imagem inválida no editar imagem do usuário.',
      id: req.userId, //Id do usuário logado.
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
    where: { id: req.userId } // Utilizo o ID do usuário logado.
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
    { where: { id: req.userId } }) // Utilizo o ID do usuário logado.
    .then(() => {

      // Salvar log no nível info
      logger.info({
        message: 'Imagem do perfil editada com sucesso.',
        image: req.file.filename,
        id: req.userId, // Utilizo o ID do usuário logado.
        userId: req.userId,
        date: new Date()
      });

      // Retornar objeto como resposta
      return res.json({
        error: false,
        message: 'Imagem do perfil editada com sucesso.'
      });
    }).catch(() => {

      // Salvar log no nível info
      logger.info({
        message: 'Imagem do perfil não editada.',
        image: req.file.filename,
        id: req.userId,// Utilizo o ID do usuário logado.
        userId: req.userId,
        date: new Date()
      });

      // Retornar objeto como resposta
      return res.status(400).json({
        error: false,
        message: 'Imagem do perfil não editada.'
      });
    })


});




// Exportar a instrução que está dentro da constante router
module.exports = router;

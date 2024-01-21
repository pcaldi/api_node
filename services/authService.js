// Manipular token de autenticação
const JWT = require('jsonwebtoken');

// Módulo "util" fornece funções para imprimir strings formatadas
const { promisify } = require('util');

// Incluir arquivo com variáveis de ambiente
require('dotenv').config();

// Exportar para utilizar em outras partes do projeto.
module.exports = {
  eAdmin: async function (req, res, next) {
    //return res.json({ message: 'Validar token' });

    // Receber o cabeçalho da requisição
    const authHeader = req.headers.authorization;
    //console.log(authHeader)

    // Acessa o IF quando não existe dados no cabeçalho
    if (!authHeader) {
      //Retornar um objeto como resposta
      return res.status(401).json({
        error: true,
        message: 'Erro: ⚠️ Necessário realizar login para acessar essa página.',
      });
    }

    // Separar a palavra Bearer do token
    const [bearer, token] = authHeader.split(' ')
    //console.log(token);

    // Se o token estiver vazio retornar erro
    if (!token) {
      //Retornar objeto como resposta
      return res.status(401).json({
        error: true,
        message: 'Erro: Necessário enviar o token!'
      });
    }

    // Permanece no try se conseguir executar corretamente
    try {
      // Validar o token
      const decode = await promisify(JWT.verify)(token, process.env.SECRET_KEY);
      //console.log(decode);

      // Atribuir como parâmetro o id do usuário que está no token
      req.userId = decode.id;
      //req.userName = decode.name;
      //console.log(req.userName, req.userId);

      return next();

    } catch (error) {
      // Retornar objeto como resposta
      return res.status(401).json({
        error: true,
        message: 'Erro: ⚠️ Necessário realizar login para acessar essa página.'
      })
    }
  }
}

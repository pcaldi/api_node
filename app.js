//Incluir Biblioteca
//Gerencia as requisições, rotas e URLS, entre outras funcionalidades
const express = require('express');
//Chamar a função express
const app = express();
// Importar biblioteca para permitir conexão externa
const cors = require('cors');
// O módulo path permite gerenciar diretórios e caminhos
const path = require('path');

// Criar o middleware para receber os dados  no corpo da requisição;
app.use(express.json());

// Criar o middleware para permitir conexão externa
app.use((req, res, next) => {
  // Qualquer endereço pode fazer a requisição "*"
  res.header("Access-Control-Allow-Origin", "*");
  // Tipos de métodos que a API aceita
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  // Permitir o envio de dados para API
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  // Executar o cors
  app.use(cors());
  // Quando não houver erro deve continuar o processamento
  next();
});

// Local dos arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));



// Incluir as CONTROLLERS
const users = require('./controllers/users');
const situations = require('./controllers/situations');
const login = require('./controllers/login');

// Criar as rotas
app.use("/", users);
app.use("/", situations);
app.use("/", login);

// Iniciar o servidor na porta 8080, criar a função utilizando arrow function para retornar a mensagem de sucesso.
const PORT = 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

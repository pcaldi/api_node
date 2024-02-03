# 🎡 RODAR O PROJETO BAIXADO
---
### Instalar todas as dependências indicada pelo package.json
```
 npm install
```

### Criar a base de dados "pcaldi" no MySQL
### ♻️ Alterar as credenciais do banco de dados no arquivo .env

### Executar as migrations
```
npx sequelize-cli db:migrate
 ```

### Executar as seeders

```
 npx sequelize-cli db:seed:all
```


### Rodar o projeto
```
node app.js
  ```

### Rodar o projeto utilizando nodemon
```
npx nodemon app.js
 ```
---
# ✴️ SEQUÊNCIA PARA CRIAR O PROJETO
### Criar o arquivo package
```
npm init
```
### Gerencia as requisições, rotas e URLS, entre outras funcionalidades
```
npm install --save express
```

### Rodar o projeto
```
node index.js
```

### Rodar o projeto utilizando nodemon
```
nodemon index.js
```

### Instalar a dependência de forma global, "-g" significa globalmente. 
```
npm install -g nodemon
```
### Instalar a dependência como desenvolvedor para reiniciar o servidor sempre que houver alterações no código fonte.
```
npm install --save-dev nodemon
```

### Rodar o projeto utilizando nodemon
```
nodemon index.js
```

## Abrir o endereço no navegador para acessar a página inicial
```
http://localhost:8080
 ```


### Comando SQL para criar a base de dados
```
CREATE DATABASE nodecelke CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Sequelize é uma biblioteca Javascript que facilita o gerenciamento do banco de dados SQL
```
npm install --save sequelize
```

### Instalar o drive do banco de dados
```
npm install --save mysql2
```

### Sequelize-cli interface  usada para criar modelos, configurações e arquivos de migração para banco de dados
```
npm install --save-dev sequelize-cli
```

### Iniciar o Sequelize-cli e criar o arquivo config
```
npx sequelize-cli init
 ```

### Manipular variáveis de ambiente
```
npm install dotenv --save
 ```

### Criar a Models situação
```
npx sequelize-cli model:generate --name Situations --attributes nameSituation:string
```

### Criar a Models usuários
```
 npx sequelize-cli model:generate --name Users --attributes name:string,email:string,situationId:integer
```

### Executar as migrations
```
npx sequelize-cli db:migrate
```

### Criar seeders situations
```
npx sequelize-cli seed:generate --name demo-situations
 ```

### Criar seeders users
```
npx sequelize-cli seed:generate --name demo-users
```

### Executar as seeders
```
npx sequelize-cli db:seed:all
```

### Criar a migrations
```
npx sequelize-cli migration:generate --name alter-users-password
```

### Instalar módulo para criptografar a senha
```
npm install --save bcryptjs
 ```

### Executar o down "rollback", Permite que seja desfeita a migration, permitindo a gestão das alterações do banco de dados, versionamento.
```
npx sequelize-cli db:migrate:undo --name (NOME-DA-MIGRATIONS)
```

### Instalar a dependência JWT - JSON Web Token
```
npm install --save jsonwebtoken
```

### Biblioteca Yup para validar formulários
```
npm install --save yup
```

### Permitir requisição externa
```
npm install cors
```

### Criar a migrations alterar a tabela users e acrescentar a coluna image
```
npx sequelize-cli migration:generate --name alter-users-image
```

### Multer é um middleware node.js para manipulação multipart/form-data, usado para o upload de arquivos
```
npm install --save multer
```

### Biblioteca Winston para salvar log na aplicação
```
npm install --save winston
```

### Criar a migrations alterar a tabela users e acrescentar a coluna recoverPassword
```
npx sequelize-cli migration:generate --name alter-users-recover-password
```
### Biblioteca Nodemailer para enviar e-mail
```
npm install --save nodemailer
```
### Criar a migrations alterar a tabela users e acrescentar a coluna recoverPasswordToken
```
npx sequelize-cli migration:generate --name alter-users-recover-password-token
```

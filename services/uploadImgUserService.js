//Multer é um middleware node.js para manipulação multipart/form-data, usado para o upload de arquivos
const multer = require('multer');

// O módulo path permite interagir com o sistema de arquivos
const path = require('path');

// Realizar o upload de arquivos
module.exports = (multer({
  // DiskStorage permite manipular local para salvar a imagem
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      //console.log(file);
      cb(null, './public/images/users')
    },
    filename: (req, file, cb) => {
      // Criar um novo nome para o arquivo
      cb(null,
        Date.now()
          .toString() + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
  }),
  // Validar a extensão do arquivo
  fileFilter: (req, file, cb) => {
    // Verificar se a extensão da imagem enviada pelo usuário está no array de extensões
    const extensionImg = ['image/jpeg', 'image/jpg', 'image/png'].find((acceptedFormat) => acceptedFormat === file.mimetype);

    // Retornar true quando a extensão da imagem é válida
    if (extensionImg) {
      return cb(null, true);
    } else {
      return cb(null, false)
    }
  }
}));

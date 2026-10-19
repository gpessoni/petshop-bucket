const multer = require('multer');

const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];
const LIMITE_MB = 5;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!TIPOS_ACEITOS.includes(file.mimetype)) {
      const erro = new Error('Tipo de arquivo inválido. Use JPEG, PNG ou WebP.');
      erro.status = 400;
      return cb(erro);
    }
    cb(null, true);
  },
});

// Campo "fotos" (até 10 imagens por requisição)
module.exports = upload.array('fotos', 10);

const express = require('express');
const petRoutes = require('./routes/petRoutes');
const fotoRoutes = require('./routes/fotoRoutes');

const app = express();
app.use(express.json());

app.use('/pets', petRoutes);
app.use('/fotos', fotoRoutes);

app.use((req, res) => {
  res.status(404).json({ sucesso: false, erro: 'Rota não encontrada' });
});

// Tratamento básico de erros
app.use((err, req, res, next) => {
  let status = err.status || 500;
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    err.message = 'Arquivo maior que o limite de 5 MB';
  } else if (err.name === 'MulterError') {
    status = 400;
  }
  if (status === 500) console.error(err);
  res.status(status).json({
    sucesso: false,
    erro: status === 500 ? 'Erro interno do servidor' : err.message,
  });
});

module.exports = app;

const express = require('express');
const petRoutes = require('./routes/petRoutes');
const fotoRoutes = require('./routes/fotoRoutes');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./docs/openapi');

const app = express();
app.use(express.json());

// CORS liberado para o frontend estático (desenvolvimento)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'Focinho Feliz — API' }));
app.get('/docs.json', (req, res) => res.json(openapi));

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

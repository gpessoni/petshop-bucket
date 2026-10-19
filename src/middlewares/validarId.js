// Valida que o parâmetro :id é um inteiro positivo
module.exports = (req, res, next, valor) => {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ sucesso: false, erro: 'ID inválido' });
  }
  next();
};

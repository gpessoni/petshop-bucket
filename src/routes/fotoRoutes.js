const router = require('express').Router();
const validarId = require('../middlewares/validarId');
const fotoController = require('../controllers/fotoController');

router.param('id', validarId);

router.get('/bucket', fotoController.listarBucket);
router.patch('/:id/principal', fotoController.definirPrincipal);
router.delete('/:id', fotoController.excluir);
router.get('/:id/download', fotoController.baixar);

module.exports = router;

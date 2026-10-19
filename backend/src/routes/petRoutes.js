const router = require('express').Router();
const validarId = require('../middlewares/validarId');
const petController = require('../controllers/petController');
const fotoController = require('../controllers/fotoController');
const upload = require('../middlewares/upload');

router.param('id', validarId);

router.post('/', petController.criar);
router.get('/', petController.listar);
router.get('/:id', petController.buscarPorId);
router.put('/:id', petController.atualizar);
router.delete('/:id', petController.excluir);

router.post('/:id/fotos', upload, fotoController.enviar);
router.get('/:id/fotos', fotoController.listarDoPet);

module.exports = router;

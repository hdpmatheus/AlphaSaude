const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/consulta.controller');
const { authenticate, requireFuncionario } = require('../middlewares/auth.middleware');

router.use(authenticate, requireFuncionario);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.excluir);

module.exports = router;

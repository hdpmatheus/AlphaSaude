const express = require('express');
const router = express.Router();
const { listar, criar, atualizar, excluir } = require('../controllers/funcionario.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', requireAdmin, listar);
router.post('/', requireAdmin, criar);
router.put('/:id', requireAdmin, atualizar);
router.delete('/:id', requireAdmin, excluir);

module.exports = router;

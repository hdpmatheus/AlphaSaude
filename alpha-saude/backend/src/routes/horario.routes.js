// horario.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/horario.controller');
const { authenticate, requireAdmin, requireFuncionario } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/', requireFuncionario, ctrl.getBloqueios);
router.post('/', requireAdmin, ctrl.criarBloqueio);
router.delete('/:id', requireAdmin, ctrl.removerBloqueio);

module.exports = router;

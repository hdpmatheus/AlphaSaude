const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/profissional.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Qualquer usuário autenticado pode listar profissionais (pacientes também)
router.get('/', authenticate, ctrl.listar);
router.get('/:id', authenticate, ctrl.buscarPorId);

// Só admin pode criar, editar e excluir
router.post('/', authenticate, requireAdmin, ctrl.criar);
router.put('/:id', authenticate, requireAdmin, ctrl.atualizar);
router.delete('/:id', authenticate, requireAdmin, ctrl.excluir);

module.exports = router;
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paciente.controller');
const { authenticate, requireFuncionario } = require('../middlewares/auth.middleware');

// Cadastro público (sem autenticação)
router.post('/', ctrl.criar);

// Rotas protegidas
router.get('/', authenticate, requireFuncionario, ctrl.listar);
router.get('/:id', authenticate, requireFuncionario, ctrl.buscarPorId);
router.put('/:id', authenticate, requireFuncionario, ctrl.atualizar);

module.exports = router;
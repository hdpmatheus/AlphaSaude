const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/consulta.controller');
const { authenticate, requireFuncionario } = require('../middlewares/auth.middleware');

// Listagem — paciente pode consultar para verificar horários ocupados
router.get('/', authenticate, ctrl.listar);

// Demais rotas — apenas funcionários
router.get('/:id', authenticate, requireFuncionario, ctrl.buscarPorId);
router.post('/', authenticate, requireFuncionario, ctrl.criar);
router.put('/:id', authenticate, requireFuncionario, ctrl.atualizar);
router.delete('/:id', authenticate, requireFuncionario, ctrl.excluir);

module.exports = router;
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paciente.controller');
const { authenticate, requireFuncionario } = require('../middlewares/auth.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Cadastro público (sem autenticação)
router.post('/', ctrl.criar);

// Rotas protegidas
router.get('/', authenticate, requireFuncionario, ctrl.listar);
router.get('/:id', authenticate, requireFuncionario, ctrl.buscarPorId);
router.put('/:id', authenticate, requireFuncionario, ctrl.atualizar);
router.delete('/:id', authenticate, requireFuncionario, async (req, res) => {
  try {
    await prisma.paciente.update({ where: { id: req.params.id }, data: { ativo: false } });
    res.json({ message: 'Paciente desativado' });
  } catch {
    res.status(500).json({ error: 'Erro ao excluir paciente' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

router.get('/', authenticate, requireAdmin, async (req, res) => {
  const { tipo, dataInicio, dataFim } = req.query;
  const where = {};
  if (tipo && tipo !== 'todos') where.tipo = tipo;
  if (dataInicio && dataFim) {
    where.createdAt = { gte: new Date(dataInicio), lte: new Date(dataFim + 'T23:59:59') };
  }
  try {
    const historico = await prisma.historico.findMany({
      where,
      include: {
        paciente: { select: { nome: true } },
        funcionario: { select: { nome: true, cargo: true } },
        consulta: { include: { profissional: { select: { nome: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Listar consultas do paciente logado
router.get('/', authenticate, async (req, res) => {
  if (req.user.tipo !== 'paciente') return res.status(403).json({ error: 'Acesso negado' });
  try {
    const consultas = await prisma.consulta.findMany({
      where: { pacienteId: req.user.id },
      include: { profissional: { select: { nome: true, especialidade: true } } },
      orderBy: [{ data: 'desc' }, { horario: 'asc' }],
    });
    res.json(consultas);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar consultas' });
  }
});

// Agendar consulta (paciente logado)
router.post('/', authenticate, async (req, res) => {
  if (req.user.tipo !== 'paciente') return res.status(403).json({ error: 'Acesso negado' });

  const { profissionalId, data, horario, observacoes, formaPagamento } = req.body;
  if (!profissionalId || !data || !horario) {
    return res.status(400).json({ error: 'Campos obrigatórios' });
  }

  try {
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia, 0, 0, 0);
    const dataFim = new Date(ano, mes - 1, dia, 23, 59, 59);

    const conflito = await prisma.consulta.findFirst({
      where: {
        profissionalId,
        horario,
        data: { gte: dataObj, lte: dataFim },
        status: { in: ['confirmada', 'pendente'] },
      },
    });
    if (conflito) return res.status(409).json({ error: 'Horário já ocupado para este profissional' });

    const consulta = await prisma.consulta.create({
      data: {
        pacienteId: req.user.id,
        profissionalId,
        data: new Date(ano, mes - 1, dia, 12, 0, 0),
        horario,
        observacoes: observacoes || null,
        formaPagamento: formaPagamento || null,
      },
      include: { profissional: { select: { nome: true, especialidade: true } } },
    });
    res.status(201).json(consulta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao agendar consulta' });
  }
});

// Cancelar consulta (paciente logado)
router.put('/:id/cancelar', authenticate, async (req, res) => {
  if (req.user.tipo !== 'paciente') return res.status(403).json({ error: 'Acesso negado' });
  const { motivo } = req.body;
  try {
    const consulta = await prisma.consulta.findUnique({ where: { id: req.params.id } });
    if (!consulta) return res.status(404).json({ error: 'Consulta não encontrada' });
    if (consulta.pacienteId !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });

    await prisma.consulta.update({
      where: { id: req.params.id },
      data: { status: 'cancelada' },
    });
    await prisma.historico.create({
      data: {
        tipo: 'cancelamento',
        consultaId: consulta.id,
        pacienteId: req.user.id,
        dataOriginal: consulta.data,
        motivo: motivo || null,
      },
    });
    res.json({ message: 'Consulta cancelada' });
  } catch {
    res.status(500).json({ error: 'Erro ao cancelar' });
  }
});

module.exports = router;
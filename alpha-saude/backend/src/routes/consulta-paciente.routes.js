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
      where: { pacienteId: Number(req.user.id) },
      include: { profissional: { select: { nome: true, especialidade: true } } },
      orderBy: [{ data: 'desc' }],
    });
    // Formata horario de DateTime para string "HH:MM"
    const formatado = consultas.map(c => ({
      ...c,
      horario: c.horario instanceof Date ? c.horario.toISOString().slice(11, 16) : c.horario,
    }));
    res.json(formatado);
  } catch (err) {
    console.error(err);
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
    const horarioDate = new Date(`1970-01-01T${horario}:00`);

    const conflito = await prisma.consulta.findFirst({
      where: {
        profissionalId: Number(profissionalId),
        horario: horarioDate,
        data: new Date(data),
        status: { in: ['confirmada', 'pendente'] },
      },
    });
    if (conflito) return res.status(409).json({ error: 'Horário já ocupado para este profissional' });

    // Usa a stored procedure sp_agendar_consulta (com transação)
    await prisma.$executeRaw`
      CALL sp_agendar_consulta(${Number(req.user.id)}, ${Number(profissionalId)}, ${data}, ${horario}, ${null}, ${formaPagamento || null}, ${observacoes || null})
    `;

    const consulta = await prisma.consulta.findFirst({
      where: {
        pacienteId: Number(req.user.id),
        profissionalId: Number(profissionalId),
        horario: horarioDate,
        data: new Date(data),
      },
      orderBy: { id: 'desc' },
      include: { profissional: { select: { nome: true, especialidade: true } } },
    });

    res.status(201).json(consulta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao agendar consulta' });
  }
});

// Cancelar consulta (paciente logado) — usa sp_cancelar_consulta (com transação)
router.put('/:id/cancelar', authenticate, async (req, res) => {
  if (req.user.tipo !== 'paciente') return res.status(403).json({ error: 'Acesso negado' });
  const { motivo } = req.body;
  const idConsulta = Number(req.params.id);

  try {
    const consulta = await prisma.consulta.findUnique({ where: { id: idConsulta } });
    if (!consulta) return res.status(404).json({ error: 'Consulta não encontrada' });
    if (consulta.pacienteId !== Number(req.user.id)) return res.status(403).json({ error: 'Acesso negado' });

    await prisma.$executeRaw`
      CALL sp_cancelar_consulta(${idConsulta}, ${null}, ${motivo || null})
    `;

    res.json({ message: 'Consulta cancelada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cancelar' });
  }
});

module.exports = router;
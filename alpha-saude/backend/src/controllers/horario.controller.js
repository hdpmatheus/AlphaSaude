const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getBloqueios = async (req, res) => {
  const { profissionalId } = req.query;
  try {
    const bloqueios = await prisma.bloqueio.findMany({
      where: profissionalId ? { profissionalId } : {},
      include: { profissional: { select: { nome: true } } },
      orderBy: { dataInicio: 'asc' },
    });
    res.json(bloqueios);
  } catch {
    res.status(500).json({ error: 'Erro ao listar bloqueios' });
  }
};

const criarBloqueio = async (req, res) => {
  const { profissionalId, dataInicio, dataFim, motivo } = req.body;
  if (!profissionalId || !dataInicio || !dataFim) return res.status(400).json({ error: 'Campos obrigatórios' });
  try {
    const b = await prisma.bloqueio.create({
      data: { profissionalId, dataInicio: new Date(dataInicio), dataFim: new Date(dataFim), motivo },
    });
    res.status(201).json(b);
  } catch {
    res.status(500).json({ error: 'Erro ao criar bloqueio' });
  }
};

const removerBloqueio = async (req, res) => {
  try {
    await prisma.bloqueio.delete({ where: { id: req.params.id } });
    res.json({ message: 'Bloqueio removido' });
  } catch {
    res.status(500).json({ error: 'Erro ao remover bloqueio' });
  }
};

module.exports = { getBloqueios, criarBloqueio, removerBloqueio };

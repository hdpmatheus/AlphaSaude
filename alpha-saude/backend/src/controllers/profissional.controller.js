const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listar = async (req, res) => {
  try {
    const profissionais = await prisma.profissional.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
    res.json(profissionais);
  } catch {
    res.status(500).json({ error: 'Erro ao listar profissionais' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const p = await prisma.profissional.findUnique({ where: { id: req.params.id } });
    if (!p) return res.status(404).json({ error: 'Profissional não encontrado' });
    res.json(p);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar profissional' });
  }
};

const criar = async (req, res) => {
  const { nome, especialidade, registro, telefone, email, diasAtendimento, horarioInicio, horarioFim } = req.body;
  if (!nome || !especialidade || !registro) return res.status(400).json({ error: 'Campos obrigatórios faltando' });

  try {
    const p = await prisma.profissional.create({
      data: { nome, especialidade, registro, telefone, email, diasAtendimento: diasAtendimento || [], horarioInicio: horarioInicio || '08:00', horarioFim: horarioFim || '18:00' },
    });
    res.status(201).json(p);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Registro ou email já cadastrado' });
    res.status(500).json({ error: 'Erro ao criar profissional' });
  }
};

const atualizar = async (req, res) => {
  try {
    const p = await prisma.profissional.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(p);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar profissional' });
  }
};

const excluir = async (req, res) => {
  try {
    await prisma.profissional.update({ where: { id: req.params.id }, data: { ativo: false } });
    res.json({ message: 'Profissional desativado' });
  } catch {
    res.status(500).json({ error: 'Erro ao excluir profissional' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listar = async (req, res) => {
  const { search } = req.query;
  const where = { ativo: true };
  if (search) {
    // MySQL: collation utf8mb4_unicode_ci já é case-insensitive por padrão,
    // então 'contains' simples já cobre o que 'mode: insensitive' fazia no Postgres
    where.OR = [
      { nome: { contains: search } },
      { cpf: { contains: search } },
      { email: { contains: search } },
    ];
  }
  try {
    const pacientes = await prisma.paciente.findMany({
      where,
      select: { id: true, nome: true, cpf: true, telefone: true, email: true, createdAt: true },
      orderBy: { nome: 'asc' },
    });
    res.json(pacientes);
  } catch (erro) {
    console.error('ERRO DETALHADO:', erro);
    res.status(500).json({ error: 'Erro ao listar pacientes' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const p = await prisma.paciente.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true, nome: true, cpf: true, telefone: true, email: true },
    });
    if (!p) return res.status(404).json({ error: 'Paciente não encontrado' });
    res.json(p);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar paciente' });
  }
};

const criar = async (req, res) => {
  const { nome, cpf, telefone, email, senha } = req.body;
  if (!nome || !cpf || !email || !senha) return res.status(400).json({ error: 'Campos obrigatórios faltando' });

  try {
    const hash = await bcrypt.hash(senha, 10);
    const p = await prisma.paciente.create({
      data: { nome, cpf, telefone, email, senha: hash },
      select: { id: true, nome: true, cpf: true, telefone: true, email: true },
    });
    res.status(201).json(p);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'CPF ou email já cadastrado' });
    res.status(500).json({ error: 'Erro ao criar paciente' });
  }
};

const atualizar = async (req, res) => {
  const { nome, telefone, email } = req.body;
  try {
    const p = await prisma.paciente.update({
      where: { id: Number(req.params.id) },
      data: { nome, telefone, email },
      select: { id: true, nome: true, cpf: true, telefone: true, email: true },
    });
    res.json(p);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar paciente' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar };

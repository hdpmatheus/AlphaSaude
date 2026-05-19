const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listar = async (req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, email: true, telefone: true, cargo: true, createdAt: true },
      orderBy: { nome: 'asc' },
    });
    res.json(funcionarios);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar funcionários' });
  }
};

const criar = async (req, res) => {
  const { nome, email, telefone, cargo, senha } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Campos obrigatórios faltando' });

  try {
    const existe = await prisma.funcionario.findUnique({ where: { email } });
    if (existe) return res.status(409).json({ error: 'Email já cadastrado' });

    const hash = await bcrypt.hash(senha, 10);
    const funcionario = await prisma.funcionario.create({
      data: { nome, email, telefone, cargo: cargo || 'recepcionista', senha: hash },
      select: { id: true, nome: true, email: true, telefone: true, cargo: true },
    });
    res.status(201).json(funcionario);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar funcionário' });
  }
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, cargo, senha } = req.body;

  try {
    const data = { nome, email, telefone, cargo };
    if (senha) data.senha = await bcrypt.hash(senha, 10);

    const funcionario = await prisma.funcionario.update({
      where: { id },
      data,
      select: { id: true, nome: true, email: true, telefone: true, cargo: true },
    });
    res.json(funcionario);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar funcionário' });
  }
};

const excluir = async (req, res) => {
  const { id } = req.params;
  // Não deletar a si mesmo
  if (req.user.id === id) return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });

  try {
    await prisma.funcionario.update({ where: { id }, data: { ativo: false } });
    res.json({ message: 'Funcionário desativado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir funcionário' });
  }
};

module.exports = { listar, criar, atualizar, excluir };

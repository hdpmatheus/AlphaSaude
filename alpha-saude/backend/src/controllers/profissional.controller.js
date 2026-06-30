const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listar = async (req, res) => {
  try {
    const profissionais = await prisma.profissional.findMany({
      where: { ativo: true },
      include: { diasAtendimento: { select: { diaSemana: true } } },
      orderBy: { nome: 'asc' },
    });
    // Formata diasAtendimento de volta para array de strings,
    // mantendo o mesmo formato que o frontend já espera
    const formatado = profissionais.map(p => ({
      ...p,
      diasAtendimento: p.diasAtendimento.map(d => d.diaSemana),
    }));
    res.json(formatado);
  } catch {
    res.status(500).json({ error: 'Erro ao listar profissionais' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const p = await prisma.profissional.findUnique({
      where: { id: Number(req.params.id) },
      include: { diasAtendimento: { select: { diaSemana: true } } },
    });
    if (!p) return res.status(404).json({ error: 'Profissional não encontrado' });
    res.json({ ...p, diasAtendimento: p.diasAtendimento.map(d => d.diaSemana) });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar profissional' });
  }
};

const criar = async (req, res) => {
  const { nome, especialidade, registro, telefone, email, diasAtendimento, horarioInicio, horarioFim } = req.body;
  if (!nome || !especialidade || !registro) return res.status(400).json({ error: 'Campos obrigatórios faltando' });

  try {
    // diasAtendimento (array) agora é criado como registros relacionados
    // na tabela dia_atendimento, em vez de coluna array do Postgres
    const p = await prisma.profissional.create({
      data: {
        nome, especialidade, registro, telefone, email,
        horarioInicio: horarioInicio || '08:00',
        horarioFim: horarioFim || '18:00',
        diasAtendimento: {
          create: (diasAtendimento || []).map(dia => ({ diaSemana: dia })),
        },
      },
      include: { diasAtendimento: true },
    });
    res.status(201).json(p);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Registro ou email já cadastrado' });
    res.status(500).json({ error: 'Erro ao criar profissional' });
  }
};

const atualizar = async (req, res) => {
  const { diasAtendimento, ...dadosBasicos } = req.body;
  const id = Number(req.params.id);

  try {
    // Se diasAtendimento foi enviado, substitui os registros relacionados
    // dentro de uma transação (delete + create) para manter consistência
    if (diasAtendimento) {
      await prisma.$transaction([
        prisma.diaAtendimento.deleteMany({ where: { profissionalId: id } }),
        prisma.diaAtendimento.createMany({
          data: diasAtendimento.map(dia => ({ profissionalId: id, diaSemana: dia })),
        }),
      ]);
    }

    const p = await prisma.profissional.update({
      where: { id },
      data: dadosBasicos,
      include: { diasAtendimento: true },
    });
    res.json(p);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar profissional' });
  }
};

const excluir = async (req, res) => {
  try {
    // sp_excluir_profissional remove os dias de atendimento e o
    // profissional numa única transação (ver alpha_saude_completo.sql)
    await prisma.profissional.update({ where: { id: Number(req.params.id) }, data: { ativo: false } });
    res.json({ message: 'Profissional desativado' });
  } catch {
    res.status(500).json({ error: 'Erro ao excluir profissional' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };

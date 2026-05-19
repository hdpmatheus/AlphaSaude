const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listar = async (req, res) => {
  const { data, profissionalId, status, periodo } = req.query;

  const where = {};
  if (profissionalId) where.profissionalId = profissionalId;
  if (status) where.status = status;

  if (periodo === 'hoje' || data) {
    const dia = data ? new Date(data) : new Date();
    dia.setHours(0, 0, 0, 0);
    const diaFim = new Date(dia);
    diaFim.setHours(23, 59, 59, 999);
    where.data = { gte: dia, lte: diaFim };
  } else if (periodo === 'semana') {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - hoje.getDay());
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + 6);
    fim.setHours(23, 59, 59, 999);
    where.data = { gte: inicio, lte: fim };
  } else if (periodo === 'mes') {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
    where.data = { gte: inicio, lte: fim };
  }

  try {
    const consultas = await prisma.consulta.findMany({
      where,
      include: {
        paciente: { select: { id: true, nome: true, telefone: true, email: true } },
        profissional: { select: { id: true, nome: true, especialidade: true } },
      },
      orderBy: [{ data: 'asc' }, { horario: 'asc' }],
    });
    res.json(consultas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar consultas' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const consulta = await prisma.consulta.findUnique({
      where: { id: req.params.id },
      include: {
        paciente: true,
        profissional: true,
        historico: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!consulta) return res.status(404).json({ error: 'Consulta não encontrada' });
    res.json(consulta);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar consulta' });
  }
};

const criar = async (req, res) => {
  const { pacienteId, profissionalId, data, horario, valor, observacoes } = req.body;
  if (!pacienteId || !profissionalId || !data || !horario) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  try {
    // Verificar conflito de horário
    const dataObj = new Date(data);
    dataObj.setHours(0, 0, 0, 0);
    const dataFim = new Date(dataObj);
    dataFim.setHours(23, 59, 59, 999);

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
      data: { pacienteId, profissionalId, data: new Date(data), horario, valor, observacoes },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { id: true, nome: true, especialidade: true } },
      },
    });
    res.status(201).json(consulta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar consulta' });
  }
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  const { status, statusPagamento, formaPagamento, valor, observacoes, data, horario, motivo } = req.body;

  try {
    const consultaAtual = await prisma.consulta.findUnique({ where: { id } });
    if (!consultaAtual) return res.status(404).json({ error: 'Consulta não encontrada' });

    const data_update = {};
    if (status) data_update.status = status;
    if (statusPagamento) data_update.statusPagamento = statusPagamento;
    if (formaPagamento) data_update.formaPagamento = formaPagamento;
    if (valor !== undefined) data_update.valor = valor;
    if (observacoes !== undefined) data_update.observacoes = observacoes;

    let tipoHistorico = null;
    if (status === 'cancelada' && consultaAtual.status !== 'cancelada') tipoHistorico = 'cancelamento';
    if (data || horario) {
      tipoHistorico = 'reagendamento';
      data_update.status = 'reagendada';
      if (data) data_update.data = new Date(data);
      if (horario) data_update.horario = horario;
    }

    const consulta = await prisma.consulta.update({ where: { id }, data: data_update });

    // Registrar histórico
    if (tipoHistorico) {
      await prisma.historico.create({
        data: {
          tipo: tipoHistorico,
          consultaId: id,
          pacienteId: consultaAtual.pacienteId,
          funcionarioId: req.user.tipo === 'funcionario' ? req.user.id : null,
          dataOriginal: consultaAtual.data,
          novaData: data ? new Date(data) : null,
          motivo: motivo || null,
        },
      });
    }

    res.json(consulta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar consulta' });
  }
};

const excluir = async (req, res) => {
  try {
    await prisma.consulta.delete({ where: { id: req.params.id } });
    res.json({ message: 'Consulta excluída' });
  } catch {
    res.status(500).json({ error: 'Erro ao excluir consulta' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };

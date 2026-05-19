const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getFaturamento = async (req, res) => {
  const { dataInicio, dataFim, profissionalId, status, periodo } = req.query;

  const where = {};
  if (profissionalId) where.profissionalId = profissionalId;
  if (status) where.statusPagamento = status;

  if (dataInicio && dataFim) {
    where.data = { gte: new Date(dataInicio), lte: new Date(dataFim + 'T23:59:59') };
  } else if (periodo === 'hoje') {
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const hojeF = new Date(hoje); hojeF.setHours(23,59,59,999);
    where.data = { gte: hoje, lte: hojeF };
  }

  try {
    const consultas = await prisma.consulta.findMany({
      where,
      include: {
        paciente: { select: { nome: true } },
        profissional: { select: { nome: true } },
      },
      orderBy: [{ data: 'desc' }, { horario: 'asc' }],
    });

    const totalRecebido = consultas
      .filter(c => c.statusPagamento === 'pago')
      .reduce((s, c) => s + Number(c.valor || 0), 0);

    const totalPendente = consultas
      .filter(c => c.statusPagamento === 'pendente')
      .reduce((s, c) => s + Number(c.valor || 0), 0);

    const consultasPagas = consultas.filter(c => c.statusPagamento === 'pago').length;
    const naopagas = consultas.filter(c => c.statusPagamento === 'pendente').length;

    res.json({ consultas, totalRecebido, totalPendente, consultasPagas, naopagas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar faturamento' });
  }
};

module.exports = { getFaturamento };

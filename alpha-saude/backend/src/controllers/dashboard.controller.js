const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboard = async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeF = new Date(hoje);
    hojeF.setHours(23, 59, 59, 999);

    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);

    const [
      consultasHoje,
      confirmadas,
      canceladas,
      horariosDisponiveis,
      proximasConsultas,
      consultasPorDia,
    ] = await Promise.all([
      prisma.consulta.count({ where: { data: { gte: hoje, lte: hojeF } } }),
      prisma.consulta.count({ where: { data: { gte: hoje, lte: hojeF }, status: 'confirmada' } }),
      prisma.consulta.count({ where: { data: { gte: hoje, lte: hojeF }, status: 'cancelada' } }),
      prisma.consulta.count({ where: { data: { gte: hoje, lte: hojeF }, status: { in: ['pendente', 'confirmada'] } } }).then(ocupados => Math.max(0, 24 - ocupados)),
      prisma.consulta.findMany({
        where: { data: { gte: hoje, lte: hojeF }, status: { in: ['confirmada', 'pendente'] } },
        include: { paciente: { select: { nome: true } }, profissional: { select: { nome: true, especialidade: true } } },
        orderBy: { horario: 'asc' },
        take: 5,
      }),
      // Consultas por dia da semana
      prisma.consulta.groupBy({
        by: ['data'],
        where: { data: { gte: inicioSemana, lte: fimSemana } },
        _count: true,
      }),
    ]);

    // Formatar por dia da semana
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const porDia = diasSemana.map((nome, i) => {
      const dia = consultasPorDia.find(c => new Date(c.data).getDay() === i);
      return { dia: nome, total: dia?._count ?? 0 };
    });

    res.json({ consultasHoje, confirmadas, canceladas, horariosDisponiveis, proximasConsultas, consultasPorDia: porDia });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
};

module.exports = { getDashboard };

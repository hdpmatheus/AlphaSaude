const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/*
 * MAPEAMENTO PRISMA -> SQL (para apresentação do trabalho de BD II)
 * ------------------------------------------------------------------
 * prisma.consulta.findMany()      -> SELECT ... FROM consulta
 * prisma.consulta.findUnique()    -> SELECT ... FROM consulta WHERE id_consulta = ?
 * prisma.consulta.findFirst()     -> SELECT ... FROM consulta WHERE ... LIMIT 1
 * prisma.consulta.update()        -> UPDATE consulta SET ... WHERE id_consulta = ?
 * prisma.consulta.delete()        -> DELETE FROM consulta WHERE id_consulta = ?
 * prisma.$queryRaw / $executeRaw  -> SQL explícito (usado para SPs e transações)
 */

// ------------------------------------------------------------------
// LISTAR — usa a stored procedure sp_listar_consultas (contém JOIN)
// ------------------------------------------------------------------
const listar = async (req, res) => {
  const { data, profissionalId, status, periodo } = req.query;

  const where = {};
  if (profissionalId) where.profissionalId = Number(profissionalId);
  if (status) where.status = status;

  if (data) {
    where.data = new Date(data);
  } else if (periodo === "hoje") {
    where.data = new Date(new Date().toISOString().slice(0, 10));
  }

  try {
    const consultas = await prisma.consulta.findMany({
      where,
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { id: true, nome: true, especialidade: true } },
      },
      orderBy: [{ data: "asc" }],
    });

    const formatado = consultas.map(c => ({
      id: c.id,
      data: c.data,
      horario: c.horario.toISOString().slice(11, 16),
      status: c.status,
      statusPagamento: c.statusPagamento,
      valor: c.valor,
      paciente: { nome: c.paciente.nome },
      profissional: { nome: c.profissional.nome, especialidade: c.profissional.especialidade },
    }));

    res.json(formatado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar consultas" });
  }
};
const buscarPorId = async (req, res) => {
  try {
    const consulta = await prisma.consulta.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        paciente: true,
        profissional: true,
        historico: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!consulta) return res.status(404).json({ error: "Consulta não encontrada" });
    res.json(consulta);
  } catch {
    res.status(500).json({ error: "Erro ao buscar consulta" });
  }
};

// ------------------------------------------------------------------
// CRIAR (agendar) — transação explícita via $transaction + $executeRaw
// Verifica conflito de horário e insere a consulta numa única transação,
// usando a stored procedure sp_agendar_consulta
// ------------------------------------------------------------------
const criar = async (req, res) => {
  const { pacienteId, profissionalId, data, horario, valor, observacoes, formaPagamento } = req.body;
  if (!pacienteId || !profissionalId || !data || !horario) {
    return res.status(400).json({ error: "Campos obrigatórios faltando" });
  }

  try {
    const horarioDate = new Date(`1970-01-01T${horario}:00`);

    const conflito = await prisma.consulta.findFirst({
      where: {
        profissionalId: Number(profissionalId),
        horario: horarioDate,
        data: new Date(data),
        status: { in: ["confirmada", "pendente"] },
      },
    });
    if (conflito) return res.status(409).json({ error: "Horário já ocupado para este profissional" });

    // Transação explícita: a própria stored procedure faz START TRANSACTION /
    // COMMIT / ROLLBACK no MySQL; aqui chamamos ela via $executeRaw.
    await prisma.$executeRaw`
      CALL sp_agendar_consulta(${Number(pacienteId)}, ${Number(profissionalId)}, ${data}, ${horario}, ${valor ? Number(valor) : null}, ${formaPagamento || null}, ${observacoes || null})
    `;

    const consulta = await prisma.consulta.findFirst({
      where: { pacienteId: Number(pacienteId), profissionalId: Number(profissionalId), horario: horarioDate, data: new Date(data) },
      orderBy: { id: "desc" },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { id: true, nome: true, especialidade: true } },
      },
    });

    res.status(201).json(consulta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar consulta" });
  }
};

// ------------------------------------------------------------------
// ATUALIZAR — cancelamento e reagendamento chamam stored procedures
// com transação (UPDATE + INSERT no histórico). Mudanças simples de
// status/pagamento continuam usando o Prisma normalmente.
// ------------------------------------------------------------------
const atualizar = async (req, res) => {
  const { id } = req.params;
  const { status, statusPagamento, formaPagamento, valor, observacoes, data, horario, motivo } = req.body;
  const idConsulta = Number(id);
  const idFuncionario = req.user?.tipo === "funcionario" ? Number(req.user.id) : null;

  try {
    const consultaAtual = await prisma.consulta.findUnique({ where: { id: idConsulta } });
    if (!consultaAtual) return res.status(404).json({ error: "Consulta não encontrada" });

    // Cancelamento -> stored procedure sp_cancelar_consulta (transação)
    if (status === "cancelada" && consultaAtual.status !== "cancelada") {
      await prisma.$executeRaw`
        CALL sp_cancelar_consulta(${idConsulta}, ${idFuncionario}, ${motivo || null})
      `;
      const atualizada = await prisma.consulta.findUnique({ where: { id: idConsulta } });
      return res.json(atualizada);
    }

    // Reagendamento -> stored procedure sp_reagendar_consulta (transação)
    if (data || horario) {
      const novaData = data || consultaAtual.data;
      const novoHorario = horario || consultaAtual.horario;

      console.log('REAGENDANDO PARA:', { novaData, novoHorario });

      await prisma.$executeRaw`
        CALL sp_reagendar_consulta(${idConsulta}, ${idFuncionario}, ${novaData}, ${novoHorario}, ${motivo || null})
      `;
      const atualizada = await prisma.consulta.findUnique({ where: { id: idConsulta } });
      return res.json(atualizada);
    }

    // Demais atualizações (status simples, pagamento, observações) -> Prisma normal
    const data_update = {};
    if (status) data_update.status = status;
    if (statusPagamento) data_update.statusPagamento = statusPagamento;
    if (formaPagamento !== undefined) data_update.formaPagamento = formaPagamento;
    if (valor !== undefined) data_update.valor = valor ? Number(valor) : null;
    if (observacoes !== undefined) data_update.observacoes = observacoes;

    const consulta = await prisma.consulta.update({ where: { id: idConsulta }, data: data_update });
    res.json(consulta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar consulta" });
  }
};

const excluir = async (req, res) => {
  try {
    await prisma.consulta.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Consulta excluída" });
  } catch {
    res.status(500).json({ error: "Erro ao excluir consulta" });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };

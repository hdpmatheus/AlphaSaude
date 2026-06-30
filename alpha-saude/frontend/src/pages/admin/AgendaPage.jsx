import { useState, useEffect } from "react";
import { Filter, CheckCircle, XCircle, Plus, Pencil, X } from "lucide-react";
import api from "../../services/api";

const statusConfig = {
  confirmada: { label: "Confirmada", bg: "bg-green-50 text-green-600" },
  pendente: { label: "Pendente", bg: "bg-yellow-50 text-yellow-600" },
  cancelada: { label: "Cancelada", bg: "bg-red-50 text-red-500" },
  reagendada: { label: "Reagendada", bg: "bg-orange-50 text-orange-600" },
  realizada: { label: "Realizada", bg: "bg-gray-100 text-gray-600" },
};

const pagamentoConfig = {
  pago: { label: "Pago", bg: "bg-green-50 text-green-600" },
  pendente: { label: "Pendente", bg: "bg-yellow-50 text-yellow-600" },
};

const emptyForm = {
  pacienteId: "",
  profissionalId: "",
  data: "",
  horario: "",
  valor: "",
  observacoes: "",
  formaPagamento: "",
};

export default function AgendaPage() {
  const [consultas, setConsultas] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [periodo, setPeriodo] = useState("hoje");
  const [showForm, setShowForm] = useState(false);
  const [loadingConsultas, setLoadingConsultas] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});

  const carregar = () => {
    setLoadingConsultas(true);
    const params = { periodo };
    if (filtro) params.profissionalId = filtro;
    api
      .get("/api/consultas", { params })
      .then((r) => setConsultas(r.data))
      .finally(() => setLoadingConsultas(false));
  };

  useEffect(() => {
    api.get("/api/profissionais").then((r) => setProfissionais(r.data));
    api.get("/api/pacientes").then((r) => setPacientes(r.data));
  }, []);

  useEffect(() => {
    carregar();
  }, [filtro, periodo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/consultas", {
        ...form,
        valor: form.valor ? Number(form.valor) : null,
        formaPagamento: form.formaPagamento || null,
        statusPagamento: "pendente",
      });
      setShowForm(false);
      setForm(emptyForm);
      carregar();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao agendar consulta");
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (id, status, motivo) => {
    await api.put(`/api/consultas/${id}`, { status, motivo });
    carregar();
  };

  // Inclui data/horário atuais no formulário de edição, guardando também
  // os valores originais para detectar se houve reagendamento ao salvar
  const abrirEdicao = (c) => {
    setEditando(c.id);
    setEditForm({
      status: c.status,
      statusPagamento: c.statusPagamento,
      formaPagamento: c.formaPagamento || "",
      valor: c.valor ? Number(c.valor) : "",
      observacoes: c.observacoes || "",
      data: new Date(c.data).toISOString().split("T")[0],
      horario: c.horario,
      dataOriginal: new Date(c.data).toISOString().split("T")[0],
      horarioOriginal: c.horario,
    });
  };

  // Se data ou horário mudaram, manda também data/horario/motivo —
  // o backend detecta isso e chama sp_reagendar_consulta (com transação)
  const salvarEdicao = async () => {
    setLoading(true);
    try {
      const houveReagendamento =
        editForm.data !== editForm.dataOriginal ||
        editForm.horario !== editForm.horarioOriginal;

      const payload = {
        status: editForm.status,
        statusPagamento: editForm.statusPagamento,
        formaPagamento: editForm.formaPagamento,
        valor: editForm.valor ? Number(editForm.valor) : null,
        observacoes: editForm.observacoes,
      };

      if (houveReagendamento) {
        const motivo = prompt("Motivo do reagendamento:") || "";
        payload.data = editForm.data;
        payload.horario = editForm.horario;
        payload.motivo = motivo;
      }

      await api.put(`/api/consultas/${editando}`, payload);
      setEditando(null);
      carregar();
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const horariosDisponiveis = () => {
    const horarios = [];
    for (let h = 7; h <= 20; h++) {
      horarios.push(`${String(h).padStart(2, "0")}:00`);
      horarios.push(`${String(h).padStart(2, "0")}:30`);
    }
    return horarios;
  };

  const formasPagamento = [
    { value: "pix", label: "Pix" },
    { value: "dinheiro", label: "Dinheiro" },
    { value: "cartao_credito", label: "Cartão de Crédito" },
    { value: "cartao_debito", label: "Cartão de Débito" },
    { value: "convenio", label: "Convênio" },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Agenda do Consultório
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie todas as consultas agendadas
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setForm(emptyForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition"
        >
          <Plus size={16} />
          Nova Consulta
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <h2 className="font-semibold text-gray-800 mb-4">Novo Agendamento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Paciente</label>
                <select
                  value={form.pacienteId}
                  onChange={(e) => setForm((p) => ({ ...p, pacienteId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione o paciente</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Profissional</label>
                <select
                  value={form.profissionalId}
                  onChange={(e) => setForm((p) => ({ ...p, profissionalId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione o profissional</option>
                  {profissionais.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} — {p.especialidade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Data</label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Horário</label>
                <select
                  value={form.horario}
                  onChange={(e) => setForm((p) => ({ ...p, horario: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione</option>
                  {horariosDisponiveis().map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Forma de Pagamento</label>
                <select
                  value={form.formaPagamento}
                  onChange={(e) => setForm((p) => ({ ...p, formaPagamento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione</option>
                  {formasPagamento.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Observações</label>
                <input
                  value={form.observacoes}
                  onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition disabled:opacity-60"
              >
                {loading ? "Agendando..." : "Confirmar Agendamento"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">Editar Consulta</h2>
              <button onClick={() => setEditando(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Data</label>
                  <input
                    type="date"
                    value={editForm.data}
                    onChange={(e) => setEditForm((p) => ({ ...p, data: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Horário</label>
                  <select
                    value={editForm.horario}
                    onChange={(e) => setEditForm((p) => ({ ...p, horario: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {horariosDisponiveis().map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Status da Consulta</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="reagendada">Reagendada</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Status Pagamento</label>
                  <select
                    value={editForm.statusPagamento}
                    onChange={(e) => setEditForm((p) => ({ ...p, statusPagamento: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.valor}
                    onChange={(e) => setEditForm((p) => ({ ...p, valor: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Forma de Pagamento</label>
                  <select
                    value={editForm.formaPagamento}
                    onChange={(e) => setEditForm((p) => ({ ...p, formaPagamento: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecione</option>
                    {formasPagamento.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Observações</label>
                <textarea
                  value={editForm.observacoes}
                  onChange={(e) => setEditForm((p) => ({ ...p, observacoes: e.target.value }))}
                  rows={2}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditando(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                onClick={salvarEdicao}
                disabled={loading}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition disabled:opacity-60"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          {["hoje", "semana", "mes", "todos"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                periodo === p ? "bg-primary-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p === "hoje" ? "Dia" : p === "semana" ? "Semana" : p === "mes" ? "Mês" : "Todas"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos os profissionais</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {loadingConsultas && (
          <p className="text-gray-400 text-sm text-center py-8">Carregando...</p>
        )}
        {!loadingConsultas && consultas.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Nenhuma consulta encontrada</p>
            <p className="text-sm mt-1">Clique em "Nova Consulta" para agendar</p>
          </div>
        )}
        {consultas.map((c) => {
          const sc = statusConfig[c.status] || statusConfig.pendente;
          const pc = pagamentoConfig[c.statusPagamento] || pagamentoConfig.pendente;
          const rowBorder = c.status === "cancelada" ? "border-red-200" : c.status === "reagendada" ? "border-orange-200" : "border-gray-100";

          return (
            <div key={c.id} className={`bg-white rounded-xl border ${rowBorder} px-5 py-4 flex items-center gap-4`}>
              <div className="w-40 shrink-0">
                <p className="text-xs text-gray-400">Paciente</p>
                <p className="font-medium text-gray-800 text-sm">{c.paciente?.nome}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400">Profissional</p>
                <p className="font-medium text-gray-800 text-sm">{c.profissional?.nome}</p>
                <p className="text-xs text-gray-500">{c.profissional?.especialidade}</p>
              </div>
              <div className="w-28">
                <p className="text-sm text-gray-700">
                {new Date(c.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                </p>
              </div>
              <div className="w-16">
                <p className="text-xs text-gray-400">Horário</p>
                <p className="text-sm font-medium text-gray-700">{c.horario}</p>
              </div>
              <div className="w-24">
                <p className="text-xs text-gray-400">Valor</p>
                <p className="text-sm font-medium text-gray-700">{c.valor ? `R$ ${Number(c.valor).toFixed(2)}` : "—"}</p>
              </div>
              <div className="w-24 shrink-0">
                <p className="text-xs text-gray-400">Forma Pgto</p>
                <p className="text-xs text-gray-600 capitalize">
                  {{ pix: "Pix", dinheiro: "Dinheiro", cartao_credito: "Cartão de Crédito", cartao_debito: "Cartão de Débito", convenio: "Convênio" }[c.formaPagamento] || "—"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pc.bg}`}>{pc.label}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg}`}>{sc.label}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button title="Editar" onClick={() => abrirEdicao(c)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition">
                  <Pencil size={15} />
                </button>
                {!["cancelada", "realizada"].includes(c.status) && (
                  <>
                    {c.status !== "confirmada" && (
                      <button title="Confirmar" onClick={() => atualizarStatus(c.id, "confirmada")} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition">
                        <CheckCircle size={15} />
                      </button>
                    )}
                    <button
                      title="Cancelar"
                      onClick={() => {
                        const motivo = prompt("Motivo do cancelamento:");
                        if (motivo !== null) atualizarStatus(c.id, "cancelada", motivo);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <XCircle size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
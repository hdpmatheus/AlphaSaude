import { useState, useEffect } from "react";
import api from "../../services/api";

export default function FaturamentoPage() {
  const [consultas, setConsultas] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    profissionalId: "",
    status: "",
  });

  const carregar = () => {
    const params = {};
    if (filtros.dataInicio) params.dataInicio = filtros.dataInicio;
    if (filtros.dataFim) params.dataFim = filtros.dataFim;
    if (filtros.profissionalId) params.profissionalId = filtros.profissionalId;
    if (filtros.status) params.status = filtros.status;
    api
      .get("/api/faturamento", { params })
      .then((r) => setConsultas(r.data.consultas || []));
  };

  useEffect(() => {
    api.get("/api/profissionais").then((r) => setProfissionais(r.data));
  }, []);
  useEffect(() => {
    carregar();
  }, []);

  // Apenas consultas pagas
  const pagas = consultas.filter((c) => c.statusPagamento === "pago");

  // Particular = pago e forma de pagamento diferente de convênio
  const particular = pagas.filter((c) => c.formaPagamento !== "convenio");
  const convenio = pagas.filter((c) => c.formaPagamento === "convenio");
  const pendentes = consultas.filter((c) => c.statusPagamento === "pendente");

  const totalGeral = pagas.reduce((s, c) => s + Number(c.valor || 0), 0);
  const totalParticular = particular.reduce(
    (s, c) => s + Number(c.valor || 0),
    0,
  );
  const totalConvenio = convenio.reduce((s, c) => s + Number(c.valor || 0), 0);
  const totalPendente = pendentes.reduce((s, c) => s + Number(c.valor || 0), 0);

  const pagBadge = {
    pago: "bg-green-50 text-green-600",
    pendente: "bg-yellow-50 text-yellow-600",
  };
  const pagLabel = { pago: "Pago", pendente: "Pendente" };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Faturamento e Relatórios
      </h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">
        Visualize e exporte relatórios financeiros detalhados
      </p>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) =>
                setFiltros((p) => ({ ...p, dataInicio: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Data Fim</label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) =>
                setFiltros((p) => ({ ...p, dataFim: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Profissional
            </label>
            <select
              value={filtros.profissionalId}
              onChange={(e) =>
                setFiltros((p) => ({ ...p, profissionalId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Todos</option>
              {profissionais.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Status Pagamento
            </label>
            <select
              value={filtros.status}
              onChange={(e) =>
                setFiltros((p) => ({ ...p, status: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Todos</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>
        </div>
        <button
          onClick={carregar}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition"
        >
          Filtrar
        </button>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-xs text-gray-500">Total Recebido</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            R$ {totalGeral.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {pagas.length} consultas pagas
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-green-100">
          <p className="text-xs text-gray-500">Total Particular</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            R$ {totalParticular.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {particular.length} consultas
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-blue-100">
          <p className="text-xs text-gray-500">Total Convênio</p>
          <p className="text-xl font-bold text-blue-600 mt-1">
            R$ {totalConvenio.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {convenio.length} consultas
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-yellow-100">
          <p className="text-xs text-gray-500">Total Pendente</p>
          <p className="text-xl font-bold text-yellow-600 mt-1">
            R$ {totalPendente.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {pendentes.length} consultas
          </p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[
                "Data",
                "Paciente",
                "Profissional",
                "Forma de Pagamento",
                "Status",
                "Valor",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-medium text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {consultas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
            {consultas.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
              >
                <td className="px-5 py-3 text-gray-500">
                  {new Date(c.data).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-5 py-3 font-medium">{c.paciente?.nome}</td>
                <td className="px-5 py-3 text-gray-500">
                  {c.profissional?.nome}
                </td>
                <td className="px-5 py-3 text-gray-500 capitalize">
                  {{
                    pix: "Pix",
                    dinheiro: "Dinheiro",
                    cartao_credito: "Cartão de Crédito",
                    cartao_debito: "Cartão de Débito",
                    convenio: "Convênio",
                  }[c.formaPagamento] || "—"}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${pagBadge[c.statusPagamento] || ""}`}
                  >
                    {pagLabel[c.statusPagamento] || c.statusPagamento}
                  </span>
                </td>
                <td className="px-5 py-3 font-semibold text-right">
                  R$ {Number(c.valor || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td
                colSpan={5}
                className="px-5 py-3 text-right text-sm font-semibold text-gray-700"
              >
                Total do Período:
              </td>
              <td className="px-5 py-3 text-right font-bold text-primary-600">
                R$ {totalGeral.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

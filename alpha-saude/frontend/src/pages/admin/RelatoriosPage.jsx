// RelatoriosPage.jsx
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';

export default function RelatoriosPage() {
  const [filtros, setFiltros] = useState({ dataInicio: '', dataFim: '', profissionalId: '' });
  const [profissionais, setProfissionais] = useState([]);
  const [dados, setDados] = useState(null);

  useEffect(() => { api.get('/api/profissionais').then(r => setProfissionais(r.data)); }, []);
  useEffect(() => { carregar(); }, []);

  const carregar = () => {
    const params = {};
    if (filtros.dataInicio) params.dataInicio = filtros.dataInicio;
    if (filtros.dataFim) params.dataFim = filtros.dataFim;
    if (filtros.profissionalId) params.profissionalId = filtros.profissionalId;
    api.get('/api/consultas', { params }).then(r => {
      const consultas = r.data;
      const porProfissional = {};
      consultas.forEach(c => {
        const nome = c.profissional?.nome || 'Desconhecido';
        porProfissional[nome] = (porProfissional[nome] || 0) + 1;
      });

      const statusCount = { realizadas: 0, canceladas: 0, reagendadas: 0 };
      consultas.forEach(c => {
        if (c.status === 'realizada') statusCount.realizadas++;
        else if (c.status === 'cancelada') statusCount.canceladas++;
        else if (c.status === 'reagendada') statusCount.reagendadas++;
      });

      const pacientes = new Set(consultas.map(c => c.pacienteId)).size;
      const taxa = consultas.length > 0 ? Math.round((statusCount.realizadas / consultas.length) * 100) : 0;
      const taxaCancelamento = consultas.length > 0 ? Math.round((statusCount.canceladas / consultas.length) * 100) : 0;

      setDados({
        total: consultas.length,
        taxaRealizacao: taxa,
        pacientes,
        taxaCancelamento,
        porProfissional: Object.entries(porProfissional).map(([nome, total]) => ({ nome, total })),
        statusPie: [
          { name: 'Realizadas', value: statusCount.realizadas, color: '#1a9494' },
          { name: 'Canceladas', value: statusCount.canceladas, color: '#ef4444' },
          { name: 'Reagendadas', value: statusCount.reagendadas, color: '#f59e0b' },
        ],
      });
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Análise e estatísticas do consultório</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
        <p className="text-sm font-medium text-gray-700 mb-3">Filtros</p>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="text-xs text-gray-500 block mb-1">Data de início</label>
            <input type="date" value={filtros.dataInicio} onChange={e=>setFiltros(p=>({...p,dataInicio:e.target.value}))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="text-xs text-gray-500 block mb-1">Data de término</label>
            <input type="date" value={filtros.dataFim} onChange={e=>setFiltros(p=>({...p,dataFim:e.target.value}))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="text-xs text-gray-500 block mb-1">Profissional</label>
            <select value={filtros.profissionalId} onChange={e=>setFiltros(p=>({...p,profissionalId:e.target.value}))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Todos</option>
              {profissionais.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}
            </select></div>
        </div>
        <button onClick={carregar} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Gerar Relatório</button>
      </div>

      {dados && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total de Consultas', value: dados.total, sub: 'Este mês', color: 'bg-blue-50 text-blue-600' },
              { label: 'Taxa de Realização', value: `${dados.taxaRealizacao}%`, sub: 'Consultas efetivadas', color: 'bg-green-50 text-green-600' },
              { label: 'Pacientes Atendidos', value: dados.pacientes, sub: 'Únicos no período', color: 'bg-purple-50 text-purple-600' },
              { label: 'Taxa de Cancelamento', value: `${dados.taxaCancelamento}%`, sub: 'Abaixo da média', color: 'bg-yellow-50 text-yellow-600' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-4">Consultas por Profissional</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dados.porProfissional}>
                  <XAxis dataKey="nome" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#1a9494" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-4">Status das Consultas</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={dados.statusPie} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                    {dados.statusPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

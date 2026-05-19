import { useState, useEffect } from 'react';
import { Filter, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';

export default function AgendaFinanceiraPage() {
  const [consultas, setConsultas] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [periodo, setPeriodo] = useState('hoje');
  const [totais, setTotais] = useState({ recebido: 0, pendente: 0, pagas: 0, nao_pagas: 0 });

  const carregar = () => {
    const params = { periodo };
    if (filtro) params.profissionalId = filtro;
    api.get('/api/consultas', { params }).then(r => {
      setConsultas(r.data);
      const recebido = r.data
        .filter(c => c.statusPagamento === 'pago')
        .reduce((s, c) => s + Number(c.valor || 0), 0);
      const pendente = r.data
        .filter(c => c.statusPagamento === 'pendente')
        .reduce((s, c) => s + Number(c.valor || 0), 0);
      setTotais({
        recebido,
        pendente,
        pagas: r.data.filter(c => c.statusPagamento === 'pago').length,
        nao_pagas: r.data.filter(c => c.statusPagamento === 'pendente').length,
      });
    });
  };

  useEffect(() => { api.get('/api/profissionais').then(r => setProfissionais(r.data)); }, []);
  useEffect(() => { carregar(); }, [filtro, periodo]);

  const marcarPago = async (id) => {
    await api.put(`/api/consultas/${id}`, { statusPagamento: 'pago' });
    carregar();
  };

  const pagBadge = {
    pago:     'bg-green-50 text-green-600',
    pendente: 'bg-yellow-50 text-yellow-600',
    convenio: 'bg-blue-50 text-blue-600',
  };

  const statusBadge = {
    confirmada: 'bg-green-50 text-green-600',
    pendente:   'bg-yellow-50 text-yellow-600',
    cancelada:  'bg-red-50 text-red-500',
    realizada:  'bg-gray-100 text-gray-600',
    reagendada: 'bg-orange-50 text-orange-600',
  };

  const pagLabel = { pago: 'Pago', pendente: 'Pendente', convenio: 'Convênio' };
  const statusLabel = { confirmada: 'Confirmada', pendente: 'Pendente', cancelada: 'Cancelada', realizada: 'Realizada', reagendada: 'Reagendada' };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Agenda Financeira</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Visualize consultas e gerencie pagamentos</p>

      {/* Totais */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Recebido (Hoje)', value: `R$ ${totais.recebido.toFixed(2)}`, icon: CheckCircle, color: 'bg-green-50 text-green-600', border: 'border-gray-100' },
          { label: 'Total Pendente',        value: `R$ ${totais.pendente.toFixed(2)}`, icon: Clock,        color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-200' },
          { label: 'Consultas Pagas',       value: totais.pagas,                       icon: DollarSign,   color: 'bg-primary-50 text-primary-600', border: 'border-gray-100' },
          { label: 'Não Pagas',             value: totais.nao_pagas,                   icon: XCircle,      color: 'bg-red-50 text-red-500', border: 'border-red-100' },
        ].map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white rounded-2xl p-5 border ${border} flex items-center justify-between`}>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {['hoje', 'semana', 'mes'].map(p => (
            <button key={p} onClick={() => setPeriodo(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                periodo === p ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {p === 'hoje' ? 'Dia' : p === 'semana' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select value={filtro} onChange={e => setFiltro(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Todos os profissionais</option>
            {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {consultas.length === 0 && (
          <p className="text-center text-gray-400 py-8">Nenhuma consulta encontrada</p>
        )}
        {consultas.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4">
            <div className="w-36 shrink-0">
              <p className="text-xs text-gray-400">Paciente</p>
              <p className="font-medium text-sm text-gray-800">{c.paciente?.nome}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Profissional</p>
              <p className="font-medium text-sm text-gray-800">{c.profissional?.nome}</p>
            </div>
            <div className="w-20">
              <p className="text-xs text-gray-400">Horário</p>
              <p className="text-sm text-gray-700">{c.horario}</p>
            </div>
            <div className="w-28">
              <p className="text-xs text-gray-400">Forma Pgto</p>
              <p className="text-sm text-gray-700 capitalize">{c.formaPagamento?.replace('_', ' ') || '—'}</p>
            </div>
            <div className="w-28">
              <p className="text-xs text-gray-400">Valor</p>
              <p className="text-sm font-semibold text-gray-800">
                R$ {Number(c.valor || 0).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[c.status] || ''}`}>
                {statusLabel[c.status] || c.status}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pagBadge[c.statusPagamento] || ''}`}>
                {pagLabel[c.statusPagamento] || c.statusPagamento}
              </span>
            </div>
            {c.statusPagamento === 'pendente' && c.status !== 'cancelada' && (
              <button
                onClick={() => marcarPago(c.id)}
                className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shrink-0"
              >
                Marcar Pago
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
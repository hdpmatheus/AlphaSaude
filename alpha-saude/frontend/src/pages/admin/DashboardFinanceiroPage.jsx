import { useState, useEffect } from 'react';
import { DollarSign, Clock, CreditCard, XCircle } from 'lucide-react';
import api from '../../services/api';

export default function DashboardFinanceiroPage() {
  const [periodo, setPeriodo] = useState('hoje');
  const [consultas, setConsultas] = useState([]);

  useEffect(() => {
    api.get('/api/faturamento', { params: { periodo } })
      .then(r => setConsultas(r.data.consultas || []));
  }, [periodo]);

  const pagas      = consultas.filter(c => c.statusPagamento === 'pago');
  const particular = pagas.filter(c => c.formaPagamento !== 'convenio');
  const convenio   = pagas.filter(c => c.formaPagamento === 'convenio');
  const pendentes  = consultas.filter(c => c.statusPagamento === 'pendente');

  const totalRecebido   = pagas.reduce((s, c) => s + Number(c.valor || 0), 0);
  const totalParticular = particular.reduce((s, c) => s + Number(c.valor || 0), 0);
  const totalConvenio   = convenio.reduce((s, c) => s + Number(c.valor || 0), 0);
  const totalPendente   = pendentes.reduce((s, c) => s + Number(c.valor || 0), 0);

  const meta = 25000;
  const pct = Math.min(100, Math.round((totalRecebido / meta) * 100));
  const circum = 2 * Math.PI * 45;

  // Receita por dia da semana (mockado com dados reais quando disponível)
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const receitaPorDia = diasSemana.map(dia => {
    const total = pagas
      .filter(c => {
        const d = new Date(c.data).getDay();
        const map = { 'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sáb': 6 };
        return d === map[dia];
      })
      .reduce((s, c) => s + Number(c.valor || 0), 0);
    return { dia, valor: total };
  });

  const maxValor = Math.max(...receitaPorDia.map(d => d.valor), 1);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
      <p className="text-gray-500 text-sm mt-1 mb-5">Acompanhe o desempenho financeiro do consultório</p>

      <div className="flex gap-2 mb-6">
        {['hoje', 'semana', 'mes'].map(p => (
          <button key={p} onClick={() => setPeriodo(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              periodo === p ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {p === 'hoje' ? 'Hoje' : p === 'semana' ? 'Esta Semana' : 'Este Mês'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Recebido', value: `R$ ${totalRecebido.toFixed(2)}`, icon: DollarSign, bg: 'bg-green-50 text-green-600', border: 'border-gray-100' },
          { label: 'Total Particular', value: `R$ ${totalParticular.toFixed(2)}`, icon: CreditCard, bg: 'bg-primary-50 text-primary-600', border: 'border-gray-100' },
          { label: 'Total Convênio', value: `R$ ${totalConvenio.toFixed(2)}`, icon: CreditCard, bg: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
          { label: 'Total Pendente', value: `R$ ${totalPendente.toFixed(2)}`, icon: Clock, bg: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-200' },
        ].map(({ label, value, icon: Icon, bg, border }) => (
          <div key={label} className={`bg-white rounded-2xl p-5 border ${border} flex items-center justify-between`}>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Receita semanal */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Receita Semanal</h2>
          <div className="space-y-2">
            {receitaPorDia.map(({ dia, valor }) => (
              <div key={dia} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-8">{dia}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div className="bg-primary-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${(valor / maxValor) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-24 text-right">
                  R$ {valor.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Meta mensal */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Meta Mensal</h2>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1a9494" strokeWidth="8"
                  strokeDasharray={circum}
                  strokeDashoffset={circum - (pct / 100) * circum}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{pct}%</span>
                <span className="text-xs text-gray-500">da meta</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Recebido:</span>
              <span className="font-semibold text-primary-600">R$ {totalRecebido.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Meta:</span>
              <span className="font-semibold">R$ {meta.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Falta:</span>
              <span className="font-semibold text-yellow-600">
                R$ {Math.max(0, meta - totalRecebido).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas transações */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 mt-6">
        <h2 className="font-semibold text-gray-800 mb-4">Últimas Transações</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="pb-2 text-left">Data</th>
              <th className="pb-2 text-left">Paciente</th>
              <th className="pb-2 text-left">Profissional</th>
              <th className="pb-2 text-left">Pagamento</th>
              <th className="pb-2 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {pagas.slice(0, 5).map(c => (
              <tr key={c.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 text-gray-500">{new Date(c.data).toLocaleDateString('pt-BR')}</td>
                <td className="py-2.5">{c.paciente?.nome}</td>
                <td className="py-2.5 text-gray-500">{c.profissional?.nome}</td>
                <td className="py-2.5 text-gray-500 capitalize">
                  {c.formaPagamento?.replace('_', ' ') || '—'}
                </td>
                <td className="py-2.5 text-right text-green-600 font-medium">
                  + R$ {Number(c.valor || 0).toFixed(2)}
                </td>
              </tr>
            ))}
            {pagas.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">Nenhuma transação encontrada</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
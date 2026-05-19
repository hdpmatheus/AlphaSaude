import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Clock, CreditCard, XCircle } from 'lucide-react';
import api from '../../services/api';

export default function DashboardFinanceiroPage() {
  const [periodo, setPeriodo] = useState('hoje');
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/api/faturamento', { params: { periodo } }).then(r => setData(r.data));
  }, [periodo]);

  const semanaData = [
    { dia: 'Seg', valor: 1200 }, { dia: 'Ter', valor: 1800 }, { dia: 'Qua', valor: 2400 },
    { dia: 'Qui', valor: 1600 }, { dia: 'Sex', valor: 2800 }, { dia: 'Sáb', valor: 900 },
  ];

  const recebido = data?.totalRecebido || 0;
  const meta = 25000;
  const pct = Math.min(100, Math.round((recebido / meta) * 100));
  const circum = 2 * Math.PI * 45;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
      <p className="text-gray-500 text-sm mt-1 mb-5">Acompanhe o desempenho financeiro do consultório</p>

      <div className="flex gap-2 mb-6">
        {['hoje', 'semana', 'mes'].map(p => (
          <button key={p} onClick={() => setPeriodo(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${periodo === p ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {p === 'hoje' ? 'Hoje' : p === 'semana' ? 'Esta Semana' : 'Este Mês'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Recebido (Hoje)', value: `R$ ${recebido.toFixed(2)}`, icon: DollarSign, bg: 'bg-green-50 text-green-600', border: 'border-gray-100' },
          { label: 'Total Pendente', value: `R$ ${(data?.totalPendente||0).toFixed(2)}`, icon: Clock, bg: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-200' },
          { label: 'Consultas Pagas', value: data?.consultasPagas || 0, icon: CreditCard, bg: 'bg-primary-50 text-primary-600', border: 'border-gray-100' },
          { label: 'Consultas Não Pagas', value: data?.naopagas || 0, icon: XCircle, bg: 'bg-red-50 text-red-500', border: 'border-red-100' },
        ].map(({ label, value, icon: Icon, bg, border }) => (
          <div key={label} className={`bg-white rounded-2xl p-5 border ${border} flex items-center justify-between`}>
            <div><p className="text-xs text-gray-500">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}><Icon size={20} /></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Receita Semanal</h2>
          <div className="space-y-2">
            {semanaData.map(({ dia, valor }) => (
              <div key={dia} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-8">{dia}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${(valor/2800)*100}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-20 text-right">R$ {valor.toFixed(2)}</span>
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
                  strokeDasharray={circum} strokeDashoffset={circum - (pct / 100) * circum}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{pct}%</span>
                <span className="text-xs text-gray-500">da meta</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Recebido:</span><span className="font-semibold text-primary-600">R$ {recebido.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Meta:</span><span className="font-semibold">R$ {meta.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Falta:</span><span className="font-semibold text-yellow-600">R$ {Math.max(0, meta - recebido).toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      {/* Últimas transações */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Últimas Transações</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="pb-2 text-left">Data/Hora</th>
              <th className="pb-2 text-left">Paciente</th>
              <th className="pb-2 text-left">Profissional</th>
              <th className="pb-2 text-left">Pagamento</th>
              <th className="pb-2 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {data?.consultas?.filter(c => c.statusPagamento === 'pago').slice(0, 5).map(c => (
              <tr key={c.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 text-gray-500">{new Date(c.data).toLocaleDateString('pt-BR')}</td>
                <td className="py-2.5">{c.paciente?.nome}</td>
                <td className="py-2.5 text-gray-500">{c.profissional?.nome}</td>
                <td className="py-2.5 text-gray-500">{c.formaPagamento || '—'}</td>
                <td className="py-2.5 text-right text-green-600 font-medium">+ R$ {Number(c.valor||0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

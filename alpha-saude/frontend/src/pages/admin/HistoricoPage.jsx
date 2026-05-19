import { useState, useEffect } from 'react';
import { RotateCcw, XCircle } from 'lucide-react';
import api from '../../services/api';

export default function HistoricoPage() {
  const [historico, setHistorico] = useState([]);
  const [filtros, setFiltros] = useState({ tipo: 'todos', dataInicio: '', dataFim: '' });

  const carregar = () => {
    const params = {};
    if (filtros.tipo !== 'todos') params.tipo = filtros.tipo;
    if (filtros.dataInicio) params.dataInicio = filtros.dataInicio;
    if (filtros.dataFim) params.dataFim = filtros.dataFim;
    api.get('/api/historico', { params }).then(r => setHistorico(r.data));
  };

  useEffect(() => { carregar(); }, []);

  const tipoBadge = {
    cancelamento: { label: 'Cancelamento', bg: 'bg-red-50 text-red-500 border border-red-200', icon: XCircle, iconColor: 'text-red-500', cardBorder: 'border-red-200' },
    reagendamento: { label: 'Reagendamento', bg: 'bg-yellow-50 text-yellow-600 border border-yellow-200', icon: RotateCcw, iconColor: 'text-yellow-600', cardBorder: 'border-yellow-200' },
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Histórico de Alterações</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Registro completo de cancelamentos e reagendamentos</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
        <p className="text-sm font-medium text-gray-700 mb-3">Filtros</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Tipo de alteração</label>
            <select value={filtros.tipo} onChange={e=>setFiltros(p=>({...p,tipo:e.target.value}))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="todos">Todos</option>
              <option value="cancelamento">Cancelamento</option>
              <option value="reagendamento">Reagendamento</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Data de início</label>
            <input type="date" value={filtros.dataInicio} onChange={e=>setFiltros(p=>({...p,dataInicio:e.target.value}))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Data de término</label>
            <input type="date" value={filtros.dataFim} onChange={e=>setFiltros(p=>({...p,dataFim:e.target.value}))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
        </div>
        <button onClick={carregar} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Filtrar</button>
      </div>

      <div className="space-y-3">
        {historico.length === 0 && <p className="text-center text-gray-400 py-10">Nenhum registro encontrado</p>}
        {historico.map(h => {
          const cfg = tipoBadge[h.tipo] || tipoBadge.cancelamento;
          const Icon = cfg.icon;
          return (
            <div key={h.id} className={`bg-white rounded-2xl border ${cfg.cardBorder} p-5`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.bg}`}>
                  <Icon size={16} className={cfg.iconColor} />
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg}`}>{cfg.label}</span>
                <span className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString('pt-BR')}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Realizado por:</p>
                  <p className="font-medium">{h.funcionario ? `${h.funcionario.nome} (${h.funcionario.cargo})` : h.paciente?.nome + ' (Paciente)'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Paciente:</p>
                  <p className="font-medium">{h.paciente?.nome}</p>
                </div>
                {h.consulta && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Profissional:</p>
                    <p className="font-medium">{h.consulta.profissional?.nome}</p>
                  </div>
                )}
                {h.dataOriginal && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{h.tipo === 'reagendamento' ? 'Data/Hora Original:' : 'Consulta Cancelada:'}</p>
                    <p className="font-medium">{new Date(h.dataOriginal).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {h.novaData && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Nova Data/Hora:</p>
                    <p className="font-medium text-primary-600">{new Date(h.novaData).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {h.motivo && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">Motivo:</p>
                    <p className="text-gray-700">{h.motivo}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

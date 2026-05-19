import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, XCircle } from 'lucide-react';
import api from '../../services/api';

const statusConfig = {
  confirmada: { label: 'Confirmada', bg: 'bg-green-50 text-green-600' },
  pendente:   { label: 'Pendente',   bg: 'bg-yellow-50 text-yellow-600' },
  cancelada:  { label: 'Cancelada',  bg: 'bg-red-50 text-red-500' },
  reagendada: { label: 'Reagendada', bg: 'bg-orange-50 text-orange-600' },
  realizada:  { label: 'Realizada',  bg: 'bg-gray-100 text-gray-600' },
};

export default function PacienteConsultas() {
  const navigate = useNavigate();
  const [consultas, setConsultas] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    api.get('/api/minhas-consultas').then(r => setConsultas(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const cancelar = async (id) => {
    const motivo = prompt('Motivo do cancelamento (opcional):');
    if (motivo === null) return;
    try {
      await api.put(`/api/minhas-consultas/${id}/cancelar`, { motivo });
      carregar();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao cancelar');
    }
  };

  const filtradas = consultas.filter(c => {
    if (filtro === 'ativas') return ['pendente', 'confirmada'].includes(c.status);
    if (filtro === 'historico') return ['realizada', 'cancelada'].includes(c.status);
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Consultas</h1>
          <p className="text-gray-500 text-sm mt-1">Histórico e consultas agendadas</p>
        </div>
        <button onClick={() => navigate('/paciente/agendar')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition">
          <Calendar size={16} /> Nova Consulta
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {[{ key: 'todas', label: 'Todas' }, { key: 'ativas', label: 'Ativas' }, { key: 'historico', label: 'Histórico' }].map(({ key, label }) => (
          <button key={key} onClick={() => setFiltro(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              filtro === key ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>{label}</button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && <p className="text-center text-gray-400 py-8">Carregando...</p>}
        {!loading && filtradas.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhuma consulta encontrada</p>
            <button onClick={() => navigate('/paciente/agendar')} className="mt-3 text-primary-600 text-sm hover:underline">Agendar agora →</button>
          </div>
        )}
        {filtradas.map(c => {
          const sc = statusConfig[c.status] || statusConfig.pendente;
          return (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center font-bold text-primary-600 shrink-0">
                {c.profissional?.nome.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{c.profissional?.nome}</p>
                <p className="text-sm text-gray-500">{c.profissional?.especialidade}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar size={12} />{new Date(c.data).toLocaleDateString('pt-BR')}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12} />{c.horario}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg}`}>{sc.label}</span>
                {['pendente', 'confirmada'].includes(c.status) && (
                  <button onClick={() => cancelar(c.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition">
                    <XCircle size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
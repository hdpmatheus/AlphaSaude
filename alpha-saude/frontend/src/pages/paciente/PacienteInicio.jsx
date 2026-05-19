import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, CheckCircle, Plus } from 'lucide-react';
import api from '../../services/api';

const statusConfig = {
  confirmada: { label: 'Confirmada', bg: 'bg-green-50 text-green-600' },
  pendente:   { label: 'Pendente',   bg: 'bg-yellow-50 text-yellow-600' },
  cancelada:  { label: 'Cancelada',  bg: 'bg-red-50 text-red-500' },
  realizada:  { label: 'Realizada',  bg: 'bg-gray-100 text-gray-600' },
};

export default function PacienteInicio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/minhas-consultas').then(r => setConsultas(r.data)).finally(() => setLoading(false));
  }, []);

  const proximas = consultas.filter(c => ['pendente', 'confirmada'].includes(c.status)).slice(0, 3);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Olá, {user?.nome?.split(' ')[0]}! 👋</h1>
      <p className="text-gray-500 text-sm mb-6">Bem-vindo ao seu portal de saúde</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total de Consultas', value: consultas.length, icon: Calendar, color: 'bg-primary-50 text-primary-600' },
          { label: 'Confirmadas', value: consultas.filter(c => c.status === 'confirmada').length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
          { label: 'Realizadas', value: consultas.filter(c => c.status === 'realizada').length, icon: Clock, color: 'bg-blue-50 text-blue-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}><Icon size={22} /></div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Próximas Consultas</h2>
          <button onClick={() => navigate('/paciente/consultas')} className="text-xs text-primary-600 hover:underline">Ver todas</button>
        </div>
        {loading && <p className="text-sm text-gray-400 text-center py-4">Carregando...</p>}
        {!loading && proximas.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Calendar size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma consulta agendada</p>
          </div>
        )}
        <div className="space-y-3">
          {proximas.map(c => {
            const sc = statusConfig[c.status] || statusConfig.pendente;
            return (
              <div key={c.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Calendar size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{c.profissional?.nome}</p>
                    <p className="text-xs text-gray-500">{c.profissional?.especialidade}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600 text-sm">
                    {new Date(c.data).toLocaleDateString('pt-BR')} às {c.horario}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${sc.bg}`}>{sc.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => navigate('/paciente/agendar')}
        className="w-full py-4 bg-primary-600 text-white rounded-2xl font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Agendar Nova Consulta
      </button>
    </div>
  );
}
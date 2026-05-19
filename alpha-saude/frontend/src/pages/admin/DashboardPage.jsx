import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, CheckCircle, XCircle, Clock, Plus, UserPlus, Stethoscope } from 'lucide-react';
import api from '../../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Carregando dashboard...</div>;

  const stats = [
    { label: 'Consultas Hoje', value: data?.consultasHoje ?? 0, icon: Calendar, color: 'bg-primary-50 text-primary-600' },
    { label: 'Confirmadas',    value: data?.confirmadas ?? 0,    icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Canceladas',     value: data?.canceladas ?? 0,     icon: XCircle, color: 'bg-red-50 text-red-500' },
    { label: 'Horários Disponíveis', value: data?.horariosDisponiveis ?? 0, icon: Clock, color: 'bg-blue-50 text-blue-600' },
  ];

  const actions = [
    { icon: Plus,       label: 'Novo Agendamento',     desc: 'Agendar consulta para paciente', path: '/admin/agenda' },
    { icon: UserPlus,   label: 'Cadastrar Paciente',   desc: 'Registrar novo paciente',        path: '/admin/agenda' },
    { icon: Stethoscope,label: 'Cadastrar Profissional',desc: 'Adicionar médico ou especialista',path: '/admin/profissionais' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Visão geral das consultas e operações</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {actions.map(({ icon: Icon, label, desc, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="bg-white rounded-2xl p-5 border border-gray-100 text-left hover:shadow-sm hover:border-primary-200 transition flex items-start gap-3"
          >
            <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={18} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-2 gap-6">
        {/* Próximas consultas */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Próximas Consultas de Hoje</h2>
          <div className="space-y-3">
            {data?.proximasConsultas?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Nenhuma consulta hoje</p>
            )}
            {data?.proximasConsultas?.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{c.paciente.nome}</p>
                  <p className="text-xs text-gray-500">{c.profissional.nome} — {c.profissional.especialidade}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600 text-sm">{c.horario}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === 'confirmada' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                  }`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/admin/agenda')}
            className="w-full mt-3 py-2.5 border border-primary-200 text-primary-600 rounded-xl text-sm hover:bg-primary-50 transition"
          >
            Ver Agenda Completa
          </button>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Consultas por Dia (Esta Semana)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.consultasPorDia || []}>
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#1a9494" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

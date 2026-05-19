import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import api from '../../services/api';

export default function HorariosPage() {
  const [profissionais, setProfissionais] = useState([]);
  const [profissionalId, setProfissionalId] = useState('');
  const [bloqueios, setBloqueios] = useState([]);
  const [profissional, setProfissional] = useState(null);
  const [form, setForm] = useState({ dataInicio: '', dataFim: '', motivo: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { api.get('/api/profissionais').then(r => { setProfissionais(r.data); if (r.data[0]) setProfissionalId(r.data[0].id); }); }, []);

  useEffect(() => {
    if (!profissionalId) return;
    api.get('/api/horarios', { params: { profissionalId } }).then(r => setBloqueios(r.data));
    api.get(`/api/profissionais/${profissionalId}`).then(r => setProfissional(r.data));
  }, [profissionalId]);

  const adicionarBloqueio = async (e) => {
    e.preventDefault();
    await api.post('/api/horarios', { profissionalId, ...form });
    setForm({ dataInicio: '', dataFim: '', motivo: '' });
    setShowForm(false);
    api.get('/api/horarios', { params: { profissionalId } }).then(r => setBloqueios(r.data));
  };

  const removerBloqueio = async (id) => {
    await api.delete(`/api/horarios/${id}`);
    setBloqueios(b => b.filter(x => x.id !== id));
  };

  const DIAS_LABEL = { segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta', quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado' };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Gestão de Horários</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Configure horários de atendimento e bloqueie datas</p>

      <div className="mb-5">
        <label className="text-sm font-medium text-gray-700 mr-3">Profissional:</label>
        <select value={profissionalId} onChange={e => setProfissionalId(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      {profissional && (
        <div className="bg-primary-50 rounded-2xl p-5 mb-5 border border-primary-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-primary-600" />
            <h2 className="font-semibold text-gray-800">Horário de Atendimento</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Dias de atendimento:</p>
              <p className="text-sm font-medium text-gray-800">
                {profissional.diasAtendimento?.map(d => DIAS_LABEL[d] || d).join(', ') || 'Não definido'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Horário:</p>
              <p className="text-sm font-medium text-gray-800">{profissional.horarioInicio} às {profissional.horarioFim}</p>
            </div>
          </div>
          <button className="mt-3 px-3 py-1.5 border border-primary-300 text-primary-700 rounded-lg text-xs hover:bg-primary-100 transition">
            Editar Disponibilidade
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Períodos Bloqueados</h2>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs hover:bg-primary-700 transition">
            <Clock size={14} />
            Bloquear Data
          </button>
        </div>

        {showForm && (
          <form onSubmit={adicionarBloqueio} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Data Início</label>
                <input type="date" value={form.dataInicio} onChange={e => setForm(p=>({...p,dataInicio:e.target.value}))} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Data Fim</label>
                <input type="date" value={form.dataFim} onChange={e => setForm(p=>({...p,dataFim:e.target.value}))} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Motivo</label>
              <input value={form.motivo} onChange={e => setForm(p=>({...p,motivo:e.target.value}))} placeholder="Ex: Feriado de Natal"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-xs">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Cancelar</button>
            </div>
          </form>
        )}

        {bloqueios.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Nenhum período bloqueado</p>}
        <div className="space-y-2">
          {bloqueios.map(b => (
            <div key={b.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Clock size={14} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(b.dataInicio).toLocaleDateString('pt-BR')} até {new Date(b.dataFim).toLocaleDateString('pt-BR')}
                  </p>
                  {b.motivo && <p className="text-xs text-gray-500">{b.motivo}</p>}
                </div>
              </div>
              <button onClick={() => removerBloqueio(b.id)}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition">
                Remover
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Stethoscope } from 'lucide-react';
import api from '../../services/api';

const DIAS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
const DIAS_LABEL = { segunda: 'Segunda-feira', terca: 'Terça-feira', quarta: 'Quarta-feira', quinta: 'Quinta-feira', sexta: 'Sexta-feira', sabado: 'Sábado' };

const emptyForm = { nome: '', especialidade: '', registro: '', telefone: '', email: '', diasAtendimento: ['segunda','terca','quarta','quinta','sexta'], horarioInicio: '08:00', horarioFim: '18:00' };

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const carregar = () => api.get('/api/profissionais').then(r => setProfissionais(r.data));
  useEffect(() => { carregar(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/api/profissionais/${editId}`, form);
      } else {
        await api.post('/api/profissionais', form);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      carregar();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setForm({ nome: p.nome, especialidade: p.especialidade, registro: p.registro, telefone: p.telefone || '', email: p.email || '', diasAtendimento: p.diasAtendimento, horarioInicio: p.horarioInicio, horarioFim: p.horarioFim });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Confirmar exclusão do profissional?')) return;
    await api.delete(`/api/profissionais/${id}`);
    carregar();
  };

  const toggleDia = (dia) => {
    setForm(p => ({
      ...p,
      diasAtendimento: p.diasAtendimento.includes(dia)
        ? p.diasAtendimento.filter(d => d !== dia)
        : [...p.diasAtendimento, dia]
    }));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie médicos e especialistas</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(emptyForm); setEditId(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition"
        >
          <Plus size={16} />
          Novo Profissional
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            {editId ? 'Editar Profissional' : 'Cadastrar Novo Profissional'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nome do profissional</label>
                <input value={form.nome} onChange={e => setForm(p=>({...p,nome:e.target.value}))} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Especialidade</label>
                <input value={form.especialidade} onChange={e => setForm(p=>({...p,especialidade:e.target.value}))} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">CPF ou Registro Profissional</label>
                <input value={form.registro} onChange={e => setForm(p=>({...p,registro:e.target.value}))} placeholder="CRM, CRO, etc."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Telefone</label>
                <input value={form.telefone} onChange={e => setForm(p=>({...p,telefone:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">E-mail</label>
              <input type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Dias de Atendimento</label>
              <div className="grid grid-cols-3 gap-2">
                {DIAS.map(dia => (
                  <label key={dia} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer text-sm transition ${form.diasAtendimento.includes(dia) ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                    <input type="checkbox" checked={form.diasAtendimento.includes(dia)} onChange={() => toggleDia(dia)} className="accent-primary-600" />
                    {DIAS_LABEL[dia]}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Horário de início</label>
                <input type="time" value={form.horarioInicio} onChange={e => setForm(p=>({...p,horarioInicio:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Horário de término</label>
                <input type="time" value={form.horarioFim} onChange={e => setForm(p=>({...p,horarioFim:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition disabled:opacity-60">
                {loading ? 'Salvando...' : 'Salvar Profissional'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {profissionais.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
              <Stethoscope size={18} className="text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{p.nome}</p>
              <p className="text-sm text-gray-500">{p.especialidade} — {p.registro}</p>
              <p className="text-xs text-gray-400 mt-0.5">{p.telefone} &nbsp; {p.email}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(p)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition">
                <Pencil size={13} /> Editar
              </button>
              <button onClick={() => handleDelete(p.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 transition">
                <Trash2 size={13} /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

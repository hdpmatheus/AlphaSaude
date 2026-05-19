import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, User } from 'lucide-react';
import api from '../../services/api';

const emptyForm = { nome: '', cpf: '', telefone: '', email: '', senha: '' };

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const carregar = (q = '') => {
    api.get('/api/pacientes', { params: q ? { search: q } : {} })
      .then(r => setPacientes(r.data));
  };

  useEffect(() => { carregar(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        const { senha, cpf, ...rest } = form;
        await api.put(`/api/pacientes/${editId}`, rest);
      } else {
        await api.post('/api/pacientes', form);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      carregar(search);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setForm({ nome: p.nome, cpf: p.cpf, telefone: p.telefone || '', email: p.email, senha: '' });
    setEditId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    carregar(e.target.value);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie o cadastro de pacientes</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(emptyForm); setEditId(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition"
        >
          <Plus size={16} />
          Novo Paciente
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            {editId ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nome completo</label>
                <input
                  value={form.nome}
                  onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">CPF</label>
                <input
                  value={form.cpf}
                  onChange={e => setForm(p => ({ ...p, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  disabled={!!editId}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Telefone</label>
                <input
                  value={form.telefone}
                  onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            {!editId && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Senha provisória</label>
                <input
                  type="password"
                  value={form.senha}
                  onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition disabled:opacity-60"
              >
                {loading ? 'Salvando...' : 'Salvar Paciente'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Buscar por nome, CPF ou e-mail..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        />
      </div>

      <div className="space-y-2">
        {pacientes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <User size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum paciente cadastrado</p>
          </div>
        )}
        {pacientes.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 font-semibold text-primary-600 text-sm">
              {p.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{p.nome}</p>
              <p className="text-sm text-gray-500">{p.cpf} &nbsp;•&nbsp; {p.telefone || 'Sem telefone'}</p>
              <p className="text-xs text-gray-400">{p.email}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleEdit(p)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition"
              >
                <Pencil size={13} /> Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
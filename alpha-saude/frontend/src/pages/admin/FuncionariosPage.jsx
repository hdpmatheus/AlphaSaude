import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const emptyForm = { nome: '', email: '', telefone: '', cargo: 'recepcionista', senha: '' };

export default function FuncionariosPage() {
  const { user } = useAuth();
  const [funcionarios, setFuncionarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const carregar = () => api.get('/api/funcionarios').then(r => setFuncionarios(r.data));
  useEffect(() => { carregar(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        const { senha, ...rest } = form;
        await api.put(`/api/funcionarios/${editId}`, senha ? form : rest);
      } else {
        await api.post('/api/funcionarios', form);
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

  const handleEdit = (f) => {
    setForm({ nome: f.nome, email: f.email, telefone: f.telefone || '', cargo: f.cargo, senha: '' });
    setEditId(f.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Confirmar exclusão?')) return;
    await api.delete(`/api/funcionarios/${id}`);
    carregar();
  };

  const cargoBadge = (cargo) => cargo === 'admin'
    ? 'bg-purple-50 text-purple-700 border border-purple-200'
    : 'bg-blue-50 text-blue-700 border border-blue-200';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie recepcionistas e administradores</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(emptyForm); setEditId(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition"
        >
          <Plus size={16} />
          Novo Funcionário
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            {editId ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Nome completo</label>
              <input value={form.nome} onChange={e => setForm(p=>({...p,nome:e.target.value}))} required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">E-mail</label>
                <input type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Telefone</label>
                <input value={form.telefone} onChange={e => setForm(p=>({...p,telefone:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Cargo</label>
              <div className="grid grid-cols-2 gap-3">
                {['recepcionista', 'admin'].map(c => (
                  <label key={c} className={`flex items-start gap-3 px-4 py-3 border rounded-xl cursor-pointer transition ${form.cargo === c ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                    <input type="radio" name="cargo" value={c} checked={form.cargo === c} onChange={() => setForm(p=>({...p,cargo:c}))} className="mt-0.5 accent-primary-600" />
                    <div>
                      <p className="text-sm font-medium capitalize">{c === 'admin' ? 'Administrador' : 'Recepcionista'}</p>
                      <p className="text-xs text-gray-500">{c === 'admin' ? 'Acesso total: Todas as funcionalidades' : 'Acesso limitado: Agenda e Pacientes'}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {editId ? 'Nova senha (deixe vazio para não alterar)' : 'Senha provisória'}
              </label>
              <input type="password" value={form.senha} onChange={e => setForm(p=>({...p,senha:e.target.value}))}
                placeholder="Mínimo 8 caracteres" required={!editId} minLength={editId ? 0 : 8}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition disabled:opacity-60">
                {loading ? 'Salvando...' : 'Salvar Funcionário'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {funcionarios.map(f => (
          <div key={f.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${f.cargo === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'}`}>
              {f.nome.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-800">{f.nome}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${cargoBadge(f.cargo)}`}>{f.cargo === 'admin' ? 'Administrador' : 'Recepcionista'}</span>
              </div>
              <p className="text-sm text-gray-500">{f.cargo === 'admin' ? 'Acesso total: Agenda, Profissionais, Funcionários e Relatórios' : 'Acesso limitado: Agenda e Pacientes'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{f.email} &nbsp; {f.telefone}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(f)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition">
                <Pencil size={13} /> Editar
              </button>
              {f.id !== user?.id && (
                <button onClick={() => handleDelete(f.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 transition">
                  <Trash2 size={13} /> Excluir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

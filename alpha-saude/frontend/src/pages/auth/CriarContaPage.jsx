import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Plus, Shield } from 'lucide-react';

export default function CriarContaPage() {
  const { loginPaciente } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', cpf: '', telefone: '', email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/pacientes', form);
      await loginPaciente(form.email, form.senha);
      navigate('/paciente/inicio');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'nome',     label: 'Nome completo', type: 'text',     placeholder: 'Maria Silva' },
    { key: 'cpf',      label: 'CPF',           type: 'text',     placeholder: '000.000.000-00' },
    { key: 'telefone', label: 'Telefone',       type: 'tel',      placeholder: '(00) 00000-0000' },
    { key: 'email',    label: 'E-mail',         type: 'email',    placeholder: 'seu@email.com' },
    { key: 'senha',    label: 'Senha',          type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <Plus size={16} className="text-white" />
        </div>
        <span className="font-semibold text-gray-800 text-lg">Alpha Saúde</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Criar Conta</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Preencha seus dados para começar</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                required
              />
            </div>
          ))}
          <div className="flex items-start gap-2 bg-primary-50 rounded-xl px-3 py-2.5">
            <Shield size={16} className="text-primary-600 mt-0.5 shrink-0" />
            <p className="text-xs text-primary-700">Seus dados estão protegidos de acordo com a LGPD</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition disabled:opacity-60"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
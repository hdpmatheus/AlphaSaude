import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Plus } from 'lucide-react';

export default function LoginPage() {
  const { login, loginPaciente } = useAuth();
  const navigate = useNavigate();
  const [tipo, setTipo] = useState('paciente');
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tipo === 'paciente') {
        await loginPaciente(form.email, form.senha);
        navigate('/paciente/inicio');
      } else {
        const user = await login(form.email, form.senha);
        navigate(user.cargo === 'recepcionista' ? '/admin/agenda' : '/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <Plus size={16} className="text-white" />
        </div>
        <span className="font-semibold text-gray-800 text-lg">Alpha Saúde</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Entrar</h1>
        <p className="text-gray-500 text-sm text-center mb-5">Acesse sua conta</p>

        <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
          {[{ key: 'paciente', label: 'Paciente' }, { key: 'funcionario', label: 'Funcionário' }].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTipo(key); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                tipo === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.senha}
              onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {tipo === 'paciente' && (
          <p className="text-center text-sm text-gray-500 mt-5">
            Não tem uma conta?{' '}
            <Link to="/criar-conta" className="text-primary-600 font-medium hover:underline">Criar conta</Link>
          </p>
        )}
      </div>
    </div>
  );
}
import { useNavigate } from 'react-router-dom';
import { Calendar, Bell, Clock, Shield, Plus } from 'lucide-react';

const features = [
  { icon: Calendar, title: 'Agendamento Online', desc: 'Agende suas consultas 24/7 de forma rápida e prática' },
  { icon: Bell,     title: 'Lembretes Automáticos', desc: 'Receba lembretes antes da sua consulta por email' },
  { icon: Clock,    title: 'Organização da Agenda', desc: 'Visualize todas as suas consultas em um só lugar' },
  { icon: Shield,   title: 'Segurança e Privacidade', desc: 'Seus dados protegidos de acordo com a LGPD' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Plus size={16} className="text-white" />
            </div>
            <span className="font-semibold text-gray-800">Alpha Saúde</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded border border-gray-200"
            >
              🗺️ Mapa do Protótipo
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/criar-conta')}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Criar conta
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Agende suas consultas com praticidade
        </h1>
        <p className="text-gray-500 text-lg mb-10">
          Sistema completo de agendamento médico online. Simplicidade para<br />
          pacientes, organização para profissionais.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/criar-conta')}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition shadow-md"
          >
            <Calendar size={18} />
            Agendar Consulta
          </button>
          <button
            onClick={() => navigate('/criar-conta')}
            className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Criar Conta
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-16 grid grid-cols-4 gap-5">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon size={22} className="text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Pronto para começar?</h2>
          <p className="text-primary-100 mb-6">Crie sua conta gratuita e comece a gerenciar suas consultas agora mesmo</p>
          <button
            onClick={() => navigate('/criar-conta')}
            className="px-8 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition"
          >
            Criar Conta Grátis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-5 text-center text-sm text-gray-400">
        <button onClick={() => navigate('/login')} className="hover:text-gray-600">
          Acesso para Funcionários e Administradores →
        </button>
      </footer>
    </div>
  );
}

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Calendar, History, LogOut, Plus, User } from 'lucide-react';

const navItems = [
  { to: 'inicio',    icon: LayoutDashboard, label: 'Início' },
  { to: 'agendar',   icon: Calendar,        label: 'Agendar Consulta' },
  { to: 'consultas', icon: History,         label: 'Minhas Consultas' },
  { to: 'perfil',    icon: User,            label: 'Meu Perfil' },
];

export default function PacienteLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-44 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Plus size={16} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm leading-tight">Alpha Saúde</p>
              <p className="text-xs text-gray-500">Portal do Paciente</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={`/paciente/${to}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-primary-600 text-white font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <p className="text-xs font-semibold text-gray-800 truncate">{user?.nome}</p>
          <p className="text-xs text-gray-500 mb-2">Paciente</p>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
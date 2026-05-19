import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Calendar, DollarSign, TrendingUp, FileText,
  Users, Clock, UserCog, BarChart2, History, LogOut, Plus, UserRound
} from 'lucide-react';

const allNavItems = [
  { to: 'dashboard',             icon: LayoutDashboard, label: 'Dashboard',             adminOnly: true },
  { to: 'agenda',                icon: Calendar,        label: 'Agenda',                adminOnly: false },
  { to: 'pacientes',             icon: UserRound,       label: 'Pacientes',             adminOnly: false },
  { to: 'agenda-financeira',     icon: DollarSign,      label: 'Agenda Financeira',     adminOnly: true },
  { to: 'dashboard-financeiro',  icon: TrendingUp,      label: 'Dashboard Financeiro',  adminOnly: true },
  { to: 'faturamento',           icon: FileText,        label: 'Faturamento',           adminOnly: true },
  { to: 'profissionais',         icon: Users,           label: 'Profissionais',         adminOnly: true },
  { to: 'horarios',              icon: Clock,           label: 'Horários',              adminOnly: true },
  { to: 'funcionarios',          icon: UserCog,         label: 'Funcionários',          adminOnly: true },
  { to: 'relatorios',            icon: BarChart2,       label: 'Relatórios',            adminOnly: true },
  { to: 'historico',             icon: History,         label: 'Histórico',             adminOnly: true },
];

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-44 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Plus size={16} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm leading-tight">Alpha Saúde</p>
              <p className="text-xs text-gray-500">Painel Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={`/admin/${to}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-gray-100 p-3">
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.nome}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.cargo}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
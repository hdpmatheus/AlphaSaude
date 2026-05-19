import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import CriarContaPage from './pages/auth/CriarContaPage';

import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AgendaPage from './pages/admin/AgendaPage';
import AgendaFinanceiraPage from './pages/admin/AgendaFinanceiraPage';
import DashboardFinanceiroPage from './pages/admin/DashboardFinanceiroPage';
import FaturamentoPage from './pages/admin/FaturamentoPage';
import ProfissionaisPage from './pages/admin/ProfissionaisPage';
import HorariosPage from './pages/admin/HorariosPage';
import FuncionariosPage from './pages/admin/FuncionariosPage';
import PacientesPage from './pages/admin/PacientesPage';
import RelatoriosPage from './pages/admin/RelatoriosPage';
import HistoricoPage from './pages/admin/HistoricoPage';

import PacienteLayout from './components/layout/PacienteLayout';
import PacienteInicio from './pages/paciente/PacienteInicio';
import PacienteAgendar from './pages/paciente/PacienteAgendar';
import PacienteConsultas from './pages/paciente/PacienteConsultas';
import PacientePerfil from './pages/paciente/PacientePerfil';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/admin/agenda" replace />;
  return children;
}

function PacienteRoute({ children }) {
  const { user, loading, isPaciente } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isPaciente) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user, isPaciente } = useAuth();

  const homeRedirect = () => {
    if (!user) return <LandingPage />;
    if (isPaciente) return <Navigate to="/paciente/inicio" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={homeRedirect()} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/criar-conta" element={<CriarContaPage />} />

      <Route path="/paciente" element={<PacienteRoute><PacienteLayout /></PacienteRoute>}>
        <Route index element={<Navigate to="inicio" replace />} />
        <Route path="inicio"    element={<PacienteInicio />} />
        <Route path="agendar"   element={<PacienteAgendar />} />
        <Route path="consultas" element={<PacienteConsultas />} />
        <Route path="perfil"    element={<PacientePerfil />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"            element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>} />
        <Route path="agenda"               element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
        <Route path="pacientes"            element={<ProtectedRoute><PacientesPage /></ProtectedRoute>} />
        <Route path="agenda-financeira"    element={<ProtectedRoute adminOnly><AgendaFinanceiraPage /></ProtectedRoute>} />
        <Route path="dashboard-financeiro" element={<ProtectedRoute adminOnly><DashboardFinanceiroPage /></ProtectedRoute>} />
        <Route path="faturamento"          element={<ProtectedRoute adminOnly><FaturamentoPage /></ProtectedRoute>} />
        <Route path="profissionais"        element={<ProtectedRoute adminOnly><ProfissionaisPage /></ProtectedRoute>} />
        <Route path="horarios"             element={<ProtectedRoute adminOnly><HorariosPage /></ProtectedRoute>} />
        <Route path="funcionarios"         element={<ProtectedRoute adminOnly><FuncionariosPage /></ProtectedRoute>} />
        <Route path="relatorios"           element={<ProtectedRoute adminOnly><RelatoriosPage /></ProtectedRoute>} />
        <Route path="historico"            element={<ProtectedRoute adminOnly><HistoricoPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
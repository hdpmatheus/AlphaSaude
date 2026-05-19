import { useAuth } from '../../contexts/AuthContext';
import { User, Mail } from 'lucide-react';

export default function PacientePerfil() {
  const { user } = useAuth();

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Meu Perfil</h1>
      <p className="text-gray-500 text-sm mb-6">Seus dados cadastrados</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-700">
            {user?.nome?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{user?.nome}</p>
            <p className="text-sm text-gray-500">Paciente</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <User size={18} className="text-primary-600 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Nome completo</p>
              <p className="text-sm font-medium text-gray-800">{user?.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Mail size={18} className="text-primary-600 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">E-mail</p>
              <p className="text-sm font-medium text-gray-800">{user?.email}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-5">
          Para atualizar seus dados, entre em contato com a recepção.
        </p>
      </div>
    </div>
  );
}
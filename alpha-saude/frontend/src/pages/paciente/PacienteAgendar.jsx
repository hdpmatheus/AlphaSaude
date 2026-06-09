import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User, CreditCard } from 'lucide-react';
import api from '../../services/api';

const HORARIOS = [
  '07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30',
];

export default function PacienteAgendar() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profissionais, setProfissionais] = useState([]);
  const [form, setForm] = useState({
    profissionalId: '', data: '', horario: '', observacoes: '', formaPagamento: ''
  });
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.get('/api/profissionais').then(r => setProfissionais(r.data));
  }, []);

  useEffect(() => {
    console.log('useEffect disparou:', form.profissionalId, form.data);
    if (!form.profissionalId || !form.data) {
      setHorariosOcupados([]);
      return;
    }
    setLoadingHorarios(true);
    console.log('Buscando horários para:', form.profissionalId, form.data);
    api.get('/api/consultas', {
      params: { profissionalId: form.profissionalId, data: form.data }
    })
      .then(r => {
        const ocupados = r.data
          .filter(c => !['cancelada'].includes(c.status))
          .map(c => c.horario);
        setHorariosOcupados(ocupados);
      })
      .finally(() => setLoadingHorarios(false));
  }, [form.profissionalId, form.data]);

  const selecionarProfissional = (p) => {
    setForm(f => ({ ...f, profissionalId: p.id, horario: '' }));
    setProfissionalSelecionado(p);
    setStep(2);
  };

  const handleConfirmar = async () => {
    setLoading(true);
    setErro('');
    try {
      await api.post('/api/minhas-consultas', form);
      setStep(4);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao agendar consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (e) => {
    setForm(f => ({ ...f, data: e.target.value, horario: '' }));
  };

  const formasPagamento = [
    { value: 'pix',            label: 'Pix' },
    { value: 'dinheiro',       label: 'Dinheiro' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'cartao_debito',  label: 'Cartão de Débito' },
    { value: 'convenio',       label: 'Convênio' },
  ];

  const formaLabel = (value) => formasPagamento.find(f => f.value === value)?.label || value;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Agendar Consulta</h1>
      <p className="text-gray-500 text-sm mb-6">Escolha o profissional, data e horário</p>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {['Profissional', 'Data e Hora', 'Confirmação'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              step > i + 1 ? 'bg-green-500 text-white' :
              step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-xs ${step === i + 1 ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{s}</span>
            {i < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Profissional */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-3">Selecione o profissional:</p>
          {profissionais.map(p => (
            <button key={p.id} onClick={() => selecionarProfissional(p)}
              className="w-full bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:border-primary-300 hover:shadow-sm transition text-left">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center font-bold text-primary-600 shrink-0">
                {p.nome.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{p.nome}</p>
                <p className="text-sm text-gray-500">{p.especialidade}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.horarioInicio} às {p.horarioFim}</p>
              </div>
              <span className="text-primary-600">→</span>
            </button>
          ))}
          {profissionais.length === 0 && (
            <p className="text-center text-gray-400 py-8">Nenhum profissional disponível</p>
          )}
        </div>
      )}

      {/* Step 2 — Data e Hora */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center font-bold text-primary-600">
              {profissionalSelecionado?.nome.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{profissionalSelecionado?.nome}</p>
              <p className="text-sm text-gray-500">{profissionalSelecionado?.especialidade}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <Calendar size={14} className="inline mr-1" />
                Data da consulta
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.data}
                onChange={handleDataChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {form.data && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    <Clock size={14} className="inline mr-1" />
                    Horário
                  </label>
                  {loadingHorarios ? (
                    <span className="text-xs text-gray-400">Verificando disponibilidade...</span>
                  ) : (
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-primary-100 border border-primary-300 inline-block" />
                        Disponível
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-gray-200 inline-block" />
                        Ocupado
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {HORARIOS.map(h => {
                    const ocupado = horariosOcupados.includes(h);
                    const selecionado = form.horario === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        disabled={ocupado}
                        onClick={() => !ocupado && setForm(f => ({ ...f, horario: h }))}
                        className={`py-2 rounded-lg text-sm font-medium border transition ${
                          ocupado
                            ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                            : selecionado
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
                {!loadingHorarios && (
                  <p className="text-xs text-gray-400 mt-2">
                    {horariosOcupados.length === 0
                      ? '✅ Todos os horários disponíveis para esta data'
                      : `${HORARIOS.length - horariosOcupados.length} horários disponíveis`}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <CreditCard size={14} className="inline mr-1" />
                Forma de Pagamento
              </label>
              <select
                value={form.formaPagamento}
                onChange={e => setForm(f => ({ ...f, formaPagamento: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione (opcional)</option>
                {formasPagamento.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Observações (opcional)</label>
              <textarea
                value={form.observacoes}
                onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                placeholder="Ex: primeira consulta, retorno, sintomas..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep(1)}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
              Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!form.data || !form.horario}
              className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Confirmação */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Confirme seu agendamento</h2>
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {erro}
            </div>
          )}
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User size={18} className="text-primary-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Profissional</p>
                <p className="text-sm font-medium">
                  {profissionalSelecionado?.nome} — {profissionalSelecionado?.especialidade}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Calendar size={18} className="text-primary-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Data</p>
                <p className="text-sm font-medium capitalize">
                  {new Date(form.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long', day: '2-digit', month: 'long'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Clock size={18} className="text-primary-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Horário</p>
                <p className="text-sm font-medium">{form.horario}</p>
              </div>
            </div>
            {form.formaPagamento && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <CreditCard size={18} className="text-primary-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Forma de Pagamento</p>
                  <p className="text-sm font-medium">{formaLabel(form.formaPagamento)}</p>
                </div>
              </div>
            )}
            {form.observacoes && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400">Observações</p>
                <p className="text-sm text-gray-700">{form.observacoes}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
              Voltar
            </button>
            <button onClick={handleConfirmar} disabled={loading}
              className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition disabled:opacity-60">
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Sucesso */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Consulta agendada!</h2>
          <p className="text-gray-500 text-sm mb-1">
            Sua consulta com <strong>{profissionalSelecionado?.nome}</strong> foi agendada para
          </p>
          <p className="text-primary-600 font-semibold mb-1">
            {new Date(form.data + 'T00:00:00').toLocaleDateString('pt-BR')} às {form.horario}
          </p>
          {form.formaPagamento && (
            <p className="text-gray-400 text-sm mb-6">
              Pagamento via {formaLabel(form.formaPagamento)}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep(1);
                setForm({ profissionalId: '', data: '', horario: '', observacoes: '', formaPagamento: '' });
                setProfissionalSelecionado(null);
              }}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
            >
              Novo Agendamento
            </button>
            <button onClick={() => navigate('/paciente/consultas')}
              className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition">
              Ver Consultas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
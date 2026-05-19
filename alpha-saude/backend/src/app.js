const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const funcionarioRoutes = require('./routes/funcionario.routes');
const profissionalRoutes = require('./routes/profissional.routes');
const consultaRoutes = require('./routes/consulta.routes');
const consultaPacienteRoutes = require('./routes/consulta-paciente.routes');
const pacienteRoutes = require('./routes/paciente.routes');
const horarioRoutes = require('./routes/horario.routes');
const historicoRoutes = require('./routes/historico.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const faturamentoRoutes = require('./routes/faturamento.routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/profissionais', profissionalRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/minhas-consultas', consultaPacienteRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/faturamento', faturamentoRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
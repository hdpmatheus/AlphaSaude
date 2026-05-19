const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const loginFuncionario = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha obrigatórios' });

  try {
    const funcionario = await prisma.funcionario.findUnique({ where: { email } });
    if (!funcionario || !funcionario.ativo) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, funcionario.senha);
    if (!senhaValida) return res.status(401).json({ error: 'Credenciais inválidas' });

    const payload = {
      id: funcionario.id,
      nome: funcionario.nome,
      email: funcionario.email,
      cargo: funcionario.cargo,
      tipo: 'funcionario',
    };

    const tokens = generateTokens(payload);
    res.json({ user: payload, ...tokens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
};

const loginPaciente = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha obrigatórios' });

  try {
    const paciente = await prisma.paciente.findUnique({ where: { email } });
    if (!paciente || !paciente.ativo) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, paciente.senha);
    if (!senhaValida) return res.status(401).json({ error: 'Credenciais inválidas' });

    const payload = {
      id: paciente.id,
      nome: paciente.nome,
      email: paciente.email,
      tipo: 'paciente',
    };

    const tokens = generateTokens(payload);
    res.json({ user: payload, ...tokens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
};

const refreshToken = (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(400).json({ error: 'Refresh token obrigatório' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const { iat, exp, ...payload } = decoded;
    const tokens = generateTokens(payload);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Refresh token inválido' });
  }
};

const seedAdmin = async () => {
  const existe = await prisma.funcionario.findFirst({ where: { cargo: 'admin' } });
  if (!existe) {
    const senha = await bcrypt.hash('admin123', 10);
    await prisma.funcionario.create({
      data: { nome: 'Dr. Roberto Silva', email: 'admin@clinica.com', cargo: 'admin', senha },
    });
    console.log('✅ Admin criado: admin@clinica.com / admin123');
  }
};

seedAdmin().catch(console.error);

module.exports = { loginFuncionario, loginPaciente, refreshToken };
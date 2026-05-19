const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// Só admin passa
const requireAdmin = (req, res, next) => {
  if (req.user?.cargo !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  next();
};

// Admin ou recepcionista
const requireFuncionario = (req, res, next) => {
  if (!['admin', 'recepcionista'].includes(req.user?.cargo)) {
    return res.status(403).json({ error: 'Acesso não autorizado' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireFuncionario };

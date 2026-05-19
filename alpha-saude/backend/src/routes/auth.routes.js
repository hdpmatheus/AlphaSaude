const express = require('express');
const router = express.Router();
const { loginFuncionario, loginPaciente, refreshToken } = require('../controllers/auth.controller');

router.post('/login', loginFuncionario);
router.post('/login/paciente', loginPaciente);
router.post('/refresh', refreshToken);

module.exports = router;
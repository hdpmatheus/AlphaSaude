const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboard.controller');
const { authenticate, requireFuncionario } = require('../middlewares/auth.middleware');

router.get('/', authenticate, requireFuncionario, getDashboard);

module.exports = router;

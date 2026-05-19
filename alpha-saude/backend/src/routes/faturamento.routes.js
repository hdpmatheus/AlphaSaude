// faturamento.routes.js
const express = require('express');
const router = express.Router();
const { getFaturamento } = require('../controllers/faturamento.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');
router.get('/', authenticate, requireAdmin, getFaturamento);
module.exports = router;

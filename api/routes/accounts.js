import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Criar conta
router.post('/', (req, res) => {
  try {
    const { name, document, documentType, balance } = req.body;

    if (!name || !document || !documentType) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios: name, document, documentType' 
      });
    }

    const validDocTypes = ['CPF', 'CNPJ'];
    if (!validDocTypes.includes(documentType.toUpperCase())) {
      return res.status(400).json({ 
        error: 'Tipo de documento inválido. Use: CPF ou CNPJ' 
      });
    }

    const account = db.createAccount({
      name,
      document,
      documentType: documentType.toUpperCase(),
      balance: balance || 0
    });

    res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso',
      data: account
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Listar todas as contas
router.get('/', (req, res) => {
  try {
    const accounts = db.getAllAccounts();
    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Consultar conta
router.get('/:accountId', (req, res) => {
  try {
    const { accountId } = req.params;
    const account = db.getAccount(accountId);
    
    if (!account) {
      return res.status(404).json({ 
        success: false,
        error: 'Conta não encontrada' 
      });
    }

    // Buscar chaves PIX da conta
    const pixKeys = db.getPixKeysByAccount(accountId);

    res.json({
      success: true,
      data: {
        ...account,
        pixKeys
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Consultar saldo
router.get('/:accountId/balance', (req, res) => {
  try {
    const { accountId } = req.params;
    const account = db.getAccount(accountId);
    
    if (!account) {
      return res.status(404).json({ 
        success: false,
        error: 'Conta não encontrada' 
      });
    }

    res.json({
      success: true,
      data: {
        accountId: account.id,
        balance: account.balance
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Estatísticas gerais
router.get('/stats/general', (req, res) => {
  try {
    const stats = db.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;

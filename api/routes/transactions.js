import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Criar transação PIX
router.post('/', async (req, res) => {
  try {
    const { fromAccountId, pixKey, amount, description } = req.body;

    if (!fromAccountId || !pixKey || !amount) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios: fromAccountId, pixKey, amount' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Valor deve ser maior que zero' 
      });
    }

    // Buscar chave PIX de destino
    const destinationKey = db.getPixKeyByValue(pixKey);
    if (!destinationKey) {
      return res.status(404).json({ 
        success: false,
        error: 'Chave PIX de destino não encontrada' 
      });
    }

    // Verificar se não é a mesma conta
    if (fromAccountId === destinationKey.accountId) {
      return res.status(400).json({ 
        success: false,
        error: 'Não é possível transferir para a mesma conta' 
      });
    }

    // Criar transação
    const transaction = db.createTransaction({
      fromAccountId,
      toAccountId: destinationKey.accountId,
      amount: parseFloat(amount),
      description: description || 'Transferência PIX',
      pixKey
    });

    // Processar transação
    const processedTransaction = db.processTransaction(transaction.id);

    res.status(201).json({
      success: true,
      message: processedTransaction.status === 'COMPLETED' 
        ? 'Transação realizada com sucesso' 
        : 'Transação falhou',
      data: processedTransaction
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Pagar QR Code PIX
router.post('/qrcode/pay', async (req, res) => {
  try {
    const { fromAccountId, qrCodePayload } = req.body;

    if (!fromAccountId || !qrCodePayload) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios: fromAccountId, qrCodePayload' 
      });
    }

    // Parse do payload
    const payload = JSON.parse(qrCodePayload);

    // Verificar expiração (se for dinâmico)
    if (payload.type === 'DYNAMIC' && payload.expiresAt) {
      if (new Date(payload.expiresAt) < new Date()) {
        return res.status(400).json({ 
          success: false,
          error: 'QR Code expirado' 
        });
      }
    }

    // Buscar chave PIX
    const destinationKey = db.getPixKeyByValue(payload.pixKey);
    if (!destinationKey) {
      return res.status(404).json({ 
        success: false,
        error: 'Chave PIX não encontrada' 
      });
    }

    // Criar e processar transação
    const transaction = db.createTransaction({
      fromAccountId,
      toAccountId: destinationKey.accountId,
      amount: parseFloat(payload.amount),
      description: payload.description || 'Pagamento via QR Code',
      pixKey: payload.pixKey,
      txid: payload.txid
    });

    const processedTransaction = db.processTransaction(transaction.id);

    res.status(201).json({
      success: true,
      message: processedTransaction.status === 'COMPLETED' 
        ? 'Pagamento realizado com sucesso' 
        : 'Pagamento falhou',
      data: processedTransaction
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Consultar transação
router.get('/:transactionId', (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = db.getTransaction(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        error: 'Transação não encontrada' 
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Listar transações de uma conta
router.get('/account/:accountId', (req, res) => {
  try {
    const { accountId } = req.params;
    const transactions = db.getTransactionsByAccount(accountId);
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Listar todas as transações
router.get('/', (req, res) => {
  try {
    const transactions = db.getAllTransactions();
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Estornar transação
router.post('/:transactionId/refund', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    const originalTransaction = db.getTransaction(transactionId);
    
    if (!originalTransaction) {
      return res.status(404).json({ 
        success: false,
        error: 'Transação não encontrada' 
      });
    }

    if (originalTransaction.status !== 'COMPLETED') {
      return res.status(400).json({ 
        success: false,
        error: 'Apenas transações completadas podem ser estornadas' 
      });
    }

    // Criar transação de estorno (inversa)
    const refundTransaction = db.createTransaction({
      fromAccountId: originalTransaction.toAccountId,
      toAccountId: originalTransaction.fromAccountId,
      amount: originalTransaction.amount,
      description: `Estorno: ${originalTransaction.description}`,
      refundReason: reason || 'Estorno solicitado',
      originalTransactionId: transactionId
    });

    // Processar estorno
    const processedRefund = db.processTransaction(refundTransaction.id);

    res.status(201).json({
      success: true,
      message: 'Estorno realizado com sucesso',
      data: {
        refundTransaction: processedRefund,
        originalTransaction
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;

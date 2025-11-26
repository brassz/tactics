import express from 'express';
import db from '../database/db.js';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// ===== PIX KEYS =====

// Criar chave PIX
router.post('/keys', async (req, res) => {
  try {
    const { accountId, keyType, keyValue } = req.body;

    if (!accountId || !keyType || !keyValue) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios: accountId, keyType, keyValue' 
      });
    }

    const validKeyTypes = ['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM'];
    if (!validKeyTypes.includes(keyType.toUpperCase())) {
      return res.status(400).json({ 
        error: 'Tipo de chave inválido. Use: CPF, CNPJ, EMAIL, PHONE, RANDOM' 
      });
    }

    const pixKey = db.createPixKey(accountId, keyType.toUpperCase(), keyValue);
    res.status(201).json({
      success: true,
      message: 'Chave PIX criada com sucesso',
      data: pixKey
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Listar chaves PIX de uma conta
router.get('/keys/account/:accountId', (req, res) => {
  try {
    const { accountId } = req.params;
    const keys = db.getPixKeysByAccount(accountId);
    
    res.json({
      success: true,
      data: keys
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Consultar chave PIX
router.get('/keys/lookup/:keyValue', (req, res) => {
  try {
    const { keyValue } = req.params;
    const pixKey = db.getPixKeyByValue(keyValue);
    
    if (!pixKey) {
      return res.status(404).json({ 
        success: false,
        error: 'Chave PIX não encontrada' 
      });
    }

    const account = db.getAccount(pixKey.accountId);
    
    res.json({
      success: true,
      data: {
        pixKey,
        account: {
          id: account.id,
          name: account.name,
          document: account.document,
          documentType: account.documentType
        }
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Deletar chave PIX
router.delete('/keys/:keyId', (req, res) => {
  try {
    const { keyId } = req.params;
    const key = db.deletePixKey(keyId);
    
    if (!key) {
      return res.status(404).json({ 
        success: false,
        error: 'Chave PIX não encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Chave PIX removida com sucesso',
      data: key
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ===== QR CODE =====

// Gerar QR Code PIX estático
router.post('/qrcode/static', async (req, res) => {
  try {
    const { accountId, pixKey, amount, description } = req.body;

    if (!accountId || !pixKey) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios: accountId, pixKey' 
      });
    }

    // Verificar se a chave existe
    const key = db.getPixKeyByValue(pixKey);
    if (!key) {
      return res.status(404).json({ 
        success: false,
        error: 'Chave PIX não encontrada' 
      });
    }

    const account = db.getAccount(accountId);
    if (!account) {
      return res.status(404).json({ 
        success: false,
        error: 'Conta não encontrada' 
      });
    }

    // Criar payload PIX (formato simplificado)
    const payload = {
      version: '01',
      type: 'STATIC',
      merchantName: account.name,
      merchantCity: 'SAO PAULO',
      pixKey: pixKey,
      amount: amount || null,
      txid: uuidv4().replace(/-/g, '').substr(0, 25),
      description: description || 'Pagamento PIX'
    };

    // Gerar string do QR Code (formato simplificado)
    const qrString = JSON.stringify(payload);
    
    // Gerar imagem do QR Code
    const qrCodeImage = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 1
    });

    // Salvar QR Code no banco
    const qrcodeData = db.createQRCode({
      accountId,
      payload,
      qrCodeImage,
      type: 'STATIC',
      amount: amount || null
    });

    res.status(201).json({
      success: true,
      message: 'QR Code gerado com sucesso',
      data: {
        id: qrcodeData.id,
        qrCodeImage,
        payload: qrString,
        txid: payload.txid
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Gerar QR Code PIX dinâmico
router.post('/qrcode/dynamic', async (req, res) => {
  try {
    const { accountId, amount, description, expiresIn } = req.body;

    if (!accountId || !amount) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios: accountId, amount' 
      });
    }

    const account = db.getAccount(accountId);
    if (!account) {
      return res.status(404).json({ 
        success: false,
        error: 'Conta não encontrada' 
      });
    }

    // Buscar chave PIX da conta
    const pixKeys = db.getPixKeysByAccount(accountId);
    if (pixKeys.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Conta não possui chave PIX cadastrada' 
      });
    }

    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + (expiresIn || 30));

    // Criar payload PIX
    const payload = {
      version: '01',
      type: 'DYNAMIC',
      merchantName: account.name,
      merchantCity: 'SAO PAULO',
      pixKey: pixKeys[0].keyValue,
      amount: amount,
      txid: uuidv4().replace(/-/g, '').substr(0, 25),
      description: description || 'Pagamento PIX',
      expiresAt: expirationDate.toISOString()
    };

    const qrString = JSON.stringify(payload);
    const qrCodeImage = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 1
    });

    const qrcodeData = db.createQRCode({
      accountId,
      payload,
      qrCodeImage,
      type: 'DYNAMIC',
      amount,
      expiresAt: expirationDate.toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'QR Code dinâmico gerado com sucesso',
      data: {
        id: qrcodeData.id,
        qrCodeImage,
        payload: qrString,
        txid: payload.txid,
        expiresAt: expirationDate.toISOString()
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Listar QR Codes de uma conta
router.get('/qrcode/account/:accountId', (req, res) => {
  try {
    const { accountId } = req.params;
    const qrcodes = db.getQRCodesByAccount(accountId);
    
    res.json({
      success: true,
      data: qrcodes
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Consultar QR Code
router.get('/qrcode/:qrcodeId', (req, res) => {
  try {
    const { qrcodeId } = req.params;
    const qrcode = db.getQRCode(qrcodeId);
    
    if (!qrcode) {
      return res.status(404).json({ 
        success: false,
        error: 'QR Code não encontrado' 
      });
    }

    res.json({
      success: true,
      data: qrcode
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;

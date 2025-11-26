import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, 'data.json');

// Banco de dados com persistência em arquivo JSON
class Database {
  constructor() {
    this.accounts = new Map();
    this.pixKeys = new Map();
    this.transactions = new Map();
    this.qrcodes = new Map();
    
    // Carregar dados salvos ou criar dados de exemplo
    this.loadData();
  }

  // Carregar dados do arquivo JSON
  loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        
        // Restaurar accounts
        if (data.accounts) {
          data.accounts.forEach(acc => this.accounts.set(acc.id, acc));
        }
        
        // Restaurar pixKeys
        if (data.pixKeys) {
          data.pixKeys.forEach(key => this.pixKeys.set(key.id, key));
        }
        
        // Restaurar transactions
        if (data.transactions) {
          data.transactions.forEach(tx => this.transactions.set(tx.id, tx));
        }
        
        // Restaurar qrcodes
        if (data.qrcodes) {
          data.qrcodes.forEach(qr => this.qrcodes.set(qr.id, qr));
        }
        
        console.log('✅ Dados carregados do arquivo!');
      } else {
        console.log('📝 Criando dados de exemplo...');
        this.initializeSampleData();
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.initializeSampleData();
    }
  }

  // Salvar dados no arquivo JSON
  saveData() {
    try {
      const data = {
        accounts: Array.from(this.accounts.values()),
        pixKeys: Array.from(this.pixKeys.values()),
        transactions: Array.from(this.transactions.values()),
        qrcodes: Array.from(this.qrcodes.values())
      };
      
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log('💾 Dados salvos!');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  }

  initializeSampleData() {
    // Conta de exemplo 1
    const account1 = {
      id: uuidv4(),
      name: 'João Silva (Exemplo)',
      document: '123.456.789-00',
      documentType: 'CPF',
      balance: 5000.00,
      createdAt: new Date().toISOString()
    };
    
    // Conta de exemplo 2
    const account2 = {
      id: uuidv4(),
      name: 'Maria Santos (Exemplo)',
      document: '987.654.321-00',
      documentType: 'CPF',
      balance: 3500.00,
      createdAt: new Date().toISOString()
    };

    this.accounts.set(account1.id, account1);
    this.accounts.set(account2.id, account2);

    // Criar chaves PIX de exemplo
    this.createPixKey(account1.id, 'CPF', '12345678900', false);
    this.createPixKey(account1.id, 'EMAIL', 'joao@example.com', false);
    this.createPixKey(account2.id, 'PHONE', '+5511987654321', false);
    
    // Salvar dados iniciais
    this.saveData();
  }

  // ===== ACCOUNTS =====
  createAccount(data) {
    const account = {
      id: uuidv4(),
      ...data,
      balance: data.balance || 0,
      createdAt: new Date().toISOString()
    };
    this.accounts.set(account.id, account);
    this.saveData();
    return account;
  }

  getAccount(accountId) {
    return this.accounts.get(accountId);
  }

  getAllAccounts() {
    return Array.from(this.accounts.values());
  }

  updateAccountBalance(accountId, amount) {
    const account = this.accounts.get(accountId);
    if (!account) return null;
    account.balance += amount;
    this.saveData();
    return account;
  }

  // ===== PIX KEYS =====
  createPixKey(accountId, keyType, keyValue, shouldSave = true) {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error('Conta não encontrada');

    // Verificar se a chave já existe
    const existingKey = Array.from(this.pixKeys.values()).find(
      key => key.keyValue === keyValue && key.keyType === keyType && key.status === 'ACTIVE'
    );
    if (existingKey) throw new Error('Chave PIX já cadastrada');

    const pixKey = {
      id: uuidv4(),
      accountId,
      keyType,
      keyValue,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    this.pixKeys.set(pixKey.id, pixKey);
    if (shouldSave) this.saveData();
    return pixKey;
  }

  getPixKeysByAccount(accountId) {
    return Array.from(this.pixKeys.values()).filter(
      key => key.accountId === accountId
    );
  }

  getPixKeyByValue(keyValue) {
    return Array.from(this.pixKeys.values()).find(
      key => key.keyValue === keyValue && key.status === 'ACTIVE'
    );
  }

  deletePixKey(keyId) {
    const key = this.pixKeys.get(keyId);
    if (!key) return null;
    key.status = 'DELETED';
    this.saveData();
    return key;
  }

  // ===== TRANSACTIONS =====
  createTransaction(data) {
    const transaction = {
      id: uuidv4(),
      txid: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
      ...data,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    this.transactions.set(transaction.id, transaction);
    this.saveData();
    return transaction;
  }

  processTransaction(transactionId) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) throw new Error('Transação não encontrada');

    const fromAccount = this.accounts.get(transaction.fromAccountId);
    const toAccount = this.accounts.get(transaction.toAccountId);

    if (!fromAccount || !toAccount) {
      transaction.status = 'FAILED';
      transaction.failReason = 'Conta não encontrada';
      this.saveData();
      return transaction;
    }

    if (fromAccount.balance < transaction.amount) {
      transaction.status = 'FAILED';
      transaction.failReason = 'Saldo insuficiente';
      this.saveData();
      return transaction;
    }

    // Processar transferência
    fromAccount.balance -= transaction.amount;
    toAccount.balance += transaction.amount;

    transaction.status = 'COMPLETED';
    transaction.completedAt = new Date().toISOString();

    this.saveData();
    return transaction;
  }

  getTransaction(transactionId) {
    return this.transactions.get(transactionId);
  }

  getTransactionsByAccount(accountId) {
    return Array.from(this.transactions.values()).filter(
      tx => tx.fromAccountId === accountId || tx.toAccountId === accountId
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getAllTransactions() {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // ===== QR CODES =====
  createQRCode(data) {
    const qrcode = {
      id: uuidv4(),
      ...data,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    this.qrcodes.set(qrcode.id, qrcode);
    this.saveData();
    return qrcode;
  }

  getQRCode(qrcodeId) {
    return this.qrcodes.get(qrcodeId);
  }

  getQRCodesByAccount(accountId) {
    return Array.from(this.qrcodes.values()).filter(
      qr => qr.accountId === accountId
    );
  }

  // ===== STATISTICS =====
  getStatistics() {
    const transactions = Array.from(this.transactions.values());
    const completedTransactions = transactions.filter(tx => tx.status === 'COMPLETED');
    
    const totalVolume = completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const avgTransaction = completedTransactions.length > 0 
      ? totalVolume / completedTransactions.length 
      : 0;

    return {
      totalAccounts: this.accounts.size,
      totalPixKeys: Array.from(this.pixKeys.values()).filter(k => k.status === 'ACTIVE').length,
      totalTransactions: transactions.length,
      completedTransactions: completedTransactions.length,
      totalVolume: totalVolume,
      averageTransaction: avgTransaction,
      qrCodesGenerated: this.qrcodes.size
    };
  }
}

// Exportar instância única (singleton)
const db = new Database();
export default db;

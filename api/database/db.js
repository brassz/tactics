import { v4 as uuidv4 } from 'uuid';

// Banco de dados simulado em memória
class Database {
  constructor() {
    this.accounts = new Map();
    this.pixKeys = new Map();
    this.transactions = new Map();
    this.qrcodes = new Map();
    
    // Criar algumas contas de exemplo
    this.initializeSampleData();
  }

  initializeSampleData() {
    // Conta de exemplo 1
    const account1 = {
      id: uuidv4(),
      name: 'João Silva',
      document: '123.456.789-00',
      documentType: 'CPF',
      balance: 5000.00,
      createdAt: new Date().toISOString()
    };
    
    // Conta de exemplo 2
    const account2 = {
      id: uuidv4(),
      name: 'Maria Santos',
      document: '987.654.321-00',
      documentType: 'CPF',
      balance: 3500.00,
      createdAt: new Date().toISOString()
    };

    // Conta empresa
    const account3 = {
      id: uuidv4(),
      name: 'Nexus Pagamentos LTDA',
      document: '12.345.678/0001-90',
      documentType: 'CNPJ',
      balance: 150000.00,
      createdAt: new Date().toISOString()
    };

    this.accounts.set(account1.id, account1);
    this.accounts.set(account2.id, account2);
    this.accounts.set(account3.id, account3);

    // Criar chaves PIX de exemplo
    this.createPixKey(account1.id, 'CPF', '12345678900');
    this.createPixKey(account1.id, 'EMAIL', 'joao@example.com');
    this.createPixKey(account2.id, 'PHONE', '+5511987654321');
    this.createPixKey(account3.id, 'CNPJ', '12345678000190');
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
    return account;
  }

  // ===== PIX KEYS =====
  createPixKey(accountId, keyType, keyValue) {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error('Conta não encontrada');

    // Verificar se a chave já existe
    const existingKey = Array.from(this.pixKeys.values()).find(
      key => key.keyValue === keyValue && key.keyType === keyType
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
      return transaction;
    }

    if (fromAccount.balance < transaction.amount) {
      transaction.status = 'FAILED';
      transaction.failReason = 'Saldo insuficiente';
      return transaction;
    }

    // Processar transferência
    fromAccount.balance -= transaction.amount;
    toAccount.balance += transaction.amount;

    transaction.status = 'COMPLETED';
    transaction.completedAt = new Date().toISOString();

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

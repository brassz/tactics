const API_URL = window.location.origin + '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadAccounts();
    switchTab('accounts');
    
    // Update QR type field visibility
    document.getElementById('qrType').addEventListener('change', (e) => {
        const pixKeyField = document.getElementById('pixKeyField');
        if (e.target.value === 'static') {
            pixKeyField.style.display = 'block';
        } else {
            pixKeyField.style.display = 'none';
        }
    });
});

// Tab switching
function switchTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-blue-600', 'text-blue-600');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab
    const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (tabBtn) {
        tabBtn.classList.add('border-blue-600', 'text-blue-600');
    }
    
    const tabContent = document.getElementById(`${tabName}-tab`);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // Load data for the tab
    switch(tabName) {
        case 'accounts':
            loadAccounts();
            break;
        case 'pixkeys':
            loadPixKeys();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'qrcode':
            loadAccountsForSelect();
            break;
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/accounts/stats/general`);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data;
            document.getElementById('totalAccounts').textContent = stats.totalAccounts;
            document.getElementById('totalKeys').textContent = stats.totalPixKeys;
            document.getElementById('totalTransactions').textContent = stats.totalTransactions;
            document.getElementById('totalVolume').textContent = formatCurrency(stats.totalVolume);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load accounts
async function loadAccounts() {
    try {
        const response = await fetch(`${API_URL}/accounts`);
        const data = await response.json();
        
        if (data.success) {
            const accountsList = document.getElementById('accountsList');
            accountsList.innerHTML = '';
            
            if (data.data.length === 0) {
                accountsList.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">Nenhuma conta encontrada. Crie uma nova conta para começar.</div>';
                return;
            }
            
            data.data.forEach(account => {
                const accountCard = document.createElement('div');
                accountCard.className = 'bg-white border-2 border-gray-200 rounded-lg p-6 card-hover';
                accountCard.innerHTML = `
                    <div class="flex items-start justify-between mb-4">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3">
                            <i class="fas fa-user text-white text-xl"></i>
                        </div>
                        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            ${account.documentType}
                        </span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${account.name}</h3>
                    <p class="text-gray-600 text-sm mb-4">${account.document}</p>
                    <div class="border-t pt-4">
                        <p class="text-gray-500 text-sm">Saldo disponível</p>
                        <p class="text-2xl font-bold text-green-600">${formatCurrency(account.balance)}</p>
                    </div>
                    <div class="mt-4 flex space-x-2">
                        <button onclick="viewAccountDetails('${account.id}')" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                            Ver Detalhes
                        </button>
                    </div>
                `;
                accountsList.appendChild(accountCard);
            });
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
        showToast('error', 'Erro', 'Não foi possível carregar as contas');
    }
}

// Load PIX keys
async function loadPixKeys() {
    try {
        const accountsResponse = await fetch(`${API_URL}/accounts`);
        const accountsData = await accountsResponse.json();
        
        const pixKeysList = document.getElementById('pixKeysList');
        pixKeysList.innerHTML = '';
        
        if (!accountsData.success || accountsData.data.length === 0) {
            pixKeysList.innerHTML = '<div class="text-center text-gray-500 py-8">Nenhuma chave PIX encontrada.</div>';
            return;
        }
        
        for (const account of accountsData.data) {
            const keysResponse = await fetch(`${API_URL}/pix/keys/account/${account.id}`);
            const keysData = await keysResponse.json();
            
            if (keysData.success && keysData.data.length > 0) {
                keysData.data.forEach(key => {
                    if (key.status === 'ACTIVE') {
                        const keyCard = document.createElement('div');
                        keyCard.className = 'bg-white border-2 border-gray-200 rounded-lg p-6 flex items-center justify-between card-hover';
                        keyCard.innerHTML = `
                            <div class="flex items-center space-x-4">
                                <div class="bg-gradient-to-r from-green-500 to-teal-600 rounded-full p-3">
                                    <i class="fas fa-key text-white text-xl"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">${account.name}</p>
                                    <p class="font-bold text-gray-800 text-lg">${key.keyValue}</p>
                                    <p class="text-sm text-gray-600 mt-1">
                                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                            ${key.keyType}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <button onclick="deletePixKey('${key.id}')" class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition">
                                <i class="fas fa-trash"></i>
                            </button>
                        `;
                        pixKeysList.appendChild(keyCard);
                    }
                });
            }
        }
        
        if (pixKeysList.children.length === 0) {
            pixKeysList.innerHTML = '<div class="text-center text-gray-500 py-8">Nenhuma chave PIX encontrada. Crie uma nova chave.</div>';
        }
    } catch (error) {
        console.error('Error loading PIX keys:', error);
        showToast('error', 'Erro', 'Não foi possível carregar as chaves PIX');
    }
}

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions`);
        const data = await response.json();
        
        const transactionsList = document.getElementById('transactionsList');
        transactionsList.innerHTML = '';
        
        if (!data.success || data.data.length === 0) {
            transactionsList.innerHTML = '<div class="text-center text-gray-500 py-8">Nenhuma transação encontrada.</div>';
            return;
        }
        
        // Get accounts for name lookup
        const accountsResponse = await fetch(`${API_URL}/accounts`);
        const accountsData = await accountsResponse.json();
        const accounts = {};
        if (accountsData.success) {
            accountsData.data.forEach(acc => {
                accounts[acc.id] = acc;
            });
        }
        
        data.data.forEach(transaction => {
            const fromAccount = accounts[transaction.fromAccountId];
            const toAccount = accounts[transaction.toAccountId];
            
            const statusColor = {
                'COMPLETED': 'bg-green-100 text-green-800',
                'PENDING': 'bg-yellow-100 text-yellow-800',
                'FAILED': 'bg-red-100 text-red-800'
            }[transaction.status] || 'bg-gray-100 text-gray-800';
            
            const statusIcon = {
                'COMPLETED': 'fa-check-circle',
                'PENDING': 'fa-clock',
                'FAILED': 'fa-times-circle'
            }[transaction.status] || 'fa-circle';
            
            const transactionCard = document.createElement('div');
            transactionCard.className = 'bg-white border-2 border-gray-200 rounded-lg p-6 card-hover';
            transactionCard.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-4 flex-1">
                        <div class="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full p-3">
                            <i class="fas fa-exchange-alt text-white text-xl"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center space-x-2 mb-2">
                                <span class="px-3 py-1 ${statusColor} rounded-full text-xs font-semibold">
                                    <i class="fas ${statusIcon} mr-1"></i>${transaction.status}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 mb-1">
                                <strong>De:</strong> ${fromAccount ? fromAccount.name : 'N/A'}
                            </p>
                            <p class="text-sm text-gray-600 mb-1">
                                <strong>Para:</strong> ${toAccount ? toAccount.name : 'N/A'}
                            </p>
                            <p class="text-sm text-gray-600 mb-2">
                                <strong>Chave PIX:</strong> ${transaction.pixKey}
                            </p>
                            <p class="text-xs text-gray-500">
                                ${new Date(transaction.createdAt).toLocaleString('pt-BR')}
                            </p>
                            ${transaction.description ? `<p class="text-sm text-gray-600 mt-2 italic">${transaction.description}</p>` : ''}
                        </div>
                    </div>
                    <div class="text-right ml-4">
                        <p class="text-2xl font-bold text-gray-800">${formatCurrency(transaction.amount)}</p>
                        <p class="text-xs text-gray-500 mt-1">TXID: ${transaction.txid}</p>
                        ${transaction.status === 'COMPLETED' && !transaction.refundReason ? `
                            <button onclick="refundTransaction('${transaction.id}')" class="mt-2 text-red-500 hover:text-red-700 text-sm font-semibold">
                                <i class="fas fa-undo mr-1"></i>Estornar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            transactionsList.appendChild(transactionCard);
        });
    } catch (error) {
        console.error('Error loading transactions:', error);
        showToast('error', 'Erro', 'Não foi possível carregar as transações');
    }
}

// Load accounts for select dropdowns
async function loadAccountsForSelect() {
    try {
        const response = await fetch(`${API_URL}/accounts`);
        const data = await response.json();
        
        if (data.success) {
            const selects = [
                'pixKeyAccountId',
                'sendFromAccount',
                'qrAccountId'
            ];
            
            selects.forEach(selectId => {
                const select = document.getElementById(selectId);
                if (select) {
                    select.innerHTML = '<option value="">Selecione uma conta</option>';
                    data.data.forEach(account => {
                        const option = document.createElement('option');
                        option.value = account.id;
                        option.textContent = `${account.name} - ${formatCurrency(account.balance)}`;
                        select.appendChild(option);
                    });
                }
            });
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
    }
}

// View account details
async function viewAccountDetails(accountId) {
    try {
        const response = await fetch(`${API_URL}/accounts/${accountId}`);
        const data = await response.json();
        
        if (data.success) {
            const account = data.data;
            let message = `
Nome: ${account.name}
Documento: ${account.document} (${account.documentType})
Saldo: ${formatCurrency(account.balance)}

Chaves PIX cadastradas:
`;
            if (account.pixKeys && account.pixKeys.length > 0) {
                account.pixKeys.forEach(key => {
                    if (key.status === 'ACTIVE') {
                        message += `\n• ${key.keyType}: ${key.keyValue}`;
                    }
                });
            } else {
                message += '\nNenhuma chave PIX cadastrada';
            }
            
            alert(message);
        }
    } catch (error) {
        console.error('Error loading account details:', error);
        showToast('error', 'Erro', 'Não foi possível carregar os detalhes da conta');
    }
}

// Create account modal functions
function openCreateAccountModal() {
    loadAccountsForSelect();
    document.getElementById('createAccountModal').classList.add('active');
}

function closeCreateAccountModal() {
    document.getElementById('createAccountModal').classList.remove('active');
}

async function createAccount() {
    const name = document.getElementById('accountName').value;
    const documentType = document.getElementById('accountDocType').value;
    const document = document.getElementById('accountDocument').value;
    const balance = parseFloat(document.getElementById('accountBalance').value) || 0;
    
    if (!name || !document) {
        showToast('error', 'Erro', 'Preencha todos os campos obrigatórios');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, documentType, document, balance })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', 'Sucesso', 'Conta criada com sucesso!');
            closeCreateAccountModal();
            loadAccounts();
            loadStats();
            
            // Clear form
            document.getElementById('accountName').value = '';
            document.getElementById('accountDocument').value = '';
            document.getElementById('accountBalance').value = '1000';
        } else {
            showToast('error', 'Erro', data.error);
        }
    } catch (error) {
        console.error('Error creating account:', error);
        showToast('error', 'Erro', 'Não foi possível criar a conta');
    }
}

// Create PIX key modal functions
function openCreatePixKeyModal() {
    loadAccountsForSelect();
    document.getElementById('createPixKeyModal').classList.add('active');
}

function closeCreatePixKeyModal() {
    document.getElementById('createPixKeyModal').classList.remove('active');
}

async function createPixKey() {
    const accountId = document.getElementById('pixKeyAccountId').value;
    const keyType = document.getElementById('pixKeyType').value;
    const keyValue = document.getElementById('pixKeyValue').value;
    
    if (!accountId || !keyType || !keyValue) {
        showToast('error', 'Erro', 'Preencha todos os campos obrigatórios');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/pix/keys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountId, keyType, keyValue })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', 'Sucesso', 'Chave PIX criada com sucesso!');
            closeCreatePixKeyModal();
            loadPixKeys();
            loadStats();
            
            // Clear form
            document.getElementById('pixKeyValue').value = '';
        } else {
            showToast('error', 'Erro', data.error);
        }
    } catch (error) {
        console.error('Error creating PIX key:', error);
        showToast('error', 'Erro', 'Não foi possível criar a chave PIX');
    }
}

async function deletePixKey(keyId) {
    if (!confirm('Deseja realmente excluir esta chave PIX?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/pix/keys/${keyId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', 'Sucesso', 'Chave PIX removida com sucesso!');
            loadPixKeys();
            loadStats();
        } else {
            showToast('error', 'Erro', data.error);
        }
    } catch (error) {
        console.error('Error deleting PIX key:', error);
        showToast('error', 'Erro', 'Não foi possível excluir a chave PIX');
    }
}

// Send PIX modal functions
function openSendPixModal() {
    loadAccountsForSelect();
    document.getElementById('sendPixModal').classList.add('active');
}

function closeSendPixModal() {
    document.getElementById('sendPixModal').classList.remove('active');
}

async function sendPix() {
    const fromAccountId = document.getElementById('sendFromAccount').value;
    const pixKey = document.getElementById('sendToPixKey').value;
    const amount = parseFloat(document.getElementById('sendAmount').value);
    const description = document.getElementById('sendDescription').value;
    
    if (!fromAccountId || !pixKey || !amount) {
        showToast('error', 'Erro', 'Preencha todos os campos obrigatórios');
        return;
    }
    
    if (amount <= 0) {
        showToast('error', 'Erro', 'O valor deve ser maior que zero');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromAccountId, pixKey, amount, description })
        });
        
        const data = await response.json();
        
        if (data.success && data.data.status === 'COMPLETED') {
            showToast('success', 'Sucesso', `PIX de ${formatCurrency(amount)} enviado com sucesso!`);
            closeSendPixModal();
            loadTransactions();
            loadAccounts();
            loadStats();
            
            // Clear form
            document.getElementById('sendToPixKey').value = '';
            document.getElementById('sendAmount').value = '';
            document.getElementById('sendDescription').value = '';
        } else {
            showToast('error', 'Erro', data.data?.failReason || data.error);
        }
    } catch (error) {
        console.error('Error sending PIX:', error);
        showToast('error', 'Erro', 'Não foi possível enviar o PIX');
    }
}

// Generate QR Code
async function generateQRCode() {
    const type = document.getElementById('qrType').value;
    const accountId = document.getElementById('qrAccountId').value;
    const amount = parseFloat(document.getElementById('qrAmount').value);
    const description = document.getElementById('qrDescription').value;
    
    if (!accountId) {
        showToast('error', 'Erro', 'Selecione uma conta');
        return;
    }
    
    if (!amount || amount <= 0) {
        showToast('error', 'Erro', 'Digite um valor válido');
        return;
    }
    
    try {
        let response;
        
        if (type === 'static') {
            const pixKey = document.getElementById('qrPixKey').value;
            if (!pixKey) {
                showToast('error', 'Erro', 'Digite a chave PIX');
                return;
            }
            
            response = await fetch(`${API_URL}/pix/qrcode/static`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId, pixKey, amount, description })
            });
        } else {
            response = await fetch(`${API_URL}/pix/qrcode/dynamic`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId, amount, description, expiresIn: 30 })
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            const qrCodeResult = document.getElementById('qrCodeResult');
            qrCodeResult.innerHTML = `
                <div class="animate-fade-in">
                    <img src="${data.data.qrCodeImage}" alt="QR Code PIX" class="mx-auto mb-4 rounded-lg shadow-lg">
                    <div class="bg-white rounded-lg p-4 text-left">
                        <p class="text-sm text-gray-600 mb-2"><strong>Valor:</strong> ${formatCurrency(amount)}</p>
                        <p class="text-sm text-gray-600 mb-2"><strong>TXID:</strong> ${data.data.txid}</p>
                        ${data.data.expiresAt ? `<p class="text-sm text-gray-600 mb-2"><strong>Expira em:</strong> ${new Date(data.data.expiresAt).toLocaleString('pt-BR')}</p>` : ''}
                        <div class="mt-4">
                            <label class="block text-xs text-gray-500 mb-1">Payload PIX Copia e Cola:</label>
                            <textarea readonly class="w-full p-2 text-xs bg-gray-100 rounded border" rows="3">${data.data.payload}</textarea>
                        </div>
                    </div>
                </div>
            `;
            showToast('success', 'Sucesso', 'QR Code gerado com sucesso!');
        } else {
            showToast('error', 'Erro', data.error);
        }
    } catch (error) {
        console.error('Error generating QR Code:', error);
        showToast('error', 'Erro', 'Não foi possível gerar o QR Code');
    }
}

// Refund transaction
async function refundTransaction(transactionId) {
    const reason = prompt('Digite o motivo do estorno:');
    if (!reason) return;
    
    try {
        const response = await fetch(`${API_URL}/transactions/${transactionId}/refund`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', 'Sucesso', 'Estorno realizado com sucesso!');
            loadTransactions();
            loadAccounts();
            loadStats();
        } else {
            showToast('error', 'Erro', data.error);
        }
    } catch (error) {
        console.error('Error refunding transaction:', error);
        showToast('error', 'Erro', 'Não foi possível realizar o estorno');
    }
}

// Utility functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function showToast(type, title, message) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    const icons = {
        success: '<i class="fas fa-check-circle text-green-500 text-2xl"></i>',
        error: '<i class="fas fa-times-circle text-red-500 text-2xl"></i>',
        info: '<i class="fas fa-info-circle text-blue-500 text-2xl"></i>'
    };
    
    toastIcon.innerHTML = icons[type] || icons.info;
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    toast.classList.remove('translate-x-full');
    
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 4000);
}

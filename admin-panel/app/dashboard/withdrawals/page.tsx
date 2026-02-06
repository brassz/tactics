'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, CheckCircle, CreditCard, MessageCircle, Send } from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  id_solicitacao: string;
  id_user: string;
  nome_completo: string;
  cpf: string;
  chave_pix: string;
  status: string;
  data_pagamento: string | null;
  created_at: string;
  solicitacoes_valores: {
    valor: number;
    users: {
      nome: string;
      telefone: string | null;
    };
  };
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [filter, setFilter] = useState<string>('pendente');

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select(`
        *,
        solicitacoes_valores (
          valor,
          users (
            nome,
            telefone
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading withdrawals:', error);
    }

    setWithdrawals(data || []);
    setLoading(false);
  };

  const markAsPaid = async (withdrawalId: string, withdrawal: WithdrawalRequest) => {
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({
        status: 'pago',
        data_pagamento: new Date().toISOString(),
      })
      .eq('id', withdrawalId);

    if (!error) {
      loadWithdrawals();
      // Perguntar se deseja enviar colinha
      if (confirm('Pagamento marcado como realizado! Deseja enviar a colinha de pagamento via WhatsApp?')) {
        sendPaymentReceipt(withdrawal);
      }
    }
  };

  const createCharge = async (withdrawal: WithdrawalRequest, sendColinha: boolean = false) => {
    const valor = withdrawal.solicitacoes_valores.valor;
    // Taxa de juros: 40% para valores abaixo de R$ 1.000,00 | 30% para R$ 1.000,00 ou mais
    const interestRate = valor < 1000 ? 40.00 : 30.00;
    const totalAmount = valor + (valor * interestRate / 100);
    
    // Calcular data de vencimento (30 dias = 1 mês)
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);

    const { error } = await supabase.from('cobrancas').insert([
      {
        id_user: withdrawal.id_user,
        valor: totalAmount,
        descricao: `Cobrança do empréstimo - Valor original: R$ ${valor.toFixed(2)} + Juros (${interestRate}%): R$ ${(totalAmount - valor).toFixed(2)}`,
        data_vencimento: dueDate.toISOString().split('T')[0],
        status: 'pendente',
      },
    ]);

    if (!error) {
      setShowChargeModal(false);
      setSelectedWithdrawal(null);
      alert('Cobrança criada com sucesso!');
      loadWithdrawals();
      
      // Se solicitado, enviar colinha após criar cobrança
      if (sendColinha) {
        sendReminder(withdrawal);
      }
    } else {
      alert('Erro ao criar cobrança');
    }
  };

  const sendPaymentReceipt = (withdrawal: WithdrawalRequest) => {
    const valor = withdrawal.solicitacoes_valores.valor;
    // Taxa de juros: 40% para valores abaixo de R$ 1.000,00 | 30% para R$ 1.000,00 ou mais
    const interestRate = valor < 1000 ? 40.00 : 30.00;
    const totalAmount = valor + (valor * interestRate / 100);
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);
    
    const message = `✅ *Pagamento Realizado!*\n\n` +
      `Olá ${withdrawal.nome_completo}!\n\n` +
      `Seu saque foi processado com sucesso.\n\n` +
      `💰 *Valor recebido:* R$ ${valor.toFixed(2)}\n` +
      `📅 *Data do pagamento:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
      `📋 *Próximo vencimento:*\n` +
      `Valor do empréstimo: R$ ${valor.toFixed(2)}\n` +
      `Juros (${interestRate}%): R$ ${(totalAmount - valor).toFixed(2)}\n` +
      `Valor total: R$ ${totalAmount.toFixed(2)}\n` +
      `Vencimento: ${dueDate.toLocaleDateString('pt-BR')}\n\n` +
      `💡 *Lembrete:* Em ${dueDate.toLocaleDateString('pt-BR')} você terá o pagamento integral do valor ou do juros para renovação.\n\n` +
      `Obrigado por escolher nossos serviços! 🎉`;

    const phone = withdrawal.solicitacoes_valores.users.telefone;
    if (phone) {
      const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Telefone do cliente não cadastrado');
    }
  };

  const sendReminder = (withdrawal: WithdrawalRequest) => {
    const valor = withdrawal.solicitacoes_valores.valor;
    // Taxa de juros: 40% para valores abaixo de R$ 1.000,00 | 30% para R$ 1.000,00 ou mais
    const interestRate = valor < 1000 ? 40.00 : 30.00;
    const totalAmount = valor + (valor * interestRate / 100);
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);
    
    const message = `📋 *Colinha de Pagamento*\n\n` +
      `Olá ${withdrawal.nome_completo}!\n\n` +
      `Lembrete: Você tem um pagamento agendado.\n\n` +
      `💰 *Detalhes do Empréstimo:*\n` +
      `Valor do empréstimo: R$ ${valor.toFixed(2)}\n` +
      `Juros (${interestRate}%): R$ ${(totalAmount - valor).toFixed(2)}\n` +
      `Valor total: R$ ${totalAmount.toFixed(2)}\n` +
      `Vencimento: ${dueDate.toLocaleDateString('pt-BR')}\n\n` +
      `💡 *Importante:* Em ${dueDate.toLocaleDateString('pt-BR')} você terá o pagamento integral do valor ou do juros para renovação.\n\n` +
      `Por favor, mantenha-se em dia com seus pagamentos! 📅`;

    const phone = withdrawal.solicitacoes_valores.users.telefone;
    if (phone) {
      const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Telefone do cliente não cadastrado');
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitações de Saque</h1>
        <p className="text-gray-600">Gerencie os saques dos clientes</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('pendente')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filter === 'pendente'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('pago')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filter === 'pago'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pagos
          </button>
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="space-y-4">
        {filteredWithdrawals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Nenhuma solicitação de saque encontrada</p>
          </div>
        ) : (
          filteredWithdrawals.map((withdrawal) => (
            <div key={withdrawal.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {withdrawal.nome_completo}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        withdrawal.status === 'pago'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {withdrawal.status === 'pago' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">CPF: {withdrawal.cpf}</p>
                  <p className="text-sm text-gray-600">Chave PIX: {withdrawal.chave_pix}</p>
                  {withdrawal.data_pagamento && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Pago em {new Date(withdrawal.data_pagamento).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(withdrawal.data_pagamento).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Solicitado em {new Date(withdrawal.created_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(withdrawal.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    R$ {parseFloat(withdrawal.solicitacoes_valores.valor.toString()).toFixed(2)}
                  </p>
                </div>
              </div>

            <div className="flex gap-2 flex-wrap">
              {withdrawal.status === 'pendente' && (
                <button
                  onClick={() => markAsPaid(withdrawal.id, withdrawal)}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Marcar como Pago
                </button>
              )}
              {withdrawal.status === 'pago' && (
                <>
                  <button
                    onClick={() => {
                      setSelectedWithdrawal(withdrawal);
                      setShowChargeModal(true);
                    }}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard size={20} />
                    Criar Cobrança
                  </button>
                  <button
                    onClick={() => sendReminder(withdrawal)}
                    className="flex-1 bg-purple-500 text-white py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={20} />
                    Enviar Colinha
                  </button>
                  <button
                    onClick={() => sendPaymentReceipt(withdrawal)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Enviar Comprovante
                  </button>
                </>
              )}
            </div>
          </div>
          ))
        )}
      </div>

      {/* Charge Modal */}
      {showChargeModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Criar Cobrança</h2>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-medium text-gray-900">{selectedWithdrawal.nome_completo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor do Empréstimo</p>
                <p className="font-medium text-gray-900">
                  R$ {parseFloat(selectedWithdrawal.solicitacoes_valores.valor.toString()).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Juros ({(() => {
                    const valor = selectedWithdrawal.solicitacoes_valores?.valor 
                      ? parseFloat(selectedWithdrawal.solicitacoes_valores.valor.toString())
                      : 0;
                    return valor < 1000 ? '40%' : '30%';
                  })()})
                </p>
                <p className="font-medium text-gray-900">
                  R$ {selectedWithdrawal.solicitacoes_valores?.valor
                    ? (() => {
                        const valor = parseFloat(selectedWithdrawal.solicitacoes_valores.valor.toString());
                        const interestRate = valor < 1000 ? 0.4 : 0.3;
                        return (valor * interestRate).toFixed(2);
                      })()
                    : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="font-medium text-gray-900 text-2xl">
                  R$ {selectedWithdrawal.solicitacoes_valores?.valor
                    ? (() => {
                        const valor = parseFloat(selectedWithdrawal.solicitacoes_valores.valor.toString());
                        const interestRate = valor < 1000 ? 0.4 : 0.3;
                        return (valor * (1 + interestRate)).toFixed(2);
                      })()
                    : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vencimento</p>
                <p className="font-medium text-gray-900">
                  {(() => {
                    const dueDate = new Date();
                    dueDate.setMonth(dueDate.getMonth() + 1);
                    return dueDate.toLocaleDateString('pt-BR');
                  })()}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => createCharge(selectedWithdrawal, false)}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                Criar Cobrança
              </button>
              <button
                onClick={() => createCharge(selectedWithdrawal, true)}
                className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                <MessageCircle size={20} />
                Criar Cobrança e Enviar Colinha
              </button>
              <button
                onClick={() => {
                  setShowChargeModal(false);
                  setSelectedWithdrawal(null);
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


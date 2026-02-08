'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, CheckCircle, CreditCard, MessageCircle, Send, Copy, Check } from 'lucide-react';

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
  solicitacoes_valores?: {
    valor: number;
    id_user?: string;
    users?: {
      nome: string;
      telefone: string | null;
    };
  };
  users?: {
    nome: string;
    telefone?: string | null;
    phone?: string | null;
  };
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedPix, setCopiedPix] = useState<string | null>(null);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      // Primeiro buscar os saques
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalsError) {
        console.error('Error loading withdrawals:', withdrawalsError);
        alert('Erro ao carregar saques: ' + withdrawalsError.message);
        setWithdrawals([]);
        return;
      }

      if (!withdrawalsData || withdrawalsData.length === 0) {
        setWithdrawals([]);
        return;
      }

      // Buscar dados relacionados para cada saque
      const withdrawalsWithData = await Promise.all(
        withdrawalsData.map(async (withdrawal) => {
          // Buscar dados da solicitação
          const { data: solicitacaoData } = await supabase
            .from('solicitacoes_valores')
            .select('valor, id_user')
            .eq('id', withdrawal.id_solicitacao)
            .single();

          // Buscar dados do usuário
          const { data: userData } = await supabase
            .from('users')
            .select('nome, telefone, phone')
            .eq('id', withdrawal.id_user)
            .single();

          return {
            ...withdrawal,
            solicitacoes_valores: solicitacaoData || { valor: 0, id_user: withdrawal.id_user },
            users: userData ? {
              nome: userData.nome || '',
              telefone: userData.telefone || userData.phone || null,
            } : { nome: '', telefone: null },
          };
        })
      );

      setWithdrawals(withdrawalsWithData);
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Erro inesperado ao carregar saques');
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const copyPixKey = async (pixKey: string, withdrawalId: string) => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopiedPix(withdrawalId);
      setTimeout(() => setCopiedPix(null), 2000);
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = pixKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedPix(withdrawalId);
      setTimeout(() => setCopiedPix(null), 2000);
    }
  };

  const openPaymentModal = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setShowPaymentModal(true);
  };

  const markAsPaid = async (withdrawalId: string, withdrawal: WithdrawalRequest) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString(),
        })
        .eq('id', withdrawalId);

      if (error) {
        console.error('Error marking as paid:', error);
        alert('Erro ao marcar como pago: ' + error.message);
        return;
      }

      setShowPaymentModal(false);
      await loadWithdrawals();
      
      // Enviar comprovante automaticamente após um pequeno delay
      setTimeout(() => {
        sendPaymentReceipt(withdrawal);
      }, 1000);
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Erro inesperado ao marcar como pago');
    }
  };

  const createCharge = async (withdrawal: WithdrawalRequest, sendColinha: boolean = false) => {
    const valor = withdrawal.solicitacoes_valores?.valor || 0;
    // Taxa de juros: 40% para valores abaixo de R$ 1.000,00 | 30% para R$ 1.000,00 ou mais
    const interestRate = valor < 1000 ? 40.00 : 30.00;
    const totalAmount = valor + (valor * interestRate / 100);
    
    // Calcular data de vencimento (30 dias = 1 mês)
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);
    const dueDateString = dueDate.toISOString().split('T')[0];

    // Criar cobrança
    const { error: chargeError } = await supabase.from('cobrancas').insert([
      {
        id_user: withdrawal.id_user,
        valor: totalAmount,
        descricao: `Cobrança do empréstimo - Valor original: R$ ${valor.toFixed(2)} + Juros (${interestRate}%): R$ ${(totalAmount - valor).toFixed(2)}`,
        data_vencimento: dueDateString,
        status: 'pendente',
      },
    ]);

    if (chargeError) {
      alert('Erro ao criar cobrança: ' + chargeError.message);
      return;
    }

    // Apenas criar cobrança - não criar pagamento na tabela pagamentos

    setShowChargeModal(false);
    setSelectedWithdrawal(null);
    alert('Cobrança criada com sucesso!');
    loadWithdrawals();
    
    // Se solicitado, enviar colinha após criar cobrança
    if (sendColinha) {
      sendReminder(withdrawal);
    }
  };

  const sendPaymentReceipt = async (withdrawal: WithdrawalRequest) => {
    try {
      // Buscar telefone do usuário se não estiver disponível
      let phone = null;
      
      // Tentar primeiro nos dados já carregados
      if (withdrawal.users?.telefone) {
        phone = withdrawal.users.telefone;
      } else if (withdrawal.users?.phone) {
        phone = withdrawal.users.phone;
      } else if (withdrawal.solicitacoes_valores?.users?.telefone) {
        phone = withdrawal.solicitacoes_valores.users.telefone;
      } else if (withdrawal.solicitacoes_valores?.users?.phone) {
        phone = withdrawal.solicitacoes_valores.users.phone;
      }
      
      // Se ainda não encontrou, buscar diretamente do banco
      if (!phone) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('telefone, phone')
          .eq('id', withdrawal.id_user)
          .single();
        
        if (userError) {
          console.error('Error loading user phone:', userError);
        } else {
          phone = userData?.telefone || userData?.phone || null;
        }
      }

      if (!phone || phone.trim() === '') {
        alert('Telefone do cliente não cadastrado. Não foi possível enviar o comprovante.\n\nPor favor, cadastre o telefone do cliente antes de enviar o comprovante.');
        return;
      }

      const valor = withdrawal.solicitacoes_valores?.valor || 0;
      // Taxa de juros: 40% para valores abaixo de R$ 1.000,00 | 30% para R$ 1.000,00 ou mais
      const interestRate = valor < 1000 ? 40.00 : 30.00;
      const totalAmount = valor + (valor * interestRate / 100);
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);
      
      const message = `✅ *Pagamento Realizado com Sucesso!*\n\n` +
        `Olá ${withdrawal.nome_completo}!\n\n` +
        `Agradecemos pela confiança em nossos serviços! 🎉\n\n` +
        `Seu saque foi processado e o pagamento foi realizado com sucesso.\n\n` +
        `💰 *Valor recebido:* R$ ${valor.toFixed(2).replace('.', ',')}\n` +
        `📅 *Data do pagamento:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
        `📋 *Informações do Vencimento (daqui 30 dias):*\n` +
        `Valor do empréstimo: R$ ${valor.toFixed(2).replace('.', ',')}\n` +
        `Juros (${interestRate}%): R$ ${(totalAmount - valor).toFixed(2).replace('.', ',')}\n` +
        `Valor total: R$ ${totalAmount.toFixed(2).replace('.', ',')}\n` +
        `Vencimento: ${dueDate.toLocaleDateString('pt-BR')}\n\n` +
        `💡 *Lembrete Importante:*\n` +
        `Em ${dueDate.toLocaleDateString('pt-BR')} você terá o pagamento integral do valor ou do juros para renovação.\n\n` +
        `Por favor, mantenha-se em dia com seus pagamentos para continuar utilizando nossos serviços.\n\n` +
        `Obrigado por escolher nossos serviços! 🙏\n\n` +
        `Qualquer dúvida, estamos à disposição! 📱`;

      const cleanPhone = phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error('Error sending receipt:', err);
      alert('Erro ao enviar comprovante. Tente novamente.');
    }
  };

  const sendReminder = async (withdrawal: WithdrawalRequest) => {
    try {
      // Buscar telefone do usuário se não estiver disponível
      let phone = null;
      
      // Tentar primeiro nos dados já carregados
      if (withdrawal.users?.telefone) {
        phone = withdrawal.users.telefone;
      } else if (withdrawal.users?.phone) {
        phone = withdrawal.users.phone;
      } else if (withdrawal.solicitacoes_valores?.users?.telefone) {
        phone = withdrawal.solicitacoes_valores.users.telefone;
      } else if (withdrawal.solicitacoes_valores?.users?.phone) {
        phone = withdrawal.solicitacoes_valores.users.phone;
      }
      
      // Se ainda não encontrou, buscar diretamente do banco
      if (!phone) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('telefone, phone')
          .eq('id', withdrawal.id_user)
          .single();
        
        if (userError) {
          console.error('Error loading user phone:', userError);
        } else {
          phone = userData?.telefone || userData?.phone || null;
        }
      }

      if (!phone || phone.trim() === '') {
        alert('Telefone do cliente não cadastrado.\n\nPor favor, cadastre o telefone do cliente antes de enviar o lembrete.');
        return;
      }

      const valor = withdrawal.solicitacoes_valores?.valor || 0;
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

      const cleanPhone = phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error('Error sending reminder:', err);
      alert('Erro ao enviar lembrete. Tente novamente.');
    }
  };

  const filteredWithdrawals = withdrawals.filter((w: WithdrawalRequest) => {
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
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('pendente')}
          className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
            filter === 'pendente'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setFilter('pago')}
          className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
            filter === 'pago'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pagos
        </button>
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
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm text-gray-600">Chave PIX:</p>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                      <span className="text-sm font-mono text-gray-900">{withdrawal.chave_pix}</span>
                      <button
                        onClick={() => copyPixKey(withdrawal.chave_pix, withdrawal.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copiar chave PIX"
                      >
                        {copiedPix === withdrawal.id ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} className="text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
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
                    R$ {withdrawal.solicitacoes_valores?.valor 
                      ? parseFloat(withdrawal.solicitacoes_valores.valor.toString()).toFixed(2)
                      : '0.00'}
                  </p>
                </div>
              </div>

            <div className="flex gap-2 flex-wrap">
              {withdrawal.status === 'pendente' && (
                <>
                  <button
                    onClick={() => openPaymentModal(withdrawal)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Wallet size={20} />
                    Realizar Pagamento
                  </button>
                  <button
                    onClick={() => markAsPaid(withdrawal.id, withdrawal)}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Marcar como Pago
                  </button>
                </>
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

      {/* Payment Modal */}
      {showPaymentModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Realizar Pagamento PIX</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cliente</p>
                <p className="font-semibold text-gray-900 text-lg">{selectedWithdrawal.nome_completo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Valor a Pagar</p>
                <p className="font-bold text-blue-600 text-3xl">
                  R$ {selectedWithdrawal.solicitacoes_valores?.valor
                    ? parseFloat(selectedWithdrawal.solicitacoes_valores.valor.toString()).toFixed(2).replace('.', ',')
                    : '0,00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Chave PIX</p>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg border-2 border-blue-200">
                  <span className="text-base font-mono text-gray-900 flex-1 break-all">
                    {selectedWithdrawal.chave_pix}
                  </span>
                  <button
                    onClick={() => copyPixKey(selectedWithdrawal.chave_pix, selectedWithdrawal.id)}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    title="Copiar chave PIX"
                  >
                    {copiedPix === selectedWithdrawal.id ? (
                      <>
                        <Check size={18} />
                        <span className="text-sm">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span className="text-sm">Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Copie a chave PIX acima e realize o pagamento no seu aplicativo bancário
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => markAsPaid(selectedWithdrawal.id, selectedWithdrawal)}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Confirmar Pagamento e Enviar Colinha
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
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
                  R$ {selectedWithdrawal.solicitacoes_valores?.valor
                    ? parseFloat(selectedWithdrawal.solicitacoes_valores.valor.toString()).toFixed(2)
                    : '0.00'}
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


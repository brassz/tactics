'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Plus, Edit, Send, MessageCircle } from 'lucide-react';

interface Payment {
  id: string;
  id_user: string;
  valor: number;
  valor_total?: number;
  valor_juros?: number;
  valor_capital?: number;
  valor_pago?: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  users: {
    nome: string;
    cpf: string;
    telefone: string | null;
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'integral' | 'juros' | 'parcial'>('integral');

  // Form state
  const [formData, setFormData] = useState({
    id_user: '',
    valor: '',
    data_vencimento: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [paymentsRes, usersRes] = await Promise.all([
      supabase
        .from('pagamentos')
        .select('*, users(nome, cpf, telefone)')
        .order('data_vencimento', { ascending: true }),
      supabase
        .from('users')
        .select('*')
        .eq('status', 'aprovado')
        .order('nome', { ascending: true }),
    ]);

    setPayments(paymentsRes.data || []);
    setUsers(usersRes.data || []);
    setLoading(false);
  };

  const sendPaymentWhatsApp = (payment: Payment) => {
    if (!payment.users.telefone) {
      alert('Cliente não possui número de telefone cadastrado');
      return;
    }

    const phone = payment.users.telefone.replace(/\D/g, '');
    const valorFormatado = parseFloat(payment.valor.toString()).toFixed(2).replace('.', ',');
    const dataVencimento = new Date(payment.data_vencimento).toLocaleDateString('pt-BR');
    
    let message = `Olá ${payment.users.nome}! 👋\n\n`;
    message += `Este é um lembrete de pagamento pendente:\n\n`;
    message += `💰 *Valor:* R$ ${valorFormatado}\n`;
    message += `📅 *Vencimento:* ${dataVencimento}\n\n`;
    message += `Por favor, realize o pagamento até a data de vencimento.\n`;
    message += `\nEm caso de dúvidas, entre em contato conosco! 📱`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('pagamentos').insert([
      {
        id_user: formData.id_user,
        valor: parseFloat(formData.valor),
        data_vencimento: formData.data_vencimento,
        status: 'pendente',
      },
    ]);

    if (!error) {
      setShowModal(false);
      setFormData({ id_user: '', valor: '', data_vencimento: '' });
      loadData();
    }
  };

  const markAsPaid = async (paymentId: string, payment?: Payment) => {
    if (payment && (payment.valor_total || payment.valor_juros || payment.valor_capital)) {
      // Se tem campos de abatimento, abrir modal para escolher tipo de pagamento
      setSelectedPayment(payment);
      setShowPaymentModal(true);
      return;
    }

    // Pagamento simples (sem abatimento)
    const { error } = await supabase
      .from('pagamentos')
      .update({
        status: 'pago',
        data_pagamento: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (!error) {
      loadData();
    }
  };

  const processPayment = async () => {
    if (!selectedPayment || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      alert('O valor deve ser maior que zero');
      return;
    }

    const total = selectedPayment.valor_total || selectedPayment.valor;
    const juros = selectedPayment.valor_juros || 0;
    const capital = selectedPayment.valor_capital || (total - juros);
    const alreadyPaid = selectedPayment.valor_pago || 0;
    const remaining = total - alreadyPaid;

    if (amount > remaining) {
      alert(`O valor não pode ser maior que o restante (R$ ${remaining.toFixed(2)})`);
      return;
    }

    let newPaidAmount = alreadyPaid + amount;
    let newStatus = newPaidAmount >= total ? 'pago' : 'pendente';

    const { error } = await supabase
      .from('pagamentos')
      .update({
        valor_pago: newPaidAmount,
        status: newStatus,
        data_pagamento: newStatus === 'pago' ? new Date().toISOString() : selectedPayment.data_pagamento,
      })
      .eq('id', selectedPayment.id);

    if (!error) {
      setShowPaymentModal(false);
      setSelectedPayment(null);
      setPaymentAmount('');
      setPaymentType('integral');
      loadData();
      alert('Pagamento registrado com sucesso!');
    } else {
      console.error('Erro ao registrar pagamento:', error);
      alert('Erro ao registrar pagamento');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pendente: 'bg-yellow-100 text-yellow-800',
      pago: 'bg-green-100 text-green-800',
      atrasado: 'bg-red-100 text-red-800',
      cancelado: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      pendente: 'Pendente',
      pago: 'Pago',
      atrasado: 'Atrasado',
      cancelado: 'Cancelado',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const stats = {
    total: payments.reduce((acc, p) => acc + parseFloat(p.valor.toString()), 0),
    pendente: payments
      .filter((p) => p.status === 'pendente' || p.status === 'atrasado')
      .reduce((acc, p) => acc + parseFloat(p.valor.toString()), 0),
    pago: payments
      .filter((p) => p.status === 'pago')
      .reduce((acc, p) => acc + parseFloat(p.valor.toString()), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Controle de Pagamentos
          </h1>
          <p className="text-gray-600">
            Gerencie os pagamentos dos clientes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Pagamento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm">Total Geral</p>
          <p className="text-3xl font-bold text-gray-900">
            R$ {stats.total.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm">Pendente</p>
          <p className="text-3xl font-bold text-yellow-600">
            R$ {stats.pendente.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm">Recebido</p>
          <p className="text-3xl font-bold text-green-600">
            R$ {stats.pago.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {payment.users.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.users.cpf}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">
                      R$ {parseFloat(payment.valor.toString()).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(payment.data_vencimento).toLocaleDateString(
                      'pt-BR'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2 items-center">
                      {payment.users.telefone && payment.status === 'pendente' && (
                        <button
                          onClick={() => sendPaymentWhatsApp(payment)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Enviar lembrete via WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </button>
                      )}
                      {payment.status === 'pendente' && (
                        <button
                          onClick={() => markAsPaid(payment.id, payment)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Registrar Pagamento
                        </button>
                      )}
                      {payment.status === 'pago' && payment.data_pagamento && (
                        <span className="text-sm text-gray-500">
                          Pago em{' '}
                          {new Date(payment.data_pagamento).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Novo Pagamento
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cliente
                </label>
                <select
                  value={formData.id_user}
                  onChange={(e) =>
                    setFormData({ ...formData, id_user: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nome} - {user.cpf}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data_vencimento: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                  Criar Pagamento
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      id_user: '',
                      valor: '',
                      data_vencimento: '',
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Registrar Pagamento
            </h2>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {(selectedPayment.valor_total || selectedPayment.valor).toFixed(2)}
                </p>
              </div>

              {selectedPayment.valor_juros && selectedPayment.valor_capital && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">
                    Juros ({(() => {
                      const capital = parseFloat(selectedPayment.valor_capital.toString());
                      return capital < 1000 ? '40%' : '30%';
                    })()})
                  </p>
                  <p className="text-xl font-semibold text-blue-900">
                    R$ {selectedPayment.valor_juros.toFixed(2)}
                  </p>
                </div>
              )}

              {selectedPayment.valor_capital && (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Capital</p>
                  <p className="text-xl font-semibold text-green-900">
                    R$ {selectedPayment.valor_capital.toFixed(2)}
                  </p>
                </div>
              )}

              {selectedPayment.valor_pago && selectedPayment.valor_pago > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Já Pago</p>
                  <p className="text-xl font-semibold text-yellow-900">
                    R$ {selectedPayment.valor_pago.toFixed(2)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Pagamento
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => {
                    setPaymentType(e.target.value as 'integral' | 'juros' | 'parcial');
                    const total = selectedPayment.valor_total || selectedPayment.valor;
                    const juros = selectedPayment.valor_juros || 0;
                    const alreadyPaid = selectedPayment.valor_pago || 0;
                    const remaining = total - alreadyPaid;
                    
                    if (e.target.value === 'integral') {
                      // Pagamento integral: valor restante total
                      setPaymentAmount(remaining.toFixed(2));
                    } else if (e.target.value === 'juros') {
                      // Apenas juros: valor dos juros restantes
                      const jurosRestantes = Math.max(0, juros - alreadyPaid);
                      setPaymentAmount(jurosRestantes.toFixed(2));
                    } else {
                      // Parcial: permitir qualquer valor
                      setPaymentAmount('');
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="integral">Pagamento Integral</option>
                  <option value="juros">Apenas Juros</option>
                  <option value="parcial">Pagamento Parcial (Qualquer Valor)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor a Pagar
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
                {paymentType === 'parcial' && (
                  <p className="text-xs text-gray-500 mt-1">
                    O valor será abatido primeiro dos juros, depois do capital
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={processPayment}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                Registrar Pagamento
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                  setPaymentAmount('');
                  setPaymentType('integral');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
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

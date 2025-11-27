'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Send, CheckCircle, XCircle, Clock, MessageCircle } from 'lucide-react';

interface Charge {
  id: string;
  id_user: string;
  valor: number;
  descricao: string;
  data_vencimento: string;
  status: string;
  link_pagamento: string | null;
  enviado_whatsapp: boolean;
  data_envio_whatsapp: string | null;
  created_at: string;
  users: {
    nome: string;
    cpf: string;
    telefone: string | null;
  };
}

export default function ChargesPage() {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    id_user: '',
    valor: '',
    descricao: '',
    data_vencimento: '',
    link_pagamento: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [chargesRes, usersRes] = await Promise.all([
      supabase
        .from('cobrancas')
        .select('*, users(nome, cpf, telefone)')
        .order('created_at', { ascending: false }),
      supabase
        .from('users')
        .select('*')
        .eq('status', 'aprovado')
        .order('nome', { ascending: true }),
    ]);

    setCharges(chargesRes.data || []);
    setUsers(usersRes.data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('cobrancas').insert([
      {
        id_user: formData.id_user,
        valor: parseFloat(formData.valor),
        descricao: formData.descricao,
        data_vencimento: formData.data_vencimento,
        link_pagamento: formData.link_pagamento || null,
        status: 'pendente',
      },
    ]);

    if (!error) {
      setShowModal(false);
      setFormData({
        id_user: '',
        valor: '',
        descricao: '',
        data_vencimento: '',
        link_pagamento: '',
      });
      loadData();
    }
  };

  const sendWhatsApp = (charge: Charge) => {
    if (!charge.users.telefone) {
      alert('Cliente não possui número de telefone cadastrado');
      return;
    }

    // Remove caracteres não numéricos do telefone
    const phone = charge.users.telefone.replace(/\D/g, '');
    
    // Formatar valor em Reais
    const valorFormatado = parseFloat(charge.valor.toString()).toFixed(2).replace('.', ',');
    
    // Formatar data de vencimento
    const dataVencimento = new Date(charge.data_vencimento).toLocaleDateString('pt-BR');
    
    // Criar mensagem personalizada
    let message = `Olá ${charge.users.nome}! 👋\n\n`;
    message += `Você possui uma cobrança pendente:\n\n`;
    message += `📋 *Descrição:* ${charge.descricao}\n`;
    message += `💰 *Valor:* R$ ${valorFormatado}\n`;
    message += `📅 *Vencimento:* ${dataVencimento}\n`;
    
    if (charge.link_pagamento) {
      message += `\n🔗 *Link de pagamento:*\n${charge.link_pagamento}\n`;
    }
    
    message += `\nPor favor, realize o pagamento até a data de vencimento.\n`;
    message += `\nEm caso de dúvidas, entre em contato conosco! 📱`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Abrir WhatsApp
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    // Marcar como enviado
    updateWhatsAppStatus(charge.id);
  };

  const updateWhatsAppStatus = async (chargeId: string) => {
    await supabase
      .from('cobrancas')
      .update({
        enviado_whatsapp: true,
        data_envio_whatsapp: new Date().toISOString(),
      })
      .eq('id', chargeId);

    loadData();
  };

  const updateChargeStatus = async (chargeId: string, status: string) => {
    await supabase
      .from('cobrancas')
      .update({ status })
      .eq('id', chargeId);

    loadData();
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

  const filteredCharges = charges.filter((charge) => {
    if (filter === 'all') return true;
    return charge.status === filter;
  });

  const stats = {
    total: charges.reduce((acc, c) => acc + parseFloat(c.valor.toString()), 0),
    pendente: charges
      .filter((c) => c.status === 'pendente' || c.status === 'atrasado')
      .reduce((acc, c) => acc + parseFloat(c.valor.toString()), 0),
    recebido: charges
      .filter((c) => c.status === 'pago')
      .reduce((acc, c) => acc + parseFloat(c.valor.toString()), 0),
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
            Cobranças de Clientes
          </h1>
          <p className="text-gray-600">
            Gerencie cobranças e envie via WhatsApp
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Cobrança
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm">Total a Receber</p>
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
            R$ {stats.recebido.toFixed(2)}
          </p>
        </div>
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
            Pagas
          </button>
          <button
            onClick={() => setFilter('atrasado')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filter === 'atrasado'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Atrasadas
          </button>
        </div>
      </div>

      {/* Charges List */}
      <div className="space-y-4">
        {filteredCharges.map((charge) => (
          <div key={charge.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {charge.users.nome}
                  </h3>
                  {getStatusBadge(charge.status)}
                  {charge.enviado_whatsapp && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1">
                      <MessageCircle size={14} />
                      WhatsApp Enviado
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  CPF: {charge.users.cpf}
                  {charge.users.telefone && ` | Tel: ${charge.users.telefone}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Vencimento:{' '}
                  {new Date(charge.data_vencimento).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">
                  R$ {parseFloat(charge.valor.toString()).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 font-medium mb-1">
                Descrição:
              </p>
              <p className="text-gray-900">{charge.descricao}</p>
              {charge.link_pagamento && (
                <>
                  <p className="text-sm text-gray-600 font-medium mt-3 mb-1">
                    Link de Pagamento:
                  </p>
                  <a
                    href={charge.link_pagamento}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm break-all"
                  >
                    {charge.link_pagamento}
                  </a>
                </>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => sendWhatsApp(charge)}
                disabled={!charge.users.telefone}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Enviar WhatsApp
              </button>

              {charge.status === 'pendente' && (
                <button
                  onClick={() => updateChargeStatus(charge.id, 'pago')}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Marcar Pago
                </button>
              )}

              {charge.status !== 'cancelado' && (
                <button
                  onClick={() => updateChargeStatus(charge.id, 'cancelado')}
                  className="bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Charge Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Nova Cobrança
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
                      {user.telefone ? ` (${user.telefone})` : ' (Sem tel.)'}
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
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Parcela 1/3 - Empréstimo solicitado em DD/MM"
                  rows={3}
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link de Pagamento (opcional)
                </label>
                <input
                  type="url"
                  value={formData.link_pagamento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      link_pagamento: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cole aqui o link do Pix, boleto ou outro método de pagamento
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                  Criar Cobrança
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      id_user: '',
                      valor: '',
                      descricao: '',
                      data_vencimento: '',
                      link_pagamento: '',
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
    </div>
  );
}

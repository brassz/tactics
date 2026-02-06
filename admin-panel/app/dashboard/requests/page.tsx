'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Request {
  id: string;
  id_user: string;
  valor: number;
  justificativa: string;
  status: string;
  created_at: string;
  users: {
    nome: string;
    cpf: string;
  };
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const { data } = await supabase
      .from('solicitacoes_valores')
      .select('*, users(nome, cpf)')
      .order('created_at', { ascending: false });

    setRequests(data || []);
    setLoading(false);
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    // Atualizar status da solicitação
    const { error } = await supabase
      .from('solicitacoes_valores')
      .update({ status })
      .eq('id', requestId);

    if (!error) {
      // Se foi aprovado, criar pagamento automaticamente
      if (status === 'aprovado') {
        const request = requests.find((r) => r.id === requestId);
        if (request) {
          // Calcular valores do empréstimo
          const valor = parseFloat(request.valor.toString());
          // Taxa de juros: 40% para valores abaixo de R$ 1.000,00 | 30% para R$ 1.000,00 ou mais
          const interestRate = valor < 1000 ? 40.00 : 30.00;
          const totalAmount = valor + (valor * interestRate / 100);
          
          // Calcular data de vencimento (30 dias = 1 mês)
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + 1);

          // Criar pagamento automaticamente
          const { error: paymentError } = await supabase
            .from('pagamentos')
            .insert([
              {
                id_user: request.id_user,
                id_solicitacao: requestId,
                valor: totalAmount,
                valor_total: totalAmount, // Valor total a pagar
                valor_juros: valor * interestRate / 100, // Valor dos juros
                valor_capital: valor, // Valor do capital
                valor_pago: 0, // Valor já pago (inicialmente 0)
                data_vencimento: dueDate.toISOString().split('T')[0],
                status: 'pendente',
              },
            ]);

          if (paymentError) {
            console.error('Erro ao criar pagamento:', paymentError);
            alert('Solicitação aprovada, mas houve erro ao criar o pagamento. Verifique manualmente.');
          } else {
            alert('Solicitação aprovada e pagamento criado automaticamente!');
          }
        }
      }

      loadRequests();
      setSelectedRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      aguardando: 'bg-yellow-100 text-yellow-800',
      aprovado: 'bg-green-100 text-green-800',
      negado: 'bg-red-100 text-red-800',
      em_analise: 'bg-blue-100 text-blue-800',
    };

    const labels = {
      aguardando: 'Aguardando',
      aprovado: 'Aprovado',
      negado: 'Negado',
      em_analise: 'Em Análise',
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

  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const stats = {
    total: requests.length,
    aguardando: requests.filter((r) => r.status === 'aguardando').length,
    aprovado: requests.filter((r) => r.status === 'aprovado').length,
    negado: requests.filter((r) => r.status === 'negado').length,
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Solicitações de Valores
        </h1>
        <p className="text-gray-600">Gerencie as solicitações dos clientes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm">Aguardando</p>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.aguardando}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm">Aprovados</p>
          <p className="text-3xl font-bold text-green-600">{stats.aprovado}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm">Negados</p>
          <p className="text-3xl font-bold text-red-600">{stats.negado}</p>
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
            onClick={() => setFilter('aguardando')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filter === 'aguardando'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aguardando
          </button>
          <button
            onClick={() => setFilter('aprovado')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filter === 'aprovado'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aprovadas
          </button>
          <button
            onClick={() => setFilter('negado')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filter === 'negado'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Negadas
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((req) => (
          <div key={req.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {req.users.nome}
                  </h3>
                  {getStatusBadge(req.status)}
                </div>
                <p className="text-sm text-gray-600">CPF: {req.users.cpf}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(req.created_at).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(req.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">
                  R$ {parseFloat(req.valor.toString()).toFixed(2)}
                </p>
              </div>
            </div>

            {req.justificativa && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Justificativa:
                </p>
                <p className="text-gray-900">{req.justificativa}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedRequest(req)}
              className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Gerenciar Solicitação
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Gerenciar Solicitação
            </h2>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-medium text-gray-900">
                  {selectedRequest.users.nome}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor</p>
                <p className="font-medium text-gray-900">
                  R$ {parseFloat(selectedRequest.valor.toString()).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status Atual</p>
                {getStatusBadge(selectedRequest.status)}
              </div>
            </div>

            <div className="space-y-3">
              {selectedRequest.status !== 'aprovado' && (
                <button
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, 'aprovado')
                  }
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Aprovar
                </button>
              )}

              {selectedRequest.status !== 'em_analise' && (
                <button
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, 'em_analise')
                  }
                  className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Clock size={20} />
                  Marcar Em Análise
                </button>
              )}

              {selectedRequest.status !== 'negado' && (
                <button
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, 'negado')
                  }
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={20} />
                  Negar
                </button>
              )}

              <button
                onClick={() => setSelectedRequest(null)}
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

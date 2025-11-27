'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Clock, Eye, MessageCircle, Phone, Edit } from 'lucide-react';

interface User {
  id: string;
  cpf: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  status: string;
  data_cadastro: string;
}

export default function CadastrosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ telefone: '', email: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('data_cadastro', { ascending: false });

    setUsers(data || []);
    setLoading(false);
  };

  const updateUserStatus = async (userId: string, status: string) => {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId);

    if (!error) {
      loadUsers();
      setSelectedUser(null);
    }
  };

  const updateUserContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const { error } = await supabase
      .from('users')
      .update({
        telefone: editForm.telefone,
        email: editForm.email,
      })
      .eq('id', editingUser.id);

    if (!error) {
      loadUsers();
      setEditingUser(null);
    }
  };

  const sendWhatsApp = (user: User) => {
    if (!user.telefone) {
      alert('Cliente não possui número de telefone cadastrado');
      return;
    }

    const phone = user.telefone.replace(/\D/g, '');
    let message = `Olá ${user.nome}! 👋\n\n`;
    message += `Este é o Sistema Financeiro entrando em contato.\n`;
    message += `\nComo podemos ajudá-lo hoje?`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pendente: 'bg-yellow-100 text-yellow-800',
      aprovado: 'bg-green-100 text-green-800',
      reprovado: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const stats = {
    total: users.length,
    pendentes: users.filter((u) => u.status === 'pendente').length,
    aprovados: users.filter((u) => u.status === 'aprovado').length,
    reprovados: users.filter((u) => u.status === 'reprovado').length,
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
          Gerenciamento de Cadastros
        </h1>
        <p className="text-gray-600">
          Visualize e aprove cadastros de clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.pendentes}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Aprovados</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.aprovados}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Reprovados</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.reprovados}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data Cadastro
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {user.cpf}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {user.telefone ? (
                        <div className="flex items-center gap-1 text-gray-900">
                          <Phone size={14} />
                          {user.telefone}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sem telefone</span>
                      )}
                      {user.email && (
                        <div className="text-gray-600 text-xs mt-1">
                          {user.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(user.data_cadastro).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {user.telefone && (
                        <button
                          onClick={() => sendWhatsApp(user)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setEditForm({
                            telefone: user.telefone || '',
                            email: user.email || '',
                          });
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Editar contato"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Gerenciar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Gerenciar Cadastro
            </h2>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium text-gray-900">{selectedUser.nome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CPF</p>
                <p className="font-medium text-gray-900">{selectedUser.cpf}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status Atual</p>
                {getStatusBadge(selectedUser.status)}
              </div>
            </div>

            <div className="space-y-3">
              {selectedUser.status !== 'aprovado' && (
                <button
                  onClick={() => updateUserStatus(selectedUser.id, 'aprovado')}
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Aprovar
                </button>
              )}

              {selectedUser.status !== 'reprovado' && (
                <button
                  onClick={() => updateUserStatus(selectedUser.id, 'reprovado')}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={20} />
                  Reprovar
                </button>
              )}

              <button
                onClick={() => setSelectedUser(null)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Editar Contato
            </h2>

            <form onSubmit={updateUserContact} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">Cliente: <span className="font-medium text-gray-900">{editingUser.nome}</span></p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone (com DDD)
                </label>
                <input
                  type="tel"
                  value={editForm.telefone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, telefone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="11999999999"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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

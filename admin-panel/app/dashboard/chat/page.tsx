'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  id_user: string;
  mensagem: string;
  remetente: string;
  timestamp: string;
  lida: boolean;
}

interface User {
  id: string;
  nome: string;
  cpf: string;
}

export default function ChatPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);

      // Subscribe to new messages
      const channel = supabase
        .channel(`chat-${selectedUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat',
            filter: `id_user=eq.${selectedUser.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'aprovado')
      .order('nome', { ascending: true });

    setUsers(data || []);
    setLoading(false);
  };

  const loadMessages = async (userId: string) => {
    const { data } = await supabase
      .from('chat')
      .select('*')
      .eq('id_user', userId)
      .order('timestamp', { ascending: true });

    setMessages(data || []);

    // Mark messages as read
    await supabase
      .from('chat')
      .update({ lida: true })
      .eq('id_user', userId)
      .eq('remetente', 'cliente')
      .eq('lida', false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedUser) return;

    const { error } = await supabase.from('chat').insert([
      {
        id_user: selectedUser.id,
        mensagem: newMessage.trim(),
        remetente: 'admin',
      },
    ]);

    if (!error) {
      setNewMessage('');
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat ao Vivo</h1>
        <p className="text-gray-600">Converse com os clientes em tempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-blue-500 text-white p-4 font-semibold">
              Clientes
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedUser?.id === user.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{user.nome}</div>
                  <div className="text-sm text-gray-500">{user.cpf}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="bg-blue-500 text-white p-4">
                <h2 className="font-semibold text-lg">{selectedUser.nome}</h2>
                <p className="text-sm text-blue-100">{selectedUser.cpf}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isAdmin = msg.remetente === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isAdmin ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isAdmin
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.mensagem}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isAdmin ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendMessage}
                className="border-t border-gray-200 p-4"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={20} />
                    Enviar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Selecione um cliente para iniciar o chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { ArrowLeft, Wallet, CheckCircle, CreditCard, MessageCircle, Send, Copy, Check } from 'lucide-react-native';
import { getSupabase } from '../lib/supabaseMulti';

export default function AdminWithdrawalsScreen({ navigation }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filter, setFilter] = useState('pendente');

  const supabase = getSupabase();

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
        Alert.alert('Erro', 'Erro ao carregar saques: ' + withdrawalsError.message);
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
      Alert.alert('Erro', 'Erro inesperado ao carregar saques');
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWithdrawals();
    setRefreshing(false);
  };

  const markAsPaid = async (withdrawalId, withdrawal) => {
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
        Alert.alert('Erro', 'Erro ao marcar como pago: ' + error.message);
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
      Alert.alert('Erro', 'Erro inesperado ao marcar como pago');
    }
  };

  const createCharge = async (withdrawal, sendColinha = false) => {
    const valor = withdrawal.solicitacoes_valores?.valor || 0;
    // Encargos calculados com base no valor solicitado
    const interestRate = valor < 1000 ? 40.0 : 30.0;
    const totalAmount = valor + (valor * interestRate) / 100;
    
    // Calcular data de vencimento (30 dias = 1 mês)
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);
    const dueDateString = dueDate.toISOString().split('T')[0];

    // Criar cobrança
    const { error: chargeError } = await supabase.from('cobrancas').insert([
      {
        id_user: withdrawal.id_user,
        valor: totalAmount,
        descricao: `Cobrança do empréstimo - Valor original: R$ ${valor
          .toFixed(2)
          .replace('.', ',')} + Encargos: R$ ${(totalAmount - valor)
          .toFixed(2)
          .replace('.', ',')}`,
        data_vencimento: dueDateString,
        status: 'pendente',
      },
    ]);

    if (chargeError) {
      Alert.alert('Erro', 'Erro ao criar cobrança: ' + chargeError.message);
      return;
    }

    // Apenas criar cobrança - não criar pagamento na tabela pagamentos

    setShowChargeModal(false);
    setSelectedWithdrawal(null);
    Alert.alert('Sucesso', 'Cobrança criada com sucesso!');
    loadWithdrawals();
    
    // Se solicitado, enviar colinha após criar cobrança
    if (sendColinha) {
      sendReminder(withdrawal);
    }
  };

  const sendPaymentReceipt = async (withdrawal) => {
    try {
      // Buscar telefone do usuário se não estiver disponível
      let phone = null;
      
      // Tentar primeiro nos dados já carregados
      if (withdrawal.users?.telefone) {
        phone = withdrawal.users.telefone;
      } else if (withdrawal.users?.phone) {
        phone = withdrawal.users.phone;
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
        Alert.alert('Aviso', 'Telefone do cliente não cadastrado. Não foi possível enviar o comprovante.\n\nPor favor, cadastre o telefone do cliente antes de enviar o comprovante.');
        return;
      }

      const valor = withdrawal.solicitacoes_valores?.valor || 0;
      // Encargos calculados com base no valor solicitado
      const interestRate = valor < 1000 ? 40.0 : 30.0;
      const totalAmount = valor + (valor * interestRate) / 100;
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
        `Encargos: R$ ${(totalAmount - valor).toFixed(2).replace('.', ',')}\n` +
        `Valor total: R$ ${totalAmount.toFixed(2).replace('.', ',')}\n` +
        `Vencimento: ${dueDate.toLocaleDateString('pt-BR')}\n\n` +
        `💡 *Lembrete Importante:*\n` +
        `Em ${dueDate.toLocaleDateString(
          'pt-BR'
        )} você terá o pagamento integral do valor ou dos encargos para renovação.\n\n` +
        `Por favor, mantenha-se em dia com seus pagamentos para continuar utilizando nossos serviços.\n\n` +
        `Obrigado por escolher nossos serviços! 🙏\n\n` +
        `Qualquer dúvida, estamos à disposição! 📱`;

      const cleanPhone = phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
      Linking.openURL(whatsappUrl);
    } catch (err) {
      console.error('Error sending receipt:', err);
      Alert.alert('Erro', 'Erro ao enviar comprovante. Tente novamente.');
    }
  };

  const sendReminder = async (withdrawal) => {
    try {
      // Buscar telefone do usuário se não estiver disponível
      let phone = null;
      
      // Tentar primeiro nos dados já carregados
      if (withdrawal.users?.telefone) {
        phone = withdrawal.users.telefone;
      } else if (withdrawal.users?.phone) {
        phone = withdrawal.users.phone;
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
        Alert.alert('Aviso', 'Telefone do cliente não cadastrado.\n\nPor favor, cadastre o telefone do cliente antes de enviar o lembrete.');
        return;
      }

      const valor = withdrawal.solicitacoes_valores?.valor || 0;
      // Encargos calculados com base no valor solicitado
      const interestRate = valor < 1000 ? 40.0 : 30.0;
      const totalAmount = valor + (valor * interestRate) / 100;
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);
      
      const message = `📋 *Colinha de Pagamento*\n\n` +
        `Olá ${withdrawal.nome_completo}!\n\n` +
        `Lembrete: Você tem um pagamento agendado.\n\n` +
        `💰 *Detalhes do Empréstimo:*\n` +
        `Valor do empréstimo: R$ ${valor.toFixed(2)}\n` +
        `Encargos: R$ ${(totalAmount - valor).toFixed(2)}\n` +
        `Valor total: R$ ${totalAmount.toFixed(2)}\n` +
        `Vencimento: ${dueDate.toLocaleDateString('pt-BR')}\n\n` +
        `💡 *Importante:* Em ${dueDate.toLocaleDateString(
          'pt-BR'
        )} você terá o pagamento integral do valor ou dos encargos para renovação.\n\n` +
        `Por favor, mantenha-se em dia com seus pagamentos! 📅`;

      const cleanPhone = phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
      Linking.openURL(whatsappUrl);
    } catch (err) {
      console.error('Error sending reminder:', err);
      Alert.alert('Erro', 'Erro ao enviar lembrete. Tente novamente.');
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#F1F5F9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saques</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#F1F5F9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saques</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pendente' && styles.filterButtonActive]}
          onPress={() => setFilter('pendente')}
        >
          <Text style={[styles.filterText, filter === 'pendente' && styles.filterTextActive]}>Pendentes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pago' && styles.filterButtonActive]}
          onPress={() => setFilter('pago')}
        >
          <Text style={[styles.filterText, filter === 'pago' && styles.filterTextActive]}>Pagos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredWithdrawals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Wallet size={48} color="#64748B" />
            <Text style={styles.emptyText}>Nenhuma solicitação de saque encontrada</Text>
          </View>
        ) : (
          filteredWithdrawals.map((withdrawal) => (
            <View key={withdrawal.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.cardName}>{withdrawal.nome_completo}</Text>
                  <View style={[styles.statusBadge, withdrawal.status === 'pago' ? styles.statusBadgePaid : styles.statusBadgePending]}>
                    <Text style={styles.statusText}>{withdrawal.status === 'pago' ? 'Pago' : 'Pendente'}</Text>
                  </View>
                </View>
                <Text style={styles.cardValue}>
                  R$ {withdrawal.solicitacoes_valores?.valor 
                    ? parseFloat(withdrawal.solicitacoes_valores.valor.toString()).toFixed(2)
                    : '0.00'}
                </Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardLabel}>CPF: {withdrawal.cpf}</Text>
                <Text style={styles.cardLabel}>Chave PIX: {withdrawal.chave_pix}</Text>
                {withdrawal.data_pagamento && (
                  <Text style={styles.cardDate}>
                    Pago em {new Date(withdrawal.data_pagamento).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(withdrawal.data_pagamento).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
                <Text style={styles.cardDate}>
                  Solicitado em {new Date(withdrawal.created_at).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(withdrawal.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              <View style={styles.cardActions}>
                {withdrawal.status === 'pendente' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonPrimary]}
                      onPress={() => {
                        setSelectedWithdrawal(withdrawal);
                        setShowPaymentModal(true);
                      }}
                    >
                      <Wallet size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Realizar Pagamento</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonSuccess]}
                      onPress={() => markAsPaid(withdrawal.id, withdrawal)}
                    >
                      <CheckCircle size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Marcar como Pago</Text>
                    </TouchableOpacity>
                  </>
                )}
                {withdrawal.status === 'pago' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonPrimary]}
                      onPress={() => {
                        setSelectedWithdrawal(withdrawal);
                        setShowChargeModal(true);
                      }}
                    >
                      <CreditCard size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Criar Cobrança</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonPurple]}
                      onPress={() => sendReminder(withdrawal)}
                    >
                      <MessageCircle size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Enviar Colinha</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonGreen]}
                      onPress={() => sendPaymentReceipt(withdrawal)}
                    >
                      <Send size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Enviar Comprovante</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Payment Modal */}
      {showPaymentModal && selectedWithdrawal && (
        <Modal visible={showPaymentModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Realizar Pagamento PIX</Text>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Cliente</Text>
                <Text style={styles.modalValue}>{selectedWithdrawal.nome_completo}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Valor a Pagar</Text>
                <Text style={styles.modalValueLarge}>
                  R$ {selectedWithdrawal.solicitacoes_valores?.valor
                    ? parseFloat(selectedWithdrawal.solicitacoes_valores.valor.toString()).toFixed(2).replace('.', ',')
                    : '0,00'}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Chave PIX</Text>
                <View style={styles.pixContainer}>
                  <Text style={styles.pixText}>{selectedWithdrawal.chave_pix}</Text>
                </View>
                <Text style={styles.modalHint}>
                  💡 Copie a chave PIX acima e realize o pagamento no seu aplicativo bancário
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSuccess]}
                onPress={() => markAsPaid(selectedWithdrawal.id, selectedWithdrawal)}
              >
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>Confirmar Pagamento e Enviar Colinha</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowPaymentModal(false);
                  setSelectedWithdrawal(null);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Charge Modal */}
      {showChargeModal && selectedWithdrawal && (
        <Modal visible={showChargeModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Criar Cobrança</Text>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Cliente</Text>
                <Text style={styles.modalValue}>{selectedWithdrawal.nome_completo}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Valor do Empréstimo</Text>
                <Text style={styles.modalValue}>
                  R$ {selectedWithdrawal.solicitacoes_valores?.valor
                    ? parseFloat(selectedWithdrawal.solicitacoes_valores.valor.toString()).toFixed(2)
                    : '0.00'}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Encargos</Text>
                <Text style={styles.modalValue}>
                  R$ {selectedWithdrawal.solicitacoes_valores?.valor
                    ? (() => {
                        const valor = parseFloat(
                          selectedWithdrawal.solicitacoes_valores.valor.toString()
                        );
                        const interestRate = valor < 1000 ? 0.4 : 0.3;
                        return (valor * interestRate).toFixed(2);
                      })()
                    : '0.00'}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Valor Total</Text>
                <Text style={styles.modalValueLarge}>
                  R$ {selectedWithdrawal.solicitacoes_valores?.valor
                    ? (() => {
                        const valor = parseFloat(selectedWithdrawal.solicitacoes_valores.valor.toString());
                        const interestRate = valor < 1000 ? 0.4 : 0.3;
                        return (valor * (1 + interestRate)).toFixed(2);
                      })()
                    : '0.00'}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Vencimento</Text>
                <Text style={styles.modalValue}>
                  {(() => {
                    const dueDate = new Date();
                    dueDate.setMonth(dueDate.getMonth() + 1);
                    return dueDate.toLocaleDateString('pt-BR');
                  })()}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => createCharge(selectedWithdrawal, false)}
              >
                <CreditCard size={20} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>Criar Cobrança</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPurple]}
                onPress={() => createCharge(selectedWithdrawal, true)}
              >
                <MessageCircle size={20} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>Criar Cobrança e Enviar Colinha</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowChargeModal(false);
                  setSelectedWithdrawal(null);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#CBD5E1',
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#CBD5E1',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1E293B',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgePaid: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  cardBody: {
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    minWidth: '48%',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  actionButtonSuccess: {
    backgroundColor: '#10B981',
  },
  actionButtonPurple: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonGreen: {
    backgroundColor: '#059669',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  modalValueLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  pixContainer: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
    marginTop: 8,
  },
  pixText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#F1F5F9',
  },
  modalHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  modalButtonSuccess: {
    backgroundColor: '#10B981',
  },
  modalButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  modalButtonPurple: {
    backgroundColor: '#8B5CF6',
  },
  modalButtonCancel: {
    backgroundColor: '#334155',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: '#CBD5E1',
  },
});


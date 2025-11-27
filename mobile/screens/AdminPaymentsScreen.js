import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { ArrowLeft, Plus, CheckCircle, MessageCircle, DollarSign } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function AdminPaymentsScreen({ navigation }) {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!formData.id_user || !formData.valor || !formData.data_vencimento) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

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
      await loadData();
      Alert.alert('Sucesso', 'Pagamento criado com sucesso!');
    } else {
      Alert.alert('Erro', 'Erro ao criar pagamento');
    }
  };

  const markAsPaid = async (paymentId) => {
    const { error } = await supabase
      .from('pagamentos')
      .update({
        status: 'pago',
        data_pagamento: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (!error) {
      await loadData();
      Alert.alert('Sucesso', 'Pagamento marcado como pago!');
    } else {
      Alert.alert('Erro', 'Erro ao atualizar pagamento');
    }
  };

  const sendPaymentWhatsApp = (payment) => {
    if (!payment.users.telefone) {
      Alert.alert('Erro', 'Cliente não possui número de telefone cadastrado');
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

    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pendente: { bg: '#FEF3C7', text: '#92400E' },
      pago: { bg: '#D1FAE5', text: '#065F46' },
      atrasado: { bg: '#FEE2E2', text: '#991B1B' },
      cancelado: { bg: '#F3F4F6', text: '#6B7280' },
    };

    const labels = {
      pendente: 'Pendente',
      pago: 'Pago',
      atrasado: 'Atrasado',
      cancelado: 'Cancelado',
    };

    const style = colors[status] || colors.pendente;

    return (
      <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
        <Text style={[styles.statusText, { color: style.text }]}>
          {labels[status] || status}
        </Text>
      </View>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamentos</Text>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Plus size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.miniStat}>
          <Text style={styles.miniStatValue}>R$ {stats.total.toFixed(2)}</Text>
          <Text style={styles.miniStatLabel}>Total</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: '#F59E0B' }]}>
            R$ {stats.pendente.toFixed(2)}
          </Text>
          <Text style={styles.miniStatLabel}>Pendente</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: '#10B981' }]}>
            R$ {stats.pago.toFixed(2)}
          </Text>
          <Text style={styles.miniStatLabel}>Recebido</Text>
        </View>
      </View>

      {/* Payments List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {payments.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentInfo}>
                <Text style={styles.clientName}>{payment.users.nome}</Text>
                <Text style={styles.clientCpf}>CPF: {payment.users.cpf}</Text>
                <Text style={styles.dueDate}>
                  Vencimento: {new Date(payment.data_vencimento).toLocaleDateString('pt-BR')}
                </Text>
                {payment.status === 'pago' && payment.data_pagamento && (
                  <Text style={styles.paidDate}>
                    Pago em: {new Date(payment.data_pagamento).toLocaleDateString('pt-BR')}
                  </Text>
                )}
              </View>
              <View style={styles.valueContainer}>
                <DollarSign size={20} color="#3B82F6" />
                <Text style={styles.valueText}>
                  R$ {parseFloat(payment.valor).toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              {getStatusBadge(payment.status)}
              
              {payment.status === 'pendente' && (
                <View style={styles.actions}>
                  {payment.users.telefone && (
                    <TouchableOpacity
                      style={styles.whatsappButton}
                      onPress={() => sendPaymentWhatsApp(payment)}
                    >
                      <MessageCircle size={16} color="#10B981" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.paidButton}
                    onPress={() => markAsPaid(payment.id)}
                  >
                    <CheckCircle size={16} color="#FFFFFF" />
                    <Text style={styles.paidButtonText}>Marcar como Pago</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* New Payment Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Novo Pagamento</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cliente</Text>
              <View style={styles.pickerContainer}>
                <ScrollView style={styles.userList}>
                  <TouchableOpacity
                    style={[styles.userOption, !formData.id_user && styles.userOptionSelected]}
                    onPress={() => setFormData({ ...formData, id_user: '' })}
                  >
                    <Text style={styles.userOptionText}>Selecione um cliente</Text>
                  </TouchableOpacity>
                  {users.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.userOption,
                        formData.id_user === user.id && styles.userOptionSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, id_user: user.id })}
                    >
                      <Text style={styles.userOptionText}>
                        {user.nome} - {user.cpf}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Valor</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.valor}
                onChangeText={(text) => setFormData({ ...formData, valor: text })}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Data de Vencimento</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                value={formData.data_vencimento}
                onChangeText={(text) => setFormData({ ...formData, data_vencimento: text })}
              />
              <Text style={styles.helperText}>Formato: AAAA-MM-DD (ex: 2025-12-31)</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.modalButtonText}>Criar Pagamento</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowModal(false);
                  setFormData({ id_user: '', valor: '', data_vencimento: '' });
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#374151' }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 8,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  clientCpf: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  paidDate: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginTop: 4,
  },
  cardFooter: {
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  whatsappButton: {
    backgroundColor: '#D1FAE5',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paidButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
  },
  paidButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  pickerContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  userList: {
    maxHeight: 150,
  },
  userOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userOptionSelected: {
    backgroundColor: '#DBEAFE',
  },
  userOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  modalActions: {
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

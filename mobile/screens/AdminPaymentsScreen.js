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
import { getSupabase, getCompanySupabase, getCurrentCompany } from '../lib/supabaseMulti';

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
  
  // Obter instância do Supabase
  const supabase = getSupabase();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Obter empresa atual
      const companyId = await getCurrentCompany();
      const companySupabase = getCompanySupabase(companyId);
      
      if (!companySupabase) {
        Alert.alert('Erro', 'Não foi possível conectar ao banco da empresa');
        return;
      }

      // Buscar pagamentos do banco da empresa (tabela payments) - apenas os últimos 50
      const { data: paymentsData, error: paymentsError } = await companySupabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false })
        .limit(50);

      if (paymentsError) {
        console.error('Erro ao carregar pagamentos:', paymentsError);
        Alert.alert('Erro', 'Erro ao carregar pagamentos: ' + paymentsError.message);
        setPayments([]);
        return;
      }

      console.log('Pagamentos carregados (admin mobile):', paymentsData?.length || 0, 'registros');

      // Usar os pagamentos diretamente sem adicionar nomes de admins
      setPayments(paymentsData || []);

      // Buscar usuários do banco principal para o modal (se necessário)
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'aprovado')
        .order('nome', { ascending: true });
      
      setUsers(usersData || []);
    } catch (err) {
      console.error('Erro inesperado ao carregar dados:', err);
      Alert.alert('Erro', 'Erro ao carregar dados');
    }
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


  const stats = {
    total: payments.reduce((acc, p) => {
      const amount = parseFloat(p?.amount || 0);
      return isNaN(amount) ? acc : acc + amount;
    }, 0),
    totalWithFine: payments.reduce((acc, p) => {
      const amount = parseFloat(p?.amount || 0);
      const fine = parseFloat(p?.fine_amount || 0);
      const total = (isNaN(amount) ? 0 : amount) + (isNaN(fine) ? 0 : fine);
      return acc + total;
    }, 0),
    count: payments?.length || 0,
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
          <Text style={styles.miniStatValue}>{stats.count}</Text>
          <Text style={styles.miniStatLabel}>Total de Pagamentos</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: '#3B82F6' }]}>
            R$ {stats.total.toFixed(2)}
          </Text>
          <Text style={styles.miniStatLabel}>Valor Total</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: '#10B981' }]}>
            R$ {stats.totalWithFine.toFixed(2)}
          </Text>
          <Text style={styles.miniStatLabel}>Com Multas</Text>
        </View>
      </View>

      {/* Payments List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {payments.length === 0 ? (
          <View style={styles.paymentCard}>
            <Text style={styles.clientName}>Nenhum pagamento encontrado</Text>
          </View>
        ) : (
          payments.map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  {payment.loan_id && (
                    <Text style={styles.clientCpf}>Empréstimo: {String(payment.loan_id).substring(0, 8)}...</Text>
                  )}
                <Text style={styles.dueDate}>
                  Data do Pagamento: {payment.payment_date ? String(new Date(payment.payment_date).toLocaleDateString('pt-BR')) : 'N/A'}
                </Text>
                  {payment.payment_type && (
                    <Text style={styles.paidDate}>
                      Tipo: {String(payment.payment_type).toUpperCase()}
                    </Text>
                  )}
                  {payment.notes && String(payment.notes).trim() && (
                    <Text style={styles.paidDate}>
                      Observações: {String(payment.notes)}
                    </Text>
                  )}
                  {payment?.fine_amount && parseFloat(payment.fine_amount) > 0 && (
                    <Text style={[styles.paidDate, { color: '#EF4444' }]}>
                      Multa: R$ {String(parseFloat(payment.fine_amount).toFixed(2))}
                    </Text>
                  )}
                </View>
                <View style={styles.valueContainer}>
                  <DollarSign size={20} color="#3B82F6" />
                  <Text style={styles.valueText}>
                    R$ {payment?.amount ? String(parseFloat(payment.amount).toFixed(2)) : '0.00'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.createdDate}>
                  Criado em: {payment.created_at ? String(new Date(payment.created_at).toLocaleDateString('pt-BR')) : 'N/A'} às{' '}
                  {payment.created_at ? String(new Date(payment.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })) : 'N/A'}
                </Text>
              </View>
            </View>
          ))
        )}
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
                        {user.nome || 'Sem nome'} - {user.cpf || 'Sem CPF'}
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
  createdDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
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

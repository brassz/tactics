import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, Clock, CheckCircle, AlertCircle, Calendar, DollarSign, X, Copy } from 'lucide-react-native';
import { getCompanySupabase } from '../lib/supabaseMulti';

export default function LoansScreen() {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoan, setPaymentLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      await loadLoans(parsedUser);
    } else {
      setLoading(false);
    }
  };

  const loadLoans = async (userData) => {
    try {
      setLoading(true);
      // Obter empresa do usuário
      const userCompany = userData.company || 'franca';
      
      // Obter instância do Supabase da empresa
      const companySupabase = getCompanySupabase(userCompany);
      
      if (!companySupabase) {
        console.error('Error: Company Supabase not found for:', userCompany);
        setLoans([]);
        setLoading(false);
        return;
      }

      // Buscar cliente no banco da empresa pelo CPF
      const { data: client, error: clientError } = await companySupabase
        .from('clients')
        .select('id')
        .eq('cpf', userData.cpf)
        .single();

      if (clientError || !client) {
        console.error('Error finding client in company database:', clientError);
        setLoans([]);
        setLoading(false);
        return;
      }

      // Buscar empréstimos do cliente
      const { data: loansData, error: loansError } = await companySupabase
        .from('loans')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (loansError) {
        console.error('Error loading loans:', loansError);
        Alert.alert('Erro', 'Erro ao carregar empréstimos: ' + loansError.message);
        setLoans([]);
      } else {
        // Atualizar status de atrasados
        const updated = loansData?.map((loan) => {
          if (loan.status === 'active' || loan.status === 'pending') {
            const hoje = new Date();
            const vencimento = new Date(loan.due_date);
            if (vencimento < hoje) {
              return { ...loan, status: 'overdue' };
            }
          }
          return loan;
        });

        setLoans(updated || []);
      }
    } catch (err) {
      console.error('Unexpected error loading loans:', err);
      Alert.alert('Erro', 'Erro inesperado ao carregar empréstimos');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={24} color="#10B981" />;
      case 'overdue':
        return <AlertCircle size={24} color="#EF4444" />;
      case 'active':
        return <Clock size={24} color="#3B82F6" />;
      case 'pending':
        return <Clock size={24} color="#F59E0B" />;
      case 'cancelled':
        return <AlertCircle size={24} color="#6B7280" />;
      default:
        return <Clock size={24} color="#F59E0B" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#10B981';
      case 'overdue':
        return '#EF4444';
      case 'active':
        return '#3B82F6';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#6B7280';
      default:
        return '#F59E0B';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'overdue':
        return 'Atrasado';
      case 'active':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Adiciona meio-dia para evitar problemas de fuso horário
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const getPixKey = (companyId) => {
    const pixKeys = {
      franca: {
        key: '54413674000147',
        bank: 'Stone Pagamento S.A',
        holder: 'Tuane Carla Mendes Tomaz',
      },
      litoral: {
        key: '16988037753',
        bank: 'COOP SICREDI',
        holder: 'Fabiana Cristina Muniz Veronezi',
      },
      mogiana: {
        key: 'financeiro.mogiana@outlook.com',
        bank: 'Banco do Brasil',
        holder: 'Fabiana Cristina Muniz Veronezi',
      },
      imperatriz: {
        key: 'financeiro.n7full@gmail.com',
        bank: 'Banco Santander',
        holder: 'Fabiana Cristina Muniz Veronezi',
      },
    };
    return pixKeys[companyId] || pixKeys.franca;
  };

  const calculateMinPayment = (loan) => {
    const amount = parseFloat(loan.original_amount || loan.amount || 0);
    const interestRate = parseFloat(loan.interest_rate || 0);
    const minPayment = (amount * interestRate) / 100;
    return minPayment;
  };

  const handleLoanPress = (loan) => {
    setSelectedLoan(loan);
  };

  const handlePaymentPress = () => {
    // Salvar o empréstimo selecionado e abrir modal de pagamento
    setPaymentLoan(selectedLoan);
    setSelectedLoan(null);
    setShowPaymentModal(true);
  };

  const handleCopyPixKey = () => {
    const pixKey = getPixKey(user?.company || 'franca').key;
    // O TextInput já permite seleção e cópia nativa
    Alert.alert(
      'Chave PIX',
      'Toque e segure no campo da chave PIX acima para copiar, depois vá ao seu banco para realizar o pagamento.',
      [{ text: 'Entendi' }]
    );
  };

  const handleConfirmPayment = async () => {
    if (!paymentLoan || !paymentAmount) {
      Alert.alert('Erro', 'Por favor, informe o valor pago');
      return;
    }

    const amount = parseFloat(paymentAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Por favor, informe um valor válido');
      return;
    }

    const minPayment = calculateMinPayment(paymentLoan);
    if (amount < minPayment) {
      Alert.alert(
        'Valor Insuficiente',
        `O valor mínimo é ${formatCurrency(minPayment)} (valor dos juros)`
      );
      return;
    }

    setProcessingPayment(true);

    try {
      // Apenas mostrar confirmação - não criar registro no banco
      // O admin vai verificar no extrato bancário e cadastrar manualmente
      
      // Fechar modal e mostrar confirmação
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentLoan(null);
      setShowConfirmation(true);

      // Recarregar empréstimos (mesmo sem mudança, para garantir sincronização)
      await loadLoans(user);
    } catch (error) {
      console.error('Erro ao processar confirmação:', error);
      Alert.alert('Erro', 'Erro ao processar confirmação. Tente novamente.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Empréstimos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Empréstimos</Text>
          <Text style={styles.subtitle}>Seus empréstimos e financiamentos</Text>
        </View>

        {/* Resumo */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total de Empréstimos</Text>
            <Text style={[styles.summaryValue, { color: '#3B82F6' }]}>
              {loans.length}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Valor Total</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {formatCurrency(
                loans.reduce((acc, loan) => acc + parseFloat(loan.total_amount || loan.amount || 0), 0)
              )}
            </Text>
          </View>
        </View>

        {/* Lista de Empréstimos */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Todos os Empréstimos</Text>
          {loans.length === 0 ? (
            <View style={styles.emptyState}>
              <CreditCard size={48} color="#64748B" />
              <Text style={styles.emptyText}>Nenhum empréstimo encontrado</Text>
            </View>
          ) : (
            loans.map((loan) => (
              <TouchableOpacity
                key={loan.id}
                style={styles.loanCard}
                onPress={() => handleLoanPress(loan)}
                activeOpacity={0.7}
              >
                <View style={styles.loanHeader}>
                  {getStatusIcon(loan.status)}
                  <View style={styles.loanInfo}>
                    <Text style={styles.loanValue}>
                      {formatCurrency(loan.total_amount || loan.amount)}
                    </Text>
                    <Text style={styles.loanDate}>
                      Contratado em {formatDate(loan.loan_date)}
                    </Text>
                  </View>
                </View>

                <View style={styles.loanDetails}>
                  <View style={styles.detailRow}>
                    <DollarSign size={16} color="#CBD5E1" />
                    <Text style={styles.detailLabel}>Valor Original:</Text>
                    <Text style={styles.detailValue}>
                      {formatCurrency(loan.original_amount || loan.amount)}
                    </Text>
                  </View>

                  {loan.interest_rate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Taxa de Juros:</Text>
                      <Text style={styles.detailValue}>{loan.interest_rate}%</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#CBD5E1" />
                    <Text style={styles.detailLabel}>Vencimento:</Text>
                    <Text style={[styles.detailValue, { color: loan.status === 'overdue' ? '#EF4444' : '#F1F5F9' }]}>
                      {formatDate(loan.due_date)}
                    </Text>
                  </View>

                  {loan.term_days && (
                    <View style={styles.detailRow}>
                      <Clock size={16} color="#CBD5E1" />
                      <Text style={styles.detailLabel}>Prazo:</Text>
                      <Text style={styles.detailValue}>{loan.term_days} dias</Text>
                    </View>
                  )}
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(loan.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(loan.status) },
                    ]}
                  >
                    {getStatusText(loan.status)}
                  </Text>
                </View>

                {loan.updated_at && loan.status !== 'pending' && (
                  <Text style={styles.updatedDate}>
                    Atualizado em {formatDate(loan.updated_at.split('T')[0])} às{' '}
                    {new Date(loan.updated_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal de Detalhes do Empréstimo */}
      <Modal
        visible={selectedLoan !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedLoan(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Empréstimo</Text>
              <TouchableOpacity onPress={() => setSelectedLoan(null)}>
                <X size={24} color="#F1F5F9" />
              </TouchableOpacity>
            </View>

            {selectedLoan && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Valor Total</Text>
                  <Text style={styles.modalValue}>
                    {formatCurrency(selectedLoan.total_amount || selectedLoan.amount)}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Valor Original</Text>
                  <Text style={styles.modalValue}>
                    {formatCurrency(selectedLoan.original_amount || selectedLoan.amount)}
                  </Text>
                </View>

                {selectedLoan.interest_rate && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Taxa de Juros</Text>
                    <Text style={styles.modalValue}>{selectedLoan.interest_rate}%</Text>
                  </View>
                )}

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Valor dos Juros (Mínimo)</Text>
                  <Text style={[styles.modalValue, { color: '#F59E0B' }]}>
                    {formatCurrency(calculateMinPayment(selectedLoan))}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Data de Vencimento</Text>
                  <Text style={styles.modalValue}>{formatDate(selectedLoan.due_date)}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(selectedLoan.status)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(selectedLoan.status) },
                      ]}
                    >
                      {getStatusText(selectedLoan.status)}
                    </Text>
                  </View>
                </View>

                {(selectedLoan.status === 'active' || selectedLoan.status === 'overdue' || selectedLoan.status === 'pending') && (
                  <TouchableOpacity
                    style={styles.paymentButton}
                    onPress={handlePaymentPress}
                  >
                    <DollarSign size={20} color="#FFFFFF" />
                    <Text style={styles.paymentButtonText}>Realizar Pagamento</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Pagamento PIX */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pagamento PIX</Text>
              <TouchableOpacity onPress={() => {
                setShowPaymentModal(false);
                setPaymentLoan(null);
              }}>
                <X size={24} color="#F1F5F9" />
              </TouchableOpacity>
            </View>

            {paymentLoan && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.pixSection}>
                  <Text style={styles.pixLabel}>Valor Mínimo (Juros)</Text>
                  <Text style={styles.pixAmount}>
                    {formatCurrency(calculateMinPayment(paymentLoan))}
                  </Text>
                  <Text style={styles.pixSubtext}>
                    Este é o valor mínimo que você deve pagar (apenas os juros)
                  </Text>
                </View>

                <View style={styles.pixSection}>
                  <Text style={styles.pixLabel}>Chave PIX para Pagamento</Text>
                  <View style={styles.pixKeyContainer}>
                    <TextInput
                      style={styles.pixKeyText}
                      value={getPixKey(user?.company || 'franca').key}
                      editable={false}
                      selectTextOnFocus={true}
                      multiline={false}
                      selectable={true}
                    />
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={handleCopyPixKey}
                    >
                      <Copy size={20} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.pixCopyHint}>
                    Toque e segure no campo acima para copiar a chave PIX
                  </Text>
                </View>

                <View style={styles.pixInfoContainer}>
                  <View style={styles.pixInfo}>
                    <Text style={styles.pixInfoLabel}>Banco:</Text>
                    <Text style={styles.pixInfoText}>
                      {getPixKey(user?.company || 'franca').bank}
                    </Text>
                  </View>

                  <View style={styles.pixInfo}>
                    <Text style={styles.pixInfoLabel}>Titular:</Text>
                    <Text style={styles.pixInfoText}>
                      {getPixKey(user?.company || 'franca').holder}
                    </Text>
                  </View>
                </View>

                <View style={styles.pixInstructions}>
                  <Text style={styles.pixInstructionsTitle}>Como realizar o pagamento:</Text>
                  <Text style={styles.pixInstructionsText}>
                    1. Copie a chave PIX acima{'\n'}
                    2. Abra o aplicativo do seu banco{'\n'}
                    3. Vá em PIX → Pagar{'\n'}
                    4. Cole a chave PIX{'\n'}
                    5. Digite o valor mínimo mostrado acima{'\n'}
                    6. Confirme o pagamento
                  </Text>
                </View>

                <View style={styles.pixWarning}>
                  <AlertCircle size={20} color="#F59E0B" />
                  <Text style={styles.pixWarningText}>
                    Após realizar o pagamento, envie o comprovante para o suporte através do chat.
                  </Text>
                </View>

                {/* Campo para informar valor pago */}
                <View style={styles.paymentInputSection}>
                  <Text style={styles.pixLabel}>Valor Pago</Text>
                  <TextInput
                    style={styles.paymentInput}
                    placeholder="0,00"
                    value={paymentAmount}
                    onChangeText={(text) => {
                      // Permitir apenas números e vírgula
                      const cleaned = text.replace(/[^0-9,]/g, '');
                      setPaymentAmount(cleaned);
                    }}
                    keyboardType="decimal-pad"
                    editable={!processingPayment}
                  />
                  <Text style={styles.paymentHint}>
                    Informe o valor que você pagou (mínimo: {formatCurrency(calculateMinPayment(paymentLoan))})
                  </Text>
                </View>

                {/* Botão de confirmar pagamento */}
                <TouchableOpacity
                  style={[styles.confirmPaymentButton, processingPayment && styles.confirmPaymentButtonDisabled]}
                  onPress={handleConfirmPayment}
                  disabled={processingPayment || !paymentAmount}
                >
                  {processingPayment ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <CheckCircle size={20} color="#FFFFFF" />
                      <Text style={styles.confirmPaymentButtonText}>Confirmar Pagamento</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.confirmationIconContainer}>
              <CheckCircle size={64} color="#10B981" />
            </View>
            <Text style={styles.confirmationTitle}>Pagamento Registrado!</Text>
            <Text style={styles.confirmationText}>
              Seu pagamento foi registrado com sucesso e será processado dentro de 8 horas úteis.
            </Text>
            <TouchableOpacity
              style={styles.confirmationButton}
              onPress={() => {
                setShowConfirmation(false);
                setPaymentLoan(null);
                setPaymentAmount('');
              }}
            >
              <Text style={styles.confirmationButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#CBD5E1',
    fontSize: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 16,
    padding: 24,
    paddingTop: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  listContainer: {
    padding: 24,
    paddingTop: 0,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#1E293B',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    color: '#CBD5E1',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  loanCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 1,
  },
  loanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  loanInfo: {
    flex: 1,
  },
  loanValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  loanDate: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  loanDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#CBD5E1',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  updatedDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  modalBody: {
    padding: 24,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  modalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pixSection: {
    marginBottom: 24,
  },
  pixLabel: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  pixAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  pixKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    marginTop: 8,
  },
  pixKeyText: {
    flex: 1,
    fontSize: 16,
    color: '#F1F5F9',
    fontFamily: 'monospace',
    paddingVertical: 4,
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  pixCopyHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  pixSubtext: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
  pixInfoContainer: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  pixInfo: {
    marginBottom: 12,
  },
  pixInfoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  pixInfoText: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  pixInstructions: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  pixInstructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DBEAFE',
    marginBottom: 8,
  },
  pixInstructionsText: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  pixWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  pixWarningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
  },
  paymentInputSection: {
    marginTop: 24,
  },
  paymentInput: {
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginTop: 8,
  },
  paymentHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  confirmPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  confirmPaymentButtonDisabled: {
    backgroundColor: '#64748B',
    opacity: 0.6,
  },
  confirmPaymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationModal: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmationIconContainer: {
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  confirmationSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmationButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  confirmationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});


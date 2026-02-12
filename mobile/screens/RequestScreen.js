import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { DollarSign, Clock, CheckCircle, XCircle, Camera } from 'lucide-react-native';
import { getSupabase, getCompanySupabase } from '../lib/supabaseMulti';
import FacialCaptureModal from '../components/FacialCaptureModal';

export default function RequestScreen() {
  const [user, setUser] = useState(null);
  const [valor, setValor] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [showFacialCapture, setShowFacialCapture] = useState(false);
  const [facialImageUri, setFacialImageUri] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [message, setMessage] = useState(null);
  
  // Obter instância do Supabase
  const supabase = getSupabase();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      await loadSolicitacoes(parsedUser.id);
    }
  };

  const loadSolicitacoes = async (userId) => {
    const { data } = await supabase
      .from('solicitacoes_valores')
      .select('*')
      .eq('id_user', userId)
      .order('created_at', { ascending: false });

    setSolicitacoes(data || []);
  };

  const formatCurrency = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const number = parseFloat(cleaned) / 100;
    return number.toFixed(2);
  };

  const uploadFacialImage = async (imageUri) => {
    try {
      // Nome único para o arquivo
      const fileName = `facial-capture-${user.id}-${Date.now()}.jpg`;
      const filePath = `capturas-faciais/${fileName}`;

      let fileData;

      // Para web, usar fetch/XMLHttpRequest; para mobile, usar FileSystem
      if (Platform.OS === 'web') {
        // Ler arquivo usando XMLHttpRequest (funciona no web)
        const xhr = new XMLHttpRequest();
        fileData = await new Promise((resolve, reject) => {
          xhr.onload = () => resolve(xhr.response);
          xhr.onerror = () => reject(new Error('Failed to read file'));
          xhr.responseType = 'arraybuffer';
          xhr.open('GET', imageUri);
          xhr.send();
        });
      } else {
        // Para mobile, usar FileSystem
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: 'base64',
        });

        // Converter base64 para arraybuffer
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        fileData = new Uint8Array(byteNumbers);
      }

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('user-documents')
        .upload(filePath, fileData, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('user-documents')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading facial image:', error);
      throw error;
    }
  };

  const saveFacialCapture = async (imageUrl, solicitacaoId) => {
    try {
      const { error } = await supabase
        .from('capturas_faciais')
        .insert([
          {
            id_user: user.id,
            tipo_operacao: 'solicitacao_valor',
            imagem_url: imageUrl,
            id_solicitacao: solicitacaoId,
            metadata: {
              timestamp: new Date().toISOString(),
              tipo_solicitacao: 'solicitacao_valor',
            },
          },
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving facial capture:', error);
      throw error;
    }
  };

  const handleFacialCapture = async (imageUri) => {
    setFacialImageUri(imageUri);
    setShowFacialCapture(false);
    // Após capturar, continuar com o envio da solicitação
    await submitRequest(imageUri);
  };

  const handleSubmit = async () => {
    if (!valor) {
      const msg = 'Por favor, informe o valor desejado';
      if (Platform.OS === 'web') {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
      } else {
        Alert.alert('Erro', msg);
      }
      return;
    }

    const valorFloat = parseFloat(valor);
    if (valorFloat <= 0) {
      const msg = 'Valor deve ser maior que zero';
      if (Platform.OS === 'web') {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
      } else {
        Alert.alert('Erro', msg);
      }
      return;
    }

    // Calcular valores do empréstimo
    // Taxa de juros: 40% para valores abaixo de R$ 1.000,00 | 30% para R$ 1.000,00 ou mais
    const interestRate = valorFloat < 1000 ? 40.00 : 30.00;
    const loanDate = new Date();
    const dueDate = new Date(loanDate);
    // Adicionar 1 mês à data de criação (ex: 06/02/2026 -> 06/03/2026)
    dueDate.setMonth(dueDate.getMonth() + 1);
    const totalAmount = valorFloat + (valorFloat * interestRate / 100);
    
    // Formatar datas para exibição
    const loanDateStr = loanDate.toLocaleDateString('pt-BR');
    const dueDateStr = dueDate.toLocaleDateString('pt-BR');

    // Para web/PWA, usar modal de confirmação
    if (Platform.OS === 'web') {
      setConfirmData({
        valorFloat,
        interestRate,
        loanDateStr,
        dueDateStr,
        totalAmount,
      });
      setShowConfirmModal(true);
    } else {
      // Para mobile nativo, usar Alert
      Alert.alert(
        'Confirmar Empréstimo',
        `Valor solicitado: R$ ${valorFloat.toFixed(2)}\n\n` +
        `Taxa de juros: ${interestRate}%\n` +
        `Data de criação: ${loanDateStr}\n` +
        `Data de vencimento: ${dueDateStr}\n\n` +
        `Valor total a pagar: R$ ${totalAmount.toFixed(2)}\n\n` +
        `Você está solicitando R$ ${valorFloat.toFixed(2)} e pagará R$ ${totalAmount.toFixed(2)} em ${dueDateStr}.`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Confirmar',
            onPress: () => {
              // Após confirmar, solicitar captura facial
              Alert.alert(
                'Captura Facial Obrigatória',
                'Para sua segurança, precisamos confirmar sua identidade através de uma foto.',
                [
                  {
                    text: 'Cancelar',
                    style: 'cancel',
                  },
                  {
                    text: 'Continuar',
                    onPress: () => setShowFacialCapture(true),
                  },
                ]
              );
            },
          },
        ]
      );
    }
  };

  const handleConfirmRequest = () => {
    setShowConfirmModal(false);
    // Para web/PWA, abrir modal de captura facial diretamente
    if (Platform.OS === 'web') {
      setMessage('Abrindo captura facial...');
      setShowFacialCapture(true);
    }
  };

  const submitRequest = async (imageUri) => {
    setLoading(true);

    try {
      // 1. Fazer upload da imagem facial
      const imageUrl = await uploadFacialImage(imageUri);

      // 2. Criar solicitação
      const valorFloat = parseFloat(valor);
      const { data: solicitacaoData, error: solicitacaoError } = await supabase
        .from('solicitacoes_valores')
        .insert([
          {
            id_user: user.id,
            valor: valorFloat,
            justificativa: justificativa || null,
            status: 'aguardando',
          },
        ])
        .select()
        .single();

      if (solicitacaoError) throw solicitacaoError;

      // 3. Salvar captura facial vinculada à solicitação
      await saveFacialCapture(imageUrl, solicitacaoData.id);

      // 4. Criar empréstimo no banco de dados da empresa
      // Obter empresa do usuário
      const userCompany = user.company || 'franca'; // Padrão: franca se não tiver
      
      // Obter instância do Supabase da empresa
      const companySupabase = getCompanySupabase(userCompany);
      
      if (!companySupabase) {
        console.error('Error: Company Supabase not found for:', userCompany);
        // Não interrompe o fluxo, apenas loga o erro
      } else {
        // Buscar cliente no banco da empresa pelo CPF
        const { data: client, error: clientError } = await companySupabase
          .from('clients')
          .select('id')
          .eq('cpf', user.cpf)
          .single();

        if (clientError || !client) {
          console.error('Error finding client in company database:', clientError);
          // Não interrompe o fluxo, apenas loga o erro
        } else {
          // Calcular campos do empréstimo
          // Taxa de juros: 40% para valores abaixo de R$ 1.000,00 | 30% para R$ 1.000,00 ou mais
          const interestRate = valorFloat < 1000 ? 40.00 : 30.00;
          const termDays = 30; // Prazo fixo: sempre 30 dias
          const loanDate = new Date();
          const dueDate = new Date(loanDate);
          // Adicionar 1 mês à data de criação (ex: 06/02/2026 -> 06/03/2026)
          dueDate.setMonth(dueDate.getMonth() + 1);

          // Criar empréstimo no banco da empresa
          // NOTA: total_amount é uma coluna gerada (calculada automaticamente pelo banco)
          // O banco calcula: total_amount = amount + (amount * interest_rate / 100)
          const { error: loanError } = await companySupabase
            .from('loans')
            .insert([
              {
                client_id: client.id,
                amount: valorFloat.toString(),
                interest_rate: interestRate.toString(),
                loan_date: loanDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
                due_date: dueDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
                status: 'pending',
                // total_amount não é inserido - é calculado automaticamente pelo banco
                created_by: client.id, // Usar client.id como created_by
                original_amount: valorFloat.toString(),
                due_date_manually_changed: false,
                term_days: termDays, // Sempre 30 dias
              },
            ]);

          if (loanError) {
            console.error('Error creating loan in company database:', loanError);
            // Não interrompe o fluxo, apenas loga o erro
            // A solicitação já foi criada com sucesso
          }
        }
      }

      const successMsg = 'Solicitação enviada com sucesso!';
      if (Platform.OS === 'web') {
        setMessage(successMsg);
        setTimeout(() => setMessage(null), 3000);
      } else {
        Alert.alert('Sucesso!', successMsg);
      }
      setValor('');
      setJustificativa('');
      setFacialImageUri(null);
      await loadSolicitacoes(user.id);
    } catch (error) {
      console.error('Error submitting request:', error);
      const errorMsg = 'Erro ao enviar solicitação. Tente novamente.';
      if (Platform.OS === 'web') {
        setMessage(errorMsg);
        setTimeout(() => setMessage(null), 3000);
      } else {
        Alert.alert('Erro', errorMsg);
      }
      setFacialImageUri(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle size={20} color="#10B981" />;
      case 'negado':
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <Clock size={20} color="#F59E0B" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado':
        return '#10B981';
      case 'negado':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'aprovado':
        return 'Aprovado';
      case 'negado':
        return 'Negado';
      case 'aguardando':
        return 'Aguardando';
      case 'em_analise':
        return 'Em Análise';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {message && Platform.OS === 'web' && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Solicitar Valor</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Valor desejado</Text>
            <View style={styles.currencyInput}>
              <Text style={styles.currencySymbol}>R$</Text>
              <TextInput
                style={styles.input}
                placeholder="0,00"
                value={valor}
                onChangeText={(text) => setValor(formatCurrency(text))}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Justificativa (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva o motivo da solicitação"
              value={justificativa}
              onChangeText={setJustificativa}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <DollarSign size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Enviar Solicitação</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Histórico */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Histórico de Solicitações</Text>
          {solicitacoes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma solicitação ainda</Text>
            </View>
          ) : (
            solicitacoes.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyValue}>
                    R$ {parseFloat(item.valor).toFixed(2)}
                  </Text>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(item.status)}
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                </View>
                {item.justificativa && (
                  <Text style={styles.historyJustification}>
                    {item.justificativa}
                  </Text>
                )}
                <Text style={styles.historyDate}>
                  {new Date(item.created_at).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(item.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Confirmation Modal for Web/PWA */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Confirmar Empréstimo</Text>
            {confirmData && (
              <>
                <Text style={styles.modalText}>
                  Valor solicitado: R$ {confirmData.valorFloat.toFixed(2)}
                </Text>
                <Text style={styles.modalText}>
                  Taxa de juros: {confirmData.interestRate}%
                </Text>
                <Text style={styles.modalText}>
                  Data de criação: {confirmData.loanDateStr}
                </Text>
                <Text style={styles.modalText}>
                  Data de vencimento: {confirmData.dueDateStr}
                </Text>
                <Text style={styles.modalText}>
                  Valor total a pagar: R$ {confirmData.totalAmount.toFixed(2)}
                </Text>
                <Text style={styles.modalSubtext}>
                  Você está solicitando R$ {confirmData.valorFloat.toFixed(2)} e pagará R$ {confirmData.totalAmount.toFixed(2)} em {confirmData.dueDateStr}.
                </Text>
                <Text style={styles.modalWarning}>
                  Para sua segurança, precisamos confirmar sua identidade através de uma foto.
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowConfirmModal(false)}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={handleConfirmRequest}
                  >
                    <Text style={styles.modalButtonText}>Continuar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Facial Capture Modal */}
      <FacialCaptureModal
        visible={showFacialCapture}
        onClose={() => {
          setShowFacialCapture(false);
          if (Platform.OS === 'web') {
            setMessage(null);
          }
        }}
        onCapture={handleFacialCapture}
        title="Captura Facial - Solicitação"
      />
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
  },
  form: {
    backgroundColor: '#1E293B',
    padding: 24,
    marginTop: 8,
    gap: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#CBD5E1',
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F1F5F9',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0F172A',
    textAlignVertical: 'top',
    color: '#F1F5F9',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historySection: {
    padding: 24,
    paddingTop: 16,
  },
  historyTitle: {
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
  },
  historyCard: {
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyJustification: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageContainer: {
    backgroundColor: '#3B82F6',
    padding: 12,
    alignItems: 'center',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 14,
    color: '#F1F5F9',
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  modalWarning: {
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 16,
    marginBottom: 20,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#334155',
  },
  modalButtonConfirm: {
    backgroundColor: '#3B82F6',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '600',
  },
});

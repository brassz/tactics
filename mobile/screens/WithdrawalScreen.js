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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Wallet, CheckCircle, Clock } from 'lucide-react-native';
import { getSupabase } from '../lib/supabaseMulti';

export default function WithdrawalScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [solicitacoesAprovadas, setSolicitacoesAprovadas] = useState([]);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState(null);
  const [message, setMessage] = useState(null);
  
  // Form fields
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [chavePix, setChavePix] = useState('');

  const supabase = getSupabase();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      await loadSolicitacoesAprovadas(parsedUser.id);
    }
  };

  const loadSolicitacoesAprovadas = async (userId) => {
    // Buscar solicitações aprovadas que ainda não têm solicitação de saque
    const { data: solicitacoes } = await supabase
      .from('solicitacoes_valores')
      .select('*')
      .eq('id_user', userId)
      .eq('status', 'aprovado')
      .order('created_at', { ascending: false });

    if (solicitacoes) {
      // Verificar quais já têm solicitação de saque
      const { data: saques } = await supabase
        .from('withdrawal_requests')
        .select('id_solicitacao')
        .in('id_solicitacao', solicitacoes.map(s => s.id));

      const saquesIds = new Set(saques?.map(s => s.id_solicitacao) || []);
      const disponiveis = solicitacoes.filter(s => !saquesIds.has(s.id));
      
      setSolicitacoesAprovadas(disponiveis);
    }
  };

  const formatCPF = (text) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.slice(0, 11);
  };

  const handleSelectSolicitacao = (solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    // Preencher campos com dados do usuário
    if (user) {
      setNomeCompleto(user.nome || '');
      setCpf(user.cpf || '');
    }
  };

  const handleSubmit = async () => {
    if (!selectedSolicitacao) {
      const msg = 'Selecione uma solicitação aprovada';
      if (Platform.OS === 'web') {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
      } else {
        Alert.alert('Erro', msg);
      }
      return;
    }

    // Validação principal: PIX deve estar preenchido
    if (!chavePix || chavePix.trim() === '') {
      const msg = 'Por favor, preencha a chave PIX';
      if (Platform.OS === 'web') {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
      } else {
        Alert.alert('Erro', msg);
      }
      return;
    }

    // Validações adicionais (opcionais, mas recomendadas)
    if (!nomeCompleto || nomeCompleto.trim() === '') {
      const msg = 'Por favor, preencha o nome completo';
      if (Platform.OS === 'web') {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
      } else {
        Alert.alert('Erro', msg);
      }
      return;
    }

    if (!cpf || cpf.length !== 11) {
      const msg = 'CPF deve conter 11 dígitos';
      if (Platform.OS === 'web') {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
      } else {
        Alert.alert('Erro', msg);
      }
      return;
    }

    setLoading(true);
    if (Platform.OS === 'web') {
      setMessage('Enviando solicitação de saque...');
    }

    try {
      // Verificar se o Supabase está conectado
      if (!supabase) {
        throw new Error('Não foi possível conectar ao servidor');
      }

      // Preparar dados para inserção
      const withdrawalData = {
        id_solicitacao: selectedSolicitacao.id,
        id_user: user.id,
        nome_completo: nomeCompleto.trim(),
        cpf: cpf,
        chave_pix: chavePix.trim(),
        status: 'pendente',
      };

      console.log('=== DADOS DO SAQUE ===');
      console.log('ID Solicitação:', withdrawalData.id_solicitacao);
      console.log('ID User:', withdrawalData.id_user);
      console.log('Nome:', withdrawalData.nome_completo);
      console.log('CPF:', withdrawalData.cpf);
      console.log('Chave PIX:', withdrawalData.chave_pix);
      console.log('Status:', withdrawalData.status);

      // Inserir no banco de dados
      if (Platform.OS === 'web') {
        setMessage('Salvando dados no servidor...');
      }

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert([withdrawalData])
        .select(); // Retornar os dados inseridos para confirmar

      if (error) {
        console.error('=== ERRO AO INSERIR SAQUE ===');
        console.error('Código:', error.code);
        console.error('Mensagem:', error.message);
        console.error('Detalhes:', error.details);
        console.error('Hint:', error.hint);
        console.error('Erro completo:', JSON.stringify(error, null, 2));
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum dado foi retornado após a inserção');
      }

      console.log('=== SAQUE INSERIDO COM SUCESSO ===');
      console.log('Dados retornados:', data);

      // Sucesso - PIX foi preenchido e solicitação criada
      const successMsg = 'Solicitação de saque enviada com sucesso! Aguarde o processamento.';
      
      if (Platform.OS === 'web') {
        setMessage(successMsg);
        setTimeout(() => {
          setMessage(null);
          setSelectedSolicitacao(null);
          setNomeCompleto('');
          setCpf('');
          setChavePix('');
          loadData();
        }, 3000);
      } else {
        Alert.alert(
          'Sucesso!',
          successMsg,
          [
            {
              text: 'OK',
              onPress: () => {
                setSelectedSolicitacao(null);
                setNomeCompleto('');
                setCpf('');
                setChavePix('');
                loadData();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      
      // Mensagem de erro mais detalhada
      let errorMsg = 'Erro ao enviar solicitação de saque.';
      
      if (error?.message) {
        errorMsg += ` ${error.message}`;
      }
      
      if (error?.code) {
        errorMsg += ` (Código: ${error.code})`;
      }
      
      // Log detalhado para debug
      if (Platform.OS === 'web') {
        console.error('Erro completo:', JSON.stringify(error, null, 2));
      }
      
      if (Platform.OS === 'web') {
        setMessage(errorMsg);
        setTimeout(() => setMessage(null), 5000);
      } else {
        Alert.alert('Erro', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {message && Platform.OS === 'web' && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#F1F5F9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CAIXA</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Wallet size={48} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Solicitar Saque</Text>
          <Text style={styles.subtitle}>
            Preencha os dados para solicitar o saque do valor aprovado
          </Text>

          {/* Lista de Solicitações Aprovadas */}
          {solicitacoesAprovadas.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhuma solicitação aprovada disponível para saque
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Solicitações Aprovadas</Text>
                {solicitacoesAprovadas.map((solicitacao) => (
                  <TouchableOpacity
                    key={solicitacao.id}
                    style={[
                      styles.solicitacaoCard,
                      selectedSolicitacao?.id === solicitacao.id && styles.solicitacaoCardSelected,
                    ]}
                    onPress={() => handleSelectSolicitacao(solicitacao)}
                  >
                    <View style={styles.solicitacaoHeader}>
                      <Text style={styles.solicitacaoValue}>
                        R$ {parseFloat(solicitacao.valor).toFixed(2)}
                      </Text>
                      {selectedSolicitacao?.id === solicitacao.id && (
                        <CheckCircle size={20} color="#10B981" />
                      )}
                    </View>
                    <Text style={styles.solicitacaoDate}>
                      Aprovado em {new Date(solicitacao.created_at).toLocaleDateString('pt-BR')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedSolicitacao && (
                <View style={styles.form}>
                  <Text style={styles.formTitle}>Dados para Saque</Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nome Completo *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Digite seu nome completo"
                      value={nomeCompleto}
                      onChangeText={setNomeCompleto}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>CPF *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="00000000000"
                      value={cpf}
                      onChangeText={(text) => setCpf(formatCPF(text))}
                      keyboardType="numeric"
                      maxLength={11}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Chave PIX *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="CPF, e-mail, telefone ou chave aleatória"
                      value={chavePix}
                      onChangeText={setChavePix}
                      autoCapitalize="none"
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
                        <Wallet size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Solicitar Saque</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 32,
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
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 16,
  },
  solicitacaoCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#334155',
  },
  solicitacaoCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A8A',
  },
  solicitacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  solicitacaoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  solicitacaoDate: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  form: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#0F172A',
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
});


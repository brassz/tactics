import React, { useState } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft } from 'lucide-react-native';
import { getSupabase } from '../lib/supabaseMulti';

export default function RegisterScreen({ navigation }) {
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState(''); // FRANCA, MOGIANA, PRAIA GRANDE, IMPERATRIZ
  const [endereco, setEndereco] = useState('');
  const [rg, setRg] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [contatoEmergenciaNome, setContatoEmergenciaNome] = useState('');
  const [contatoEmergenciaTelefone, setContatoEmergenciaTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  const cidades = [
    { id: 'franca', name: 'FRANCA' },
    { id: 'mogiana', name: 'MOGIANA' },
    { id: 'litoral', name: 'PRAIA GRANDE' },
    { id: 'imperatriz', name: 'IMPERATRIZ' },
  ];

  const formatCPF = (text) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.slice(0, 11);
  };

  const formatCelular = (text) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.slice(0, 11);
  };

  const formatRG = (text) => {
    // RG aceita letras e números
    return text.slice(0, 20);
  };

  const formatData = (text) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    return formatted;
  };

  const formatContatoEmergenciaTelefone = (text) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.slice(0, 11);
  };

  const handleRegister = async () => {
    // Validar campos obrigatórios
    if (!cpf || !nome || !celular || !email || !cidade || !endereco) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validar CPF
    if (cpf.length !== 11) {
      Alert.alert('Erro', 'CPF deve conter 11 dígitos');
      return;
    }

    // Validar Celular
    if (celular.length !== 11) {
      Alert.alert('Erro', 'Celular deve conter DDD + 9 dígitos (ex: 11999999999)');
      return;
    }

    // Validar Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    // Validar data de nascimento se preenchida
    if (dataNascimento && dataNascimento.length > 0 && dataNascimento.length !== 10) {
      Alert.alert('Erro', 'Data de nascimento deve estar no formato DD/MM/AAAA');
      return;
    }

    setLoading(true);

    try {
      // Obter instância do Supabase atual
      const supabase = getSupabase();
      
      // Verificar se CPF já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('cpf', cpf)
        .single();

      if (existingUser) {
        Alert.alert('Erro', 'CPF já cadastrado');
        setLoading(false);
        return;
      }

      // Converter data de nascimento para formato SQL
      let birthDateSQL = null;
      if (dataNascimento && dataNascimento.length === 10) {
        const [dia, mes, ano] = dataNascimento.split('/');
        birthDateSQL = `${ano}-${mes}-${dia}`;
      }

      // Mapear cidade para company
      const cidadeSelecionada = cidades.find(c => c.name === cidade);
      const companyId = cidadeSelecionada ? cidadeSelecionada.id : 'franca';
      
      // Criar usuário
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            cpf,
            nome: nome,
            phone: celular,
            email,
            city: cidade, // Cidade selecionada (FRANCA, MOGIANA, PRAIA GRANDE, IMPERATRIZ)
            address: endereco,
            rg: rg || null,
            birth_date: birthDateSQL,
            company: companyId, // franca, mogiana, litoral
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Criar contato de emergência se preenchido
      if (contatoEmergenciaNome && contatoEmergenciaTelefone) {
        const { error: emergencyError } = await supabase
          .from('emergency_contacts')
          .insert([
            {
              client_id: data.id,
              name: contatoEmergenciaNome,
              phone: contatoEmergenciaTelefone,
              client_name: nome,
              client_cpf: cpf,
              client_email: email,
              client_phone: celular,
            },
          ]);
        
        if (emergencyError) {
          console.error('Error creating emergency contact:', emergencyError);
          // Não bloqueia o cadastro se falhar o contato de emergência
        }
      }

      // Redirecionar para envio de documentos
      Alert.alert(
        'Cadastro realizado!',
        'Agora envie seus documentos para análise.',
        [
          {
            text: 'Continuar',
            onPress: () => navigation.navigate('DocumentUpload', { user: data }),
          },
        ]
      );
    } catch (error) {
      console.error('Error registering:', error);
      Alert.alert('Erro', 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Preencha seus dados para começar
          </Text>

        <View style={styles.form}>
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
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Celular *</Text>
            <TextInput
              style={styles.input}
              placeholder="11999999999"
              value={celular}
              onChangeText={(text) => setCelular(formatCelular(text))}
              keyboardType="phone-pad"
              maxLength={11}
            />
            <Text style={styles.hint}>DDD + número (ex: 11999999999)</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cidade *</Text>
            <View style={styles.cidadesContainer}>
              {cidades.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.cidadeButton,
                    cidade === c.name && styles.cidadeButtonSelected
                  ]}
                  onPress={() => setCidade(c.name)}
                >
                  <Text style={[
                    styles.cidadeButtonText,
                    cidade === c.name && styles.cidadeButtonTextSelected
                  ]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Endereço Completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Rua, número, bairro"
              value={endereco}
              onChangeText={setEndereco}
              autoCapitalize="words"
              multiline
            />
            <Text style={styles.hint}>Ex: Rua Perola Byngton 279 Casa 2, Pq Bitaru</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>RG</Text>
            <TextInput
              style={styles.input}
              placeholder="00.000.000-0"
              value={rg}
              onChangeText={(text) => setRg(formatRG(text))}
              maxLength={20}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={dataNascimento}
              onChangeText={(text) => setDataNascimento(formatData(text))}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contato de Emergência - Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome completo do contato"
              value={contatoEmergenciaNome}
              onChangeText={setContatoEmergenciaNome}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contato de Emergência - Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="11999999999"
              value={contatoEmergenciaTelefone}
              onChangeText={(text) => setContatoEmergenciaTelefone(formatContatoEmergenciaTelefone(text))}
              keyboardType="phone-pad"
              maxLength={11}
            />
            <Text style={styles.hint}>DDD + número (ex: 11999999999)</Text>
          </View>

          <Text style={styles.requiredNote}>* Campos obrigatórios</Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>
        </View>
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
    padding: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5E1',
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  hint: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#1E293B',
    color: '#F1F5F9',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
  requiredNote: {
    fontSize: 12,
    color: '#CBD5E1',
    fontStyle: 'italic',
    marginTop: -8,
  },
  cidadesContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  cidadeButton: {
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
  },
  cidadeButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A8A',
  },
  cidadeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CBD5E1',
    textAlign: 'center',
  },
  cidadeButtonTextSelected: {
    color: '#3B82F6',
  },
});

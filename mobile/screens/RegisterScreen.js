import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function RegisterScreen({ navigation }) {
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCPF = (text) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.slice(0, 11);
  };

  const formatTelefone = (text) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.slice(0, 11);
  };

  const handleRegister = async () => {
    if (!cpf || !nome) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (cpf.length !== 11) {
      Alert.alert('Erro', 'CPF deve conter 11 dígitos');
      return;
    }

    setLoading(true);

    try {
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

      // Criar usuário
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            cpf,
            nome,
            telefone: telefone || null,
            email: email || null,
            status: 'pendente',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      Alert.alert(
        'Sucesso!',
        'Cadastro realizado com sucesso. Aguarde a aprovação do administrador.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
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

      <View style={styles.content}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>
          Preencha seus dados para começar
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>CPF</Text>
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
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Telefone (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="11999999999"
              value={telefone}
              onChangeText={(text) => setTelefone(formatTelefone(text))}
              keyboardType="phone-pad"
              maxLength={11}
            />
            <Text style={styles.hint}>DDD + número (ex: 11999999999)</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
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
    color: '#374151',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
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
});

import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { ArrowLeft, Fingerprint } from 'lucide-react-native';
import { supabase } from '../lib/supabaseMulti';

export default function LoginScreen({ navigation }) {
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricAuthenticated, setBiometricAuthenticated] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
  };

  const authenticateBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para continuar',
        fallbackLabel: 'Usar senha',
        cancelLabel: 'Cancelar',
      });

      if (result.success) {
        setBiometricAuthenticated(true);
        return true;
      } else {
        Alert.alert('Erro', 'Autenticação falhou. Tente novamente.');
        return false;
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Alert.alert('Erro', 'Erro ao autenticar. Tente novamente.');
      return false;
    }
  };

  const formatCPF = (text) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.slice(0, 11);
  };

  const handleLogin = async () => {
    if (!cpf) {
      Alert.alert('Erro', 'Por favor, informe seu CPF');
      return;
    }

    if (cpf.length !== 11) {
      Alert.alert('Erro', 'CPF deve conter 11 dígitos');
      return;
    }

    // Verificar autenticação biométrica primeiro
    if (biometricAvailable && !biometricAuthenticated) {
      const authenticated = await authenticateBiometric();
      if (!authenticated) {
        return;
      }
    }

    setLoading(true);

    try {
      // Verificar se é admin
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('cpf', cpf)
        .single();

      if (admin && !adminError) {
        // Redirecionar para seleção de empresa
        navigation.navigate('CompanySelect', { cpf });
        setLoading(false);
        return;
      }

      // Se não é admin, buscar na tabela de usuários
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('cpf', cpf)
        .single();

      if (error || !user) {
        Alert.alert('Erro', 'CPF não encontrado');
        setLoading(false);
        return;
      }

      if (user.status === 'pendente') {
        Alert.alert(
          'Aguardando Aprovação',
          'Seu cadastro ainda está em análise. Por favor, aguarde a aprovação do administrador.'
        );
        setLoading(false);
        return;
      }

      if (user.status === 'reprovado') {
        Alert.alert(
          'Cadastro Reprovado',
          'Seu cadastro foi reprovado. Entre em contato com o suporte.'
        );
        setLoading(false);
        return;
      }

      // Verificar se já enviou documentos
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('id_user', user.id)
        .single();

      // Salvar usuário
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Se não enviou documentos, ir para tela de upload
      if (!documents) {
        navigation.navigate('DocumentUpload', { user });
      }
      // O app vai recarregar automaticamente através do polling do AsyncStorage
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
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
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>
          Informe seu CPF para acessar
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

          {biometricAvailable && !biometricAuthenticated && (
            <View style={styles.biometricInfo}>
              <Fingerprint size={20} color="#3B82F6" />
              <Text style={styles.biometricText}>
                Autenticação biométrica será solicitada
              </Text>
            </View>
          )}

          {biometricAuthenticated && (
            <View style={styles.biometricSuccess}>
              <Fingerprint size={20} color="#10B981" />
              <Text style={styles.biometricSuccessText}>
                Autenticado com sucesso!
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
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
  biometricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  biometricText: {
    fontSize: 14,
    color: '#3B82F6',
    flex: 1,
  },
  biometricSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  biometricSuccessText: {
    fontSize: 14,
    color: '#10B981',
    flex: 1,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Building2 } from 'lucide-react-native';
import { COMPANIES_LIST } from '../config/companies';
import { setCurrentCompany, supabase } from '../lib/supabaseMulti';

export default function CompanySelectScreen({ navigation, route }) {
  const { cpf } = route.params;
  const [loading, setLoading] = useState(false);

  const handleSelectCompany = async (company) => {
    setLoading(true);
    
    try {
      // Definir empresa atual
      await setCurrentCompany(company.id);
      
      // Buscar dados do admin
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('cpf', cpf)
        .single();
      
      if (error || !admin) {
        Alert.alert('Erro', 'Admin não encontrado nesta empresa');
        setLoading(false);
        return;
      }
      
      // Salvar admin no AsyncStorage
      await AsyncStorage.setItem('admin', JSON.stringify(admin));
      
      // O App.js vai detectar e redirecionar automaticamente
    } catch (error) {
      console.error('Error selecting company:', error);
      Alert.alert('Erro', 'Erro ao selecionar empresa. Tente novamente.');
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

      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Selecione a Empresa</Text>
        <Text style={styles.subtitle}>
          Escolha qual empresa deseja acessar como administrador
        </Text>

        <View style={styles.companiesContainer}>
          {COMPANIES_LIST.map((company) => (
            <TouchableOpacity
              key={company.id}
              style={styles.companyCard}
              onPress={() => handleSelectCompany(company)}
              disabled={loading}
            >
              <View style={styles.companyIcon}>
                <Building2 size={32} color="#3B82F6" />
              </View>
              <Text style={styles.companyName}>{company.name}</Text>
              {loading ? (
                <ActivityIndicator color="#3B82F6" />
              ) : (
                <Text style={styles.companyAction}>Acessar →</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.infoText}>
          CPF: {cpf}
        </Text>
      </ScrollView>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  companiesContainer: {
    gap: 16,
  },
  companyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  companyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  companyAction: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 32,
  },
});

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, COMPANY_DATABASES } from '../config/companies';

// Instância ÚNICA do Supabase (usada para: cadastros pendentes + storage)
export const supabase = createClient(
  SUPABASE_CONFIG.supabaseUrl,
  SUPABASE_CONFIG.supabaseKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Para compatibilidade com código que usa supabaseStorage
export const supabaseStorage = supabase;

// Função para obter cliente Supabase de uma empresa específica
export const getCompanySupabase = (companyId) => {
  const config = COMPANY_DATABASES[companyId];
  if (!config) {
    console.error(`Company ${companyId} not found`);
    return null;
  }
  
  return createClient(config.supabaseUrl, config.supabaseKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};

// Empresa atual selecionada (apenas para filtros)
let currentCompanyId = 'franca';

// Função para obter a empresa atual do storage
export const getCurrentCompany = async () => {
  try {
    const companyId = await AsyncStorage.getItem('selectedCompany');
    return companyId || 'franca';
  } catch (error) {
    console.error('Error getting current company:', error);
    return 'franca';
  }
};

// Função para definir a empresa atual
export const setCurrentCompany = async (companyId) => {
  try {
    await AsyncStorage.setItem('selectedCompany', companyId);
    currentCompanyId = companyId;
    return true;
  } catch (error) {
    console.error('Error setting current company:', error);
    return false;
  }
};

// Função para obter o cliente Supabase (sempre o mesmo)
export const getSupabase = () => {
  return supabase;
};

// Função para obter o ID da empresa atual
export const getCurrentCompanyId = () => {
  return currentCompanyId;
};

// Inicializar a empresa atual do storage
export const initializeSupabase = async () => {
  const companyId = await getCurrentCompany();
  await setCurrentCompany(companyId);
};

// Para compatibilidade com LoginScreen
export const getAllSupabaseInstances = () => {
  // Retorna a mesma instância para todas as empresas
  return {
    franca: supabase,
    mogiana: supabase,
    litoral: supabase,
  };
};

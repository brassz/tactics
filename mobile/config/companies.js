// Configuração do Supabase ÚNICO (usado para cadastros pendentes e storage)
export const SUPABASE_CONFIG = {
  supabaseUrl: 'https://zwazrwqrbghdicywipaq.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXpyd3FyYmdoZGljeXdpcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzY4MzEsImV4cCI6MjA3Njg1MjgzMX0.y3zCgl0DRUNqxJpe2Uc3w2qDArkRLDekg2zCEuk9Rn0',
};

// Configuração dos bancos de dados de cada empresa (para clientes aprovados)
export const COMPANY_DATABASES = {
  franca: {
    supabaseUrl: 'https://mhtxyxizfnxupwmilith.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odHh5eGl6Zm54dXB3bWlsaXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzIzMDYsImV4cCI6MjA3MTcwODMwNn0.s1Y9kk2Va5EMcwAEGQmhTxo70Zv0o9oR6vrJixwEkWI',
  },
  mogiana: {
    supabaseUrl: 'https://eemfnpefgojllvzzaimu.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbWZucGVmZ29qbGx2enphaW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjUyNjIsImV4cCI6MjA3Mjc0MTI2Mn0.PKJJ-scljbF3CFrFtMz6Rq03lVt36NQxooEH3kOcr5Y',
  },
  litoral: {
    supabaseUrl: 'https://dtifsfzmnjnllzzlndxv.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aWZzZnptbmpubGx6emxuZHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjQ5NzUsImV4cCI6MjA3Mjc0MDk3NX0.V40szmRzuvni2J4GK5-qZUR7nBWeUy7ikYy9B7iHxkA',
  },
};

// Lista de empresas (com informações completas)
export const COMPANIES = {
  FRANCA: {
    id: 'franca',
    name: 'FRANCA CRED',
  },
  MOGIANA: {
    id: 'mogiana',
    name: 'MOGIANA CRED',
  },
  LITORAL: {
    id: 'litoral',
    name: 'LITORAL CRED',
  },
};

// Array de empresas para listagem
export const COMPANIES_LIST = Object.values(COMPANIES);

// Função para obter empresa por ID
export const getCompanyById = (id) => {
  return COMPANIES_LIST.find(company => company.id === id);
};

// Função para obter empresa por nome
export const getCompanyByName = (name) => {
  return COMPANIES_LIST.find(company => company.name === name);
};

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://zwazrwqrbghdicywipaq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXpyd3FyYmdoZGljeXdpcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzY4MzEsImV4cCI6MjA3Njg1MjgzMX0.y3zCgl0DRUNqxJpe2Uc3w2qDArkRLDekg2zCEuk9Rn0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificacaoCompleta() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 VERIFICAÇÃO COMPLETA - SISTEMA ADMINISTRATIVO');
  console.log('═══════════════════════════════════════════════════\n');

  let allOk = true;

  // 1. Verificar arquivo .env do admin-panel
  console.log('1️⃣  Verificando arquivo .env do admin-panel...');
  const envPath = path.join(__dirname, 'admin-panel', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('zwazrwqrbghdicywipaq') && envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
      console.log('   ✅ Arquivo .env configurado corretamente\n');
    } else {
      console.log('   ⚠️  Arquivo .env existe mas pode estar incorreto\n');
      allOk = false;
    }
  } else {
    console.log('   ❌ Arquivo .env não encontrado!\n');
    allOk = false;
  }

  // 2. Verificar arquivo .env do mobile
  console.log('2️⃣  Verificando arquivo .env do mobile...');
  const mobileEnvPath = path.join(__dirname, 'mobile', '.env');
  if (fs.existsSync(mobileEnvPath)) {
    const mobileEnvContent = fs.readFileSync(mobileEnvPath, 'utf8');
    if (mobileEnvContent.includes('zwazrwqrbghdicywipaq') && mobileEnvContent.includes('EXPO_PUBLIC_SUPABASE_URL')) {
      console.log('   ✅ Arquivo .env configurado corretamente\n');
    } else {
      console.log('   ⚠️  Arquivo .env existe mas pode estar incorreto\n');
    }
  } else {
    console.log('   ⚠️  Arquivo .env do mobile não encontrado\n');
  }

  // 3. Verificar conexão com Supabase
  console.log('3️⃣  Testando conexão com Supabase...');
  try {
    const { data, error } = await supabase.from('admins').select('count', { count: 'exact', head: true });
    if (!error) {
      console.log('   ✅ Conexão com Supabase funcionando\n');
    } else {
      console.log('   ❌ Erro na conexão:', error.message, '\n');
      allOk = false;
    }
  } catch (err) {
    console.log('   ❌ Erro ao conectar:', err.message, '\n');
    allOk = false;
  }

  // 4. Verificar admin no banco
  console.log('4️⃣  Verificando administrador no banco de dados...');
  const { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('*')
    .eq('cpf', '42483289843')
    .single();

  if (adminError) {
    console.log('   ❌ Admin não encontrado:', adminError.message, '\n');
    allOk = false;
  } else if (admin) {
    console.log('   ✅ Admin encontrado com sucesso!');
    console.log('      CPF:', admin.cpf);
    console.log('      Nome:', admin.nome);
    console.log('      ID:', admin.id, '\n');
  }

  // 5. Testar processo de login
  console.log('5️⃣  Simulando processo de login...');
  const { data: loginTest, error: loginError } = await supabase
    .from('admins')
    .select('*')
    .eq('cpf', '42483289843')
    .single();

  if (loginError || !loginTest) {
    console.log('   ❌ Login falhou\n');
    allOk = false;
  } else {
    console.log('   ✅ Login funcionaria corretamente!\n');
  }

  // Resumo final
  console.log('═══════════════════════════════════════════════════');
  if (allOk) {
    console.log('✅ TUDO CONFIGURADO CORRETAMENTE!');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('📝 PRÓXIMOS PASSOS:\n');
    console.log('1. Inicie o servidor:');
    console.log('   cd admin-panel');
    console.log('   npm install');
    console.log('   npm run dev\n');
    console.log('2. Acesse: http://localhost:3000\n');
    console.log('3. Digite o CPF: 42483289843\n');
    console.log('4. Clique em "Entrar"\n');
  } else {
    console.log('⚠️  ALGUNS PROBLEMAS FORAM ENCONTRADOS');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('Consulte o arquivo LOGIN_TROUBLESHOOTING.md para mais informações.\n');
  }
}

verificacaoCompleta();

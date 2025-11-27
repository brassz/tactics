const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zwazrwqrbghdicywipaq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXpyd3FyYmdoZGljeXdpcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzY4MzEsImV4cCI6MjA3Njg1MjgzMX0.y3zCgl0DRUNqxJpe2Uc3w2qDArkRLDekg2zCEuk9Rn0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTudo() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 VERIFICAÇÃO COMPLETA DO SISTEMA');
  console.log('═══════════════════════════════════════════════════\n');

  const cpf = '42483289843';

  // Verificar Admin
  console.log('1️⃣  PAINEL ADMINISTRATIVO (Web)');
  console.log('─────────────────────────────────────────────────');
  const { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('*')
    .eq('cpf', cpf)
    .single();

  if (admin) {
    console.log('✅ Admin encontrado!');
    console.log('   CPF:', admin.cpf);
    console.log('   Nome:', admin.nome);
    console.log('   Acesso: http://localhost:3000');
    console.log('   Comando: cd admin-panel && npm run dev\n');
  } else {
    console.log('❌ Admin não encontrado\n');
  }

  // Verificar Usuário
  console.log('2️⃣  APP MOBILE (Expo)');
  console.log('─────────────────────────────────────────────────');
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('cpf', cpf)
    .single();

  if (user) {
    console.log('✅ Usuário encontrado!');
    console.log('   CPF:', user.cpf);
    console.log('   Nome:', user.nome);
    console.log('   Status:', user.status);
    console.log('   Pode logar:', user.status === 'aprovado' ? 'SIM ✓' : 'NÃO ✗');
    console.log('   Comando: cd mobile && npx expo start\n');
  } else {
    console.log('❌ Usuário não encontrado\n');
  }

  // Resumo
  console.log('═══════════════════════════════════════════════════');
  console.log('📋 RESUMO');
  console.log('═══════════════════════════════════════════════════\n');
  
  if (admin && user) {
    console.log('✅ TUDO CONFIGURADO PERFEITAMENTE!\n');
    console.log('Você pode:');
    console.log('✓ Acessar o painel admin com CPF:', cpf);
    console.log('✓ Fazer login no app mobile com CPF:', cpf);
    console.log('\n📖 Consulte o arquivo INICIO_RAPIDO.md para mais detalhes!\n');
  } else {
    console.log('⚠️  Alguns acessos não foram encontrados:\n');
    if (!admin) console.log('❌ Admin não configurado');
    if (!user) console.log('❌ Usuário mobile não configurado');
    console.log('');
  }
}

verificarTudo();

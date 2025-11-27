// Script para testar login de administradores no app mobile
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zwazrwqrbghdicywipaq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXpyd3FyYmdoZGljeXdpcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzY4MzEsImV4cCI6MjA3Njg1MjgzMX0.y3zCgl0DRUNqxJpe2Uc3w2qDArkRLDekg2zCEuk9Rn0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simular o fluxo de login do LoginScreen.js
async function testAdminLogin(cpf) {
  console.log(`\n🔍 Testando login com CPF: ${cpf}`);
  console.log('─'.repeat(50));

  try {
    // Primeiro, verificar se é um administrador
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (admin && !adminError) {
      console.log('✅ ADMIN ENCONTRADO!');
      console.log(`   Nome: ${admin.nome}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   CPF: ${admin.cpf}`);
      console.log(`   ⚡ Login seria permitido como administrador`);
      
      const adminUser = {
        id: admin.id,
        cpf: admin.cpf,
        nome: admin.nome,
        status: 'aprovado',
        isAdmin: true,
      };
      
      console.log('\n📦 Objeto de usuário admin criado:');
      console.log(JSON.stringify(adminUser, null, 2));
      return { success: true, type: 'admin', user: adminUser };
    }

    // Se não é admin, buscar na tabela de usuários
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (error || !user) {
      console.log('❌ CPF NÃO ENCONTRADO em nenhuma tabela');
      return { success: false, type: null };
    }

    console.log('✅ USUÁRIO ENCONTRADO!');
    console.log(`   Nome: ${user.nome}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   CPF: ${user.cpf}`);
    console.log(`   Status: ${user.status}`);

    if (user.status === 'pendente') {
      console.log('⚠️  Login bloqueado: aguardando aprovação');
      return { success: false, type: 'user', reason: 'pendente' };
    }

    if (user.status === 'reprovado') {
      console.log('❌ Login bloqueado: cadastro reprovado');
      return { success: false, type: 'user', reason: 'reprovado' };
    }

    console.log('⚡ Login seria permitido como usuário regular');
    return { success: true, type: 'user', user };

  } catch (error) {
    console.error('❌ Erro ao fazer login:', error.message);
    return { success: false, type: null, error };
  }
}

// Testar todos os CPFs
async function runTests() {
  console.log('\n🧪 TESTE DE LOGIN - APP MOBILE');
  console.log('═'.repeat(50));

  // Lista de CPFs para testar
  const testCPFs = [
    { cpf: '05050149045', desc: 'Administrador Principal' },
    { cpf: '42483289843', desc: 'Admin JA' },
    { cpf: '00000000000', desc: 'Administrador Master' },
    { cpf: '12345678901', desc: 'CPF que não existe' },
  ];

  const results = [];

  for (const test of testCPFs) {
    const result = await testAdminLogin(test.cpf);
    results.push({
      ...test,
      ...result,
    });
  }

  // Resumo dos testes
  console.log('\n\n📊 RESUMO DOS TESTES');
  console.log('═'.repeat(50));

  results.forEach((result) => {
    const status = result.success ? '✅' : '❌';
    const type = result.type === 'admin' ? '👑 Admin' : result.type === 'user' ? '👤 Usuário' : '❌ Não encontrado';
    console.log(`${status} ${result.cpf} (${result.desc})`);
    console.log(`   Tipo: ${type}`);
    if (result.reason) {
      console.log(`   Motivo: ${result.reason}`);
    }
    console.log('');
  });

  console.log('═'.repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\n✨ RESULTADO FINAL: ${successful}/${total} logins bem-sucedidos\n`);
}

// Executar os testes
runTests().catch(console.error);

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zwazrwqrbghdicywipaq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXpyd3FyYmdoZGljeXdpcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzY4MzEsImV4cCI6MjA3Njg1MjgzMX0.y3zCgl0DRUNqxJpe2Uc3w2qDArkRLDekg2zCEuk9Rn0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const cpf = '42483289843';
  
  console.log('🧪 Testando login como o painel admin faz...\n');
  console.log(`Buscando admin com CPF: ${cpf}\n`);

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (error) {
      console.error('❌ ERRO:', error.message);
      console.error('Detalhes:', error);
      return;
    }

    if (!admin) {
      console.log('❌ Nenhum admin encontrado com esse CPF');
      return;
    }

    console.log('✅ LOGIN BEM-SUCEDIDO!');
    console.log('\nDados do admin que seriam salvos no localStorage:');
    console.log(JSON.stringify(admin, null, 2));
    console.log('\n✅ O login está funcionando corretamente!');
    console.log('\n📝 Instruções:');
    console.log('1. Acesse o painel admin');
    console.log('2. Digite o CPF: 42483289843');
    console.log('3. Clique em "Entrar"');

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
}

testLogin();

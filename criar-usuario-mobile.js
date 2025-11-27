const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zwazrwqrbghdicywipaq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXpyd3FyYmdoZGljeXdpcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzY4MzEsImV4cCI6MjA3Njg1MjgzMX0.y3zCgl0DRUNqxJpe2Uc3w2qDArkRLDekg2zCEuk9Rn0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function criarUsuario() {
  console.log('📱 Criando usuário para o app mobile...\n');

  // Criar usuário
  const { data: user, error } = await supabase
    .from('users')
    .insert([
      {
        cpf: '42483289843',
        nome: 'JA',
        status: 'aprovado'  // Já aprovado para conseguir logar
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    return;
  }

  console.log('✅ Usuário criado com sucesso!');
  console.log('\n📋 Dados do usuário:');
  console.log('   CPF:', user.cpf);
  console.log('   Nome:', user.nome);
  console.log('   Status:', user.status);
  console.log('   ID:', user.id);

  console.log('\n📱 Como usar no app mobile:');
  console.log('1. Abra o app no Expo');
  console.log('2. Clique em "Já tenho conta"');
  console.log('3. Digite o CPF: 42483289843');
  console.log('4. Clique em "Entrar"');
  console.log('\n✅ Pronto! Você poderá acessar o app!');
}

criarUsuario();

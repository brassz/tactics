const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zwazrwqrbghdicywipaq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXpyd3FyYmdoZGljeXdpcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzY4MzEsImV4cCI6MjA3Njg1MjgzMX0.y3zCgl0DRUNqxJpe2Uc3w2qDArkRLDekg2zCEuk9Rn0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listarAdmins() {
  console.log('═══════════════════════════════════════════════════');
  console.log('📋 LISTA DE ADMINISTRADORES');
  console.log('═══════════════════════════════════════════════════\n');

  const { data: admins, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar admins:', error.message);
    return;
  }

  if (!admins || admins.length === 0) {
    console.log('⚠️  Nenhum administrador encontrado\n');
    return;
  }

  console.log(`✅ Total de administradores: ${admins.length}\n`);

  admins.forEach((admin, index) => {
    console.log(`${index + 1}. ${admin.nome}`);
    console.log(`   CPF: ${admin.cpf}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Criado em: ${new Date(admin.created_at).toLocaleString('pt-BR')}`);
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════');
  console.log('🖥️  COMO FAZER LOGIN');
  console.log('═══════════════════════════════════════════════════\n');
  console.log('1. Inicie o servidor:');
  console.log('   cd admin-panel && npm run dev\n');
  console.log('2. Acesse: http://localhost:3000\n');
  console.log('3. Digite um dos CPFs acima\n');
  console.log('4. Clique em "Entrar"\n');
}

listarAdmins();

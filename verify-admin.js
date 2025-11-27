const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zwazrwqrbghdicywipaq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3YXpyd3FyYmdoZGljeXdpcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzY4MzEsImV4cCI6MjA3Njg1MjgzMX0.y3zCgl0DRUNqxJpe2Uc3w2qDArkRLDekg2zCEuk9Rn0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAdmin() {
  console.log('🔍 Verificando administradores no banco de dados...\n');
  
  // Listar todos os admins
  console.log('1. Buscando todos os administradores:');
  const { data: allAdmins, error: allError } = await supabase
    .from('admins')
    .select('*');

  if (allError) {
    console.error('❌ Erro ao buscar admins:', allError.message);
  } else {
    console.log('✅ Total de admins encontrados:', allAdmins?.length || 0);
    if (allAdmins && allAdmins.length > 0) {
      allAdmins.forEach(admin => {
        console.log(`   - CPF: ${admin.cpf}, Nome: ${admin.nome}`);
      });
    }
  }

  console.log('\n2. Buscando admin específico (CPF: 42483289843):');
  const { data: specificAdmin, error: specificError } = await supabase
    .from('admins')
    .select('*')
    .eq('cpf', '42483289843')
    .single();

  if (specificError) {
    console.error('❌ Erro ao buscar admin específico:', specificError.message);
    console.log('\n⚠️  PROBLEMA ENCONTRADO: Admin não existe ou não pode ser acessado!');
  } else if (specificAdmin) {
    console.log('✅ Admin encontrado!');
    console.log('   CPF:', specificAdmin.cpf);
    console.log('   Nome:', specificAdmin.nome);
    console.log('   ID:', specificAdmin.id);
    console.log('\n✅ O admin está configurado corretamente no banco de dados!');
  }
}

verifyAdmin();

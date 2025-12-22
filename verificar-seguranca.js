/**
 * Script de Verificação - Funcionalidades de Segurança
 * 
 * Este script verifica se todas as funcionalidades de segurança
 * estão configuradas corretamente no banco de dados.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'SUA_URL_AQUI';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'SUA_KEY_AQUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verificarTabelaCapturasFaciais() {
  console.log('\n🔍 Verificando tabela capturas_faciais...');
  
  try {
    const { data, error } = await supabase
      .from('capturas_faciais')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Tabela capturas_faciais não encontrada ou sem permissão');
      console.log('   Execute: supabase/migration-facial-captures.sql');
      return false;
    }
    
    console.log('✅ Tabela capturas_faciais existe e está acessível');
    return true;
  } catch (err) {
    console.log('❌ Erro ao verificar tabela:', err.message);
    return false;
  }
}

async function verificarStorage() {
  console.log('\n🔍 Verificando Storage (bucket user-documents)...');
  
  try {
    const { data, error } = await supabase.storage
      .from('user-documents')
      .list('', { limit: 1 });
    
    if (error) {
      console.log('❌ Bucket user-documents não encontrado ou sem permissão');
      console.log('   Crie o bucket no Supabase Dashboard');
      return false;
    }
    
    console.log('✅ Bucket user-documents existe e está acessível');
    return true;
  } catch (err) {
    console.log('❌ Erro ao verificar storage:', err.message);
    return false;
  }
}

async function verificarUsuariosTeste() {
  console.log('\n🔍 Verificando usuários de teste...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, cpf, nome, status')
      .limit(5);
    
    if (error) {
      console.log('❌ Erro ao buscar usuários:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado');
      console.log('   Cadastre um usuário de teste no app');
      return false;
    }
    
    console.log(`✅ ${data.length} usuário(s) encontrado(s):`);
    data.forEach(user => {
      console.log(`   - ${user.nome} (CPF: ${user.cpf}, Status: ${user.status})`);
    });
    return true;
  } catch (err) {
    console.log('❌ Erro ao verificar usuários:', err.message);
    return false;
  }
}

async function verificarCapturasFaciais() {
  console.log('\n🔍 Verificando capturas faciais existentes...');
  
  try {
    const { data, error } = await supabase
      .from('capturas_faciais')
      .select('id, tipo_operacao, created_at, users(nome)')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('❌ Erro ao buscar capturas:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️  Nenhuma captura facial encontrada ainda');
      console.log('   Faça uma solicitação ou pagamento no app para testar');
      return true; // Não é erro, apenas ainda não tem dados
    }
    
    console.log(`✅ ${data.length} captura(s) facial(is) encontrada(s):`);
    data.forEach(captura => {
      console.log(`   - ${captura.tipo_operacao} em ${new Date(captura.created_at).toLocaleString('pt-BR')}`);
    });
    return true;
  } catch (err) {
    console.log('❌ Erro ao verificar capturas:', err.message);
    return false;
  }
}

async function verificarSolicitacoesComCapturas() {
  console.log('\n🔍 Verificando solicitações com capturas faciais...');
  
  try {
    const { data, error } = await supabase
      .from('solicitacoes_valores')
      .select(`
        id,
        valor,
        status,
        created_at,
        users(nome),
        capturas_faciais(imagem_url, created_at)
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('❌ Erro ao buscar solicitações:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️  Nenhuma solicitação encontrada');
      return true;
    }
    
    const comCaptura = data.filter(s => s.capturas_faciais && s.capturas_faciais.length > 0);
    const semCaptura = data.filter(s => !s.capturas_faciais || s.capturas_faciais.length === 0);
    
    console.log(`✅ ${data.length} solicitação(ões) encontrada(s):`);
    console.log(`   - ${comCaptura.length} com captura facial`);
    console.log(`   - ${semCaptura.length} sem captura facial`);
    
    if (semCaptura.length > 0) {
      console.log('   ⚠️  Algumas solicitações não têm captura facial (podem ser antigas)');
    }
    
    return true;
  } catch (err) {
    console.log('❌ Erro ao verificar solicitações:', err.message);
    return false;
  }
}

async function verificarPagamentosComCapturas() {
  console.log('\n🔍 Verificando pagamentos com capturas faciais...');
  
  try {
    const { data, error } = await supabase
      .from('pagamentos')
      .select(`
        id,
        valor,
        status,
        data_pagamento,
        users(nome),
        capturas_faciais(imagem_url, created_at)
      `)
      .eq('status', 'pago')
      .order('data_pagamento', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('❌ Erro ao buscar pagamentos:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️  Nenhum pagamento realizado encontrado');
      return true;
    }
    
    const comCaptura = data.filter(p => p.capturas_faciais && p.capturas_faciais.length > 0);
    const semCaptura = data.filter(p => !p.capturas_faciais || p.capturas_faciais.length === 0);
    
    console.log(`✅ ${data.length} pagamento(s) realizado(s):`);
    console.log(`   - ${comCaptura.length} com captura facial`);
    console.log(`   - ${semCaptura.length} sem captura facial`);
    
    if (semCaptura.length > 0) {
      console.log('   ⚠️  Alguns pagamentos não têm captura facial (podem ser antigos)');
    }
    
    return true;
  } catch (err) {
    console.log('❌ Erro ao verificar pagamentos:', err.message);
    return false;
  }
}

async function verificarEstatisticas() {
  console.log('\n📊 Estatísticas Gerais...');
  
  try {
    // Total de capturas por tipo
    const { data: capturas } = await supabase
      .from('capturas_faciais')
      .select('tipo_operacao');
    
    if (capturas && capturas.length > 0) {
      const stats = capturas.reduce((acc, c) => {
        acc[c.tipo_operacao] = (acc[c.tipo_operacao] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📈 Capturas Faciais por Tipo:');
      Object.entries(stats).forEach(([tipo, count]) => {
        console.log(`   - ${tipo}: ${count}`);
      });
    }
    
    // Total de usuários
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n👥 Total de Usuários: ${totalUsers || 0}`);
    
    // Total de solicitações
    const { count: totalSolicitacoes } = await supabase
      .from('solicitacoes_valores')
      .select('*', { count: 'exact', head: true });
    
    console.log(`💰 Total de Solicitações: ${totalSolicitacoes || 0}`);
    
    // Total de pagamentos
    const { count: totalPagamentos } = await supabase
      .from('pagamentos')
      .select('*', { count: 'exact', head: true });
    
    console.log(`💳 Total de Pagamentos: ${totalPagamentos || 0}`);
    
    return true;
  } catch (err) {
    console.log('❌ Erro ao gerar estatísticas:', err.message);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 VERIFICAÇÃO DE FUNCIONALIDADES DE SEGURANÇA');
  console.log('═══════════════════════════════════════════════════════');
  
  if (SUPABASE_URL === 'SUA_URL_AQUI' || SUPABASE_ANON_KEY === 'SUA_KEY_AQUI') {
    console.log('\n❌ Configure as variáveis de ambiente:');
    console.log('   SUPABASE_URL=sua_url');
    console.log('   SUPABASE_ANON_KEY=sua_key');
    console.log('\nOu edite o arquivo verificar-seguranca.js');
    process.exit(1);
  }
  
  const resultados = [];
  
  resultados.push(await verificarTabelaCapturasFaciais());
  resultados.push(await verificarStorage());
  resultados.push(await verificarUsuariosTeste());
  resultados.push(await verificarCapturasFaciais());
  resultados.push(await verificarSolicitacoesComCapturas());
  resultados.push(await verificarPagamentosComCapturas());
  resultados.push(await verificarEstatisticas());
  
  console.log('\n═══════════════════════════════════════════════════════');
  
  const sucesso = resultados.filter(r => r).length;
  const total = resultados.length;
  
  if (sucesso === total) {
    console.log('✅ TODAS AS VERIFICAÇÕES PASSARAM!');
    console.log('   Sistema de segurança está configurado corretamente.');
  } else {
    console.log(`⚠️  ${sucesso}/${total} VERIFICAÇÕES PASSARAM`);
    console.log('   Revise os itens marcados com ❌ acima.');
  }
  
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);


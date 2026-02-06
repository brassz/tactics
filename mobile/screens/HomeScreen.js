import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, User, FileText, DollarSign, Clock, Wallet } from 'lucide-react-native';
import { getSupabase } from '../lib/supabaseMulti';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [stats, setStats] = useState({
    solicitacoes: 0,
    pendentes: 0,
    proxPagamento: null,
    aprovadasParaSaque: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  
  // Obter instância do Supabase
  const supabase = getSupabase();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Atualizar dados do usuário do banco para pegar status atualizado
      const { data: updatedUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', parsedUser.id)
        .single();
      
      if (updatedUser) {
        setUser(updatedUser);
        // Atualizar AsyncStorage com dados atualizados
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      await loadDocuments(parsedUser.id);
      await loadStats(parsedUser.id);
    }
  };

  const loadDocuments = async (userId) => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('id_user', userId)
      .single();
    
    setDocuments(data);
  };

  const loadStats = async (userId) => {
    // Solicitações
    const { data: solicitacoes } = await supabase
      .from('solicitacoes_valores')
      .select('*')
      .eq('id_user', userId);

    const pendentes = solicitacoes?.filter(s => s.status === 'aguardando').length || 0;
    const aprovadas = solicitacoes?.filter(s => s.status === 'aprovado') || [];

    // Verificar quantas aprovadas não têm solicitação de saque
    let aprovadasParaSaque = 0;
    if (aprovadas.length > 0) {
      const { data: saques } = await supabase
        .from('withdrawal_requests')
        .select('id_solicitacao')
        .in('id_solicitacao', aprovadas.map(s => s.id));

      const saquesIds = new Set(saques?.map(s => s.id_solicitacao) || []);
      aprovadasParaSaque = aprovadas.filter(s => !saquesIds.has(s.id)).length;
    }

    // Próximo pagamento
    const { data: pagamentos } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('id_user', userId)
      .eq('status', 'pendente')
      .order('data_vencimento', { ascending: true })
      .limit(1);

    setStats({
      solicitacoes: solicitacoes?.length || 0,
      pendentes,
      proxPagamento: pagamentos?.[0] || null,
      aprovadasParaSaque,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    // The App component will detect the change and update navigation automatically
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado':
        return '#10B981';
      case 'pendente':
      case 'em_analise':
        return '#F59E0B';
      case 'reprovado':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'aprovado':
        return 'Aprovado';
      case 'pendente':
        return 'Pendente';
      case 'em_analise':
        return 'Em Análise';
      case 'reprovado':
        return 'Reprovado';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.greeting}>Olá,</Text>
              <Text style={styles.userName}>{user?.nome}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Status dos Documentos - Só mostra se cadastro não estiver aprovado */}
        {user?.status !== 'aprovado' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FileText size={24} color="#3B82F6" />
              <Text style={styles.cardTitle}>Status do Cadastro</Text>
            </View>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(user?.status)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(user?.status) },
                  ]}
                >
                  {getStatusText(user?.status)}
                </Text>
              </View>
            </View>
            {user?.status === 'pendente' && (
              <Text style={styles.notificationText}>
                Seu cadastro está aguardando aprovação. Você receberá uma notificação quando for aprovado.
              </Text>
            )}
          </View>
        )}

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <DollarSign size={32} color="#3B82F6" />
            <Text style={styles.statValue}>{stats.solicitacoes}</Text>
            <Text style={styles.statLabel}>Solicitações</Text>
          </View>

          <View style={styles.statCard}>
            <Clock size={32} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.pendentes}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
        </View>

        {/* Próximo Pagamento */}
        {stats.proxPagamento && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Próximo Pagamento</Text>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentValue}>
                R$ {parseFloat(stats.proxPagamento.valor).toFixed(2)}
              </Text>
              <Text style={styles.paymentDate}>
                Vencimento:{' '}
                {new Date(stats.proxPagamento.data_vencimento).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
        )}

        {/* Ações Rápidas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ações Rápidas</Text>
          {stats.aprovadasParaSaque > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.caixaButton]}
              onPress={() => navigation.navigate('Withdrawal')}
            >
              <Wallet size={20} color="#10B981" />
              <Text style={[styles.actionButtonText, { color: '#10B981' }]}>
                CAIXA - Solicitar Saque ({stats.aprovadasParaSaque})
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Request')}
          >
            <DollarSign size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Nova Solicitação</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Payments')}
          >
            <FileText size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Ver Pagamentos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 48,
    height: 48,
  },
  greeting: {
    fontSize: 16,
    color: '#CBD5E1',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  logoutButton: {
    padding: 8,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noDataText: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  notificationText: {
    color: '#CBD5E1',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#CBD5E1',
    marginTop: 4,
  },
  paymentInfo: {
    gap: 8,
  },
  paymentValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  paymentDate: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  caixaButton: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
});

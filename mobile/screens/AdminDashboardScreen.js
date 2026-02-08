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
import { LogOut, Users, FileText, DollarSign, Clock, CheckCircle, Wallet } from 'lucide-react-native';
import { getSupabase } from '../lib/supabaseMulti';

export default function AdminDashboardScreen({ navigation }) {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalRequests: 0,
    pendingRequests: 0,
    totalPayments: 0,
    pendingPayments: 0,
    pendingDocuments: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  
  // Obter instância do Supabase
  const supabase = getSupabase();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const adminData = await AsyncStorage.getItem('admin');
    if (adminData) {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
      await loadStats();
    }
  };

  const loadStats = async () => {
    // Carregar usuários
    const { data: users } = await supabase
      .from('users')
      .select('*');
    
    // Carregar solicitações
    const { data: requests } = await supabase
      .from('solicitacoes_valores')
      .select('*');

    // Carregar pagamentos
    const { data: payments } = await supabase
      .from('pagamentos')
      .select('*');

    // Carregar documentos
    const { data: documents } = await supabase
      .from('documents')
      .select('*');

    // Carregar saques pendentes
    const { data: withdrawals } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('status', 'pendente');

    setStats({
      totalUsers: users?.length || 0,
      pendingUsers: users?.filter(u => u.status === 'pendente').length || 0,
      totalRequests: requests?.length || 0,
      pendingRequests: requests?.filter(r => r.status === 'aguardando').length || 0,
      totalPayments: payments?.length || 0,
      pendingPayments: payments?.filter(p => p.status === 'pendente').length || 0,
      pendingDocuments: documents?.filter(d => d.status_documentos === 'pendente').length || 0,
      pendingWithdrawals: withdrawals?.length || 0,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('admin');
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
              <Text style={styles.greeting}>Painel Admin</Text>
              <Text style={styles.userName}>{admin?.nome}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={[styles.statCard, styles.usersCard]}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <Users size={32} color="#3B82F6" />
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Usuários</Text>
            {stats.pendingUsers > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.pendingUsers}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.statCard, styles.requestsCard]}
            onPress={() => navigation.navigate('AdminRequests')}
          >
            <DollarSign size={32} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.totalRequests}</Text>
            <Text style={styles.statLabel}>Solicitações</Text>
            {stats.pendingRequests > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.pendingRequests}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.statCard, styles.documentsCard]}
            onPress={() => navigation.navigate('AdminDocuments')}
          >
            <FileText size={32} color="#8B5CF6" />
            <Text style={styles.statValue}>{stats.pendingDocuments}</Text>
            <Text style={styles.statLabel}>Documentos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.statCard, styles.paymentsCard]}
            onPress={() => navigation.navigate('AdminPayments')}
          >
            <Clock size={32} color="#10B981" />
            <Text style={styles.statValue}>{stats.totalPayments}</Text>
            <Text style={styles.statLabel}>Pagamentos</Text>
            {stats.pendingPayments > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.pendingPayments}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesso Rápido</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <Users size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Gerenciar Cadastros</Text>
            {stats.pendingUsers > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{stats.pendingUsers} pendentes</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AdminRequests')}
          >
            <DollarSign size={20} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Solicitações de Valores</Text>
            {stats.pendingRequests > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{stats.pendingRequests} aguardando</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AdminDocuments')}
          >
            <FileText size={20} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>Validar Documentos</Text>
            {stats.pendingDocuments > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{stats.pendingDocuments} pendentes</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AdminWithdrawals')}
          >
            <Wallet size={20} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Saques</Text>
            {stats.pendingWithdrawals > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{stats.pendingWithdrawals} pendentes</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AdminPayments')}
          >
            <Clock size={20} color="#10B981" />
            <Text style={styles.actionButtonText}>Controle de Pagamentos</Text>
            {stats.pendingPayments > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{stats.pendingPayments} pendentes</Text>
              </View>
            )}
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    width: '47%',
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
    position: 'relative',
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
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    flex: 1,
  },
  actionBadge: {
    backgroundColor: '#7F1D1D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  actionBadgeText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
});

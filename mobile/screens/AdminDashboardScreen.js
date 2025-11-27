import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, Users, FileText, DollarSign, Clock, CheckCircle } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

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

    setStats({
      totalUsers: users?.length || 0,
      pendingUsers: users?.filter(u => u.status === 'pendente').length || 0,
      totalRequests: requests?.length || 0,
      pendingRequests: requests?.filter(r => r.status === 'aguardando').length || 0,
      totalPayments: payments?.length || 0,
      pendingPayments: payments?.filter(p => p.status === 'pendente').length || 0,
      pendingDocuments: documents?.filter(d => d.status_documentos === 'pendente').length || 0,
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
          <View>
            <Text style={styles.greeting}>Painel Admin</Text>
            <Text style={styles.userName}>{admin?.nome}</Text>
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
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  actionBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionBadgeText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function PaymentsScreen() {
  const [user, setUser] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      await loadPagamentos(parsedUser.id);
    }
  };

  const loadPagamentos = async (userId) => {
    const { data } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('id_user', userId)
      .order('data_vencimento', { ascending: true });

    // Atualizar status de atrasados
    const updated = data?.map((p) => {
      if (p.status === 'pendente') {
        const hoje = new Date();
        const vencimento = new Date(p.data_vencimento);
        if (vencimento < hoje) {
          return { ...p, status: 'atrasado' };
        }
      }
      return p;
    });

    setPagamentos(updated || []);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pago':
        return <CheckCircle size={24} color="#10B981" />;
      case 'atrasado':
        return <AlertCircle size={24} color="#EF4444" />;
      default:
        return <Clock size={24} color="#F59E0B" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pago':
        return '#10B981';
      case 'atrasado':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'atrasado':
        return 'Atrasado';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTotalPendente = () => {
    return pagamentos
      .filter((p) => p.status === 'pendente' || p.status === 'atrasado')
      .reduce((acc, p) => acc + parseFloat(p.valor), 0);
  };

  const getTotalPago = () => {
    return pagamentos
      .filter((p) => p.status === 'pago')
      .reduce((acc, p) => acc + parseFloat(p.valor), 0);
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
          <Text style={styles.title}>Pagamentos</Text>
        </View>

        {/* Resumo */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Pendente</Text>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
              R$ {getTotalPendente().toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Pago</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              R$ {getTotalPago().toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Lista de Pagamentos */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Todas as Parcelas</Text>
          {pagamentos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhum pagamento cadastrado</Text>
            </View>
          ) : (
            pagamentos.map((item) => (
              <View key={item.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  {getStatusIcon(item.status)}
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentValue}>
                      R$ {parseFloat(item.valor).toFixed(2)}
                    </Text>
                    <Text style={styles.paymentDate}>
                      Vencimento:{' '}
                      {new Date(item.data_vencimento).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(item.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {getStatusText(item.status)}
                  </Text>
                </View>
                {item.data_pagamento && (
                  <Text style={styles.paymentDatePaid}>
                    Pago em:{' '}
                    {new Date(item.data_pagamento).toLocaleDateString('pt-BR')}
                  </Text>
                )}
              </View>
            ))
          )}
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
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 16,
    padding: 24,
    paddingTop: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 24,
    paddingTop: 0,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDatePaid: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 8,
  },
});

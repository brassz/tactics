import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { ArrowLeft, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function AdminRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const { data } = await supabase
      .from('solicitacoes_valores')
      .select('*, users(nome, cpf)')
      .order('created_at', { ascending: false });

    setRequests(data || []);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const updateRequestStatus = async (requestId, status) => {
    const { error } = await supabase
      .from('solicitacoes_valores')
      .update({ status })
      .eq('id', requestId);

    if (!error) {
      await loadRequests();
      setSelectedRequest(null);
      
      const statusMessages = {
        aprovado: 'aprovada',
        negado: 'negada',
        em_analise: 'marcada como em análise',
      };
      
      Alert.alert('Sucesso', `Solicitação ${statusMessages[status]}!`);
    } else {
      Alert.alert('Erro', 'Erro ao atualizar status');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      aguardando: { bg: '#FEF3C7', text: '#92400E' },
      aprovado: { bg: '#D1FAE5', text: '#065F46' },
      negado: { bg: '#FEE2E2', text: '#991B1B' },
      em_analise: { bg: '#DBEAFE', text: '#1E40AF' },
    };

    const labels = {
      aguardando: 'Aguardando',
      aprovado: 'Aprovado',
      negado: 'Negado',
      em_analise: 'Em Análise',
    };

    const style = colors[status] || colors.aguardando;

    return (
      <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
        <Text style={[styles.statusText, { color: style.text }]}>
          {labels[status] || status}
        </Text>
      </View>
    );
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const stats = {
    total: requests.length,
    aguardando: requests.filter((r) => r.status === 'aguardando').length,
    aprovado: requests.filter((r) => r.status === 'aprovado').length,
    negado: requests.filter((r) => r.status === 'negado').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitações</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.miniStat}>
          <Text style={styles.miniStatValue}>{stats.total}</Text>
          <Text style={styles.miniStatLabel}>Total</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: '#F59E0B' }]}>{stats.aguardando}</Text>
          <Text style={styles.miniStatLabel}>Aguardando</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: '#10B981' }]}>{stats.aprovado}</Text>
          <Text style={styles.miniStatLabel}>Aprovadas</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: '#EF4444' }]}>{stats.negado}</Text>
          <Text style={styles.miniStatLabel}>Negadas</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'aguardando' && styles.filterButtonActive]}
            onPress={() => setFilter('aguardando')}
          >
            <Text style={[styles.filterButtonText, filter === 'aguardando' && styles.filterButtonTextActive]}>
              Aguardando
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'em_analise' && styles.filterButtonActive]}
            onPress={() => setFilter('em_analise')}
          >
            <Text style={[styles.filterButtonText, filter === 'em_analise' && styles.filterButtonTextActive]}>
              Em Análise
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'aprovado' && styles.filterButtonActive]}
            onPress={() => setFilter('aprovado')}
          >
            <Text style={[styles.filterButtonText, filter === 'aprovado' && styles.filterButtonTextActive]}>
              Aprovadas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'negado' && styles.filterButtonActive]}
            onPress={() => setFilter('negado')}
          >
            <Text style={[styles.filterButtonText, filter === 'negado' && styles.filterButtonTextActive]}>
              Negadas
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Requests List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredRequests.map((req) => (
          <View key={req.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.requestInfo}>
                <Text style={styles.clientName}>{req.users.nome}</Text>
                <Text style={styles.clientCpf}>CPF: {req.users.cpf}</Text>
                <Text style={styles.requestDate}>
                  {new Date(req.created_at).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(req.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.valueContainer}>
                <DollarSign size={20} color="#3B82F6" />
                <Text style={styles.valueText}>
                  R$ {parseFloat(req.valor).toFixed(2)}
                </Text>
              </View>
            </View>

            {req.justificativa && (
              <View style={styles.justificationBox}>
                <Text style={styles.justificationLabel}>Justificativa:</Text>
                <Text style={styles.justificationText}>{req.justificativa}</Text>
              </View>
            )}

            <View style={styles.cardFooter}>
              {getStatusBadge(req.status)}
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => setSelectedRequest(req)}
              >
                <Text style={styles.manageButtonText}>Gerenciar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Management Modal */}
      <Modal
        visible={selectedRequest !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Gerenciar Solicitação</Text>

            {selectedRequest && (
              <>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Cliente</Text>
                  <Text style={styles.modalValue}>{selectedRequest.users.nome}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Valor Solicitado</Text>
                  <Text style={[styles.modalValue, { color: '#3B82F6', fontSize: 24 }]}>
                    R$ {parseFloat(selectedRequest.valor).toFixed(2)}
                  </Text>
                </View>

                {selectedRequest.justificativa && (
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalLabel}>Justificativa</Text>
                    <Text style={styles.modalValue}>{selectedRequest.justificativa}</Text>
                  </View>
                )}

                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Status Atual</Text>
                  {getStatusBadge(selectedRequest.status)}
                </View>

                <View style={styles.modalActions}>
                  {selectedRequest.status !== 'aprovado' && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.approveButton]}
                      onPress={() => updateRequestStatus(selectedRequest.id, 'aprovado')}
                    >
                      <CheckCircle size={20} color="#FFFFFF" />
                      <Text style={styles.modalButtonText}>Aprovar</Text>
                    </TouchableOpacity>
                  )}

                  {selectedRequest.status !== 'em_analise' && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.analysisButton]}
                      onPress={() => updateRequestStatus(selectedRequest.id, 'em_analise')}
                    >
                      <Clock size={20} color="#FFFFFF" />
                      <Text style={styles.modalButtonText}>Marcar Em Análise</Text>
                    </TouchableOpacity>
                  )}

                  {selectedRequest.status !== 'negado' && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.rejectButton]}
                      onPress={() => updateRequestStatus(selectedRequest.id, 'negado')}
                    >
                      <XCircle size={20} color="#FFFFFF" />
                      <Text style={styles.modalButtonText}>Negar</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setSelectedRequest(null)}
                  >
                    <Text style={[styles.modalButtonText, { color: '#374151' }]}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 8,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  filters: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  clientCpf: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginTop: 4,
  },
  justificationBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  justificationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  justificationText: {
    fontSize: 14,
    color: '#1F2937',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  modalInfo: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalActions: {
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  analysisButton: {
    backgroundColor: '#3B82F6',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

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
  Linking,
  Image,
} from 'react-native';
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye, Download, X } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function AdminDocumentsScreen({ navigation }) {
  const [documents, setDocuments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*, users(nome, cpf)')
      .order('created_at', { ascending: false });

    setDocuments(data || []);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const updateDocumentStatus = async (docId, status) => {
    const { error } = await supabase
      .from('documents')
      .update({ status_documentos: status })
      .eq('id', docId);

    if (!error) {
      await loadDocuments();
      setSelectedDoc(null);
      
      const statusMessages = {
        aprovado: 'aprovados',
        reprovado: 'reprovados',
        em_analise: 'marcados como em análise',
      };
      
      Alert.alert('Sucesso', `Documentos ${statusMessages[status]}!`);
    } else {
      Alert.alert('Erro', 'Erro ao atualizar status');
    }
  };

  const openDocument = (url) => {
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert('Erro', 'URL do documento não disponível');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pendente: { bg: '#FEF3C7', text: '#92400E' },
      aprovado: { bg: '#D1FAE5', text: '#065F46' },
      reprovado: { bg: '#FEE2E2', text: '#991B1B' },
      em_analise: { bg: '#DBEAFE', text: '#1E40AF' },
    };

    const labels = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      reprovado: 'Reprovado',
      em_analise: 'Em Análise',
    };

    const style = colors[status] || colors.pendente;

    return (
      <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
        <Text style={[styles.statusText, { color: style.text }]}>
          {labels[status] || status}
        </Text>
      </View>
    );
  };

  const stats = {
    total: documents.length,
    pendentes: documents.filter((d) => d.status_documentos === 'pendente').length,
    aprovados: documents.filter((d) => d.status_documentos === 'aprovado').length,
    reprovados: documents.filter((d) => d.status_documentos === 'reprovado').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documentos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.miniStat}>
          <Text style={styles.miniStatValue}>{stats.total}</Text>
          <Text style={styles.miniStatLabel}>Total</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: '#F59E0B' }]}>{stats.pendentes}</Text>
          <Text style={styles.miniStatLabel}>Pendentes</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: '#10B981' }]}>{stats.aprovados}</Text>
          <Text style={styles.miniStatLabel}>Aprovados</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: '#EF4444' }]}>{stats.reprovados}</Text>
          <Text style={styles.miniStatLabel}>Reprovados</Text>
        </View>
      </View>

      {/* Documents List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {documents.map((doc) => (
          <View key={doc.id} style={styles.docCard}>
            <View style={styles.docHeader}>
              <View style={styles.docInfo}>
                <Text style={styles.clientName}>{doc.users.nome}</Text>
                <Text style={styles.clientCpf}>CPF: {doc.users.cpf}</Text>
                <Text style={styles.docDate}>
                  Enviado em {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              {getStatusBadge(doc.status_documentos)}
            </View>

            {/* Documents Grid */}
            <View style={styles.documentsGrid}>
              <TouchableOpacity
                style={styles.docButton}
                onPress={() => setViewingImage(doc.selfie_url)}
              >
                <Eye size={20} color="#6B7280" />
                <Text style={styles.docButtonText}>Selfie</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.docButton}
                onPress={() => setViewingImage(doc.cnh_rg_url)}
              >
                <Eye size={20} color="#6B7280" />
                <Text style={styles.docButtonText}>RG/CNH</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.docButton}
                onPress={() => openDocument(doc.comprovante_endereco_url)}
              >
                <Download size={20} color="#6B7280" />
                <Text style={styles.docButtonText}>Comp. End.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.docButton}
                onPress={() => openDocument(doc.comprovante_renda_url)}
              >
                <Download size={20} color="#6B7280" />
                <Text style={styles.docButtonText}>Comp. Renda</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.docButton}
                onPress={() => openDocument(doc.carteira_trabalho_pdf_url)}
              >
                <Download size={20} color="#6B7280" />
                <Text style={styles.docButtonText}>CTPS</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => setSelectedDoc(doc)}
            >
              <Text style={styles.manageButtonText}>Gerenciar Documentos</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Management Modal */}
      <Modal
        visible={selectedDoc !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDoc(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Gerenciar Documentos</Text>

            {selectedDoc && (
              <>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Cliente</Text>
                  <Text style={styles.modalValue}>{selectedDoc.users.nome}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Status Atual</Text>
                  {getStatusBadge(selectedDoc.status_documentos)}
                </View>

                <View style={styles.modalActions}>
                  {selectedDoc.status_documentos !== 'aprovado' && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.approveButton]}
                      onPress={() => updateDocumentStatus(selectedDoc.id, 'aprovado')}
                    >
                      <CheckCircle size={20} color="#FFFFFF" />
                      <Text style={styles.modalButtonText}>Aprovar</Text>
                    </TouchableOpacity>
                  )}

                  {selectedDoc.status_documentos !== 'em_analise' && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.analysisButton]}
                      onPress={() => updateDocumentStatus(selectedDoc.id, 'em_analise')}
                    >
                      <Clock size={20} color="#FFFFFF" />
                      <Text style={styles.modalButtonText}>Marcar Em Análise</Text>
                    </TouchableOpacity>
                  )}

                  {selectedDoc.status_documentos !== 'reprovado' && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.rejectButton]}
                      onPress={() => updateDocumentStatus(selectedDoc.id, 'reprovado')}
                    >
                      <XCircle size={20} color="#FFFFFF" />
                      <Text style={styles.modalButtonText}>Reprovar</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setSelectedDoc(null)}
                  >
                    <Text style={[styles.modalButtonText, { color: '#374151' }]}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={viewingImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingImage(null)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setViewingImage(null)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {viewingImage && (
            <Image
              source={{ uri: viewingImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
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
  scrollView: {
    flex: 1,
  },
  docCard: {
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
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  docInfo: {
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
  docDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  docButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  docButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  manageButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
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
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  fullImage: {
    width: '90%',
    height: '80%',
  },
});

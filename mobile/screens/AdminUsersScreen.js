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
  ActivityIndicator,
  Image,
} from 'react-native';
import { ArrowLeft, CheckCircle, XCircle, Clock, Phone, Mail, MessageCircle, Eye, FileText } from 'lucide-react-native';
import { getSupabase, getCompanySupabase, supabaseStorage } from '../lib/supabaseMulti';

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [documents, setDocuments] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  
  // Obter instância do Supabase
  const supabase = getSupabase();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    setUsers(data || []);
  };

  const loadUserDocuments = async (userId) => {
    setLoadingDocs(true);
    try {
      const documentTypes = ['selfie', 'cnh', 'ctps', 'comprovante'];
      const docs = {};
      
      for (const type of documentTypes) {
        const path = `${userId}/${type}`;
        const { data, error } = await supabaseStorage
          .storage
          .from('user-documents')
          .list(userId, {
            search: type
          });
        
        if (!error && data && data.length > 0) {
          const { data: { publicUrl } } = supabaseStorage
            .storage
            .from('user-documents')
            .getPublicUrl(`${path}/${data[0].name}`);
          
          docs[type] = publicUrl;
        }
      }
      
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Erro', 'Erro ao carregar documentos');
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      loadUserDocuments(selectedUser.id);
    } else {
      setDocuments(null);
    }
  }, [selectedUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const updateUserStatus = async (userId, status) => {
    try {
      // Se está aprovando, precisa copiar para o banco da empresa
      if (status === 'aprovado') {
        // Buscar dados completos do usuário
        const { data: user, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchError || !user) {
          Alert.alert('Erro', 'Erro ao buscar dados do usuário');
          return;
        }

        if (!user.company) {
          Alert.alert('Erro', 'Usuário não possui empresa definida');
          return;
        }

        // Obter instância do banco da empresa
        const companySupabase = getCompanySupabase(user.company);
        
        if (!companySupabase) {
          Alert.alert('Erro', 'Erro ao conectar com banco da empresa');
          return;
        }

        // Copiar dados para tabela clients do banco da empresa
        const { error: insertError } = await companySupabase
          .from('clients')
          .insert([{
            cpf: user.cpf,
            name: user.nome,
            phone: user.phone,
            email: user.email,
            address: user.address,
            rg: user.rg,
            birth_date: user.birth_date,
            photo: user.photo,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (insertError) {
          console.error('Error inserting into company database:', insertError);
          Alert.alert('Erro', 'Erro ao salvar cliente no banco da empresa');
          return;
        }
      }

      // Atualizar status na tabela users do banco único
      const { error: updateError } = await supabase
        .from('users')
        .update({ status })
        .eq('id', userId);

      if (!updateError) {
        await loadUsers();
        setSelectedUser(null);
        Alert.alert(
          'Sucesso', 
          status === 'aprovado' 
            ? 'Cadastro aprovado e cliente salvo no banco da empresa!' 
            : 'Cadastro reprovado com sucesso!'
        );
      } else {
        Alert.alert('Erro', 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Erro', 'Erro ao processar aprovação');
    }
  };

  const sendWhatsApp = (user) => {
    if (!user.telefone) {
      Alert.alert('Erro', 'Cliente não possui número de telefone cadastrado');
      return;
    }

    const phone = user.telefone.replace(/\D/g, '');
    let message = `Olá ${user.nome}! 👋\n\n`;
    message += `Aqui é a NovixCred entrando em contato.\n`;
    message += `\nComo podemos ajudá-lo hoje?`;

    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pendente: { bg: '#FEF3C7', text: '#92400E' },
      aprovado: { bg: '#D1FAE5', text: '#065F46' },
      reprovado: { bg: '#FEE2E2', text: '#991B1B' },
    };

    const labels = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      reprovado: 'Reprovado',
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

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    return user.status === filter;
  });

  const stats = {
    total: users.length,
    pendentes: users.filter((u) => u.status === 'pendente').length,
    aprovados: users.filter((u) => u.status === 'aprovado').length,
    reprovados: users.filter((u) => u.status === 'reprovado').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastros</Text>
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

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'pendente' && styles.filterButtonActive]}
            onPress={() => setFilter('pendente')}
          >
            <Text style={[styles.filterButtonText, filter === 'pendente' && styles.filterButtonTextActive]}>
              Pendentes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'aprovado' && styles.filterButtonActive]}
            onPress={() => setFilter('aprovado')}
          >
            <Text style={[styles.filterButtonText, filter === 'aprovado' && styles.filterButtonTextActive]}>
              Aprovados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'reprovado' && styles.filterButtonActive]}
            onPress={() => setFilter('reprovado')}
          >
            <Text style={[styles.filterButtonText, filter === 'reprovado' && styles.filterButtonTextActive]}>
              Reprovados
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Users List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.nome}</Text>
                <Text style={styles.userCpf}>CPF: {user.cpf}</Text>
                {user.telefone && (
                  <View style={styles.contactRow}>
                    <Phone size={14} color="#6B7280" />
                    <Text style={styles.contactText}>{user.telefone}</Text>
                  </View>
                )}
                {user.email && (
                  <View style={styles.contactRow}>
                    <Mail size={14} color="#6B7280" />
                    <Text style={styles.contactText}>{user.email}</Text>
                  </View>
                )}
                <Text style={styles.userDate}>
                  Cadastro: {new Date(user.data_cadastro).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              {getStatusBadge(user.status)}
            </View>

            <View style={styles.actions}>
              {user.telefone && (
                <TouchableOpacity
                  style={styles.whatsappButton}
                  onPress={() => sendWhatsApp(user)}
                >
                  <MessageCircle size={18} color="#10B981" />
                  <Text style={styles.whatsappButtonText}>WhatsApp</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => setSelectedUser(user)}
              >
                <Text style={styles.manageButtonText}>Gerenciar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Management Modal */}
      <Modal
        visible={selectedUser !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Gerenciar Cadastro</Text>

            {selectedUser && (
              <>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Nome</Text>
                  <Text style={styles.modalValue}>{selectedUser.nome}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>CPF</Text>
                  <Text style={styles.modalValue}>{selectedUser.cpf}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Status Atual</Text>
                  {getStatusBadge(selectedUser.status)}
                </View>

                {/* Documentos */}
                <View style={styles.documentsSection}>
                  <Text style={styles.sectionTitle}>Documentos</Text>
                  {loadingDocs ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : documents && Object.keys(documents).length > 0 ? (
                    <View style={styles.documentsGrid}>
                      {documents.selfie && (
                        <TouchableOpacity 
                          style={styles.docCard}
                          onPress={() => setViewingImage({ url: documents.selfie, title: 'Selfie' })}
                        >
                          <Image source={{ uri: documents.selfie }} style={styles.docImage} />
                          <Text style={styles.docLabel}>Selfie</Text>
                        </TouchableOpacity>
                      )}
                      {documents.cnh && (
                        <TouchableOpacity 
                          style={styles.docCard}
                          onPress={() => setViewingImage({ url: documents.cnh, title: 'CNH' })}
                        >
                          <Image source={{ uri: documents.cnh }} style={styles.docImage} />
                          <Text style={styles.docLabel}>CNH</Text>
                        </TouchableOpacity>
                      )}
                      {documents.ctps && (
                        <TouchableOpacity 
                          style={styles.docCard}
                          onPress={() => setViewingImage({ url: documents.ctps, title: 'CTPS' })}
                        >
                          <Image source={{ uri: documents.ctps }} style={styles.docImage} />
                          <Text style={styles.docLabel}>CTPS</Text>
                        </TouchableOpacity>
                      )}
                      {documents.comprovante && (
                        <TouchableOpacity 
                          style={styles.docCard}
                          onPress={() => setViewingImage({ url: documents.comprovante, title: 'Comprovante' })}
                        >
                          <Image source={{ uri: documents.comprovante }} style={styles.docImage} />
                          <Text style={styles.docLabel}>Comprovante</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <View style={styles.noDocsContainer}>
                      <FileText size={32} color="#9CA3AF" />
                      <Text style={styles.noDocsText}>Nenhum documento enviado</Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalActions}>
                  {selectedUser.status !== 'aprovado' && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.approveButton]}
                      onPress={() => updateUserStatus(selectedUser.id, 'aprovado')}
                    >
                      <CheckCircle size={20} color="#FFFFFF" />
                      <Text style={styles.modalButtonText}>Aprovar</Text>
                    </TouchableOpacity>
                  )}

                  {selectedUser.status !== 'reprovado' && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.rejectButton]}
                      onPress={() => updateUserStatus(selectedUser.id, 'reprovado')}
                    >
                      <XCircle size={20} color="#FFFFFF" />
                      <Text style={styles.modalButtonText}>Reprovar</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setSelectedUser(null)}
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
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity 
            style={styles.imageViewerClose}
            onPress={() => setViewingImage(null)}
          >
            <XCircle size={32} color="#FFFFFF" />
          </TouchableOpacity>
          {viewingImage && (
            <>
              <Text style={styles.imageViewerTitle}>{viewingImage.title}</Text>
              <Image 
                source={{ uri: viewingImage.url }} 
                style={styles.imageViewerImage}
                resizeMode="contain"
              />
            </>
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
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userCpf: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  contactText: {
    fontSize: 12,
    color: '#6B7280',
  },
  userDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
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
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  whatsappButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  manageButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
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
  documentsSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  docCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  docImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  docLabel: {
    padding: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  noDocsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noDocsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  imageViewerTitle: {
    position: 'absolute',
    top: 50,
    left: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  imageViewerImage: {
    width: '90%',
    height: '80%',
  },
});

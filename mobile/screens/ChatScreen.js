import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Send, Image as ImageIcon, Bot } from 'lucide-react-native';
import { getSupabase, getCompanySupabase, supabaseStorage } from '../lib/supabaseMulti';

export default function ChatScreen() {
  const [user, setUser] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const scrollViewRef = useRef();
  
  // Obter instância do Supabase
  const supabase = getSupabase();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      // Subscribe to new messages
      const channel = supabase
        .channel('chat-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat',
            filter: `id_user=eq.${user.id}`,
          },
          (payload) => {
            setMensagens((prev) => [...prev, payload.new]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadData = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      await loadMensagens(parsedUser.id);
    }
  };

  const loadMensagens = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('chat')
        .select('*')
        .eq('id_user', userId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMensagens(data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error in loadMensagens:', error);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const uploadImage = async (imageUri) => {
    try {
      setUploadingImage(true);
      
      // Ler arquivo como base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });

      // Nome único para o arquivo
      const fileName = `chat-${user.id}-${Date.now()}.jpg`;
      const filePath = `chat-images/${fileName}`;

      // Converter base64 para arraybuffer
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Upload para o Supabase Storage usando o bucket user-documents (já configurado)
      const { data, error } = await supabaseStorage.storage
        .from('user-documents')
        .upload(filePath, byteArray, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabaseStorage.storage
        .from('user-documents')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Erro', 'Precisamos de permissão para acessar suas fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUrl = await uploadImage(result.assets[0].uri);
        
        // Enviar mensagem com imagem
        const { data: newMessage, error } = await supabase
          .from('chat')
          .insert([
            {
              id_user: user.id,
              mensagem: '[Imagem enviada]',
              remetente: 'cliente',
              arquivo_url: imageUrl,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Adicionar mensagem ao estado local imediatamente
        if (newMessage) {
          setMensagens((prev) => [...prev, newMessage]);
          setTimeout(scrollToBottom, 100);
        }

        // Recarregar mensagens para garantir sincronização
        await loadMensagens(user.id);

        // Processar resposta do bot após enviar imagem
        setTimeout(() => processBotResponse('[Imagem enviada]'), 500);
      }
    } catch (error) {
      console.error('Error picking/uploading image:', error);
      Alert.alert('Erro', 'Erro ao enviar imagem. Tente novamente.');
    }
  };

  const getClientLoans = async () => {
    try {
      const userCompany = user?.company || 'franca';
      const companySupabase = getCompanySupabase(userCompany);
      
      if (!companySupabase) return [];

      // Buscar cliente no banco da empresa
      const { data: client } = await companySupabase
        .from('clients')
        .select('id')
        .eq('cpf', user.cpf)
        .single();

      if (!client) return [];

      // Buscar empréstimos ativos
      const { data: loans } = await companySupabase
        .from('loans')
        .select('*')
        .eq('client_id', client.id)
        .in('status', ['active', 'pending', 'overdue'])
        .order('due_date', { ascending: true });

      return loans || [];
    } catch (error) {
      console.error('Error loading loans:', error);
      return [];
    }
  };

  const getClientPayments = async () => {
    try {
      const { data: payments } = await supabase
        .from('cobrancas')
        .select('*')
        .eq('id_user', user.id)
        .in('status', ['pendente', 'atrasado'])
        .order('data_vencimento', { ascending: true });

      return payments || [];
    } catch (error) {
      console.error('Error loading payments:', error);
      return [];
    }
  };

  const getClientRequests = async () => {
    try {
      const { data: requests } = await supabase
        .from('solicitacoes_valores')
        .select('*')
        .eq('id_user', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return requests || [];
    } catch (error) {
      console.error('Error loading requests:', error);
      return [];
    }
  };

  const processBotResponse = async (userMessage) => {
    if (!user) return;

    const message = userMessage.toLowerCase().trim();
    let botResponse = '';

    // Detectar intenções
    if (message.includes('emprestimo') || message.includes('empréstimo') || message.includes('emprestimos') || message.includes('empréstimos')) {
      const loans = await getClientLoans();
      
      if (loans.length === 0) {
        botResponse = 'Você não possui empréstimos ativos no momento.';
      } else {
        botResponse = `Você possui ${loans.length} empréstimo(s) ativo(s):\n\n`;
        loans.forEach((loan, index) => {
          const amount = parseFloat(loan.total_amount || loan.amount || 0);
          const dueDate = new Date(loan.due_date + 'T12:00:00').toLocaleDateString('pt-BR');
          botResponse += `${index + 1}. Valor: R$ ${amount.toFixed(2)}\n`;
          botResponse += `   Vencimento: ${dueDate}\n`;
          botResponse += `   Status: ${loan.status === 'active' ? 'Ativo' : loan.status === 'overdue' ? 'Atrasado' : 'Pendente'}\n\n`;
        });
      }
    } else if (message.includes('vencimento') || message.includes('vencer') || message.includes('vencido')) {
      const payments = await getClientPayments();
      const loans = await getClientLoans();
      
      const allDueDates = [
        ...payments.map(p => ({ type: 'Cobrança', date: p.data_vencimento, value: p.valor })),
        ...loans.map(l => ({ type: 'Empréstimo', date: l.due_date, value: l.total_amount || l.amount })),
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      if (allDueDates.length === 0) {
        botResponse = 'Você não possui vencimentos pendentes.';
      } else {
        const nextDue = allDueDates[0];
        const nextDate = new Date(nextDue.date + 'T12:00:00').toLocaleDateString('pt-BR');
        botResponse = `Próximo vencimento:\n\n`;
        botResponse += `Tipo: ${nextDue.type}\n`;
        botResponse += `Data: ${nextDate}\n`;
        botResponse += `Valor: R$ ${parseFloat(nextDue.value).toFixed(2)}\n\n`;
        
        if (allDueDates.length > 1) {
          botResponse += `Você possui ${allDueDates.length} vencimento(s) no total.`;
        }
      }
    } else if (message.includes('valor') || message.includes('correção') || message.includes('corrigir') || message.includes('erro')) {
      botResponse = 'Para correção de valores ou dúvidas sobre valores, por favor, entre em contato com um administrador. Nossa equipe irá verificar e corrigir qualquer inconsistência.';
    } else if (message.includes('aprov') || message.includes('aprovado') || message.includes('status') || message.includes('solicitação')) {
      const requests = await getClientRequests();
      
      if (requests.length === 0) {
        botResponse = 'Você não possui solicitações recentes.';
      } else {
        const latest = requests[0];
        botResponse = `Status da sua última solicitação:\n\n`;
        botResponse += `Valor: R$ ${parseFloat(latest.valor).toFixed(2)}\n`;
        botResponse += `Status: ${latest.status === 'aprovado' ? '✅ Aprovado' : latest.status === 'negado' ? '❌ Negado' : latest.status === 'em_analise' ? '⏳ Em Análise' : '⏳ Aguardando'}\n`;
        botResponse += `Data: ${new Date(latest.created_at).toLocaleDateString('pt-BR')}\n\n`;
        
        if (latest.status === 'aprovado') {
          botResponse += 'Sua solicitação foi aprovada! Você pode verificar seus empréstimos na aba "Empréstimos".';
        } else if (latest.status === 'negado') {
          botResponse += 'Sua solicitação foi negada. Entre em contato com o suporte para mais informações.';
        } else {
          botResponse += 'Sua solicitação está sendo analisada. Você receberá uma notificação quando houver atualização.';
        }
      }
    } else if (message.includes('oi') || message.includes('olá') || message.includes('ola') || message.includes('bom dia') || message.includes('boa tarde') || message.includes('boa noite')) {
      botResponse = `Olá ${user.nome}! 👋\n\nComo posso ajudá-lo hoje?\n\nPosso ajudar com:\n• Empréstimos ativos\n• Vencimentos\n• Status de solicitações\n• Correção de valores\n\nDigite sua dúvida ou escolha um dos temas acima!`;
    } else if (message.includes('ajuda') || message.includes('help') || message.includes('opções') || message.includes('opcoes')) {
      botResponse = 'Posso ajudá-lo com:\n\n1️⃣ *Empréstimos ativos* - Digite "empréstimos"\n2️⃣ *Vencimentos* - Digite "vencimento"\n3️⃣ *Status de solicitação* - Digite "status" ou "aprovado"\n4️⃣ *Correção de valores* - Digite "correção"\n\nOu envie sua dúvida e um administrador irá responder!';
    } else {
      // Resposta padrão se não detectar intenção específica
      botResponse = 'Desculpe, não consegui entender sua solicitação.\n\nPara atendimento personalizado, entre em contato:\n📞 *16 98803-7753*\n\nOu posso ajudá-lo com:\n• Empréstimos ativos\n• Vencimentos\n• Status de solicitações\n\nDigite sua dúvida ou escolha um dos temas acima!';
    }

    // Enviar resposta do bot após um pequeno delay
    if (botResponse) {
      setTimeout(async () => {
        const { data: botMessage, error } = await supabase
          .from('chat')
          .insert([
            {
              id_user: user.id,
              mensagem: botResponse,
              remetente: 'admin',
            },
          ])
          .select()
          .single();

        if (!error && botMessage) {
          // Adicionar mensagem do bot ao estado local
          setMensagens((prev) => [...prev, botMessage]);
          setTimeout(scrollToBottom, 100);
        }
      }, 1000);
    }
  };

  const handleSend = async () => {
    if (!mensagem.trim() || !user) return;

    try {
      const messageToProcess = mensagem.trim();
      setMensagem('');
      
      // Inserir mensagem no banco
      const { data: newMessage, error } = await supabase
        .from('chat')
        .insert([
          {
            id_user: user.id,
            mensagem: messageToProcess,
            remetente: 'cliente',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Adicionar mensagem ao estado local imediatamente
      if (newMessage) {
        setMensagens((prev) => [...prev, newMessage]);
        setTimeout(scrollToBottom, 100);
      }

      // Recarregar mensagens para garantir sincronização
      await loadMensagens(user.id);
      
      // Processar resposta do bot
      await processBotResponse(messageToProcess);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Erro', 'Erro ao enviar mensagem. Tente novamente.');
      // Restaurar mensagem em caso de erro
      setMensagem(messageToProcess);
    }
  };

  const renderMessage = (msg) => {
    const isCliente = msg.remetente === 'cliente';
    const isBot = msg.remetente === 'admin' && (
      msg.mensagem.includes('👋') || 
      msg.mensagem.includes('Posso ajudá-lo') ||
      msg.mensagem.includes('Você possui') ||
      msg.mensagem.includes('Próximo vencimento') ||
      msg.mensagem.includes('Status da sua')
    );
    const time = new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        key={msg.id}
        style={[
          styles.messageContainer,
          isCliente ? styles.messageCliente : styles.messageAdmin,
        ]}
      >
        {isBot && (
          <View style={styles.botBadge}>
            <Bot size={12} color="#10B981" />
            <Text style={styles.botBadgeText}>Bot</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isCliente ? styles.bubbleCliente : styles.bubbleAdmin,
          ]}
        >
          {msg.arquivo_url ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: msg.arquivo_url }}
                style={styles.messageImage}
                resizeMode="cover"
                onError={(error) => {
                  console.error('Error loading image:', error);
                }}
              />
              {msg.mensagem && msg.mensagem !== '[Imagem enviada]' && (
                <Text
                  style={[
                    styles.messageText,
                    isCliente ? styles.textCliente : styles.textAdmin,
                    { marginTop: 8 },
                  ]}
                >
                  {msg.mensagem}
                </Text>
              )}
            </View>
          ) : (
            <Text
              style={[
                styles.messageText,
                isCliente ? styles.textCliente : styles.textAdmin,
              ]}
            >
              {msg.mensagem}
            </Text>
          )}
          <Text
            style={[
              styles.messageTime,
              isCliente ? styles.timeCliente : styles.timeAdmin,
            ]}
          >
            {time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suporte</Text>
        <Text style={styles.subtitle}>Chat ao vivo</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={scrollToBottom}
        >
          {mensagens.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhuma mensagem ainda.{'\n'}
                Envie uma mensagem para iniciar o chat.
              </Text>
            </View>
          ) : (
            mensagens.map(renderMessage)
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={handlePickImage}
            disabled={uploadingImage || !user}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <ImageIcon size={24} color="#3B82F6" />
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            value={mensagem}
            onChangeText={setMensagem}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!mensagem.trim() || !user) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!mensagem.trim() || !user || uploadingImage}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  subtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    marginTop: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#CBD5E1',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageCliente: {
    alignItems: 'flex-end',
  },
  messageAdmin: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  bubbleCliente: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  bubbleAdmin: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  textCliente: {
    color: '#FFFFFF',
  },
  textAdmin: {
    color: '#F1F5F9',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  timeCliente: {
    color: '#DBEAFE',
  },
  timeAdmin: {
    color: '#CBD5E1',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  imageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  imageContainer: {
    marginBottom: 8,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  botBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#10B98120',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  botBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
  },
});

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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Send } from 'lucide-react-native';
import { getSupabase } from '../lib/supabaseMulti';

export default function ChatScreen() {
  const [user, setUser] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState([]);
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
    const { data } = await supabase
      .from('chat')
      .select('*')
      .eq('id_user', userId)
      .order('timestamp', { ascending: true });

    setMensagens(data || []);
    setTimeout(scrollToBottom, 100);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = async () => {
    if (!mensagem.trim() || !user) return;

    try {
      const { error } = await supabase.from('chat').insert([
        {
          id_user: user.id,
          mensagem: mensagem.trim(),
          remetente: 'cliente',
        },
      ]);

      if (error) throw error;

      setMensagem('');
      // A mensagem será adicionada automaticamente via subscription
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = (msg) => {
    const isCliente = msg.remetente === 'cliente';
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
        <View
          style={[
            styles.messageBubble,
            isCliente ? styles.bubbleCliente : styles.bubbleAdmin,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isCliente ? styles.textCliente : styles.textAdmin,
            ]}
          >
            {msg.mensagem}
          </Text>
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
            disabled={!mensagem.trim() || !user}
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
});

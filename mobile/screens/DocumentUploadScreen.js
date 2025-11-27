import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Camera, Upload, CheckCircle } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DocumentUploadScreen({ route, navigation }) {
  const { user } = route.params;
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState({
    selfie: null,
    cnhRg: null,
    comprovanteEndereco: null,
    comprovanteRenda: null,
    carteiraTrabalho: null,
  });

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Erro', 'Precisamos de permissão para acessar a câmera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setDocuments({ ...documents, selfie: result.assets[0] });
    }
  };

  const pickImage = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setDocuments({ ...documents, [type]: result.assets[0] });
    }
  };

  const pickDocument = async (type) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setDocuments({ ...documents, [type]: result.assets[0] });
    }
  };

  const uploadFile = async (file, path) => {
    const fileExt = file.uri.split('.').pop();
    const fileName = `${path}/${user.id}_${Date.now()}.${fileExt}`;

    // Ler arquivo como base64
    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Converter base64 para ArrayBuffer
    const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    const { data, error } = await supabase.storage
      .from('user-documents')
      .upload(fileName, arrayBuffer, {
        contentType: file.mimeType || 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('user-documents')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    // Validar se todos os documentos foram enviados
    if (!documents.selfie || !documents.cnhRg || !documents.comprovanteEndereco || 
        !documents.comprovanteRenda || !documents.carteiraTrabalho) {
      Alert.alert('Erro', 'Por favor, envie todos os documentos');
      return;
    }

    setLoading(true);

    try {
      // Upload de todos os arquivos
      const selfieUrl = await uploadFile(documents.selfie, 'selfies');
      const cnhRgUrl = await uploadFile(documents.cnhRg, 'cnh-rg');
      const enderecoUrl = await uploadFile(documents.comprovanteEndereco, 'comprovantes-endereco');
      const rendaUrl = await uploadFile(documents.comprovanteRenda, 'comprovantes-renda');
      const carteiraUrl = await uploadFile(documents.carteiraTrabalho, 'carteiras-trabalho');

      // Salvar no banco
      const { error } = await supabase
        .from('documents')
        .insert([
          {
            id_user: user.id,
            selfie_url: selfieUrl,
            cnh_rg_url: cnhRgUrl,
            comprovante_endereco_url: enderecoUrl,
            comprovante_renda_url: rendaUrl,
            carteira_trabalho_pdf_url: carteiraUrl,
            status_documentos: 'em_analise',
          },
        ]);

      if (error) throw error;

      Alert.alert(
        'Sucesso!',
        'Documentos enviados com sucesso. Aguarde a análise.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Recarregar app
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading documents:', error);
      Alert.alert('Erro', 'Erro ao enviar documentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Envie seus documentos</Text>
          <Text style={styles.subtitle}>
            Para sua segurança, precisamos validar seus documentos
          </Text>

          {/* Selfie */}
          <View style={styles.documentItem}>
            <Text style={styles.documentTitle}>📸 Selfie</Text>
            {documents.selfie ? (
              <View style={styles.uploadedContainer}>
                <Image source={{ uri: documents.selfie.uri }} style={styles.preview} />
                <CheckCircle size={20} color="#10B981" />
                <Text style={styles.uploadedText}>Foto enviada</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={takeSelfie}>
                <Camera size={24} color="#3B82F6" />
                <Text style={styles.uploadButtonText}>Tirar foto</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* RG/CNH */}
          <View style={styles.documentItem}>
            <Text style={styles.documentTitle}>🪪 RG ou CNH</Text>
            {documents.cnhRg ? (
              <View style={styles.uploadedContainer}>
                <CheckCircle size={20} color="#10B981" />
                <Text style={styles.uploadedText}>Documento enviado</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('cnhRg')}>
                <Upload size={24} color="#3B82F6" />
                <Text style={styles.uploadButtonText}>Enviar foto</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Comprovante de Endereço */}
          <View style={styles.documentItem}>
            <Text style={styles.documentTitle}>🏡 Comprovante de Endereço</Text>
            {documents.comprovanteEndereco ? (
              <View style={styles.uploadedContainer}>
                <CheckCircle size={20} color="#10B981" />
                <Text style={styles.uploadedText}>Documento enviado</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={() => pickDocument('comprovanteEndereco')}
              >
                <Upload size={24} color="#3B82F6" />
                <Text style={styles.uploadButtonText}>Enviar arquivo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Comprovante de Renda */}
          <View style={styles.documentItem}>
            <Text style={styles.documentTitle}>💰 Comprovante de Renda</Text>
            {documents.comprovanteRenda ? (
              <View style={styles.uploadedContainer}>
                <CheckCircle size={20} color="#10B981" />
                <Text style={styles.uploadedText}>Documento enviado</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={() => pickDocument('comprovanteRenda')}
              >
                <Upload size={24} color="#3B82F6" />
                <Text style={styles.uploadButtonText}>Enviar arquivo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Carteira de Trabalho */}
          <View style={styles.documentItem}>
            <Text style={styles.documentTitle}>📘 Carteira de Trabalho Digital</Text>
            {documents.carteiraTrabalho ? (
              <View style={styles.uploadedContainer}>
                <CheckCircle size={20} color="#10B981" />
                <Text style={styles.uploadedText}>Documento enviado</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={() => pickDocument('carteiraTrabalho')}
              >
                <Upload size={24} color="#3B82F6" />
                <Text style={styles.uploadButtonText}>Enviar PDF</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Enviar Documentos</Text>
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
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  documentItem: {
    marginBottom: 24,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DBEAFE',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  uploadedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  preview: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

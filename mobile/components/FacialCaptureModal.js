import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Check } from 'lucide-react-native';

export default function FacialCaptureModal({ visible, onClose, onCapture, title = 'Captura Facial' }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef(null);

  React.useEffect(() => {
    if (visible && !permission) {
      requestPermission();
    }
  }, [visible]);

  const checkPermission = () => {
    if (!permission) return null;
    if (!permission.granted) {
      Alert.alert('Erro', 'Permissão de câmera necessária para continuar');
      onClose();
      return false;
    }
    return true;
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: false,
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Erro', 'Erro ao capturar foto. Tente novamente.');
      }
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const confirmCapture = async () => {
    if (capturedImage) {
      setUploading(true);
      try {
        await onCapture(capturedImage);
        handleClose();
      } catch (error) {
        console.error('Error confirming capture:', error);
        Alert.alert('Erro', 'Erro ao processar imagem. Tente novamente.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleClose = () => {
    setCapturedImage(null);
    onClose();
  };

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando câmera...</Text>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Solicitando permissão...</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Permitir Câmera</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent={false} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Camera or Preview */}
        <View style={styles.cameraContainer}>
          {capturedImage ? (
            <Image source={{ uri: capturedImage }} style={styles.preview} />
          ) : (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.faceGuide} />
              </View>
            </CameraView>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>
            {capturedImage ? 'Confirmar Captura?' : 'Instruções'}
          </Text>
          <Text style={styles.instructionText}>
            {capturedImage
              ? 'Verifique se a foto está clara e seu rosto está visível.'
              : 'Posicione seu rosto no centro da tela e tire uma foto clara.'}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {capturedImage ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.retakeButton]}
                onPress={retakePicture}
                disabled={uploading}
              >
                <Text style={styles.iconEmoji}>📷</Text>
                <Text style={styles.actionButtonText}>Tirar Novamente</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={confirmCapture}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Check size={24} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Confirmar</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 250,
    height: 300,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 150,
    opacity: 0.5,
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  instructions: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  retakeButton: {
    backgroundColor: '#6B7280',
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  iconEmoji: {
    fontSize: 24,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});


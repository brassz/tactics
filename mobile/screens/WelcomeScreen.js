import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  ScrollView 
} from 'react-native';
import { 
  Camera, 
  CreditCard, 
  MapPin, 
  Briefcase,
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  Zap
} from 'lucide-react-native';

export default function WelcomeScreen({ navigation }) {
  const documentos = [
    { icon: Camera, title: 'Selfie', description: 'Foto sua para verificação de identidade' },
    { icon: CreditCard, title: 'CNH', description: 'Carteira Nacional de Habilitação' },
    { icon: MapPin, title: 'Comprovante de Endereço', description: 'Conta de luz, água ou telefone' },
    { icon: Briefcase, title: 'Carteira de Trabalho', description: 'Carteira de Trabalho Digital' },
  ];

  const beneficios = [
    { icon: Zap, title: 'Rápido', description: 'Aprovação em até 24h' },
    { icon: Shield, title: 'Seguro', description: 'Seus dados protegidos' },
    { icon: Clock, title: 'Prático', description: 'Tudo pelo celular' },
  ];

  const passos = [
    { step: '1', title: 'Crie sua conta', description: 'Cadastre-se com seus dados pessoais' },
    { step: '2', title: 'Envie os documentos', description: 'Faça upload dos documentos necessários' },
    { step: '3', title: 'Aguarde a análise', description: 'Nossa equipe analisa em até 24h' },
    { step: '4', title: 'Solicite seu empréstimo', description: 'Após aprovado, solicite o valor desejado' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>Sistema de Empréstimos</Text>
          <Text style={styles.heroSubtitle}>
            Soluções financeiras rápidas, seguras e acessíveis para você
          </Text>
          
          {/* Botões de Ação no Topo */}
          <View style={styles.heroButtonContainer}>
            <TouchableOpacity
              style={styles.heroPrimaryButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <Text style={styles.heroPrimaryButtonText}>Criar Conta</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroSecondaryButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.heroSecondaryButtonText}>Já tenho conta</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Benefícios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por que escolher nosso sistema?</Text>
          <View style={styles.beneficiosGrid}>
            {beneficios.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <View key={index} style={styles.beneficioCard}>
                  <View style={styles.beneficioIconContainer}>
                    <IconComponent size={24} color="#3B82F6" />
                  </View>
                  <Text style={styles.beneficioTitle}>{item.title}</Text>
                  <Text style={styles.beneficioDescription}>{item.description}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Como Solicitar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Como solicitar seu empréstimo?</Text>
          <View style={styles.passosContainer}>
            {passos.map((passo, index) => (
              <View key={index} style={styles.passoCard}>
                <View style={styles.passoNumber}>
                  <Text style={styles.passoNumberText}>{passo.step}</Text>
                </View>
                <View style={styles.passoContent}>
                  <Text style={styles.passoTitle}>{passo.title}</Text>
                  <Text style={styles.passoDescription}>{passo.description}</Text>
                </View>
                {index < passos.length - 1 && (
                  <View style={styles.passoConnector} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Documentos Necessários */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentos necessários</Text>
          <Text style={styles.sectionSubtitle}>
            Prepare os seguintes documentos para agilizar seu cadastro
          </Text>
          <View style={styles.documentosContainer}>
            {documentos.map((doc, index) => {
              const IconComponent = doc.icon;
              return (
                <View key={index} style={styles.documentoCard}>
                  <View style={styles.documentoIconContainer}>
                    <IconComponent size={28} color="#3B82F6" />
                  </View>
                  <View style={styles.documentoContent}>
                    <Text style={styles.documentoTitle}>{doc.title}</Text>
                    <Text style={styles.documentoDescription}>{doc.description}</Text>
                  </View>
                  <CheckCircle size={20} color="#10B981" />
                </View>
              );
            })}
          </View>
        </View>

        {/* Informações Adicionais */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Shield size={24} color="#3B82F6" />
            <Text style={styles.infoTitle}>Segurança e Privacidade</Text>
          </View>
          <Text style={styles.infoText}>
            Todos os seus dados e documentos são criptografados e protegidos. 
            Utilizamos tecnologia de ponta para garantir a segurança das suas informações.
          </Text>
        </View>

        {/* Botões de Ação */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Criar Conta</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Já tenho conta</Text>
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
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    backgroundColor: '#1E293B',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 70,
    height: 70,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  heroButtonContainer: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  heroPrimaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  heroPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  heroSecondaryButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  heroSecondaryButtonText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 20,
    lineHeight: 20,
  },
  beneficiosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  beneficioCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  beneficioIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  beneficioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
    textAlign: 'center',
  },
  beneficioDescription: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
  },
  passosContainer: {
    marginTop: 16,
  },
  passoCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  passoNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  passoNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  passoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  passoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  passoDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  passoConnector: {
    position: 'absolute',
    left: 24,
    top: 68,
    width: 2,
    height: 16,
    backgroundColor: '#334155',
  },
  documentosContainer: {
    marginTop: 16,
    gap: 12,
  },
  documentoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  documentoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentoContent: {
    flex: 1,
  },
  documentoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  documentoDescription: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  infoCard: {
    marginHorizontal: 24,
    marginTop: 32,
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginLeft: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
});

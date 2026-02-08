import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Home, FileText, DollarSign, MessageCircle, Users, Clock, CreditCard } from 'lucide-react-native';

// User Screens
import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import CompanySelectScreen from './screens/CompanySelectScreen';
import DocumentUploadScreen from './screens/DocumentUploadScreen';
import HomeScreen from './screens/HomeScreen';
import RequestScreen from './screens/RequestScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import ChatScreen from './screens/ChatScreen';
import WithdrawalScreen from './screens/WithdrawalScreen';
import LoansScreen from './screens/LoansScreen';

// Admin Screens
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminUsersScreen from './screens/AdminUsersScreen';
import AdminRequestsScreen from './screens/AdminRequestsScreen';
import AdminDocumentsScreen from './screens/AdminDocumentsScreen';
import AdminPaymentsScreen from './screens/AdminPaymentsScreen';
import AdminWithdrawalsScreen from './screens/AdminWithdrawalsScreen';

// Multi-tenant
import { initializeSupabase } from './lib/supabaseMulti';

// Services
import { checkAndNotifyLoans, cleanOldNotifications } from './services/loanNotifications';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopWidth: 1,
          borderTopColor: '#334155',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Request"
        component={RequestScreen}
        options={{
          tabBarLabel: 'Solicitar',
          tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Loans"
        component={LoansScreen}
        options={{
          tabBarLabel: 'Empréstimos',
          tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Suporte',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminRequests" component={AdminRequestsScreen} />
      <Stack.Screen name="AdminDocuments" component={AdminDocumentsScreen} />
      <Stack.Screen name="AdminWithdrawals" component={AdminWithdrawalsScreen} />
      <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Inicializar sistema multi-tenant
    initializeSupabase();
    
    // Configurar listeners de notificação
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Aqui você pode navegar para a tela de empréstimos quando o usuário tocar na notificação
    });

    checkUser();
    
    // Limpar notificações antigas
    cleanOldNotifications();
    
    // Poll for user/admin changes to handle logout
    const interval = setInterval(checkUser, 1000);

    return () => {
      clearInterval(interval);
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const checkUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const adminData = await AsyncStorage.getItem('admin');
      
      if (adminData) {
        setAdmin(JSON.parse(adminData));
        setUser(null);
      } else if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setAdmin(null);
        
        // Verificar empréstimos quando usuário estiver logado
        setTimeout(() => checkAndNotifyLoans(), 2000);
      } else {
        setUser(null);
        setAdmin(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verificar empréstimos periodicamente quando usuário estiver logado
  useEffect(() => {
    if (!user || admin) return;
    
    // Verificar a cada 5 minutos
    const interval = setInterval(() => {
      checkAndNotifyLoans();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, admin]);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user && !admin ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="CompanySelect" component={CompanySelectScreen} />
              <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
            </>
          ) : admin ? (
            <Stack.Screen name="AdminStack" component={AdminStack} />
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Withdrawal" component={WithdrawalScreen} />
              <Stack.Screen name="Payments" component={PaymentsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

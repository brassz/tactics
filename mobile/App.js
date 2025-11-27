import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, FileText, DollarSign, MessageCircle, Users, Clock } from 'lucide-react-native';

// User Screens
import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import DocumentUploadScreen from './screens/DocumentUploadScreen';
import HomeScreen from './screens/HomeScreen';
import RequestScreen from './screens/RequestScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import ChatScreen from './screens/ChatScreen';

// Admin Screens
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminUsersScreen from './screens/AdminUsersScreen';
import AdminRequestsScreen from './screens/AdminRequestsScreen';
import AdminDocumentsScreen from './screens/AdminDocumentsScreen';
import AdminPaymentsScreen from './screens/AdminPaymentsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
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
        name="Payments"
        component={PaymentsScreen}
        options={{
          tabBarLabel: 'Pagamentos',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
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
      <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    checkUser();
    
    // Poll for user/admin changes to handle logout
    const interval = setInterval(checkUser, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const adminData = await AsyncStorage.getItem('admin');
      
      if (adminData) {
        setAdmin(JSON.parse(adminData));
        setUser(null);
      } else if (userData) {
        setUser(JSON.parse(userData));
        setAdmin(null);
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
              <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
            </>
          ) : admin ? (
            <Stack.Screen name="AdminStack" component={AdminStack} />
          ) : (
            <Stack.Screen name="MainTabs" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

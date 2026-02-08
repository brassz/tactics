import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configurar como as notificações devem ser tratadas quando o app está em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Solicitar permissões de notificação
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }
  
  try {
    // Para desenvolvimento local, não precisamos do projectId
    // Em produção, você pode usar Constants.expoConfig.extra.eas.projectId
    if (Device.isDevice) {
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  } catch (e) {
    console.error('Error getting push token:', e);
  }

  return token;
}

// Enviar notificação local
export async function schedulePushNotification(title, body, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // null = enviar imediatamente
  });
}

// Enviar notificação para empréstimo vencido
export async function notifyOverdueLoan(loan) {
  const amount = parseFloat(loan.total_amount || loan.amount || 0).toFixed(2);
  const dueDate = new Date(loan.due_date + 'T12:00:00').toLocaleDateString('pt-BR');
  
  await schedulePushNotification(
    '⚠️ Empréstimo Vencido',
    `Seu empréstimo de R$ ${amount} venceu em ${dueDate}. Por favor, realize o pagamento o quanto antes.`,
    {
      type: 'overdue_loan',
      loanId: loan.id,
    }
  );
}

// Enviar notificação para empréstimo próximo do vencimento
export async function notifyUpcomingLoan(loan, daysUntilDue) {
  const amount = parseFloat(loan.total_amount || loan.amount || 0).toFixed(2);
  const dueDate = new Date(loan.due_date + 'T12:00:00').toLocaleDateString('pt-BR');
  
  let title, body;
  if (daysUntilDue === 0) {
    title = '⏰ Empréstimo Vence Hoje';
    body = `Seu empréstimo de R$ ${amount} vence hoje (${dueDate}). Não esqueça de realizar o pagamento!`;
  } else if (daysUntilDue === 1) {
    title = '⏰ Empréstimo Vence Amanhã';
    body = `Seu empréstimo de R$ ${amount} vence amanhã (${dueDate}). Prepare-se para realizar o pagamento!`;
  } else {
    title = '📅 Empréstimo Próximo do Vencimento';
    body = `Seu empréstimo de R$ ${amount} vence em ${daysUntilDue} dias (${dueDate}).`;
  }

  await schedulePushNotification(
    title,
    body,
    {
      type: 'upcoming_loan',
      loanId: loan.id,
      daysUntilDue,
    }
  );
}


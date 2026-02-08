import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCompanySupabase } from '../lib/supabaseMulti';
import { notifyOverdueLoan, notifyUpcomingLoan, registerForPushNotificationsAsync } from './notifications';

// Armazenar IDs de empréstimos que já receberam notificação para evitar spam
const NOTIFICATION_STORAGE_KEY = 'loan_notifications_sent';

// Obter empréstimos que já receberam notificação
async function getSentNotifications() {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading notification storage:', error);
    return {};
  }
}

// Salvar ID de empréstimo que recebeu notificação
async function markNotificationSent(loanId, type) {
  try {
    const sent = await getSentNotifications();
    const key = `${loanId}_${type}`;
    sent[key] = Date.now();
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(sent));
  } catch (error) {
    console.error('Error saving notification storage:', error);
  }
}

// Verificar se já foi enviada notificação para este empréstimo hoje
async function hasNotificationBeenSent(loanId, type) {
  try {
    const sent = await getSentNotifications();
    const key = `${loanId}_${type}`;
    const timestamp = sent[key];
    
    if (!timestamp) return false;
    
    // Verificar se a notificação foi enviada hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notificationDate = new Date(timestamp);
    notificationDate.setHours(0, 0, 0, 0);
    
    return notificationDate.getTime() === today.getTime();
  } catch (error) {
    console.error('Error checking notification storage:', error);
    return false;
  }
}

// Calcular dias até o vencimento
function getDaysUntilDue(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate + 'T12:00:00');
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Verificar se empréstimo está vencido
function isOverdue(loan) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(loan.due_date + 'T12:00:00');
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate < today;
}

// Verificar e enviar notificações para empréstimos
export async function checkAndNotifyLoans() {
  try {
    // Registrar para notificações push
    await registerForPushNotificationsAsync();
    
    // Obter usuário logado
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      return; // Usuário não está logado
    }

    const user = JSON.parse(userData);
    const userCompany = user.company || 'franca';
    
    // Obter instância do Supabase da empresa
    const companySupabase = getCompanySupabase(userCompany);
    if (!companySupabase) {
      console.error('Error: Company Supabase not found for:', userCompany);
      return;
    }

    // Buscar cliente no banco da empresa pelo CPF
    const { data: client, error: clientError } = await companySupabase
      .from('clients')
      .select('id')
      .eq('cpf', user.cpf)
      .single();

    if (clientError || !client) {
      console.error('Error finding client:', clientError);
      return;
    }

    // Buscar empréstimos ativos do cliente
    const { data: loans, error: loansError } = await companySupabase
      .from('loans')
      .select('*')
      .eq('client_id', client.id)
      .in('status', ['active', 'pending', 'overdue']);

    if (loansError || !loans || loans.length === 0) {
      return;
    }

    // Verificar cada empréstimo
    for (const loan of loans) {
      const daysUntilDue = getDaysUntilDue(loan.due_date);
      
      // Verificar se está vencido
      if (isOverdue(loan)) {
        const hasSent = await hasNotificationBeenSent(loan.id, 'overdue');
        if (!hasSent) {
          await notifyOverdueLoan(loan);
          await markNotificationSent(loan.id, 'overdue');
        }
      }
      // Verificar se vence em 3 dias ou menos
      else if (daysUntilDue >= 0 && daysUntilDue <= 3) {
        const hasSent = await hasNotificationBeenSent(loan.id, `upcoming_${daysUntilDue}`);
        if (!hasSent) {
          await notifyUpcomingLoan(loan, daysUntilDue);
          await markNotificationSent(loan.id, `upcoming_${daysUntilDue}`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking loans for notifications:', error);
  }
}

// Limpar notificações antigas do storage (manter apenas dos últimos 7 dias)
export async function cleanOldNotifications() {
  try {
    const sent = await getSentNotifications();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const cleaned = {};
    for (const [key, timestamp] of Object.entries(sent)) {
      if (timestamp > sevenDaysAgo) {
        cleaned[key] = timestamp;
      }
    }
    
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(cleaned));
  } catch (error) {
    console.error('Error cleaning old notifications:', error);
  }
}


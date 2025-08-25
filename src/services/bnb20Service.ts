import { supabase } from '@/integrations/supabase/client';

export interface BNB20Transaction {
  id: string;
  payment_id?: string;
  type: 'deposit' | 'withdrawal';
  amount_usd: number;
  amount_bnb: number;
  status: string;
  pay_address?: string;
  pay_amount?: number;
  pay_currency?: string;
  qr_code_base64?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  admin_notes?: string;
  admin_approved_at?: string;
}

export interface BNB20PaymentResponse {
  success: boolean;
  payment_id?: string;
  pay_address?: string;
  pay_amount?: number;
  pay_currency?: string;
  qr_code_url?: string;
  expires_at?: string;
  status?: string;
  amount_usd?: number;
  amount_bnb?: number;
  withdrawal_id?: string;
  message?: string;
  bnb_address?: string;
  error?: string;
}

export class BNB20Service {
  
  /**
   * Criar um depósito BNB20
   */
  static async createDeposit(amount: number, currency = 'usd'): Promise<BNB20PaymentResponse> {
    try {
      console.log('🚀 Criando depósito BNB20:', { amount, currency });

      const { data, error } = await supabase.functions.invoke('nowpayments-create-payment', {
        body: { amount, currency }
      });

      if (error) {
        console.error('❌ Erro na Edge Function:', error);
        throw new Error(error.message || 'Erro ao criar pagamento');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      console.log('✅ Depósito criado:', data);
      return data;
    } catch (error) {
      console.error('💥 Erro no createDeposit:', error);
      throw error;
    }
  }

  /**
   * Criar um saque BNB20
   */
  static async createWithdrawal(amount: number, bnbAddress: string, currency = 'usd'): Promise<BNB20PaymentResponse> {
    try {
      console.log('🚀 Criando saque BNB20:', { amount, bnbAddress, currency });

      const { data, error } = await supabase.functions.invoke('nowpayments-create-withdrawal', {
        body: { amount, bnb_address: bnbAddress, currency }
      });

      if (error) {
        console.error('❌ Erro na Edge Function:', error);
        throw new Error(error.message || 'Erro ao criar saque');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      console.log('✅ Saque criado:', data);
      return data;
    } catch (error) {
      console.error('💥 Erro no createWithdrawal:', error);
      throw error;
    }
  }

  /**
   * Consultar status de uma transação
   */
  static async getTransactionStatus(paymentId?: string, transactionId?: string): Promise<BNB20Transaction> {
    try {
      console.log('🔍 Consultando status:', { paymentId, transactionId });

      const params = new URLSearchParams();
      if (paymentId) params.append('payment_id', paymentId);
      if (transactionId) params.append('transaction_id', transactionId);

      const { data, error } = await supabase.functions.invoke(`nowpayments-status?${params.toString()}`);

      if (error) {
        console.error('❌ Erro na consulta:', error);
        throw new Error(error.message || 'Erro ao consultar status');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      console.log('✅ Status obtido:', data.transaction);
      return data.transaction;
    } catch (error) {
      console.error('💥 Erro no getTransactionStatus:', error);
      throw error;
    }
  }

  /**
   * Buscar transações do usuário
   */
  static async getUserTransactions(): Promise<BNB20Transaction[]> {
    try {
      console.log('📋 Buscando transações BNB20 do usuário');

      const { data, error } = await supabase
        .from('bnb20_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar transações:', error);
        throw error;
      }

      console.log('✅ Transações obtidas:', data.length);
      return data || [];
    } catch (error) {
      console.error('💥 Erro no getUserTransactions:', error);
      throw error;
    }
  }

  /**
   * Aprovar/Rejeitar transação (apenas admin)
   */
  static async approveTransaction(
    transactionId: string, 
    action: 'approve' | 'reject', 
    reason?: string,
    adminEmail?: string
  ): Promise<any> {
    try {
      console.log('🔐 Admin aprovação:', { transactionId, action, reason });

      const { data, error } = await supabase.functions.invoke('nowpayments-admin-approve', {
        body: { transaction_id: transactionId, action, reason, admin_email: adminEmail }
      });

      if (error) {
        console.error('❌ Erro na aprovação:', error);
        throw new Error(error.message || 'Erro ao processar aprovação');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      console.log('✅ Aprovação processada:', data);
      return data;
    } catch (error) {
      console.error('💥 Erro no approveTransaction:', error);
      throw error;
    }
  }

  /**
   * Validar endereço BNB
   */
  static validateBNBAddress(address: string): boolean {
    // Validação básica para endereços BSC/BNB
    const bnbRegex = /^0x[a-fA-F0-9]{40}$/;
    return bnbRegex.test(address);
  }

  /**
   * Formatar valor BNB
   */
  static formatBNB(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    }).format(amount) + ' BNB';
  }

  /**
   * Formatar valor USD
   */
  static formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  /**
   * Traduzir status para português
   */
  static translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'waiting': 'Aguardando Pagamento',
      'confirming': 'Confirmando',
      'confirmed': 'Confirmado',
      'sending': 'Enviando',
      'partially_paid': 'Parcialmente Pago',
      'finished': 'Concluído',
      'failed': 'Falhou',
      'refunded': 'Reembolsado',
      'expired': 'Expirado',
      'admin_approved': 'Aprovado pelo Admin',
      'admin_rejected': 'Rejeitado pelo Admin',
    };
    
    return statusMap[status] || status;
  }

  /**
   * Obter cor do status
   */
  static getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'pending': 'text-yellow-600',
      'waiting': 'text-blue-600',
      'confirming': 'text-orange-600',
      'confirmed': 'text-green-600',
      'sending': 'text-purple-600',
      'partially_paid': 'text-yellow-600',
      'finished': 'text-green-600',
      'failed': 'text-red-600',
      'refunded': 'text-gray-600',
      'expired': 'text-red-600',
      'admin_approved': 'text-green-600',
      'admin_rejected': 'text-red-600',
    };
    
    return colorMap[status] || 'text-gray-600';
  }
}
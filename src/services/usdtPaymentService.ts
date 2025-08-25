import { supabase } from '@/integrations/supabase/client';

export interface CreatePaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
  success_url?: string;
  cancel_url?: string;
}

export interface PaymentResponse {
  success: boolean;
  payment_id?: string;
  pay_address?: string;
  pay_amount?: number;
  qr_code_base64?: string;
  order_id?: string;
  payment_status?: string;
  created_at?: string;
  expires_at?: string;
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  payment_status?: string;
  pay_status?: string;
  pay_amount?: number;
  actually_paid?: number;
  price_amount?: number;
  price_currency?: string;
  pay_currency?: string;
  order_id?: string;
  order_description?: string;
  purchase_id?: string;
  outcome_amount?: number;
  outcome_currency?: string;
  created_at?: string;
  updated_at?: string;
  error?: string;
}

export class USDTPaymentService {
  static async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('🚀 Criando pagamento USDT:', request);

      const { data, error } = await supabase.functions.invoke('nowpayments-create-payment', {
        body: request
      });

      if (error) {
        console.error('❌ Erro na Edge Function:', error);
        throw new Error('Falha na comunicação com o servidor');
      }

      if (!data.success) {
        console.error('❌ Erro no createPayment:', data.error);
        throw new Error(data.error || 'Erro desconhecido');
      }

      console.log('✅ Pagamento criado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('💥 Erro no createPayment:', error);
      throw error;
    }
  }

  static async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      console.log('📊 Consultando status do pagamento:', paymentId);

      const { data, error } = await supabase.functions.invoke('nowpayments-status', {
        body: { payment_id: paymentId }
      });

      if (error) {
        console.error('❌ Erro na Edge Function:', error);
        throw new Error('Falha na comunicação com o servidor');
      }

      if (!data.success) {
        console.error('❌ Erro no getPaymentStatus:', data.error);
        throw new Error(data.error || 'Erro desconhecido');
      }

      console.log('✅ Status obtido com sucesso:', data);
      return data;
    } catch (error) {
      console.error('💥 Erro no getPaymentStatus:', error);
      throw error;
    }
  }

  static async getUserTransactions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('bnb20_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar transações:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('💥 Erro no getUserTransactions:', error);
      throw error;
    }
  }

  static async getSupportedCurrencies(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('supported_currencies')
        .select('*')
        .eq('is_active', true)
        .order('symbol', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar moedas:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('💥 Erro no getSupportedCurrencies:', error);
      throw error;
    }
  }

  static async getPaymentStats(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('payment_stats')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        // Usuário pode não ter permissão para ver stats
        return [];
      }

      return data || [];
    } catch (error) {
      // Silenciar erro para usuários sem permissão
      return [];
    }
  }
}
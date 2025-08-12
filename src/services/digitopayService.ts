import { supabase } from '@/integrations/supabase/client';

// Configurações do DigitoPay - Documentação Oficial
const DIGITOPAY_CONFIG = {
  baseUrl: 'https://api.digitopayoficial.com.br/api', // URL oficial da API
  clientId: import.meta.env.VITE_DIGITOPAY_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_DIGITOPAY_CLIENT_SECRET || '',
  webhookSecret: import.meta.env.VITE_DIGITOPAY_WEBHOOK_SECRET || ''
};

// Tipos TypeScript baseados na documentação oficial
export interface DigitoPayAuthResponse {
  success: boolean;
  accessToken?: string;
  message?: string;
}

// Estrutura de depósito conforme documentação oficial
export interface DigitoPayDepositRequest {
  dueDate: string;
  paymentOptions: string[];
  person: {
    cpf: string;
    name: string;
  };
  value: number;
  callbackUrl?: string;
  idempotencyKey?: string;
}

export interface DigitoPayDepositResponse {
  success: boolean;
  id?: string;
  pixCopiaECola?: string;
  qrCodeBase64?: string;
  qrCodeUrl?: string;
  expiresAt?: string;
  status?: string;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Estrutura de saque conforme documentação oficial
export interface DigitoPayWithdrawalRequest {
  paymentOptions: string[];
  person: {
    pixKeyTypes: string;
    pixKey: string;
    name: string;
    cpf: string;
  };
  value: number;
  endToEndId?: string;
  callbackUrl?: string;
  idempotencyKey?: string;
}

export interface DigitoPayWithdrawalResponse {
  success: boolean;
  id?: string;
  isSend?: boolean;
  message?: string;
  idempotencyKey?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface DigitoPayWebhookData {
  id: string;
  externalId?: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'FAILED';
  amount: number;
  customer: {
    name: string;
    document: string;
  };
  paymentMethod: {
    type: string;
    pixKey?: string;
    pixKeyType?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Classe principal do serviço DigitoPay
export class DigitoPayService {
  private static accessToken: string | null = null;
  private static tokenExpiry: number = 0;

  // Autenticação com a API - Via Edge Function para evitar CORS
  static async authenticate(): Promise<DigitoPayAuthResponse> {
    try {
      console.log('🔐 Iniciando autenticação via Edge Function...');
      
      const response = await supabase.functions.invoke('digitopay-auth', {
        body: {}
      });

      console.log('📡 Resposta da Edge Function:', response);

      if (response.error) {
        await this.logDebug('authenticate_error', response.error);
        return { success: false, message: response.error.message || 'Erro na Edge Function' };
      }

      const data = response.data;

      if (data.success && data.accessToken) {
        this.accessToken = data.accessToken;
        this.tokenExpiry = Date.now() + (data.expiration * 1000);
        
        await this.logDebug('authenticate_success', { 
          hasToken: !!data.accessToken,
          expiration: data.expiration
        });
        
        return { success: true, accessToken: data.accessToken };
      } else {
        await this.logDebug('authenticate_failure', data);
        return { success: false, message: data.message || 'Erro na autenticação' };
      }
    } catch (error) {
      console.error('💥 Erro na autenticação:', error);
      await this.logDebug('authenticate_exception', { error: String(error) });
      return { success: false, message: 'Erro de conexão' };
    }
  }

  // Verificar se o token ainda é válido
  private static async ensureValidToken(): Promise<boolean> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      const authResult = await this.authenticate();
      return authResult.success;
    }
    return true;
  }

  // Criar depósito - Via Edge Function para evitar CORS
  static async createDeposit(
    amount: number,
    cpf: string,
    name: string,
    callbackUrl: string,
    description?: string
  ): Promise<DigitoPayDepositResponse> {
    try {
      console.log('💰 Criando depósito via Edge Function...');
      
      const response = await supabase.functions.invoke('digitopay-deposit', {
        body: {
          amount,
          cpf,
          name,
          callbackUrl,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      console.log('📡 Resposta da Edge Function deposit:', response);

      if (response.error) {
        await this.logDebug('createDeposit_error', response.error);
        return { success: false, message: response.error.message || 'Erro na Edge Function' };
      }

      const data = response.data;

      if (data.success && data.id) {
        await this.logDebug('createDeposit_success', {
          id: data.id,
          hasPixCode: !!data.pixCopiaECola,
          hasQrCode: !!data.qrCodeBase64
        });

        return {
          success: true,
          id: data.id,
          pixCopiaECola: data.pixCopiaECola,
          qrCodeBase64: data.qrCodeBase64,
          qrCodeUrl: data.qrCodeUrl,
          expiresAt: data.expiresAt,
          status: data.status
        };
      } else {
        await this.logDebug('createDeposit_failure', data);
        return {
          success: false,
          message: data.message || 'Erro ao criar depósito',
          errors: data.errors
        };
      }
    } catch (error) {
      console.error('💥 Erro ao criar depósito:', error);
      await this.logDebug('createDeposit_exception', { error: String(error) });
      return { success: false, message: 'Erro de conexão' };
    }
  }

  // Criar saque - Conforme documentação oficial
  static async createWithdrawal(
    amount: number,
    cpf: string,
    name: string,
    pixKey: string,
    pixKeyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM',
    callbackUrl: string,
    description?: string
  ): Promise<DigitoPayWithdrawalResponse> {
    try {
      if (!(await this.ensureValidToken())) {
        return { success: false, message: 'Erro na autenticação' };
      }

      const withdrawalData: DigitoPayWithdrawalRequest = {
        paymentOptions: ['PIX'],
        person: {
          pixKeyTypes: pixKeyType,
          pixKey: pixKey,
          name: name,
          cpf: cpf.replace(/\D/g, '')
        },
        value: amount,
        endToEndId: `withdrawal_${Date.now()}`,
        callbackUrl: callbackUrl,
        idempotencyKey: `withdrawal_${Date.now()}`
      };

      const response = await fetch(`${DIGITOPAY_CONFIG.baseUrl}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(withdrawalData),
      });

      const data = await response.json();
      await this.logDebug('createWithdrawal', { request: withdrawalData, response: data });

      if (response.ok && data.id) {
        return {
          success: true,
          id: data.id,
          isSend: data.isSend
        };
      } else {
        return {
          success: false,
          message: data.message || data.mensagem || 'Erro ao criar saque',
          errors: data.errors
        };
      }
    } catch (error) {
      await this.logDebug('createWithdrawal_exception', { error: String(error) });
      return { success: false, message: 'Erro de conexão' };
    }
  }

  // Verificar status de uma transação - Conforme documentação oficial
  static async checkTransactionStatus(trxId: string): Promise<any> {
    try {
      if (!(await this.ensureValidToken())) {
        return { success: false, message: 'Erro na autenticação' };
      }

      const response = await fetch(`${DIGITOPAY_CONFIG.baseUrl}/statusTransaction/${trxId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const data = await response.json();
      await this.logDebug('checkStatus', { trxId, response: data });

      return data;
    } catch (error) {
      await this.logDebug('checkStatus_exception', { trxId, error: String(error) });
      return { success: false, message: 'Erro de conexão' };
    }
  }

  // Verificar status de um saque - Conforme documentação oficial
  static async checkWithdrawalStatus(trxId: string): Promise<any> {
    try {
      if (!(await this.ensureValidToken())) {
        return { success: false, message: 'Erro na autenticação' };
      }

      const response = await fetch(`${DIGITOPAY_CONFIG.baseUrl}/statusTransaction/${trxId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const data = await response.json();
      await this.logDebug('checkWithdrawalStatus', { trxId, response: data });

      return data;
    } catch (error) {
      await this.logDebug('checkWithdrawalStatus_exception', { trxId, error: String(error) });
      return { success: false, message: 'Erro de conexão' };
    }
  }

  // Listar transações - Conforme documentação oficial
  static async listTransactions(page: number = 1, limit: number = 20): Promise<any> {
    try {
      if (!(await this.ensureValidToken())) {
        return { success: false, message: 'Erro na autenticação' };
      }

      const response = await fetch(`${DIGITOPAY_CONFIG.baseUrl}/accountTransaction?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const data = await response.json();
      await this.logDebug('listTransactions', { page, limit, response: data });

      return data;
    } catch (error) {
      await this.logDebug('listTransactions_exception', { error: String(error) });
      return { success: false, message: 'Erro de conexão' };
    }
  }

  // Log de debug
  private static async logDebug(tipo: string, payload: any): Promise<void> {
    try {
      await supabase
        .from('digitopay_debug')
        .insert({
          tipo,
          payload
        });
    } catch (error) {
      console.error('Erro ao salvar log de debug:', error);
    }
  }

  // Salvar transação no banco
  static async saveTransaction(
    userId: string,
    trxId: string,
    type: 'deposit' | 'withdrawal',
    amount: number,
    amountBrl: number,
    pixCode?: string,
    qrCodeBase64?: string,
    pixKey?: string,
    pixKeyType?: string,
    personName?: string,
    personCpf?: string,
    gatewayResponse?: any
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('digitopay_transactions')
        .insert({
          user_id: userId,
          trx_id: trxId,
          type,
          amount,
          amount_brl: amountBrl,
          pix_code: pixCode,
          qr_code_base64: qrCodeBase64,
          pix_key: pixKey,
          pix_key_type: pixKeyType,
          person_name: personName,
          person_cpf: personCpf,
          gateway_response: gatewayResponse
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      return { success: false, error };
    }
  }

  // Atualizar status da transação
  static async updateTransactionStatus(
    trxId: string,
    status: string,
    callbackData?: any
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('digitopay_transactions')
        .update({
          status,
          callback_data: callbackData
        })
        .eq('trx_id', trxId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return { success: false, error };
    }
  }

  // Buscar transações do usuário
  static async getUserTransactions(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return { success: false, error };
    }
  }

  // Buscar logs de debug (apenas admin)
  static async getDebugLogs(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('digitopay_debug')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      return { success: false, error };
    }
  }

  // Validar webhook - Conforme documentação oficial
  static validateWebhook(payload: string, signature: string): boolean {
    try {
      // Implementar validação de assinatura conforme documentação
      // Por enquanto, retorna true para desenvolvimento
      return true;
    } catch (error) {
      console.error('Erro ao validar webhook:', error);
      return false;
    }
  }
} 
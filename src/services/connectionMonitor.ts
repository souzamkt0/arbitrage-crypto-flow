import React from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionStatus {
  isOnline: boolean;
  lastCheck: number;
  consecutiveFailures: number;
  retryCount: number;
}

class ConnectionMonitor {
  private status: ConnectionStatus = {
    isOnline: true,
    lastCheck: Date.now(),
    consecutiveFailures: 0,
    retryCount: 0
  };

  private listeners: Array<(status: ConnectionStatus) => void> = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly CHECK_INTERVAL = 30000; // 30 segundos
  private readonly TIMEOUT_DURATION = 8000; // 8 segundos

  constructor() {
    this.startMonitoring();
    this.setupNetworkListeners();
  }

  private startMonitoring() {
    this.checkInterval = setInterval(() => {
      this.checkConnection();
    }, this.CHECK_INTERVAL);
  }

  private setupNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Conexão restaurada');
        this.status.isOnline = true;
        this.status.consecutiveFailures = 0;
        this.status.retryCount = 0;
        this.notifyListeners();
        this.checkConnection();
      });

      window.addEventListener('offline', () => {
        console.log('📡 Conexão perdida');
        this.status.isOnline = false;
        this.notifyListeners();
      });
    }
  }

  private async checkConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_DURATION);

      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      // Conexão bem-sucedida
      if (!this.status.isOnline) {
        console.log('✅ Conexão com Supabase restaurada');
      }
      
      this.status.isOnline = true;
      this.status.consecutiveFailures = 0;
      this.status.retryCount = 0;
      this.status.lastCheck = Date.now();
      this.notifyListeners();
      
      return true;

    } catch (error) {
      this.status.consecutiveFailures++;
      this.status.lastCheck = Date.now();
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('⏰ Timeout na conexão com Supabase');
        } else {
          console.warn('❌ Erro de conexão com Supabase:', error.message);
        }
      }

      // Marcar como offline após 3 falhas consecutivas
      if (this.status.consecutiveFailures >= 3) {
        this.status.isOnline = false;
        console.error('🔴 Conexão com Supabase marcada como offline');
      }

      this.notifyListeners();
      return false;
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.status);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // Reset retry count on success
        this.status.retryCount = 0;
        
        return result;
      } catch (error) {
        lastError = error as Error;
        this.status.retryCount = attempt + 1;
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff
          console.log(`🔄 Tentativa ${attempt + 1}/${maxRetries + 1} falhou, tentando novamente em ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  public onStatusChange(listener: (status: ConnectionStatus) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  public async forceCheck(): Promise<boolean> {
    return await this.checkConnection();
  }

  public destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners = [];
  }
}

// Singleton instance
export const connectionMonitor = new ConnectionMonitor();

// Hook para usar no React
export function useConnectionStatus() {
  const [status, setStatus] = React.useState(connectionMonitor.getStatus());
  
  React.useEffect(() => {
    const unsubscribe = connectionMonitor.onStatusChange(setStatus);
    return unsubscribe;
  }, []);
  
  return status;
}

// Função utilitária para executar operações do Supabase com retry
export async function executeSupabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  return connectionMonitor.executeWithRetry(operation, maxRetries);
}
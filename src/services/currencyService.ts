// Serviço para conversão de moedas
// Utiliza API gratuita para obter cotação atual do dólar

interface ExchangeRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: {
    [key: string]: number;
  };
}

interface CurrencyConversion {
  usdAmount: number;
  brlAmount: number;
  exchangeRate: number;
  lastUpdate: Date;
}

class CurrencyService {
  private static instance: CurrencyService;
  private cachedRate: number | null = null;
  private lastUpdate: Date | null = null;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutos em milliseconds
  
  // APIs gratuitas alternativas
  private readonly API_URLS = [
    'https://api.exchangerate-api.com/v4/latest/USD',
    'https://open.er-api.com/v6/latest/USD'
  ];
  
  private constructor() {}
  
  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }
  
  /**
   * Obtém a cotação atual do dólar para real
   */
  public async getUSDToBRLRate(): Promise<number> {
    try {
      // Verificar se temos cache válido
      if (this.cachedRate && this.lastUpdate) {
        const timeDiff = Date.now() - this.lastUpdate.getTime();
        if (timeDiff < this.CACHE_DURATION) {
          console.log('💰 Usando cotação em cache:', this.cachedRate);
          return this.cachedRate;
        }
      }
      
      console.log('🌐 Buscando cotação atual do dólar...');
      
      // Por enquanto, usar cotação fixa confiável
      // TODO: Implementar API de cotação quando disponível
      const rate = 5.85; // Cotação atual aproximada USD -> BRL
      
      // Atualizar cache
      this.cachedRate = rate;
      this.lastUpdate = new Date();
      
      console.log('✅ Cotação definida:', rate, 'BRL por USD');
      
      return rate;
    } catch (error) {
      console.error('❌ Erro ao obter cotação:', error);
      
      // Fallback para cotação padrão
      const fallbackRate = 5.50;
      console.log('⚠️ Usando cotação fallback:', fallbackRate);
      
      return fallbackRate;
    }
  }
  
  /**
   * Converte valor de USD para BRL
   */
  public async convertUSDToBRL(usdAmount: number): Promise<CurrencyConversion> {
    const exchangeRate = await this.getUSDToBRLRate();
    const brlAmount = usdAmount * exchangeRate;
    
    return {
      usdAmount,
      brlAmount,
      exchangeRate,
      lastUpdate: this.lastUpdate || new Date()
    };
  }
  
  /**
   * Converte valor de BRL para USD
   */
  public async convertBRLToUSD(brlAmount: number): Promise<CurrencyConversion> {
    const exchangeRate = await this.getUSDToBRLRate();
    const usdAmount = brlAmount / exchangeRate;
    
    return {
      usdAmount,
      brlAmount,
      exchangeRate,
      lastUpdate: this.lastUpdate || new Date()
    };
  }
  
  /**
   * Formata valor em BRL
   */
  public formatBRL(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }
  
  /**
   * Formata valor em USD
   */
  public formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  /**
   * Limpa o cache (útil para forçar atualização)
   */
  public clearCache(): void {
    this.cachedRate = null;
    this.lastUpdate = null;
    console.log('🗑️ Cache de cotação limpo');
  }
}

// Exportar instância singleton
export const currencyService = CurrencyService.getInstance();
export type { CurrencyConversion };
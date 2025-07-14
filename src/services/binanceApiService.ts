import * as CryptoJS from 'crypto-js';

// Configuração da API Binance
const BINANCE_API_CONFIG = {
  BASE_URL: 'https://api.binance.com',
  API_KEY: 'B5xi6RvYu11sYxxvZPdYZ4pzTK0pii2CpOsawmVG45bXICkYhjzV9MkjH2y0XGqt',
  SECRET_KEY: 'WRS9svtgQAeb83LMpf54XjiCrfNz5U0Ie8B1dWn2gBY5P61layPLkYISl56zqUMq'
};

// Interfaces para tipos de dados
export interface BinanceAccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  balances: Array<{
    asset: string;
    free: string;
    locked: string;
  }>;
}

export interface BinanceOrderResponse {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
}

export interface BinanceSymbolPrice {
  symbol: string;
  price: string;
}

export interface BinanceOrderBookTicker {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
}

// Classe principal para interação com a API Binance
class BinanceApiService {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    // Pegar as chaves do localStorage ou usar as padrões
    this.apiKey = localStorage.getItem('binance_api_key') || BINANCE_API_CONFIG.API_KEY;
    this.secretKey = localStorage.getItem('binance_secret_key') || BINANCE_API_CONFIG.SECRET_KEY;
    this.baseUrl = BINANCE_API_CONFIG.BASE_URL;
  }

  // Gerar assinatura HMAC SHA256
  private generateSignature(queryString: string): string {
    return CryptoJS.HmacSHA256(queryString, this.secretKey).toString();
  }

  // Criar query string a partir de parâmetros
  private createQueryString(params: Record<string, any>): string {
    return Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  // Fazer requisição para endpoint público
  private async makePublicRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const queryString = this.createQueryString(params);
    const url = `${this.baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro na requisição pública:', error);
      throw error;
    }
  }

  // Fazer requisição para endpoint assinado
  private async makeSignedRequest(
    endpoint: string,
    params: Record<string, any> = {},
    method: 'GET' | 'POST' | 'DELETE' = 'GET'
  ): Promise<any> {
    const timestamp = Date.now();
    const allParams = { ...params, timestamp };
    const queryString = this.createQueryString(allParams);
    const signature = this.generateSignature(queryString);
    
    const finalQueryString = `${queryString}&signature=${signature}`;
    const url = `${this.baseUrl}${endpoint}?${finalQueryString}`;

    const headers = {
      'X-MBX-APIKEY': this.apiKey,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição assinada:', error);
      throw error;
    }
  }

  // ========== ENDPOINTS PÚBLICOS ==========

  // Obter preços atuais de todos os símbolos
  async getAllPrices(): Promise<BinanceSymbolPrice[]> {
    return await this.makePublicRequest('/api/v3/ticker/price');
  }

  // Obter preço de um símbolo específico
  async getPrice(symbol: string): Promise<BinanceSymbolPrice> {
    return await this.makePublicRequest('/api/v3/ticker/price', { symbol });
  }

  // Obter melhores preços de compra e venda para todos os símbolos
  async getAllOrderBookTickers(): Promise<BinanceOrderBookTicker[]> {
    return await this.makePublicRequest('/api/v3/ticker/bookTicker');
  }

  // Obter informações do livro de ofertas para um símbolo
  async getOrderBook(symbol: string, limit: number = 100): Promise<any> {
    return await this.makePublicRequest('/api/v3/depth', { symbol, limit });
  }

  // Obter estatísticas de 24h para um símbolo
  async get24hrStats(symbol: string): Promise<any> {
    return await this.makePublicRequest('/api/v3/ticker/24hr', { symbol });
  }

  // ========== ENDPOINTS PRIVADOS ==========

  // Testar conectividade da API
  async testConnectivity(): Promise<any> {
    return await this.makePublicRequest('/api/v3/ping');
  }

  // Obter informações da conta
  async getAccountInfo(): Promise<BinanceAccountInfo> {
    return await this.makeSignedRequest('/api/v3/account');
  }

  // Obter saldos da conta
  async getBalances(): Promise<Array<{ asset: string; free: string; locked: string }>> {
    const accountInfo = await this.getAccountInfo();
    return accountInfo.balances.filter(balance => 
      parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
    );
  }

  // Criar ordem de compra/venda
  async createOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    type: 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT',
    quantity: string,
    price?: string,
    timeInForce?: 'GTC' | 'IOC' | 'FOK'
  ): Promise<BinanceOrderResponse> {
    const params: Record<string, any> = {
      symbol,
      side,
      type,
      quantity,
    };

    if (type === 'LIMIT' && price && timeInForce) {
      params.price = price;
      params.timeInForce = timeInForce;
    }

    return await this.makeSignedRequest('/api/v3/order', params, 'POST');
  }

  // Obter todas as ordens abertas
  async getOpenOrders(symbol?: string): Promise<any[]> {
    const params = symbol ? { symbol } : {};
    return await this.makeSignedRequest('/api/v3/openOrders', params);
  }

  // Cancelar uma ordem
  async cancelOrder(symbol: string, orderId: number): Promise<any> {
    return await this.makeSignedRequest('/api/v3/order', { symbol, orderId }, 'DELETE');
  }

  // Obter histórico de ordens
  async getOrderHistory(symbol: string, limit: number = 500): Promise<any[]> {
    return await this.makeSignedRequest('/api/v3/allOrders', { symbol, limit });
  }

  // ========== FUNÇÕES DE ARBITRAGEM ==========

  // Encontrar oportunidades de arbitragem
  async findArbitrageOpportunities(minProfitPercentage: number = 1.0): Promise<Array<{
    symbol: string;
    buyPrice: number;
    sellPrice: number;
    profit: number;
    profitPercentage: number;
  }>> {
    try {
      const tickers = await this.getAllOrderBookTickers();
      const opportunities: Array<{
        symbol: string;
        buyPrice: number;
        sellPrice: number;
        profit: number;
        profitPercentage: number;
      }> = [];

      // Simular arbitragem entre pares (exemplo simplificado)
      for (const ticker of tickers) {
        const buyPrice = parseFloat(ticker.bidPrice);
        const sellPrice = parseFloat(ticker.askPrice);
        
        if (buyPrice > 0 && sellPrice > 0) {
          const profit = sellPrice - buyPrice;
          const profitPercentage = (profit / buyPrice) * 100;

          if (profitPercentage >= minProfitPercentage) {
            opportunities.push({
              symbol: ticker.symbol,
              buyPrice,
              sellPrice,
              profit,
              profitPercentage
            });
          }
        }
      }

      return opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
    } catch (error) {
      console.error('Erro ao buscar oportunidades de arbitragem:', error);
      return [];
    }
  }

  // Executar uma arbitragem
  async executeArbitrage(
    symbol: string,
    quantity: string,
    buyPrice: string,
    sellPrice: string
  ): Promise<{
    buyOrder?: BinanceOrderResponse;
    sellOrder?: BinanceOrderResponse;
    error?: string;
  }> {
    try {
      // Criar ordem de compra
      const buyOrder = await this.createOrder(
        symbol,
        'BUY',
        'LIMIT',
        quantity,
        buyPrice,
        'GTC'
      );

      // Se a compra foi bem-sucedida, criar ordem de venda
      if (buyOrder.status === 'FILLED' || buyOrder.status === 'PARTIALLY_FILLED') {
        const sellOrder = await this.createOrder(
          symbol,
          'SELL',
          'LIMIT',
          quantity,
          sellPrice,
          'GTC'
        );

        return { buyOrder, sellOrder };
      } else {
        return { buyOrder, error: 'Ordem de compra não foi executada completamente' };
      }
    } catch (error) {
      console.error('Erro ao executar arbitragem:', error);
      return { error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  // ========== FUNÇÕES DE MONITORAMENTO ==========

  // Verificar status da conexão
  async checkConnection(): Promise<boolean> {
    try {
      await this.testConnectivity();
      return true;
    } catch (error) {
      console.error('Falha na conexão com a Binance:', error);
      return false;
    }
  }

  // Verificar se as credenciais são válidas
  async validateCredentials(): Promise<boolean> {
    try {
      await this.getAccountInfo();
      return true;
    } catch (error) {
      console.error('Credenciais inválidas:', error);
      return false;
    }
  }
}

// Instância singleton do serviço
export const binanceApi = new BinanceApiService();
export default BinanceApiService;
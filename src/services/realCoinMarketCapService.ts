import axios from 'axios';

// Interface para dados da CoinMarketCap
export interface CoinMarketCapData {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
      volume_24h: number;
      market_cap: number;
      last_updated: string;
    };
  };
}

export interface AlphaBotUpdate {
  lastUpdate: number;
  nextUpdate: number;
  trades: AlphaBotTrade[];
  balances: {
    btc: number;
    usdt: number;
    real: number;
  };
  progress: number;
  totalProfitBTC: number;
  totalProfitUSDT: number;
  totalProfitBRL: number;
}

export interface AlphaBotTrade {
  id: string;
  pair: string;
  currentPrice: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  time: string;
  symbol: string;
  name: string;
}

class RealCoinMarketCapService {
  private readonly API_KEY = 'YOUR_COINMARKETCAP_API_KEY'; // Substitua pela sua chave real
  private readonly BASE_URL = 'https://pro-api.coinmarketcap.com/v1';
  private readonly SANDBOX_URL = 'https://sandbox-api.coinmarketcap.com/v1';
  private readonly UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas em ms
  
  private lastUpdateTime: number = 0;
  private cachedData: CoinMarketCapData[] = [];
  private alphaBotData: AlphaBotUpdate | null = null;

  constructor() {
    // Inicializar com dados do localStorage se existirem
    const stored = localStorage.getItem('alphabot_data');
    if (stored) {
      try {
        this.alphaBotData = JSON.parse(stored);
      } catch (e) {
        console.error('Erro ao carregar dados do AlphaBot:', e);
      }
    }
  }

  // Método para buscar dados da CoinMarketCap (usando sandbox para demo)
  async fetchCryptocurrencyData(symbols: string[] = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'DOT', 'LINK', 'MATIC', 'AVAX']): Promise<CoinMarketCapData[]> {
    try {
      // Para demonstração, vamos simular dados realistas
      // Em produção, descomente as linhas abaixo e use sua API key real
      
      /*
      const response = await axios.get(`${this.SANDBOX_URL}/cryptocurrency/quotes/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.API_KEY,
          'Accept': 'application/json'
        },
        params: {
          symbol: symbols.join(','),
          convert: 'USD'
        }
      });
      
      const data = response.data.data;
      this.cachedData = Object.values(data) as CoinMarketCapData[];
      */
      
      // Simulação de dados realistas para demonstração
      this.cachedData = this.generateRealisticData(symbols);
      this.lastUpdateTime = Date.now();
      
      return this.cachedData;
    } catch (error) {
      console.error('Erro ao buscar dados da CoinMarketCap:', error);
      // Retornar dados simulados em caso de erro
      return this.generateRealisticData(symbols);
    }
  }

  // Gerar dados realistas para demonstração
  private generateRealisticData(symbols: string[]): CoinMarketCapData[] {
    const baseData = {
      BTC: { price: 43250, change: 2.34 },
      ETH: { price: 2680, change: 1.87 },
      BNB: { price: 325, change: -0.45 },
      SOL: { price: 98.75, change: 3.21 },
      ADA: { price: 0.452, change: -1.23 },
      XRP: { price: 0.615, change: 0.89 },
      DOT: { price: 7.25, change: 1.45 },
      LINK: { price: 15.60, change: 2.10 },
      MATIC: { price: 0.895, change: -0.67 },
      AVAX: { price: 38.20, change: 1.98 }
    };

    return symbols.map((symbol, index) => {
      const base = baseData[symbol as keyof typeof baseData] || { price: 100, change: 0 };
      const variation = (Math.random() - 0.5) * 0.1; // ±5% de variação
      const currentPrice = base.price * (1 + variation);
      
      return {
        id: index + 1,
        name: this.getFullName(symbol),
        symbol,
        quote: {
          USD: {
            price: currentPrice,
            percent_change_24h: base.change + (Math.random() - 0.5) * 2,
            volume_24h: Math.random() * 1000000000 + 100000000,
            market_cap: currentPrice * (Math.random() * 1000000000 + 100000000),
            last_updated: new Date().toISOString()
          }
        }
      };
    });
  }

  private getFullName(symbol: string): string {
    const names: { [key: string]: string } = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      BNB: 'BNB',
      SOL: 'Solana',
      ADA: 'Cardano',
      XRP: 'XRP',
      DOT: 'Polkadot',
      LINK: 'Chainlink',
      MATIC: 'Polygon',
      AVAX: 'Avalanche'
    };
    return names[symbol] || symbol;
  }

  // Método principal para atualizar o AlphaBot
  async updateAlphaBot(): Promise<AlphaBotUpdate> {
    const now = Date.now();
    
    // Verificar se precisa atualizar (24h)
    if (this.alphaBotData && (now - this.alphaBotData.lastUpdate) < this.UPDATE_INTERVAL) {
      // Atualizar apenas o progresso
      const elapsed = now - this.alphaBotData.lastUpdate;
      const progress = Math.min((elapsed / this.UPDATE_INTERVAL) * 100, 100);
      
      this.alphaBotData.progress = progress;
      this.alphaBotData.nextUpdate = this.alphaBotData.lastUpdate + this.UPDATE_INTERVAL;
      
      // Salvar no localStorage
      localStorage.setItem('alphabot_data', JSON.stringify(this.alphaBotData));
      
      return this.alphaBotData;
    }

    // Buscar novos dados da CoinMarketCap
    const cryptoData = await this.fetchCryptocurrencyData();
    
    // Gerar novas operações de arbitragem baseadas nos dados reais
    const trades = this.generateArbitrageTrades(cryptoData);
    
    // Calcular lucros simulados baseados na variação de preços
    const totalProfitUSDT = trades.reduce((acc, trade) => {
      return acc + (Math.abs(trade.change24h) * trade.currentPrice * 0.01); // Simular lucro baseado na volatilidade
    }, 0);
    
    const btcPrice = cryptoData.find(c => c.symbol === 'BTC')?.quote.USD.price || 43250;
    const brlRate = 5.40; // Taxa USD/BRL (em produção, buscar de uma API de câmbio)
    
    const balances = {
      btc: totalProfitUSDT / btcPrice,
      usdt: totalProfitUSDT,
      real: totalProfitUSDT * brlRate
    };

    // Criar nova atualização
    this.alphaBotData = {
      lastUpdate: now,
      nextUpdate: now + this.UPDATE_INTERVAL,
      trades,
      balances,
      progress: 0,
      totalProfitBTC: totalProfitUSDT / btcPrice,
      totalProfitUSDT: totalProfitUSDT,
      totalProfitBRL: totalProfitUSDT * brlRate
    };

    // Salvar no localStorage
    localStorage.setItem('alphabot_data', JSON.stringify(this.alphaBotData));

    return this.alphaBotData;
  }

  // Gerar operações de arbitragem baseadas em dados reais
  private generateArbitrageTrades(cryptoData: CoinMarketCapData[]): AlphaBotTrade[] {
    return cryptoData.map((crypto, index) => {
      return {
        id: Math.random().toString(36).substring(7),
        pair: `${crypto.symbol}/USDT`,
        currentPrice: crypto.quote.USD.price,
        change24h: crypto.quote.USD.percent_change_24h,
        volume24h: crypto.quote.USD.volume_24h,
        marketCap: crypto.quote.USD.market_cap,
        rank: index + 1,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        symbol: crypto.symbol,
        name: crypto.name
      };
    });
  }

  // Obter dados atuais do AlphaBot
  getCurrentAlphaBotData(): AlphaBotUpdate | null {
    return this.alphaBotData;
  }

  // Forçar atualização manual
  async forceUpdate(): Promise<AlphaBotUpdate> {
    this.alphaBotData = null;
    localStorage.removeItem('alphabot_data');
    return this.updateAlphaBot();
  }

  // Calcular tempo restante para próxima atualização
  getTimeUntilNextUpdate(): { hours: number; minutes: number } {
    if (!this.alphaBotData) {
      return { hours: 24, minutes: 0 };
    }

    const now = Date.now();
    const timeLeft = this.alphaBotData.nextUpdate - now;
    
    if (timeLeft <= 0) {
      return { hours: 0, minutes: 0 };
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  }
}

// Exportar instância singleton
export const realCoinMarketCapService = new RealCoinMarketCapService();
export default realCoinMarketCapService;
const CMC_API_KEY = "0f376f16-1d3f-4a3d-83fb-7b3731b1db3c";
const CMC_BASE_URL = "https://pro-api.coinmarketcap.com/v1";

export interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
      volume_24h: number;
      market_cap: number;
    };
  };
}

export interface ArbitrageOpportunity {
  symbol: string;
  name: string;
  exchange1: string;
  exchange2: string;
  price1: number;
  price2: number;
  profitPercent: number;
  volume: number;
}

export const coinMarketCapService = {
  async getTopCryptos(limit = 50): Promise<CryptoData[]> {
    try {
      const response = await fetch(
        `${CMC_BASE_URL}/cryptocurrency/listings/latest?start=1&limit=${limit}&convert=USD`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': CMC_API_KEY,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      // Return mock data if API fails
      return getMockCryptoData();
    }
  },

  async getArbitrageOpportunities(): Promise<ArbitrageOpportunity[]> {
    try {
      const cryptos = await this.getTopCryptos(20);
      
      // Simulate arbitrage opportunities between exchanges
      const opportunities: ArbitrageOpportunity[] = [];
      
      cryptos.forEach(crypto => {
        const basePrice = crypto.quote.USD.price;
        
        // Simulate price differences between exchanges
        const binancePrice = basePrice * (1 + (Math.random() - 0.5) * 0.02);
        const futuresPrice = basePrice * (1 + (Math.random() - 0.5) * 0.025);
        
        const profitPercent = Math.abs((futuresPrice - binancePrice) / binancePrice * 100);
        
        if (profitPercent > 0.5) { // Only show opportunities > 0.5%
          opportunities.push({
            symbol: crypto.symbol,
            name: crypto.name,
            exchange1: "Binance Spot",
            exchange2: "Binance Futures",
            price1: binancePrice,
            price2: futuresPrice,
            profitPercent,
            volume: crypto.quote.USD.volume_24h,
          });
        }
      });
      
      return opportunities.sort((a, b) => b.profitPercent - a.profitPercent).slice(0, 10);
    } catch (error) {
      console.error('Error fetching arbitrage opportunities:', error);
      return [];
    }
  }
};

function getMockCryptoData(): CryptoData[] {
  return [
    {
      id: 1,
      name: "Bitcoin",
      symbol: "BTC",
      quote: {
        USD: {
          price: 43250.50,
          percent_change_24h: 2.35,
          volume_24h: 25000000000,
          market_cap: 850000000000
        }
      }
    },
    {
      id: 1027,
      name: "Ethereum",
      symbol: "ETH",
      quote: {
        USD: {
          price: 2680.80,
          percent_change_24h: -1.25,
          volume_24h: 18000000000,
          market_cap: 320000000000
        }
      }
    },
    // Add more mock data as needed
  ];
}

export default coinMarketCapService;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DigitoPayWithdrawal } from "@/components/DigitoPayWithdrawal";
import { DigitoPayHistory } from "@/components/DigitoPayHistory";
import { TradingChart } from "@/components/TradingChart";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Smartphone, 
  DollarSign,
  Wallet,
  AlertTriangle,
  Zap,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowDown,
  Eye,
  EyeOff
} from "lucide-react";

// Generate massive order book data with thousands of orders
const generateMassiveOrderBook = (count: number, type: 'buy' | 'sell') => {
  const orders = [];
  const basePrice = 64880.033; // BTC price from image
  const spreadPercent = 0.001; // 0.1% spread
  
  // Popular exchanges/brokers from image
  const exchanges = [
    'Binance', 'Bybit', 'Coinbase', 'Bitget', 'Gemini', 'Cryptomarket',
    'Bittrex', 'KuCoin', 'OKX', 'MEXC', 'Huobi', 'FTX',
    'Bitstamp', 'Kraken', 'Poloniex', 'HitBTC', 'Gate.io', 'Crypto.com'
  ];

  const cryptoPairs = [
    'BTC/USD', 'ETH/USD', 'BNB/USD', 'ADA/USD', 'XRP/USD',
    'SOL/USD', 'DOT/USD', 'DOGE/USD', 'AVAX/USD', 'MATIC/USD'
  ];
  
  for (let i = 0; i < count; i++) {
    const priceOffset = type === 'sell' 
      ? spreadPercent + (i * 0.00005) // Sell orders above market price
      : -spreadPercent - (i * 0.00005); // Buy orders below market price
    
    const price = basePrice * (1 + priceOffset + (Math.random() - 0.5) * 0.002);
    const amount = (Math.random() * 10 + 0.001).toFixed(3);
    const total = (price * parseFloat(amount)).toFixed(0);
    const bid = (price * 0.9999).toFixed(0);
    const exchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    const pair = cryptoPairs[Math.floor(Math.random() * cryptoPairs.length)];
    const orderId = Math.floor(Math.random() * 100000) + 40000;
    
    orders.push({
      id: orderId,
      pair: pair,
      value: `$${price.toFixed(2)}`,
      amount: amount,
      bid: `$${bid}`,
      total: `$${total}`,
      exchange: exchange,
      timestamp: Date.now() + i * 5,
      qty: amount,
      status: Math.random() > 0.4 ? 'EXECUTADA' : Math.random() > 0.6 ? 'EXECUTANDO' : 'PENDENTE'
    });
  }
  
  return orders;
};

const Withdrawal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState("digitopay");
  const [isLoading, setIsLoading] = useState(false);
  const [sellOrders, setSellOrders] = useState(() => generateMassiveOrderBook(8000, 'sell'));
  const [buyOrders, setBuyOrders] = useState(() => generateMassiveOrderBook(8000, 'buy'));
  const [sideBuyOrders, setSideBuyOrders] = useState(() => generateMassiveOrderBook(5000, 'buy'));
  const [userBalance, setUserBalance] = useState(905.58); // Value from image
  const [referralBalance, setReferralBalance] = useState(0);
  const [residualBalance, setResidualBalance] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  // Load withdrawal data
  const loadWithdrawalData = async () => {
    if (!user) return;

    try {
      // Load user balances
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance, referral_balance')
        .eq('user_id', user.id)
        .single();

      if (!profileError && profile) {
        setUserBalance(profile.balance || 0);
        setReferralBalance(profile.referral_balance || 0);
        setResidualBalance(0);
      }

      // Load withdrawal data from DigiToPay
      const { data: withdrawals } = await supabase
        .from('digitopay_transactions')
        .select('amount, amount_brl, status')
        .eq('user_id', user.id)
        .eq('type', 'withdrawal');

      if (withdrawals) {
        const completed = withdrawals.filter(d => d.status === 'completed');
        const pending = withdrawals.filter(d => d.status === 'pending');
        
        setTotalWithdrawals(completed.length);
        setPendingWithdrawals(pending.length);
      }
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
    }
  };

  // Load withdrawal data when user changes
  useEffect(() => {
    loadWithdrawalData();
  }, [user]);

  // Simulate real-time massive order book updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate fresh massive orders - Ultra frequent updates
      setSellOrders(generateMassiveOrderBook(8000, 'sell'));
      setBuyOrders(generateMassiveOrderBook(8000, 'buy'));
      setSideBuyOrders(generateMassiveOrderBook(5000, 'buy'));
    }, 100); // Update every 100ms for extreme activity

    return () => clearInterval(interval);
  }, []);

  const totalBalance = userBalance + referralBalance + residualBalance;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Header similar to Alphabit */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-lg p-2">
                <ArrowDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Sistema de Saque</h1>
                <p className="text-sm text-slate-300">• Sistema Ativo • Pronto para operações</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">${totalBalance.toFixed(2)}</div>
                <div className="text-sm text-slate-300">Saldo Disponível</div>
              </div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Left Panel - Saldo + Live Sell Orders */}
          <div className="w-1/4 bg-slate-800/50 border-r border-slate-700 h-screen overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Saldo Section */}
              <div className="space-y-3">
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-semibold text-blue-400">Saldo Disponível</span>
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-1">${totalBalance.toFixed(2)}</div>
                  <div className="text-xs text-slate-400 mb-3">{totalWithdrawals} saques • {pendingWithdrawals} pendentes</div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                    <div className="text-xs text-green-400 font-medium">
                      ✅ Saldo disponível para saque
                    </div>
                    <div className="text-xs text-slate-400">Pronto para operações</div>
                  </div>
                </div>
              </div>

              {/* MASSIVE Sell Orders Box */}
              <div className="bg-slate-800 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-semibold text-white">Live Sell Orders</span>
                  <div className="bg-red-500/20 px-2 py-1 rounded text-xs text-red-400">LIVE</div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse ml-auto"></div>
                </div>
                
                <div className="text-xs text-slate-400 mb-3">
                  <div className="grid grid-cols-4 gap-1 text-xs text-slate-400 border-b border-slate-600 pb-1 mb-2">
                    <div>EXCHANGE</div>
                    <div>PREÇO</div>
                    <div>QTD</div>
                    <div>TOTAL</div>
                  </div>
                  
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {sellOrders.slice(0, 150).map((order, index) => (
                      <div 
                        key={`sell-${order.id}-${index}`}
                        className="grid grid-cols-4 gap-1 text-xs p-1 bg-slate-700/30 rounded border-l-2 border-red-500/50 hover:bg-red-900/20 transition-colors"
                      >
                        <div className="text-yellow-400 font-medium truncate">
                          {order.exchange}
                        </div>
                        <div className="text-red-400 font-medium">
                          ${order.value.replace('$', '').slice(0, 7)}
                        </div>
                        <div className="text-white text-xs">
                          {order.qty}
                        </div>
                        <div className="text-slate-400 text-xs">
                          ${order.total.replace('$', '').slice(0, 6)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - BTC Chart + Withdrawal Interface */}
          <div className="flex-1 w-1/2 p-6">
            <div className="space-y-6">
              {/* BTC/USD Price Display */}
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500 rounded-lg p-2">
                      <span className="text-white font-bold text-sm">₿</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">BTC/USD</h3>
                      <p className="text-sm text-slate-300">Bitcoin Price</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-400">LIVE</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl font-bold text-white">$64,880.033</div>
                  <div className="text-emerald-400 text-sm font-medium">↗ +0.00%</div>
                </div>
                
                <div className="h-80">
                  <TradingChart />
                </div>
              </div>

              {/* Sistema de Saque */}
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader className="border-b border-slate-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                        <ArrowDown className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-white">Sistema de Saque</CardTitle>
                        <p className="text-sm text-slate-300">Escolha o tipo de saque desejado</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-blue-400 text-sm font-medium">SISTEMA ATIVO</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 px-3 py-2 rounded-full text-sm">
                      <Activity className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-medium">3 Tipos de Saque • Limite: 1 por dia</span>
                    </div>
                  </div>

                  {user ? (
                    <DigitoPayWithdrawal 
                      userBalance={userBalance}
                      referralBalance={referralBalance}
                      onSuccess={() => {
                        toast({
                          title: "✅ SAQUE ENVIADO!",
                          description: "Seu saque foi processado com sucesso",
                        });
                        loadWithdrawalData();
                      }} 
                    />
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl inline-block">
                        <AlertTriangle className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <p className="text-blue-400 text-lg font-medium">Autenticação Necessária</p>
                        <p className="text-slate-400 mt-2">Faça login para acessar o sistema de saques</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Right Panel - Live Buy Orders */}
          <div className="w-1/4 bg-slate-800/50 border-l border-slate-700 h-screen overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* MASSIVE Buy Orders Box */}
              <div className="bg-slate-800 border border-emerald-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">Live Buy Orders</span>
                  <div className="bg-emerald-500/20 px-2 py-1 rounded text-xs text-emerald-400">LIVE</div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse ml-auto"></div>
                </div>
                
                <div className="text-xs text-slate-400 mb-3">
                  <div className="grid grid-cols-4 gap-1 text-xs text-slate-400 border-b border-slate-600 pb-1 mb-2">
                    <div>EXCHANGE</div>
                    <div>PREÇO</div>
                    <div>QTD</div>
                    <div>TOTAL</div>
                  </div>
                  
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {buyOrders.slice(0, 150).map((order, index) => (
                      <div 
                        key={`buy-${order.id}-${index}`}
                        className="grid grid-cols-4 gap-1 text-xs p-1 bg-slate-700/30 rounded border-l-2 border-emerald-500/50 hover:bg-emerald-900/20 transition-colors"
                      >
                        <div className="text-yellow-400 font-medium truncate">
                          {order.exchange}
                        </div>
                        <div className="text-emerald-400 font-medium">
                          ${order.value.replace('$', '').slice(0, 7)}
                        </div>
                        <div className="text-white text-xs">
                          {order.qty}
                        </div>
                        <div className="text-slate-400 text-xs">
                          ${order.total.replace('$', '').slice(0, 6)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Market Activity */}
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">Atividade do Mercado</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Volume 24h:</span>
                    <span className="text-emerald-400 font-semibold">$2.8B</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Variação:</span>
                    <span className="text-emerald-400 font-semibold">+0.00%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Exchanges Ativas:</span>
                    <span className="text-white font-semibold">18</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Withdrawal;
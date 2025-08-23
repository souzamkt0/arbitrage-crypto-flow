import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DigitoPayDeposit } from "@/components/DigitoPayDeposit";
import { TradingChart } from "@/components/TradingChart";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
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
  Activity
} from "lucide-react";

// Simulated market data generator
const generateMarketData = () => {
  const base = Math.random() * 100 + 50;
  return {
    value: base.toFixed(4),
    amount: (Math.random() * 5).toFixed(4),
    bid: (base * 0.8).toFixed(2),
    total: (base * Math.random() * 0.2).toFixed(2)
  };
};

const Deposit = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("digitopay");
  const [isLoading, setIsLoading] = useState(false);
  const [sellOrders, setSellOrders] = useState(() => Array(8).fill(null).map(() => generateMarketData()));
  const [buyOrders, setBuyOrders] = useState(() => Array(8).fill(null).map(() => generateMarketData()));

  // Update orders every 2 seconds to simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setSellOrders(prev => prev.map(() => generateMarketData()));
      setBuyOrders(prev => prev.map(() => generateMarketData()));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // BNB Form State
  const [bnbForm, setBnbForm] = useState({
    amount: "",
    senderName: ""
  });

  const handleBnbSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bnbForm.amount || !bnbForm.senderName) {
      toast({
        title: "Campos obrigatórios", 
        description: "Preencha todos os campos para o depósito USDT BNB20",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      toast({
        title: "Informações enviadas!",
        description: "Envie o USDT para o endereço fornecido. O depósito será processado em até 15 minutos.",
      });
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <ErrorBoundary>
      <div className="h-screen bg-[#0a0e1a] text-white flex flex-col overflow-hidden">
        {/* Header Navigation */}
        <header className="bg-[#151b2b] border-b border-gray-800 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-xl font-bold text-cyan-400">finrax</div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Bell className="h-4 w-4" />
              </Button>
              <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2">
                Wallet
              </Button>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Portfolio */}
          <div className="w-72 bg-[#151b2b] border-r border-gray-800 p-3 space-y-3 overflow-y-auto flex-shrink-0">
            {/* Portfolio Header */}
            <div className="border-b border-gray-800 pb-3">
              <h2 className="text-base font-semibold mb-2">Watchlist</h2>
              <div className="text-xl font-bold text-green-400">$56,450.10</div>
              <div className="text-xs text-gray-400">175° USD EUR</div>
            </div>

            {/* Portfolio Tabs */}
            <div className="flex gap-2">
              <button className="px-2 py-1 bg-[#1f2937] text-white rounded text-xs">BASIC</button>
              <button className="px-2 py-1 text-gray-400 hover:text-white text-xs">GRAPH</button>
            </div>

            {/* Search */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-[#1f2937] border border-gray-700 rounded px-2 py-1 text-xs"
              />
            </div>

            {/* Favorites */}
            <div>
              <h3 className="text-xs font-semibold mb-2">Favourite</h3>
              <div className="space-y-1">
                {['BCH', 'EUR', 'USD', 'BTC'].map((currency) => (
                  <div key={currency} className="text-xs text-gray-400 hover:text-white cursor-pointer">
                    {currency}
                  </div>
                ))}
              </div>
            </div>

            {/* Assets List */}
            <div className="space-y-1 text-xs">
              {[
                { pair: 'BTC-DASH', price: '1245.54€2643', change: '+5.024%' },
                { pair: 'ETH-DASH', price: '1845.32€1234', change: '+3.122%' },
                { pair: 'XRP-DASH', price: '0.54€567', change: '-2.845%' },
                { pair: 'ADA-DASH', price: '0.89€234', change: '+1.456%' },
                { pair: 'DOT-DASH', price: '7.23€891', change: '+4.567%' },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center py-1 hover:bg-[#1f2937] px-2 rounded transition-colors">
                  <span className="text-white">{item.pair}</span>
                  <div className="text-right">
                    <div className="text-white">{item.price}</div>
                    <div className={`text-xs ${item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {item.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* XRP/CBN Chart */}
            <div className="mt-4">
              <div className="text-xs font-semibold mb-1">USD/BTC</div>
              <div className="text-red-400 text-xs">-6.01%</div>
              <div className="h-16 bg-[#1f2937] rounded mt-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Center - Main Chart Area */}
          <div className="flex-1 bg-[#0a0e1a] p-4 space-y-4 overflow-y-auto">
            {/* Deposit Interface - Moved to top */}
            <Card className="bg-[#151b2b] border border-gray-800">
              <CardHeader className="border-b border-gray-800 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                      <Wallet className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-white">Deposit Terminal</CardTitle>
                      <p className="text-xs text-gray-400">Sistema ativo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">ONLINE</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-[#1f2937] border border-gray-700 p-1">
                    <TabsTrigger 
                      value="digitopay" 
                      className="flex items-center justify-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white py-2"
                    >
                      <Smartphone className="h-3 w-3" />
                      <span className="font-medium text-xs">PIX Instant</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="usdt" 
                      className="flex items-center justify-center space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white py-2"
                    >
                      <CreditCard className="h-3 w-3" />
                      <span className="font-medium text-xs">USDT Crypto</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="digitopay" className="space-y-4">
                    {user ? (
                      <DigitoPayDeposit onSuccess={() => {
                        toast({
                          title: "🎉 PARABÉNS!",
                          description: "Depósito processado com sucesso",
                        });
                      }} />
                    ) : (
                      <div className="text-center py-8">
                        <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl inline-block mx-auto">
                          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                          <p className="text-red-400 text-sm font-medium">Authentication Required</p>
                          <p className="text-gray-400 mt-1 text-xs">Please login to access deposits</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="usdt" className="space-y-4">
                    <form onSubmit={handleBnbSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="usdt-amount" className="text-purple-400 font-medium text-xs">Amount (USDT)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-3 w-3 text-purple-400" />
                            <Input
                              id="usdt-amount"
                              type="number"
                              placeholder="100.00"
                              className="pl-9 bg-[#1f2937] border-gray-700 text-white h-9 focus:border-purple-500 text-xs"
                              min="10"
                              step="0.01"
                              value={bnbForm.amount}
                              onChange={(e) => setBnbForm({...bnbForm, amount: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sender-name" className="text-purple-400 font-medium text-xs">Sender Name</Label>
                          <Input
                            id="sender-name"
                            type="text"
                            placeholder="Full name"
                            className="bg-[#1f2937] border-gray-700 text-white h-9 focus:border-purple-500 text-xs"
                            value={bnbForm.senderName}
                            onChange={(e) => setBnbForm({...bnbForm, senderName: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold h-9 text-xs"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <>
                            <Zap className="h-3 w-3 mr-2" />
                            CONFIRM CRYPTO DEPOSIT
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Chart Header */}
            <div className="bg-[#151b2b] rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-[#3b82f6] text-white rounded text-xs">XRP</button>
                  <button className="px-2 py-1 bg-[#1f2937] text-gray-300 rounded text-xs">BTC</button>
                  <button className="px-2 py-1 bg-[#1f2937] text-gray-300 rounded text-xs">USD</button>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">0.913</div>
                  <div className="text-xs text-gray-400">24h change: <span className="text-green-400">+6.01%</span></div>
                </div>
              </div>
              
              {/* Market Stats */}
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-gray-400">24h Low</div>
                  <div className="text-white">0.753%</div>
                </div>
                <div>
                  <div className="text-gray-400">Volume</div>
                  <div className="text-white">1.1453 BTC.00</div>
                </div>
                <div>
                  <div className="text-gray-400">Market Cap</div>
                  <div className="text-white">144.89</div>
                </div>
                <div>
                  <div className="text-gray-400">Last price</div>
                  <div className="text-white">144.89</div>
                </div>
              </div>
            </div>

            {/* Orders Section - Above Chart */}
            <div className="grid grid-cols-2 gap-4">
              {/* Sell Orders */}
              <div className="bg-[#151b2b] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <h3 className="text-sm font-semibold text-white">Sell Orders</h3>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto"></div>
                </div>
                <div className="space-y-1">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 border-b border-gray-700 pb-1">
                    <div>VALUE</div>
                    <div>AMOUNT</div>
                    <div>BID</div>
                    <div>TOTAL</div>
                  </div>
                  {sellOrders.map((order, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 text-xs text-white py-0.5 hover:bg-[#1f2937] rounded transition-all duration-300 animate-fade-in">
                      <div className="transition-all duration-500">{order.value}</div>
                      <div className="text-red-400 transition-all duration-500">{order.amount}</div>
                      <div className="transition-all duration-500">{order.bid}</div>
                      <div className="transition-all duration-500">{order.total}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buy Orders */}
              <div className="bg-[#151b2b] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-white">Buy Orders</h3>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>
                </div>
                <div className="space-y-1">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 border-b border-gray-700 pb-1">
                    <div>VALUE</div>
                    <div>AMOUNT</div>
                    <div>BID</div>
                    <div>TOTAL</div>
                  </div>
                  {buyOrders.map((order, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 text-xs text-white py-0.5 hover:bg-[#1f2937] rounded transition-all duration-300 animate-fade-in">
                      <div className="transition-all duration-500">{order.value}</div>
                      <div className="text-green-400 transition-all duration-500">{order.amount}</div>
                      <div className="transition-all duration-500">{order.bid}</div>
                      <div className="transition-all duration-500">{order.total}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Chart */}
            <div className="bg-[#151b2b] rounded-lg p-3 flex-1 min-h-0">
              <TradingChart />
            </div>
          </div>

          {/* Right Sidebar - Trading Panel */}
          <div className="w-72 bg-[#151b2b] border-l border-gray-800 p-3 space-y-3 overflow-y-auto flex-shrink-0">
            {/* Trading Panel Header */}
            <div className="border-b border-gray-800 pb-3">
              <div className="flex gap-2 mb-3">
                <button className="px-2 py-1 bg-[#3b82f6] text-white rounded text-xs">BUY ETH</button>
                <button className="px-2 py-1 bg-[#1f2937] text-gray-300 rounded text-xs">SELL ETH</button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-400 mb-1">PRICE</div>
                  <div className="text-base font-bold text-white">0.04524300</div>
                  <div className="text-xs text-gray-400">≈ 1,779.94 USD</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 mb-1">AMOUNT</div>
                  <input 
                    type="text" 
                    placeholder="0" 
                    className="w-full bg-[#1f2937] border border-gray-700 rounded px-2 py-1 text-white text-xs"
                  />
                  <div className="text-xs text-gray-400 mt-1">ETH</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400">TOTAL = 0.00000000</div>
                </div>
                
                <Button className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-2 text-xs">
                  Place buy order
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
              </div>
              <div className="space-y-2">
                {[
                  { amount: '1265.00 XRP', time: 'Today, 9:30PM', type: 'buy' },
                  { amount: '100 USD to 56.54 XRP', time: 'Today, 9:30PM', type: 'convert' },
                  { amount: '0.50043 BTC', time: 'Yesterday, 11:51PM', type: 'sell' },
                  { amount: '45.6 USD', time: 'Yesterday, 11:12PM', type: 'withdraw' },
                  { amount: '1265.00 XRP', time: 'Yesterday, 23:52PM', type: 'buy' },
                  { amount: '1265.00 XRP to 0.0051 BTC', time: 'Yesterday, 23:52PM', type: 'convert' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 hover:bg-[#1f2937] rounded transition-colors">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'buy' ? 'bg-green-400' : 
                      activity.type === 'sell' ? 'bg-red-400' : 
                      'bg-blue-400'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-xs text-white">{activity.amount}</div>
                      <div className="text-xs text-gray-400">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Deposit;
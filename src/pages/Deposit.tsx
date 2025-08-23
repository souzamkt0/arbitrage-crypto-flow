import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Clock,
  AlertTriangle,
  Zap,
  Bell
} from "lucide-react";

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("digitopay");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isActivated, setIsActivated] = useState(false);

  // Auto-activation countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsActivated(true);
          clearInterval(timer);
          toast({
            title: "✅ Sistema Ativado!",
            description: "Depósitos foram ativados automaticamente",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [toast]);

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

    // Simular processamento
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
      <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col">
        {/* Header Navigation */}
        <header className="bg-[#151b2b] border-b border-gray-800 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-xl font-bold text-cyan-400">finrax</div>
              <nav className="hidden md:flex gap-6 text-sm text-gray-400">
                <button className="hover:text-white transition-colors">Dashboard</button>
                <button className="text-cyan-400">Exchange</button>
                <button className="hover:text-white transition-colors">Analytics</button>
                <button className="hover:text-white transition-colors">Convert</button>
                <button className="hover:text-white transition-colors">NFT Helpdesk</button>
              </nav>
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
          <div className="w-80 bg-[#151b2b] border-r border-gray-800 p-4 space-y-4 overflow-y-auto flex-shrink-0">
            {/* Portfolio Header */}
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-lg font-semibold mb-2">Watchlist</h2>
              <div className="text-2xl font-bold text-green-400">$56,450.10</div>
              <div className="text-sm text-gray-400">175° USD EUR</div>
            </div>

            {/* Portfolio Tabs */}
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-[#1f2937] text-white rounded text-sm">BASIC</button>
              <button className="px-3 py-1 text-gray-400 hover:text-white text-sm">GRAPH</button>
            </div>

            {/* Search */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-[#1f2937] border border-gray-700 rounded px-3 py-2 text-sm"
              />
            </div>

            {/* Favorites */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Favourite</h3>
              <div className="space-y-2">
                {['BCH', 'EUR', 'USD', 'BTC'].map((currency) => (
                  <div key={currency} className="text-sm text-gray-400 hover:text-white cursor-pointer">
                    {currency}
                  </div>
                ))}
              </div>
            </div>

            {/* Assets List */}
            <div className="space-y-2 text-sm">
              {[
                { pair: 'BTC-DASH', price: '1245.54€2643', change: '+5.024%' },
                { pair: 'BTC-DASH', price: '1245.54€2643', change: '+5.024%' },
                { pair: 'BTC-DASH', price: '1245.54€2643', change: '+5.024%' },
                { pair: 'BTC-DASH', price: '1245.54€2643', change: '+5.024%' },
                { pair: 'BTC-DASH', price: '1245.54€2643', change: '+5.024%' },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center py-1 hover:bg-[#1f2937] px-2 rounded">
                  <span className="text-white">{item.pair}</span>
                  <div className="text-right">
                    <div className="text-white">{item.price}</div>
                    <div className="text-green-400 text-xs">{item.change}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* XRP/CBN Chart */}
            <div className="mt-6">
              <div className="text-sm font-semibold mb-2">XRP/CBN</div>
              <div className="text-red-400 text-sm">-6.01%</div>
              <div className="h-20 bg-[#1f2937] rounded mt-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Center - Main Chart Area */}
          <div className="flex-1 bg-[#0a0e1a] p-6 space-y-6 overflow-y-auto">
            {/* Chart Header */}
            <div className="bg-[#151b2b] rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-4">
                  <button className="px-3 py-1 bg-[#3b82f6] text-white rounded text-sm">XRP</button>
                  <button className="px-3 py-1 bg-[#1f2937] text-gray-300 rounded text-sm">BTC</button>
                  <button className="px-3 py-1 bg-[#1f2937] text-gray-300 rounded text-sm">USD</button>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">0.913</div>
                  <div className="text-sm text-gray-400">24h change: <span className="text-green-400">+6.01%</span></div>
                </div>
              </div>
              
              {/* Market Stats */}
              <div className="grid grid-cols-4 gap-4 text-sm">
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

            {/* Main Chart */}
            <div className="bg-[#151b2b] rounded-lg p-4" style={{ height: '400px' }}>
              <TradingChart />
            </div>

            {/* Deposit Interface */}
            {!isActivated && (
              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-orange-500/30">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Sistema Iniciando</h3>
                      <p className="text-gray-400">Ativação automática em...</p>
                    </div>
                  </div>
                  
                  <div className="text-6xl font-bold text-orange-400 mb-4">
                    {countdown}
                  </div>
                  
                  <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {isActivated && (
              <Card className="bg-[#151b2b] border border-gray-800">
                <CardHeader className="border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-white">
                          Deposit Terminal
                        </CardTitle>
                        <p className="text-sm text-gray-400">Sistema ativo</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs font-medium">ONLINE</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#1f2937] border border-gray-700 p-1">
                      <TabsTrigger 
                        value="digitopay" 
                        className="flex items-center justify-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white py-3"
                      >
                        <Smartphone className="h-4 w-4" />
                        <span className="font-medium">PIX Instant</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="usdt" 
                        className="flex items-center justify-center space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white py-3"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span className="font-medium">USDT Crypto</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="digitopay" className="space-y-6">
                      {user ? (
                        <DigitoPayDeposit onSuccess={() => {
                          toast({
                            title: "🎉 PARABÉNS!",
                            description: "Depósito processado com sucesso",
                          });
                        }} />
                      ) : (
                        <div className="text-center py-12">
                          <div className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl inline-block mx-auto">
                            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                            <p className="text-red-400 text-lg font-medium">Authentication Required</p>
                            <p className="text-gray-400 mt-2">Please login to access deposits</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="usdt" className="space-y-6">
                      <form onSubmit={handleBnbSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="usdt-amount" className="text-purple-400 font-medium">Amount (USDT)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-4 top-4 h-4 w-4 text-purple-400" />
                              <Input
                                id="usdt-amount"
                                type="number"
                                placeholder="100.00"
                                className="pl-12 bg-[#1f2937] border-gray-700 text-white h-12 focus:border-purple-500"
                                min="10"
                                step="0.01"
                                value={bnbForm.amount}
                                onChange={(e) => setBnbForm({...bnbForm, amount: e.target.value})}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="sender-name" className="text-purple-400 font-medium">Sender Name</Label>
                            <Input
                              id="sender-name"
                              type="text"
                              placeholder="Full name"
                              className="bg-[#1f2937] border-gray-700 text-white h-12 focus:border-purple-500"
                              value={bnbForm.senderName}
                              onChange={(e) => setBnbForm({...bnbForm, senderName: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold h-12"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Processing...</span>
                            </div>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              CONFIRM CRYPTO DEPOSIT
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Orders Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sell Orders */}
              <div className="bg-[#151b2b] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Sell Orders</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 border-b border-gray-700 pb-2">
                    <div>VALUE</div>
                    <div>AMOUNT</div>
                    <div>BID</div>
                    <div>VALUE</div>
                  </div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 text-xs text-white py-1">
                      <div>65.6642</div>
                      <div className="text-red-400">0.8775</div>
                      <div>51.50</div>
                      <div>13.32</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buy Orders */}
              <div className="bg-[#151b2b] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Buy Orders</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 border-b border-gray-700 pb-2">
                    <div>VALUE</div>
                    <div>AMOUNT</div>
                    <div>BID</div>
                    <div>VALUE</div>
                  </div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 text-xs text-white py-1">
                      <div>65.6642</div>
                      <div className="text-green-400">0.8775</div>
                      <div>51.50</div>
                      <div>13.32</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Trading Panel */}
          <div className="w-80 bg-[#151b2b] border-l border-gray-800 p-4 space-y-4 overflow-y-auto flex-shrink-0">
            {/* Trading Panel Header */}
            <div className="border-b border-gray-800 pb-4">
              <div className="flex gap-2 mb-4">
                <button className="px-3 py-1 bg-[#3b82f6] text-white rounded text-sm">BUY ETH</button>
                <button className="px-3 py-1 bg-[#1f2937] text-gray-300 rounded text-sm">SELL ETH</button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400 mb-1">PRICE</div>
                  <div className="text-lg font-bold text-white">0.04524300</div>
                  <div className="text-xs text-gray-400">≈ 1,779.94 USD</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-1">AMOUNT</div>
                  <input 
                    type="text" 
                    placeholder="0" 
                    className="w-full bg-[#1f2937] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  />
                  <div className="text-xs text-gray-400 mt-1">ETH</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">TOTAL = 0.00000000</div>
                </div>
                
                <Button className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3">
                  Place buy order
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { amount: '1265.00 XRP', time: 'Today, 9:30PM', type: 'buy' },
                  { amount: '100 USD to 56.54 XRP', time: 'Today, 9:30PM', type: 'convert' },
                  { amount: '0.50043 BTC', time: 'Yesterday, 11:51PM', type: 'sell' },
                  { amount: '45.6 USD', time: 'Yesterday, 11:12PM', type: 'withdraw' },
                  { amount: '1265.00 XRP', time: 'Yesterday, 23:52PM', type: 'buy' },
                  { amount: '1265.00 XRP to 0.0051 BTC', time: 'Yesterday, 23:52PM', type: 'convert' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 hover:bg-[#1f2937] rounded">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'buy' ? 'bg-green-400' : 
                      activity.type === 'sell' ? 'bg-red-400' : 
                      'bg-blue-400'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{activity.amount}</div>
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
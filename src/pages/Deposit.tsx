import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DigitoPayDeposit } from "@/components/DigitoPayDeposit";
import { DigitoPayHistory } from "@/components/DigitoPayHistory";

import { TradingChart } from "@/components/TradingChart";
import { MarketOverview } from "@/components/MarketOverview";
import { DepositStats } from "@/components/DepositStats";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Copy, 
  DollarSign,
  Wallet,
  History,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  Activity,
  Users,
  BarChart3,
  PieChart,
  Monitor,
  Settings,
  Bell
} from "lucide-react";

const Deposit = () => {
  console.log('🚀 Deposit component loading...');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  console.log('👤 User:', user);
  console.log('📋 Profile:', profile);
  const [activeTab, setActiveTab] = useState("digitopay");
  const [isLoading, setIsLoading] = useState(false);
  const [bnbAddress] = useState("0x742d35Cc6634C0532925a3b8D39C1234567890AB");
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
      
      // Salvar dados do depósito
      const depositData = {
        type: "USDT_BNB20",
        amount: bnbForm.amount,
        senderName: bnbForm.senderName,
        address: bnbAddress,
        timestamp: new Date().toISOString(),
        status: "pending"
      };
      
      const deposits = JSON.parse(localStorage.getItem("alphabit_deposits") || "[]");
      deposits.push(depositData);
      localStorage.setItem("alphabit_deposits", JSON.stringify(deposits));
      
      setIsLoading(false);
    }, 1500);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência`,
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0a0e1a] text-white">
        {/* Header Navigation */}
        <header className="bg-[#151b2b] border-b border-gray-800 px-6 py-4">
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
        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Sidebar - Portfolio */}
          <div className="w-80 bg-[#151b2b] border-r border-gray-800 p-4 space-y-4">
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
          <div className="flex-1 bg-[#0a0e1a] p-6 space-y-6">
              {/* Main Deposit Interface - Responsive */}
              {!isActivated && (
                <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-orange-500/30">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Sistema Iniciando</h3>
                        <p className="text-sm sm:text-base text-gray-400">Ativação automática em...</p>
                      </div>
                    </div>
                    
                    <div className="text-4xl sm:text-6xl font-bold text-orange-400 mb-4">
                      {countdown}
                    </div>
                    
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                      />
                    </div>
                    
                    <p className="text-sm sm:text-base text-gray-400">
                      O sistema será ativado automaticamente. Aguarde...
                    </p>
                  </CardContent>
                </Card>
              )}
              {isActivated && (
                <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-green-500/20">
                  <CardHeader className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-b border-green-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                          <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-white">
                            Deposit Terminal - ATIVADO
                          </CardTitle>
                          <p className="text-sm text-gray-400">Sistema funcionando perfeitamente</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-xs font-medium">
                          ONLINE
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                <CardContent className="p-4 sm:p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-slate-800/50 border border-slate-600/30 p-1">
                      <TabsTrigger 
                        value="digitopay" 
                        className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white py-2 sm:py-3"
                      >
                        <Smartphone className="h-4 w-4" />
                        <span className="font-medium text-xs sm:text-sm">PIX Instant</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="usdt" 
                        className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white py-2 sm:py-3"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span className="font-medium text-xs sm:text-sm">USDT Crypto</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* PIX Deposit Tab - Responsive */}
                    <TabsContent value="digitopay" className="space-y-4 sm:space-y-6">
                      {user ? (
                        <>
                          <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-3 sm:p-4 mb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                              <div>
                                <p className="text-green-400 font-medium text-sm sm:text-base">Sistema Operacional</p>
                                <p className="text-xs sm:text-sm text-gray-400">Processamento instantâneo ativo</p>
                              </div>
                            </div>
                          </div>
                          
                          
                          <DigitoPayDeposit onSuccess={() => {
                            toast({
                              title: "🎉 PARABÉNS!",
                              description: "Depósito processado com sucesso",
                            });
                          }} />
                        </>
                      ) : (
                        <div className="text-center py-8 sm:py-12">
                          <div className="p-4 sm:p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl inline-block mx-auto max-w-sm">
                            <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-red-400 mx-auto mb-3 sm:mb-4" />
                            <p className="text-red-400 text-base sm:text-lg font-medium">Authentication Required</p>
                            <p className="text-gray-400 mt-2 text-sm sm:text-base">Please login to access the trading deposit system</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* USDT Deposit Tab - Responsive */}
                    <TabsContent value="usdt" className="space-y-4 sm:space-y-6">
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-purple-500/20 border border-purple-500/30 px-3 sm:px-4 py-2 rounded-full">
                          <Clock className="h-4 w-4 text-purple-400" />
                          <span className="text-purple-400 font-medium text-xs sm:text-sm">USDT BNB20 • 10-15 min confirmation</span>
                        </div>
                      </div>

                      <form onSubmit={handleBnbSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="usdt-amount" className="text-purple-400 font-medium text-sm sm:text-base">Amount (USDT)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 text-purple-400" />
                              <Input
                                id="usdt-amount"
                                type="number"
                                placeholder="100.00"
                                className="pl-10 sm:pl-12 bg-slate-800/60 border-purple-500/30 text-white h-10 sm:h-12 focus:border-purple-500 text-sm sm:text-base"
                                min="10"
                                step="0.01"
                                value={bnbForm.amount}
                                onChange={(e) => setBnbForm({...bnbForm, amount: e.target.value})}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="sender-name" className="text-purple-400 font-medium text-sm sm:text-base">Sender Name</Label>
                            <Input
                              id="sender-name"
                              type="text"
                              placeholder="Full name"
                              className="bg-slate-800/60 border-purple-500/30 text-white h-10 sm:h-12 focus:border-purple-500 text-sm sm:text-base"
                              value={bnbForm.senderName}
                              onChange={(e) => setBnbForm({...bnbForm, senderName: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-purple-400 font-medium text-sm sm:text-base">Wallet Address (BNB20)</Label>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <Input
                              value={bnbAddress}
                              readOnly
                              className="font-mono text-xs sm:text-sm bg-slate-800/60 border-purple-500/30 text-purple-400 flex-1"
                            />
                            <Button
                              type="button"
                              onClick={() => copyToClipboard(bnbAddress, "Address")}
                              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 sm:px-4 whitespace-nowrap"
                            >
                              <Copy className="h-4 w-4 mr-1 sm:mr-0" />
                              <span className="sm:hidden">Copy Address</span>
                            </Button>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-3 sm:p-4">
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-purple-400 mb-2 text-sm sm:text-base">Important Notes:</h4>
                              <ul className="text-gray-300 space-y-1 text-xs sm:text-sm">
                                <li>• Send only USDT on BNB Smart Chain (BEP20)</li>
                                <li>• Minimum: 10 USDT | Processing: 10-15 minutes</li>
                                <li>• Double-check network before sending</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold h-10 sm:h-12 text-sm sm:text-base"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span className="text-sm sm:text-base">Processing...</span>
                            </div>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">CONFIRM CRYPTO DEPOSIT</span>
                              <span className="sm:hidden">CONFIRM DEPOSIT</span>
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                </Card>
              )}

              {/* Trading Chart */}
              <TradingChart />

            {/* Chart Header */}
            <div className="bg-[#151b2b] rounded-lg p-4 mb-4">
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
            <div className="bg-[#151b2b] rounded-lg p-4 mb-6" style={{ height: '400px' }}>
              <TradingChart />
            </div>

            {/* Deposit Interface */}
            {!isActivated && (
              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-orange-500/30 mb-6">
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
              <Card className="bg-[#151b2b] border border-gray-800 mb-6">
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
          <div className="w-80 bg-[#151b2b] border-l border-gray-800 p-4 space-y-4">
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
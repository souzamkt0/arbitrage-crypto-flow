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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
        {/* Trading Header */}
        <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-blue-500/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="hover:bg-blue-500/10 text-blue-400 border border-blue-500/20 p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">TRADING DEPOSIT</h1>
                    <p className="text-xs text-gray-400">Advanced deposit terminal</p>
                  </div>
                </div>
              </div>

              {/* Center Section - Status */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">SYSTEM ONLINE</span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">REAL-TIME</span>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Main Trading Layout - Responsive */}
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6 min-h-screen">
            {/* Left Sidebar - Market Data - Hidden on mobile by default, can be toggled */}
            <div className="hidden lg:block lg:col-span-1 space-y-4 sm:space-y-6">
              <MarketOverview />
            </div>

            {/* Main Content Area - Full width on mobile */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 w-full">
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

              {/* Transaction History */}
              {user && (
                <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-green-500/20">
                  <CardHeader className="border-b border-green-500/20">
                    <div className="flex items-center gap-3">
                      <History className="h-5 w-5 text-green-400" />
                      <CardTitle className="text-lg font-bold text-white">Transaction History</CardTitle>
                      <div className="ml-auto px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-xs font-medium">
                        REAL-TIME
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="max-h-96 overflow-y-auto">
                      <DigitoPayHistory />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Sidebar - Show only on large screens */}
            <div className="hidden lg:block lg:col-span-1 space-y-4 sm:space-y-6">
              <DepositStats />
              
              {/* Security Info - Mobile optimized */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-blue-500/20">
                <CardHeader className="bg-gradient-to-r from-blue-600/10 to-green-600/10 border-b border-blue-500/20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <CardTitle className="text-base sm:text-lg font-bold text-white">Security Features</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="text-green-400 font-medium text-xs sm:text-sm">Real-time Processing</h4>
                        <p className="text-gray-400 text-xs">Instant verification and confirmation</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="text-blue-400 font-medium text-xs sm:text-sm">Bank-grade Security</h4>
                        <p className="text-gray-400 text-xs">256-bit SSL encryption</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="text-purple-400 font-medium text-xs sm:text-sm">24/7 Monitoring</h4>
                        <p className="text-gray-400 text-xs">Advanced fraud detection</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Market Overview - Show on mobile only */}
          <div className="lg:hidden">
            <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-purple-500/20">
              <CardHeader className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base font-bold text-white">Market Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <MarketOverview />
              </CardContent>
            </Card>
          </div>

          {/* Transaction History Section - Mobile First */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-green-500/20">
              <CardHeader className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-b border-green-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                      <History className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg font-bold text-white">
                        Transaction History
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-gray-400">Recent deposit transactions</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {user ? (
                  <DigitoPayHistory />
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl inline-block max-w-xs mx-auto">
                      <History className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-blue-400 font-medium text-sm sm:text-base">Login Required</p>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">Access your transaction history</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Support Section - Fully responsive */}
            <Card className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-yellow-500/20">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 bg-yellow-500/20 border border-yellow-500/20 rounded-xl">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-white">24/7 Trading Support</h3>
                    <p className="text-sm sm:text-base text-gray-400">Expert assistance for all deposit operations</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mx-auto mb-2" />
                    <div className="text-sm text-white font-medium">Instant Support</div>
                    <div className="text-xs text-gray-400">Response in seconds</div>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-sm text-white font-medium">Secure Process</div>
                    <div className="text-xs text-gray-400">Bank-level security</div>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-sm text-white font-medium">Fast Processing</div>
                    <div className="text-xs text-gray-400">Average 2 minutes</div>
                  </div>
                </div>

                <Button className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">CONTACT TRADING SUPPORT</span>
                  <span className="sm:hidden">CONTACT SUPPORT</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Deposit;
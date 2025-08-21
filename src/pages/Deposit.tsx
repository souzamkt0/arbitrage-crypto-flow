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
        {/* Trading Header - Mobile Responsive */}
        <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-blue-500/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Left Section - Mobile Optimized */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="hover:bg-blue-500/10 text-blue-400 border border-blue-500/20 p-1.5 sm:p-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-xl font-bold text-white">TRADING DEPOSIT</h1>
                    <p className="hidden sm:block text-xs text-gray-400">Advanced deposit terminal</p>
                  </div>
                </div>
              </div>

              {/* Center Section - Hidden on Small Screens */}
              <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                <div className="flex items-center gap-2 px-2 xl:px-3 py-1 bg-green-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs xl:text-sm font-medium">SYSTEM ONLINE</span>
                </div>
                
                <div className="flex items-center gap-2 px-2 xl:px-3 py-1 bg-blue-500/20 rounded-full">
                  <Activity className="h-3 w-3 xl:h-4 xl:w-4 text-blue-400" />
                  <span className="text-blue-400 text-xs xl:text-sm font-medium">REAL-TIME</span>
                </div>
              </div>

              {/* Right Section - Mobile Optimized */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1.5 sm:p-2">
                  <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1.5 sm:p-2">
                  <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Status Indicators */}
            <div className="flex lg:hidden items-center justify-center gap-3 pb-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium">ONLINE</span>
              </div>
              
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 rounded-full">
                <Activity className="h-3 w-3 text-blue-400" />
                <span className="text-blue-400 text-xs font-medium">LIVE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Mobile-First Trading Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* Mobile: Market Overview First */}
            <div className="xl:col-span-1 order-1 xl:order-1">
              <div className="block xl:sticky xl:top-20">
                <MarketOverview />
              </div>
            </div>

            {/* Main Content Area - Mobile Priority */}
            <div className="xl:col-span-2 order-2 xl:order-2 space-y-4 sm:space-y-6">
              {/* Trading Chart - Responsive Height */}
              <div className="w-full">
                <TradingChart />
              </div>

              {/* Main Deposit Interface */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-blue-500/20">
                <CardHeader className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-white">
                          Deposit Terminal
                        </CardTitle>
                        <p className="text-sm text-gray-400">Choose your deposit method</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-xs font-medium">
                        INSTANT
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 sm:p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-slate-800/50 border border-slate-600/30 p-1">
                      <TabsTrigger 
                        value="digitopay" 
                        className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs sm:text-sm p-2 sm:p-3"
                      >
                        <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-medium">PIX</span>
                        <span className="hidden sm:inline">Instant</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="usdt" 
                        className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white text-xs sm:text-sm p-2 sm:p-3"
                      >
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-medium">USDT</span>
                        <span className="hidden sm:inline">Crypto</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* PIX Deposit Tab */}
                    <TabsContent value="digitopay" className="space-y-4 sm:space-y-6">
                      {user ? (
                        <DigitoPayDeposit onSuccess={() => {
                          toast({
                            title: "🎉 PARABÉNS!",
                            description: "Depósito processado com sucesso",
                          });
                        }} />
                      ) : (
                        <div className="text-center py-8 sm:py-12">
                          <div className="p-4 sm:p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl inline-block">
                            <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-red-400 mx-auto mb-4" />
                            <p className="text-red-400 text-base sm:text-lg font-medium">Authentication Required</p>
                            <p className="text-gray-400 mt-2 text-sm sm:text-base">Please login to access the trading deposit system</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* USDT Deposit Tab */}
                    <TabsContent value="usdt" className="space-y-4 sm:space-y-6">
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-purple-500/20 border border-purple-500/30 px-3 sm:px-4 py-2 rounded-full">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                          <span className="text-purple-400 font-medium text-xs sm:text-sm">USDT BNB20 • 10-15 min</span>
                        </div>
                      </div>

                      <form onSubmit={handleBnbSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="usdt-amount" className="text-purple-400 font-medium text-sm sm:text-base">Amount (USDT)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 sm:left-4 top-3 sm:top-4 h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" />
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

                          <div className="space-y-2 sm:space-y-3">
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

                        <div className="space-y-2 sm:space-y-3">
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
                              className="bg-purple-500 hover:bg-purple-600 text-white px-4 w-full sm:w-auto"
                            >
                              <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-0" />
                              <span className="sm:hidden">Copy Address</span>
                            </Button>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-3 sm:p-4">
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 mt-0.5 sm:mt-1 flex-shrink-0" />
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
                          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold h-11 sm:h-12 text-sm sm:text-base"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                              <span className="text-sm sm:text-base">Processing...</span>
                            </div>
                          ) : (
                            <>
                              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                              <span className="text-sm sm:text-base">CONFIRM CRYPTO DEPOSIT</span>
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Transaction History - Mobile Responsive */}
              {user && (
                <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-green-500/20">
                  <CardHeader className="border-b border-green-500/20 p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <History className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                        <CardTitle className="text-base sm:text-lg font-bold text-white">Transaction History</CardTitle>
                      </div>
                      <div className="sm:ml-auto px-2 sm:px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-xs font-medium w-fit">
                        REAL-TIME
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                      <DigitoPayHistory />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Sidebar - Statistics - Mobile Last */}
            <div className="xl:col-span-1 order-3 xl:order-3">
              <div className="block xl:sticky xl:top-20">
                <DepositStats />
              </div>
            </div>
          </div>

          {/* Support Section - Mobile Optimized */}
          <Card className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-yellow-500/20">
            <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <div className="p-3 sm:p-4 bg-yellow-500/20 border border-yellow-500/20 rounded-xl">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white">24/7 Trading Support</h3>
                  <p className="text-sm sm:text-base text-gray-400">Expert assistance for all deposit operations</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mx-auto mb-2" />
                  <div className="text-xs sm:text-sm text-white font-medium">Instant Support</div>
                  <div className="text-xs text-gray-400">Response in seconds</div>
                </div>
                
                <div className="p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-xs sm:text-sm text-white font-medium">Secure Process</div>
                  <div className="text-xs text-gray-400">Bank-level security</div>
                </div>
                
                <div className="p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-xs sm:text-sm text-white font-medium">Fast Processing</div>
                  <div className="text-xs text-gray-400">Average 2 minutes</div>
                </div>
              </div>

              <Button className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-6 sm:px-8 py-3">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">CONTACT TRADING SUPPORT</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Deposit;
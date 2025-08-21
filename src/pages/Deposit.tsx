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

        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Main Trading Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-screen">
            {/* Left Sidebar - Market Data */}
            <div className="lg:col-span-1 space-y-6">
              <MarketOverview />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trading Chart */}
              <TradingChart />

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

                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-800/50 border border-slate-600/30 p-1">
                      <TabsTrigger 
                        value="digitopay" 
                        className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                      >
                        <Smartphone className="h-4 w-4" />
                        <span className="font-medium">PIX Instant</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="usdt" 
                        className="flex items-center space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span className="font-medium">USDT Crypto</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* PIX Deposit Tab */}
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
                          <div className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl inline-block">
                            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                            <p className="text-red-400 text-lg font-medium">Authentication Required</p>
                            <p className="text-gray-400 mt-2">Please login to access the trading deposit system</p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* USDT Deposit Tab */}
                    <TabsContent value="usdt" className="space-y-6">
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-3 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full">
                          <Clock className="h-4 w-4 text-purple-400" />
                          <span className="text-purple-400 font-medium">USDT BNB20 • 10-15 min confirmation</span>
                        </div>
                      </div>

                      <form onSubmit={handleBnbSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="usdt-amount" className="text-purple-400 font-medium">Amount (USDT)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-4 top-4 h-4 w-4 text-purple-400" />
                              <Input
                                id="usdt-amount"
                                type="number"
                                placeholder="100.00"
                                className="pl-12 bg-slate-800/60 border-purple-500/30 text-white h-12 focus:border-purple-500"
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
                              className="bg-slate-800/60 border-purple-500/30 text-white h-12 focus:border-purple-500"
                              value={bnbForm.senderName}
                              onChange={(e) => setBnbForm({...bnbForm, senderName: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-purple-400 font-medium">Wallet Address (BNB20)</Label>
                          <div className="flex items-center space-x-3">
                            <Input
                              value={bnbAddress}
                              readOnly
                              className="font-mono text-sm bg-slate-800/60 border-purple-500/30 text-purple-400"
                            />
                            <Button
                              type="button"
                              onClick={() => copyToClipboard(bnbAddress, "Address")}
                              className="bg-purple-500 hover:bg-purple-600 text-white px-4"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-purple-400 mt-1" />
                            <div>
                              <h4 className="font-semibold text-purple-400 mb-2">Important Notes:</h4>
                              <ul className="text-gray-300 space-y-1 text-sm">
                                <li>• Send only USDT on BNB Smart Chain (BEP20)</li>
                                <li>• Minimum: 10 USDT | Processing: 10-15 minutes</li>
                                <li>• Double-check network before sending</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold h-12"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
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

            {/* Right Sidebar - Statistics */}
            <div className="lg:col-span-1 space-y-6">
              <DepositStats />
            </div>
          </div>

          {/* Support Section */}
          <Card className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-yellow-500/20">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="p-4 bg-yellow-500/20 border border-yellow-500/20 rounded-xl">
                  <Shield className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">24/7 Trading Support</h3>
                  <p className="text-gray-400">Expert assistance for all deposit operations</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                  <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <div className="text-sm text-white font-medium">Instant Support</div>
                  <div className="text-xs text-gray-400">Response in seconds</div>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                  <Shield className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-sm text-white font-medium">Secure Process</div>
                  <div className="text-xs text-gray-400">Bank-level security</div>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                  <Zap className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-sm text-white font-medium">Fast Processing</div>
                  <div className="text-xs text-gray-400">Average 2 minutes</div>
                </div>
              </div>

              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-3">
                <Users className="h-4 w-4 mr-2" />
                CONTACT TRADING SUPPORT
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Deposit;
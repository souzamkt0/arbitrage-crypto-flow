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
import { MarketOverview } from "@/components/MarketOverview";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  DollarSign,
  Wallet,
  History,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Bell,
  Settings,
  ArrowDown,
  Eye,
  EyeOff,
  TrendingDown
} from "lucide-react";

const Withdrawal = () => {
  console.log('🚀 Withdrawal component loading...');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  console.log('👤 User:', user);
  console.log('📋 Profile:', profile);
  
  const [activeTab, setActiveTab] = useState("digitopay");
  const [userBalance, setUserBalance] = useState(0);
  const [referralBalance, setReferralBalance] = useState(0);
  const [residualBalance, setResidualBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔄 Carregando dados do usuário...', { user: user?.email, userId: user?.id });
      
      if (!user) {
        console.log('❌ Nenhum usuário logado');
        return;
      }
      
      try {
        // Fetch user profile data
        console.log('🔍 Buscando perfil do usuário:', user.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('balance, referral_balance')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('❌ Erro ao buscar perfil:', error);
          return;
        }

        console.log('✅ Perfil encontrado:', profile);

        if (profile) {
          setUserBalance(profile.balance || 0);
          setReferralBalance(profile.referral_balance || 0);
          setResidualBalance(0); // Coluna não existe na tabela
          
          console.log('💰 Saldos configurados:', {
            balance: profile.balance || 0,
            referral_balance: profile.referral_balance || 0,
            total: (profile.balance || 0) + (profile.referral_balance || 0)
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadUserData();
  }, [user]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
        {/* Trading Header */}
        <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-red-500/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="hover:bg-red-500/10 text-red-400 border border-red-500/20 p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <ArrowDown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">TRADING WITHDRAWAL</h1>
                    <p className="text-xs text-gray-400">Advanced withdrawal terminal</p>
                  </div>
                </div>
              </div>

              {/* Center Section - Status */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">SYSTEM ONLINE</span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
                  <Activity className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">REAL-TIME</span>
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
          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Main Balance */}
            <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBalance(!showBalance)}
                        className="h-5 w-5 p-0"
                      >
                        {showBalance ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xl font-bold text-red-400">
                      {showBalance ? `$${userBalance.toFixed(2)}` : "••••••"}
                    </p>
                  </div>
                  <Wallet className="h-6 w-6 text-red-400" />
                </div>
              </CardContent>
            </Card>

            {/* Referral Balance */}
            <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Referral Balance</p>
                    <p className="text-lg font-bold text-amber-600">
                      {showBalance ? `$${referralBalance.toFixed(2)}` : "••••••"}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            {/* Residual Balance */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Residual Balance</p>
                    <p className="text-lg font-bold text-blue-600">
                      {showBalance ? `$${residualBalance.toFixed(2)}` : "••••••"}
                    </p>
                  </div>
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {/* Total Balance */}
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Total Available</p>
                    <p className="text-lg font-bold text-green-600">
                      {showBalance ? `$${(userBalance + referralBalance + residualBalance).toFixed(2)}` : "••••••"}
                    </p>
                  </div>
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

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

              {/* Main Withdrawal Interface */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-red-500/20">
                <CardHeader className="bg-gradient-to-r from-red-600/10 to-orange-600/10 border-b border-red-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                        <ArrowDown className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-white">
                          Withdrawal Terminal
                        </CardTitle>
                        <p className="text-sm text-gray-400">Fast and secure withdrawals</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-red-500/20 rounded-full text-red-400 text-xs font-medium">
                        FAST
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-1 mb-6 bg-slate-800/50 border border-slate-600/30 p-1">
                      <TabsTrigger 
                        value="digitopay" 
                        className="flex items-center space-x-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
                      >
                        <Smartphone className="h-4 w-4" />
                        <span className="font-medium">PIX Withdrawal</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* PIX Withdrawal Tab */}
                    <TabsContent value="digitopay" className="space-y-6">
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center space-x-3 bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-full">
                          <Clock className="h-4 w-4 text-red-400" />
                          <span className="text-red-400 font-medium">PIX Instant • Processing in 2 hours</span>
                        </div>
                      </div>

                      {user ? (
                        <DigitoPayWithdrawal 
                          userBalance={userBalance}
                          referralBalance={referralBalance}
                          onSuccess={() => {
                            toast({
                              title: "✅ WITHDRAWAL SENT!",
                              description: "Your withdrawal has been processed successfully",
                            });
                          }} 
                        />
                      ) : (
                        <div className="text-center py-12">
                          <div className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl inline-block">
                            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                            <p className="text-red-400 text-lg font-medium">Authentication Required</p>
                            <p className="text-gray-400 mt-2">Please login to access the trading withdrawal system</p>
                          </div>
                        </div>
                      )}

                      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-red-400 mb-2">Withdrawal Information:</h4>
                            <ul className="text-gray-300 space-y-1 text-sm">
                              <li>• Processing time: Up to 2 business hours</li>
                              <li>• Available: Monday to Friday, 9AM - 5PM</li>
                              <li>• Daily limit: $2,000 PIX</li>
                              <li>• Fee: 2% PIX withdrawal</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Transaction History */}
              {user && (
                <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-orange-500/20">
                  <CardHeader className="border-b border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <History className="h-5 w-5 text-orange-400" />
                      <CardTitle className="text-lg font-bold text-white">Withdrawal History</CardTitle>
                      <div className="ml-auto px-3 py-1 bg-orange-500/20 rounded-full text-orange-400 text-xs font-medium">
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

            {/* Right Sidebar - Withdrawal Stats */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-red-500/20">
                <CardHeader className="border-b border-red-500/20">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <ArrowDown className="h-5 w-5 text-red-400" />
                    Withdrawal Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Daily Limit Used</span>
                      <span className="text-white font-medium">$500 / $2,000</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Processing Time</span>
                      <span className="text-green-400 font-medium">~2 hours</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Success Rate</span>
                      <span className="text-green-400 font-medium">99.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-yellow-500/20">
                <CardHeader className="border-b border-yellow-500/20">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-yellow-400" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-sm text-gray-300">2FA Enabled</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-sm text-gray-300">IP Whitelist</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-sm text-gray-300">Email Verification</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  <h3 className="text-xl font-bold text-white">24/7 Withdrawal Support</h3>
                  <p className="text-gray-400">Expert assistance for all withdrawal operations</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                  <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <div className="text-sm text-white font-medium">Fast Processing</div>
                  <div className="text-xs text-gray-400">2 hour confirmation</div>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                  <Shield className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-sm text-white font-medium">Secure Process</div>
                  <div className="text-xs text-gray-400">Bank-level security</div>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/30">
                  <Zap className="h-6 w-6 text-red-400 mx-auto mb-2" />
                  <div className="text-sm text-white font-medium">24/7 Support</div>
                  <div className="text-xs text-gray-400">Always available</div>
                </div>
              </div>

              <p className="text-gray-400 text-sm">
                Need help with your withdrawal? Our trading support team is available 24/7 to assist you.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Withdrawal;
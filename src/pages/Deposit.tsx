import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DigitoPayDeposit } from "@/components/DigitoPayDeposit";
import { useAuth } from "@/hooks/useAuth";
import { DepositHistory } from "@/components/DepositHistory";
import { UserInfoCard } from "@/components/UserInfoCard";
import { TradingStatusBar } from "@/components/TradingStatusBar";
import { MarketOverview } from "@/components/MarketOverview";
import { PriceTicker } from "@/components/PriceTicker";
import { TradingChart } from "@/components/TradingChart";
import { EthereumChart } from "@/components/EthereumChart";
import { 
  ArrowLeft, 
  TrendingUp,
  Zap,
  Shield,
  Activity,
  DollarSign,
  BarChart3
} from "lucide-react";

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState("pix");

  return (
    <div className="min-h-screen bg-background">
      {/* Live Price Ticker */}
      <PriceTicker />
      
      {/* Trading Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-accent rounded-lg border border-border text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-binance-yellow to-binance-green rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-binance-black" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">TRADING DEPOSIT</h1>
                  <p className="text-xs text-muted-foreground">Sistema de depósito profissional</p>
                </div>
              </div>
            </div>

            <TradingStatusBar />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Layout responsivo - Mobile: Stack, Desktop: Grid */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Sidebar - Informações do usuário */}
          <div className="lg:col-span-3 space-y-6">
            <UserInfoCard user={user} profile={profile} />
            
            {/* Market Overview */}
            <MarketOverview />
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <Card className="bg-gradient-to-br from-success/10 to-trading-green/10 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-xs text-muted-foreground">Ganhos Hoje</span>
                  </div>
                  <div className="text-lg font-bold text-success">+$127.85</div>
                  <div className="text-xs text-muted-foreground">+12.4%</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-binance-yellow/10 to-warning/10 border-binance-yellow/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-binance-yellow" />
                    <span className="text-xs text-muted-foreground">Operações</span>
                  </div>
                  <div className="text-lg font-bold text-binance-yellow">47</div>
                  <div className="text-xs text-muted-foreground">Executadas</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Área principal - Depósito */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="bg-gradient-to-br from-card to-card/50 border border-border shadow-lg">
              <CardHeader className="bg-gradient-to-r from-binance-yellow/10 to-success/10 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-binance-yellow to-success rounded-lg">
                      <DollarSign className="h-5 w-5 text-binance-black" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">
                        Terminal de Depósito
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Sistema ativo e funcionando</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <div className="px-3 py-1 bg-success/20 rounded-full text-success text-xs font-medium">
                      ONLINE
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 border border-border p-1">
                    <TabsTrigger 
                      value="pix" 
                      className="flex items-center justify-center space-x-2 data-[state=active]:bg-success data-[state=active]:text-success-foreground py-3"
                    >
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">PIX Instantâneo</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="crypto" 
                      className="flex items-center justify-center space-x-2 data-[state=active]:bg-binance-yellow data-[state=active]:text-binance-black py-3"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Cripto USDT</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pix" className="space-y-6">
                    {user ? (
                      <DigitoPayDeposit onSuccess={() => {
                        toast({
                          title: "🎉 DEPÓSITO CONFIRMADO!",
                          description: "Seu saldo foi atualizado com sucesso",
                        });
                      }} />
                    ) : (
                      <div className="text-center py-12">
                        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl inline-block mx-auto max-w-sm">
                          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
                          <p className="text-destructive text-lg font-medium">Autenticação Necessária</p>
                          <p className="text-muted-foreground mt-2">Faça login para acessar o sistema de depósito</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="crypto" className="space-y-6">
                    <div className="text-center py-12">
                      <div className="p-6 bg-warning/10 border border-warning/20 rounded-xl inline-block mx-auto max-w-sm">
                        <Shield className="h-12 w-12 text-warning mx-auto mb-4" />
                        <p className="text-warning text-lg font-medium">Em Desenvolvimento</p>
                        <p className="text-muted-foreground mt-2">Depósitos em criptomoeda em breve</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar direita - Charts e Histórico */}
          <div className="lg:col-span-3 space-y-6">
            {/* Trading Charts */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-binance-yellow" />
                  Live Charts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mini Charts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/20 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">BTC/USDT</span>
                      <span className="text-xs text-success">+2.45%</span>
                    </div>
                    <div className="h-20">
                      <TradingChart />
                    </div>
                  </div>
                  
                  <div className="bg-muted/20 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">ETH/USDT</span>
                      <span className="text-xs text-destructive">-1.23%</span>
                    </div>
                    <div className="h-20">
                      <EthereumChart />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <DepositHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrendingUp, DollarSign, Clock, Target, Calendar, Bot, Timer, Play, ArrowUpDown, Activity, Zap, Sparkles, BarChart3, CreditCard, Wallet, ChevronRight, Shield, CheckCircle, PlayCircle, Users, Crown, Star, Trophy, TrendingDown, ArrowLeft, PlusCircle, Flame, Lock, Eye, EyeOff, AlertTriangle, Calculator } from "lucide-react";
import { ResponsiveContainer, Area, AreaChart, Tooltip, CartesianGrid, LineChart, Line, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router-dom";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
// import { PlanTradingChart } from "@/components/PlanTradingChart"; // Temporariamente removido para debug

interface InvestmentPlan {
  id: string;
  name: string;
  daily_rate: number;
  minimum_amount: number;
  max_investment_amount?: number;
  duration_days: number;
  description: string;
  status: string;
  minimum_indicators: number;
  features: string[];
}
interface UserInvestment {
  id: string;
  investment_plan_id: string;
  amount: number;
  daily_rate: number;
  start_date: string;
  end_date: string;
  total_earned: number;
  status: "active" | "completed";
  operations_completed: number;
  total_operations: number;
  current_day_progress: number;
  today_earnings: number;
  daily_target: number;
  days_remaining: number;
  created_at: string;
  updated_at: string;
}
interface Order {
  id: string;
  side: 'buy' | 'sell';
  price: number;
  qty: number;
  exchange: string;
  status: 'open' | 'filled' | 'partial';
  time: string;
}
interface Trade {
  id: string;
  side: 'buy' | 'sell';
  price: number;
  qty: number;
  exchange: string;
  time: string;
}
const TradingInvestments = () => {
  console.log('🔍 TradingInvestments: Componente iniciando...');

  // Hooks devem vir ANTES de qualquer lógica condicional
  const { user } = useAuth();
  const { toast } = useToast();
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    // State Management
    const [plans, setPlans] = useState<InvestmentPlan[]>([]);
    const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
    const [selectedAmount, setSelectedAmount] = useState<string>("");
    const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'plans' | 'active' | 'history'>('plans');
    const [userReferrals, setUserReferrals] = useState<number>(0);
    const [showInvestDialog, setShowInvestDialog] = useState(false);
    const [processingOperations, setProcessingOperations] = useState<Set<string>>(new Set());
    const [hiddenAmounts, setHiddenAmounts] = useState<Set<string>>(new Set());
    const [showArbitrageModal, setShowArbitrageModal] = useState(false);
    const [currentArbitrage, setCurrentArbitrage] = useState<{
      investment: UserInvestment | null;
      progress: number;
      currentProfit: number;
      finalProfit: number;
      stage: 'analyzing' | 'opportunity' | 'calculating' | 'buying' | 'transferring' | 'selling' | 'finalizing' | 'completed';
      pair: string;
      exchanges: string[];
      buyPrice: number;
      sellPrice: number;
      chartData: Array<{
        time: string;
        price: number;
        exchange: string;
        volume: number;
      }>;
      operationStartTime: number;
    }>({
      investment: null,
      progress: 0,
      currentProfit: 0,
      finalProfit: 0,
      stage: 'analyzing',
      pair: '',
      exchanges: [],
      buyPrice: 0,
      sellPrice: 0,
      chartData: [],
      operationStartTime: 0
    });
    // Real-time market visual states
    const [orderBook, setOrderBook] = useState<{ buys: Order[]; sells: Order[] }>({ buys: [], sells: [] });
    const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
    const [tickerPrice, setTickerPrice] = useState<number>(0);
    const [unrealizedPnl, setUnrealizedPnl] = useState<number>(0);
    const [feesAccum, setFeesAccum] = useState<number>(0);
    // Mobile bottom sheet for operations
    const [isOpsSheetOpen, setIsOpsSheetOpen] = useState(false);

  // Error boundary básico
  try {
    // Função para verificar requisitos de cada plano
    const getRequirementMessage = (planName: string) => {
      if (planName.includes('4.0.0')) {
        return '';
      } else if (planName.includes('4.0.5')) {
        return 'Paga até 3% porém tem que ter 10 pessoas ativas no primeiro nível com planos ativos. Não pode ativar se não tiver apto com os 10 indicados ativos. ';
      } else if (planName.includes('4.1.0')) {
        return 'Precisa de 40 pessoas ativas no Robô 4.0.5 para acessar. ';
      } else {
        return '';
      }
    };

    useEffect(() => {
      console.log('🔍 TradingInvestments useEffect: user =', user);
      if (user) {
        console.log('🔍 TradingInvestments: Carregando dados...');
        fetchPlans();
        fetchUserInvestments();
        fetchUserReferrals();
        
        // Configurar sincronização em tempo real para investment_plans
        const plansChannel = supabase
          .channel('investment_plans_realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'investment_plans'
            },
            () => {
              console.log('🔄 Planos atualizados - recarregando...');
              fetchPlans();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(plansChannel);
        };
      }
    }, [user]);
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const {
          data,
          error
        } = await supabase.from('investment_plans').select('*').eq('status', 'active').order('minimum_amount');
        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('Erro ao buscar planos:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar planos de investimento",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    const fetchUserInvestments = async () => {
      if (!user?.id) return;
      try {
        const {
          data,
          error
        } = await supabase.from('user_investments').select('*').eq('user_id', user.id).order('created_at', {
          ascending: false
        });
        if (error) throw error;
        setUserInvestments(data || []);
      } catch (error) {
        console.error('Erro ao buscar investimentos:', error);
      }
    };

    // Função para gerar dados do gráfico de trading
    const generateTradingData = () => {
      const data = [];
      let price = 45000; // Preço inicial do BTC

      for (let i = 0; i < 24; i++) {
        const variation = (Math.random() - 0.5) * 1000; // Variação aleatória
        price += variation;
        data.push({
          time: `${i.toString().padStart(2, '0')}:00`,
          price: Math.round(price)
        });
      }
      return data;
    };
    const fetchUserReferrals = async () => {
      if (!user?.id) return;
      try {
        const {
          data,
          error
        } = await supabase.from('referrals').select('*').eq('referrer_id', user.id).eq('status', 'active');
        if (error) throw error;
        setUserReferrals(data?.length || 0);
      } catch (error) {
        console.error('Erro ao buscar indicações:', error);
      }
    };
    const populateTestData = async () => {
      try {
        const {
          data,
          error
        } = await supabase.functions.invoke('populate-trading-data');
        if (error) throw error;
        toast({
          title: "✅ Dados Populados",
          description: "Dados de trading foram adicionados com sucesso!"
        });
      } catch (error) {
        console.error('Erro ao popular dados:', error);
        toast({
          title: "Erro",
          description: "Falha ao popular dados de teste",
          variant: "destructive"
        });
      }
    };
    const createInvestment = async () => {
      console.log('🔍 createInvestment iniciado');
      console.log('selectedPlan:', selectedPlan);
      console.log('selectedAmount:', selectedAmount);
      console.log('user?.id:', user?.id);
      if (!selectedPlan || !selectedAmount || !user?.id) {
        console.log('❌ Dados insuficientes para criar investimento');
        return;
      }
      const amount = parseFloat(selectedAmount);
      console.log('💰 Valor do investimento:', amount);
      if (amount < selectedPlan.minimum_amount) {
        console.log('❌ Valor menor que o mínimo');
        toast({
          title: "Valor Inválido",
          description: `Valor mínimo é $${selectedPlan.minimum_amount}`,
          variant: "destructive"
        });
        return;
      }
      if (selectedPlan.max_investment_amount && amount > selectedPlan.max_investment_amount) {
        console.log('❌ Valor maior que o máximo');
        toast({
          title: "Valor Inválido",
          description: `Valor máximo é $${selectedPlan.max_investment_amount}`,
          variant: "destructive"
        });
        return;
      }
      console.log('👥 Verificando indicações - userReferrals:', userReferrals, 'minimum_indicators:', selectedPlan.minimum_indicators);
      if (userReferrals < selectedPlan.minimum_indicators) {
        console.log('❌ Indicações insuficientes');
        toast({
          title: "Indicações Insuficientes",
          description: `Este plano requer ${selectedPlan.minimum_indicators} indicações ativas`,
          variant: "destructive"
        });
        return;
      }
      try {
        console.log('🚀 Iniciando criação do investimento...');
        setIsLoading(true);
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + selectedPlan.duration_days);
        const investmentData = {
          user_id: user.id,
          investment_plan_id: selectedPlan.id,
          amount: amount,
          daily_rate: selectedPlan.daily_rate,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_earned: 0,
          status: 'active',
          operations_completed: 0,
          total_operations: selectedPlan.duration_days * 2,
          // 2 operações por dia
          current_day_progress: 0,
          today_earnings: 0,
          daily_target: amount * (selectedPlan.daily_rate / 100),
          days_remaining: selectedPlan.duration_days
        };
        console.log('📋 Dados do investimento:', investmentData);
        const {
          data,
          error
        } = await supabase.from('user_investments').insert(investmentData).select();
        console.log('📊 Resposta do Supabase:', {
          data,
          error
        });
        if (error) {
          console.error('❌ Erro do Supabase:', error);
          throw error;
        }

        // Registrar operação de comissão para referrer
        if (userReferrals > 0) {
          await supabase.rpc('calculate_referral_commission_auto', {
            referred_user_id: user.id,
            investment_amount: amount
          });
        }
        toast({
          title: "✅ Investimento Criado!",
          description: `Seu plano ${selectedPlan.id === '1' ? 'Robo 4.0' : selectedPlan.id === '2' ? 'Robô 4.0.5' : selectedPlan.id === '3' ? 'Robô 4.1.0' : selectedPlan.name} está ativo!`
        });
        setShowInvestDialog(false);
        setSelectedAmount("");
        setSelectedPlan(null);
        fetchUserInvestments();
      } catch (error) {
        console.error('Erro ao criar investimento:', error);
        toast({
          title: "Erro",
          description: "Falha ao criar investimento. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    const executeArbitrage = async (investment: UserInvestment) => {
      if (processingOperations.has(investment.id)) return;

      // Verificar limite de operações por dia
      if (investment.operations_completed >= 2) {
        toast({
          title: "⚠️ Limite Atingido",
          description: "Aguarde o reset diário para executar novas operações.",
          variant: "destructive"
        });
        return;
      }

      // Lucro baseado na configuração do plano no admin
      console.log('💰 Calculando lucro:', {
        investmentAmount: investment.amount,
        dailyRate: investment.daily_rate,
        investmentId: investment.id
      });
      const baseProfit = investment.amount * investment.daily_rate; // Baseado na taxa configurada
      console.log('💰 Lucro calculado:', {
        amount: investment.amount,
        daily_rate: investment.daily_rate,
        baseProfit: baseProfit,
        shouldBe_1_84: '1.84 para $100 com 1.84%'
      });
      const variation = 1; // Sem variação
      const finalProfit = baseProfit * variation;

      // Configurar dados da arbitragem
      const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
      const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Bitfinex', 'KuCoin'];
      const selectedPair = pairs[Math.floor(Math.random() * pairs.length)];
      const selectedExchanges = exchanges.sort(() => 0.5 - Math.random()).slice(0, 2);
      let buyPrice = 0;
      if (selectedPair.includes('BTC')) buyPrice = 40000 + Math.random() * 20000;else if (selectedPair.includes('ETH')) buyPrice = 2000 + Math.random() * 1000;else if (selectedPair.includes('BNB')) buyPrice = 200 + Math.random() * 100;else buyPrice = 0.5 + Math.random() * 2;
      const sellPrice = buyPrice * (1 + finalProfit / investment.amount);

      // Dados iniciais do gráfico
      const initialChartData = Array.from({
        length: 20
      }, (_, i) => ({
        time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString(),
        price: buyPrice + (Math.random() - 0.5) * (buyPrice * 0.001),
        exchange: selectedExchanges[0],
        volume: Math.random() * 1000 + 500
      }));
      setCurrentArbitrage({
        investment,
        progress: 0,
        currentProfit: 0,
        finalProfit,
        stage: 'analyzing',
        pair: selectedPair,
        exchanges: selectedExchanges,
        buyPrice,
        sellPrice,
        chartData: initialChartData,
        operationStartTime: Date.now()
      });
      // Seed initial order book and trades
      const seedBuys: Order[] = Array.from({ length: 10 }, (_, i) => ({
        id: `b${Date.now()}_${i}`,
        side: 'buy',
        price: parseFloat((buyPrice * (1 - 0.0005 * i)).toFixed(6)),
        qty: parseFloat(((Math.random() * 0.8 + 0.2)).toFixed(4)),
        exchange: selectedExchanges[0],
        status: 'open',
        time: new Date().toLocaleTimeString()
      }));
      const seedSells: Order[] = Array.from({ length: 10 }, (_, i) => ({
        id: `s${Date.now()}_${i}`,
        side: 'sell',
        price: parseFloat((sellPrice * (1 + 0.0005 * i)).toFixed(6)),
        qty: parseFloat(((Math.random() * 0.8 + 0.2)).toFixed(4)),
        exchange: selectedExchanges[1] || selectedExchanges[0],
        status: 'open',
        time: new Date().toLocaleTimeString()
      }));
      setOrderBook({ buys: seedBuys, sells: seedSells });
      setRecentTrades([]);
      setTickerPrice(buyPrice);
      setUnrealizedPnl(0);
      setFeesAccum(0);
      setShowArbitrageModal(true);
      setProcessingOperations(prev => new Set(prev).add(investment.id));

      // Simulação será executada no modal
    };
    const runArbitrageSimulation = async () => {
      const investment = currentArbitrage.investment;
      if (!investment) return;
      try {
        let waveOffset = 0;

        // Etapa 1: Analisando mercados e spreads (12 segundos)
        setCurrentArbitrage(prev => ({
          ...prev,
          stage: 'analyzing'
        }));
        for (let i = 0; i <= 15; i += 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
          waveOffset += 0.2;
          setCurrentArbitrage(prev => ({
            ...prev,
            progress: i,
            chartData: [...prev.chartData.slice(-19), {
              time: new Date().toLocaleTimeString(),
              price: prev.buyPrice + Math.sin(waveOffset) * (prev.buyPrice * 0.004) + (Math.random() - 0.5) * (prev.buyPrice * 0.001),
              exchange: prev.exchanges[Math.floor(Math.random() * prev.exchanges.length)],
              volume: Math.random() * 1000 + 500
            }]
          }));
        }

        // Etapa 2: Identificando melhores oportunidades (10 segundos)
        setCurrentArbitrage(prev => ({
          ...prev,
          stage: 'opportunity'
        }));
        for (let i = 15; i <= 30; i += 1) {
          await new Promise(resolve => setTimeout(resolve, 650));
          waveOffset += 0.3;
          setCurrentArbitrage(prev => ({
            ...prev,
            progress: i,
            chartData: [...prev.chartData.slice(-19), {
              time: new Date().toLocaleTimeString(),
              price: prev.buyPrice + Math.sin(waveOffset) * (prev.buyPrice * 0.003) + (Math.random() - 0.5) * (prev.buyPrice * 0.001),
              exchange: prev.exchanges[Math.floor(Math.random() * prev.exchanges.length)],
              volume: Math.random() * 1500 + 800
            }]
          }));
        }

        // Etapa 3: Calculando riscos e volumes (8 segundos)
        setCurrentArbitrage(prev => ({
          ...prev,
          stage: 'calculating'
        }));
        for (let i = 30; i <= 40; i += 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
          waveOffset += 0.25;
          setCurrentArbitrage(prev => ({
            ...prev,
            progress: i,
            chartData: [...prev.chartData.slice(-19), {
              time: new Date().toLocaleTimeString(),
              price: prev.buyPrice + Math.sin(waveOffset) * (prev.buyPrice * 0.002) + (Math.random() - 0.5) * (prev.buyPrice * 0.0008),
              exchange: prev.exchanges[0],
              volume: Math.random() * 2000 + 1000
            }]
          }));
        }

        // Etapa 4: Executando ordem de compra (12 segundos)
        setCurrentArbitrage(prev => ({
          ...prev,
          stage: 'buying'
        }));
        for (let i = 40; i <= 60; i += 1) {
          await new Promise(resolve => setTimeout(resolve, 600));
          waveOffset += 0.4;
          setCurrentArbitrage(prev => {
            const priceMovement = (prev.sellPrice - prev.buyPrice) * ((i - 40) / 20) * 0.4;
            const waveEffect = Math.sin(waveOffset) * (prev.buyPrice * 0.003);
            return {
              ...prev,
              progress: i,
              currentProfit: prev.finalProfit * (i - 40) / 60, // Progride até o lucro calculado
              chartData: [...prev.chartData.slice(-19), {
                time: new Date().toLocaleTimeString(),
                price: prev.buyPrice + priceMovement + waveEffect + (Math.random() - 0.5) * (prev.buyPrice * 0.001),
                exchange: prev.exchanges[0],
                volume: Math.random() * 3000 + 2000
              }]
            };
          });
          // Update real-time ticker and order book (buying phase)
          setTickerPrice(prev => prev + (Math.random() - 0.4) * 2);
          setOrderBook((ob) => {
            const updatedBuys: Order[] = ob.buys.map((o, idx) => (idx < 2 ? { ...o, status: 'filled' } as Order : o)).slice(0).sort((a,b) => b.price - a.price);
            return { buys: updatedBuys, sells: ob.sells };
          });
          setRecentTrades((trades) => ([{
            id: `t${Date.now()}_${i}`,
            side: 'buy',
            price: tickerPrice || (currentArbitrage.buyPrice + Math.random()),
            qty: parseFloat((Math.random() * 0.5 + 0.05).toFixed(4)),
            exchange: currentArbitrage.exchanges[0],
            time: new Date().toLocaleTimeString()
          } as Trade, ...trades]).slice(0, 25));
          setFeesAccum(f => f + 0.02);
        }

        // Etapa 5: Transferindo entre exchanges (8 segundos)
        setCurrentArbitrage(prev => ({
          ...prev,
          stage: 'transferring'
        }));
        for (let i = 60; i <= 75; i += 1) {
          await new Promise(resolve => setTimeout(resolve, 530));
          waveOffset += 0.35;
          setCurrentArbitrage(prev => {
            const priceMovement = (prev.sellPrice - prev.buyPrice) * ((i - 40) / 35) * 0.6;
            const waveEffect = Math.sin(waveOffset) * (prev.buyPrice * 0.002);
            return {
              ...prev,
              progress: i,
              currentProfit: prev.finalProfit * (i - 40) / 50, // Progride até o lucro calculado
              chartData: [...prev.chartData.slice(-19), {
                time: new Date().toLocaleTimeString(),
                price: prev.buyPrice + priceMovement + waveEffect + (Math.random() - 0.5) * (prev.buyPrice * 0.0008),
                exchange: 'Transferindo...',
                volume: Math.random() * 1000 + 500
              }]
            };
          });
          // Transfer phase - drift ticker slightly
          setTickerPrice(prev => prev + (Math.random() - 0.5));
        }

        // Etapa 6: Executando ordem de venda (8 segundos)
        setCurrentArbitrage(prev => ({
          ...prev,
          stage: 'selling'
        }));
        for (let i = 75; i <= 95; i += 1) {
          await new Promise(resolve => setTimeout(resolve, 400));
          waveOffset += 0.45;
          setCurrentArbitrage(prev => {
            const priceMovement = (prev.sellPrice - prev.buyPrice) * ((i - 40) / 55);
            const waveEffect = Math.sin(waveOffset) * (prev.buyPrice * 0.0015);
            return {
              ...prev,
              progress: i,
              currentProfit: prev.finalProfit * (i - 40) / 55, // Progride até o lucro calculado
              chartData: [...prev.chartData.slice(-19), {
                time: new Date().toLocaleTimeString(),
                price: prev.buyPrice + priceMovement + waveEffect + (Math.random() - 0.5) * (prev.buyPrice * 0.0005),
                exchange: prev.exchanges[1],
                volume: Math.random() * 4000 + 2500
              }]
            };
          });
          // Selling phase - fill sell orders, push trades
          setTickerPrice(prev => prev + (Math.random() - 0.3) * 2.5);
          setOrderBook((ob) => {
            const updatedSells: Order[] = ob.sells.map((o, idx) => (idx < 2 ? { ...o, status: 'filled' } as Order : o)).slice(0).sort((a,b) => a.price - b.price);
            return { buys: ob.buys, sells: updatedSells };
          });
          setRecentTrades((trades) => ([{
            id: `t${Date.now()}_${i}`,
            side: 'sell',
            price: tickerPrice || (currentArbitrage.sellPrice - Math.random()),
            qty: parseFloat((Math.random() * 0.6 + 0.05).toFixed(4)),
            exchange: currentArbitrage.exchanges[1],
            time: new Date().toLocaleTimeString()
          } as Trade, ...trades]).slice(0, 25));
          setFeesAccum(f => f + 0.02);
        }

        // Etapa 7: Finalizando e confirmando lucros (2 segundos)
        setCurrentArbitrage(prev => ({
          ...prev,
          stage: 'finalizing'
        }));
        for (let i = 95; i <= 100; i += 1) {
          await new Promise(resolve => setTimeout(resolve, 400));
          waveOffset += 0.3;
          setCurrentArbitrage(prev => ({
            ...prev,
            progress: i,
            currentProfit: prev.finalProfit, // Valor final baseado no cálculo
            chartData: [...prev.chartData.slice(-19), {
              time: new Date().toLocaleTimeString(),
              price: prev.sellPrice + Math.sin(waveOffset) * (prev.sellPrice * 0.001) + (Math.random() - 0.5) * (prev.sellPrice * 0.0003),
              exchange: prev.exchanges[1],
              volume: Math.random() * 2000 + 1000
            }]
          }));
        }

        // Finalizar com timestamp de operação
        setCurrentArbitrage(prev => ({
          ...prev,
          stage: 'completed',
          progress: 100,
          currentProfit: prev.finalProfit, // Valor final baseado no cálculo
          operationStartTime: prev.operationStartTime || Date.now()
        }));

        // Aguardar 2 segundos e atualizar banco de dados
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Atualizar saldo do usuário na tabela profiles
        const {
          data: profileData,
          error: profileError
        } = await supabase.from('profiles').select('balance, total_profit').eq('user_id', user?.id).single();
        if (profileError) throw profileError;
        const newBalance = (profileData.balance || 0) + currentArbitrage.finalProfit;

        // Atualizar saldo principal
        const {
          error: balanceUpdateError
        } = await supabase.from('profiles').update({
          balance: newBalance,
          total_profit: (profileData.total_profit || 0) + currentArbitrage.finalProfit
        }).eq('user_id', user?.id);
        if (balanceUpdateError) throw balanceUpdateError;

        // Atualizar investimento
        const {
          error: updateError
        } = await supabase.from('user_investments').update({
          operations_completed: investment.operations_completed + 1,
          total_earned: investment.total_earned + currentArbitrage.finalProfit,
          today_earnings: investment.today_earnings + currentArbitrage.finalProfit,
          current_day_progress: (investment.operations_completed + 1) / 2 * 100,
          updated_at: new Date().toISOString()
        }).eq('id', investment.id).eq('user_id', user?.id);
        if (updateError) throw updateError;

        // Registrar no histórico de trading
        await supabase.from('trading_profits').insert({
          user_id: user?.id,
          investment_amount: investment.amount,
          daily_rate: investment.daily_rate,
          plan_name: plans.find(p => p.id === investment.investment_plan_id)?.name || 'Unknown',
          total_profit: currentArbitrage.finalProfit,
          exchanges_count: 2,
          completed_operations: 1,
          execution_time_seconds: 8,
          profit_per_exchange: currentArbitrage.finalProfit / 2,
          metadata: {
            operation_number: investment.operations_completed + 1,
            operation_type: 'arbitrage_operation',
            pair: currentArbitrage.pair,
            exchanges: currentArbitrage.exchanges,
            profit_percentage: (currentArbitrage.finalProfit / investment.amount * 100).toFixed(4)
          }
        });
        toast({
          title: "✅ Arbitragem Concluída!",
          description: `Lucro de $${currentArbitrage.finalProfit.toFixed(2)} adicionado ao seu saldo!`
        });
        fetchUserInvestments();
      } catch (error) {
        console.error('Erro ao executar arbitragem:', error);
        toast({
          title: "Erro",
          description: "Erro ao executar arbitragem. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setProcessingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(investment.id);
          return newSet;
        });
      }
    };
    const toggleHideAmount = (investmentId: string) => {
      setHiddenAmounts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(investmentId)) {
          newSet.delete(investmentId);
        } else {
          newSet.add(investmentId);
        }
        return newSet;
      });
    };
    const getPlanDisplayName = (planId: string) => {
      const plan = plans.find(p => p.id === planId);
      return plan?.name || 'Plano Desconhecido';
    };
    const activeInvestments = userInvestments.filter(inv => inv.status === 'active');
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalEarnings = userInvestments.reduce((sum, inv) => sum + inv.total_earned, 0);
    console.log('🔍 TradingInvestments: Renderizando...', {
      user,
      isLoading,
      plans: plans.length,
      userInvestments: userInvestments.length
    });
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Trading Style */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
          <div className="flex items-center gap-3 lg:gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-2 bg-slate-800/50 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent">
                Trading Investments
              </h1>
              <p className="text-slate-300 text-base lg:text-lg">
                Robôs de arbitragem automatizados
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 text-xs sm:text-sm font-bold border-0 shadow-lg">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{userReferrals} Indicações</span>
                <span className="sm:hidden">{userReferrals}</span>
            </Badge>
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 text-xs sm:text-sm font-bold border-0 shadow-lg">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{activeInvestments.length} Ativos</span>
                <span className="sm:hidden">{activeInvestments.length}</span>
            </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-600/30">
          {[{
            key: 'plans',
            label: 'Planos Disponíveis',
            icon: Bot
          }, {
            key: 'active',
            label: 'Investimentos Ativos',
            icon: Activity
          }, {
            key: 'history',
            label: 'Histórico',
            icon: BarChart3
          }].map(({
            key,
            label,
            icon: Icon
          }) => <Button key={key} variant={activeTab === key ? 'default' : 'ghost'} onClick={() => setActiveTab(key as any)} className={`flex-1 flex items-center justify-center gap-2 ${activeTab === key ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>
              <Icon className={`h-4 w-4 ${key === 'active' && activeTab === 'active' ? 'animate-pulse text-yellow-400' : ''}`} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(' ')[0]}</span>
            </Button>)}
        </div>

        {/* Stats Cards - Apenas na aba Investimentos Ativos */}
        {activeTab === 'active' && activeInvestments.length > 0 && <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Investido</p>
                    <p className="text-2xl font-bold text-white">${totalInvested.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm">Total Ganhos</p>
                    <p className="text-2xl font-bold text-yellow-400">+${totalEarnings.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">ROI Médio</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {((plans.find(p => p.id === userInvestments.find(inv => inv.status === 'active')?.investment_plan_id)?.daily_rate || 0.0033) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
          </div>}

        {/* Content based on active tab */}
        {activeTab === 'plans' && <div className="space-y-8">
            {/* Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {plans.map(plan => {
              // Verificar requisitos específicos para cada plano baseado nos dados já carregados
              let canInvest = false;
              if (plan.id === '1') {
                canInvest = true; // Robô 4.0 sempre pode acessar
              } else if (plan.id === '2') {
                canInvest = userReferrals >= 10; // Robô 4.0.5 precisa de 10 indicações ativas
              } else if (plan.id === '3') {
                canInvest = userReferrals >= 40; // Robô 4.1.0 precisa de 40 indicações ativas
              } else {
                canInvest = userReferrals >= plan.minimum_indicators;
              }
              const isLocked = !canInvest;
              return <div key={plan.id} className="space-y-6">
                    {/* Plan Card */}
                    <Card className="relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-slate-900/95 via-yellow-900/20 to-slate-900/95 border-yellow-500/30 shadow-lg shadow-yellow-500/10 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10">
                      {/* Profit Information Box */}
                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-300 text-sm font-medium">
                              💰 Lucro Diário Potencial (Variável)
                            </p>
                            <p className="text-yellow-400 text-lg font-bold">
                              Até 2% ao dia*
                            </p>
                            {plan.id === '1' && <p className="text-yellow-300 text-xs mt-1">
                                *Arbitragem variável - pode ser menor
                              </p>}
                          </div>
                          <div className="text-right">
                            <p className="text-slate-300 text-xs">
                              Simulação com $1,000
                            </p>
                            <p className="text-yellow-400 text-xl font-bold">
                              {plan.id === '1' ? 'Até $20/dia' : plan.id === '2' ? 'Até $30/dia' : plan.id === '3' ? 'Até $40/dia' : 'Até $20/dia'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 text-center">
          <div className="space-y-2">
            <p className="text-white text-sm">
              {isLocked ? (
                <span className="flex items-center gap-2 text-red-300">
                  <Lock className="h-4 w-4" />
                  Plano bloqueado - {getRequirementMessage(plan.name)}
                </span>
              ) : plan.name.includes('4.0.0') ? (
                <span className="flex items-center gap-2 text-emerald-300">
                  <TrendingUp className="h-4 w-4" />
                  Sistema de arbitragem automática - ganhos variáveis
                </span>
              ) : (
                <span className="flex items-center gap-2 text-blue-300">
                  <Bot className="h-4 w-4" />
                  Sistema automatizado com rentabilidade variável
                </span>
              )}
            </p>
            
            {canInvest && plan.name.includes('4.0.0') && (
              <p className="text-yellow-300 text-xs flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Arbitragem variável: pode ganhar menos de 2% - ganhos não fixos
              </p>
            )}
            
            {canInvest && !plan.name.includes('4.0.0') && (
              <p className="text-yellow-300 text-xs flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Ganhos não garantidos - Sistema automatizado variável
              </p>
            )}
          </div>
                        </div>
                      </div>
                      {isLocked}
                      
                      

                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                            <Bot className="h-5 w-5 text-yellow-400" />
                            {plan.id === '1' ? 'Robo 4.0' : plan.id === '2' ? 'Robô 4.0.5' : plan.id === '3' ? 'Robô 4.1.0' : plan.name}
                          </CardTitle>
          <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold">
                            até 2%
                          </Badge>
                        </div>
                        {/* Informações específicas de cada plano */}
                        <div className="mt-2 space-y-2">
                          {plan.name.includes('4.0.0') && (
                            <div className="space-y-1">
                              <p className="text-xs text-emerald-300 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Arbitragem Automática
                              </p>
                              <p className="text-xs text-yellow-300 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Ganhos variáveis (não fixos)
                              </p>
                              <p className="text-xs text-green-300 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Sem requisitos de indicação
                              </p>
                            </div>
                          )}
                          
                          {plan.name.includes('4.0.5') && (
                            <div className="space-y-1">
                              <p className="text-xs text-emerald-300 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Até 3% ao dia
                              </p>
                              <p className="text-xs text-orange-300 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Precisa de 10 indicados ativos no 4.0.0
                              </p>
                              <p className="text-xs text-red-300 flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Bloqueado sem os requisitos
                              </p>
                            </div>
                          )}
                          
                          {plan.name.includes('4.1.0') && (
                            <div className="space-y-1">
                              <p className="text-xs text-emerald-300 flex items-center gap-1">
                                <Crown className="h-3 w-3" />
                                Até 4% ao dia - Nível Premium
                              </p>
                              <p className="text-xs text-orange-300 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Precisa de 40 indicados ativos no 4.0.5
                              </p>
                              <p className="text-xs text-purple-300 flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                Máximo potencial de lucro
                              </p>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-white">
                          {plan.description}
                        </p>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-white">
                              <DollarSign className="w-4 h-4" />
                              Valor Mínimo
                              <DollarSign className="w-4 h-4" />
                              Valor Mínimo
                            </div>
                            <div className="font-semibold text-white">
                              ${plan.minimum_amount}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-white">
                              <Clock className="w-4 h-4" />
                              Duração
                              <Clock className="w-4 h-4" />
                              Duração
                            </div>
                            <div className="font-semibold text-white">
                              {plan.duration_days} dias
                            </div>
                          </div>
                        </div>

                        {plan.minimum_indicators > 0 && <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-white">
                              <Users className="w-4 h-4" />
                              Indicações Necessárias
                              <Users className="w-4 h-4" />
                              Indicações Necessárias
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-white">
                                {plan.minimum_indicators}
                              </div>
                              <Badge variant={canInvest ? "default" : "destructive"} className="text-xs">
                                Você tem: {userReferrals}
                              </Badge>
                            </div>
                          </div>}

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white">
                            Recursos:
                          </h4>
                          <div className="space-y-1">
                            {plan.features?.slice(0, 3).map((feature, index) => <div key={index} className="text-xs flex items-center gap-1 text-white">
                                <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
                                {feature}
                              </div>)}
                          </div>
                        </div>

                        {/* Simulador de Ganhos para Plano Livre */}
                        {plan.name.includes('4.0.0') && (
                          <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg p-4 border border-cyan-500/20 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Calculator className="h-4 w-4 text-cyan-400" />
                              <h4 className="font-semibold text-cyan-300">Simulador de Ganhos - Plano Livre</h4>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <Label htmlFor={`simulator-${plan.id}`} className="text-xs text-cyan-200">
                                    Valor (máx. $100)
                                  </Label>
                                  <Input
                                    id={`simulator-${plan.id}`}
                                    type="number"
                                    max="100"
                                    min="10"
                                    placeholder="10"
                                    className="bg-slate-700/50 border-cyan-500/30 text-white text-sm mt-1"
                                    onChange={(e) => {
                                      const value = Math.min(100, Math.max(10, parseFloat(e.target.value) || 10));
                                      e.target.value = value.toString();
                                      
                                      // Calcular projeções variáveis
                                      const minDaily = value * 0.005; // 0.5%
                                      const maxDaily = value * 0.02; // 2%
                                      const avgDaily = value * 0.0125; // 1.25% média
                                      
                                      // Atualizar display das projeções
                                      const projectionDiv = (e.target as HTMLInputElement).closest('.space-y-3')?.querySelector('.projection-results');
                                      if (projectionDiv) {
                                        projectionDiv.innerHTML = `
                                          <div class="grid grid-cols-3 gap-2 text-xs">
                                            <div class="text-center p-2 bg-red-900/20 rounded border border-red-500/20">
                                              <div class="text-red-300">Mínimo</div>
                                              <div class="text-red-400 font-bold">$${minDaily.toFixed(2)}/dia</div>
                                              <div class="text-red-200 text-[10px]">0.5%</div>
                                            </div>
                                            <div class="text-center p-2 bg-green-900/20 rounded border border-green-500/20">
                                              <div class="text-green-300">Média</div>
                                              <div class="text-green-400 font-bold">$${avgDaily.toFixed(2)}/dia</div>
                                              <div class="text-green-200 text-[10px]">1.25%</div>
                                            </div>
                                            <div class="text-center p-2 bg-blue-900/20 rounded border border-blue-500/20">
                                              <div class="text-blue-300">Máximo</div>
                                              <div class="text-blue-400 font-bold">$${maxDaily.toFixed(2)}/dia</div>
                                              <div class="text-blue-200 text-[10px]">2%</div>
                                            </div>
                                          </div>
                                          <div class="mt-3 p-2 bg-yellow-900/20 rounded border border-yellow-500/20">
                                            <div class="text-yellow-300 text-[10px] font-medium mb-1">Projeção 30 dias:</div>
                                            <div class="flex justify-between text-[10px]">
                                              <span class="text-red-300">Min: $${(minDaily * 30).toFixed(0)}</span>
                                              <span class="text-green-300">Méd: $${(avgDaily * 30).toFixed(0)}</span>
                                              <span class="text-blue-300">Máx: $${(maxDaily * 30).toFixed(0)}</span>
                                            </div>
                                          </div>
                                        `;
                                      }
                                    }}
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-5 bg-cyan-500/20 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30"
                                  onClick={(e) => {
                                    const input = (e.target as HTMLElement).closest('.flex')?.querySelector('input') as HTMLInputElement;
                                    input.value = '50';
                                    input.dispatchEvent(new Event('change', { bubbles: true }));
                                  }}
                                >
                                  $50
                                </Button>
                              </div>
                              
                              <div className="projection-results">
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div className="text-center p-2 bg-red-900/20 rounded border border-red-500/20">
                                    <div className="text-red-300">Mínimo</div>
                                    <div className="text-red-400 font-bold">$0.05/dia</div>
                                    <div className="text-red-200 text-[10px]">0.5%</div>
                                  </div>
                                  <div className="text-center p-2 bg-green-900/20 rounded border border-green-500/20">
                                    <div className="text-green-300">Média</div>
                                    <div className="text-green-400 font-bold">$0.13/dia</div>
                                    <div className="text-green-200 text-[10px]">1.25%</div>
                                  </div>
                                  <div className="text-center p-2 bg-blue-900/20 rounded border border-blue-500/20">
                                    <div className="text-blue-300">Máximo</div>
                                    <div className="text-blue-400 font-bold">$0.20/dia</div>
                                    <div className="text-blue-200 text-[10px]">2%</div>
                                  </div>
                                </div>
                                <div className="mt-3 p-2 bg-yellow-900/20 rounded border border-yellow-500/20">
                                  <div className="text-yellow-300 text-[10px] font-medium mb-1">Projeção 30 dias:</div>
                                  <div className="flex justify-between text-[10px]">
                                    <span className="text-red-300">Min: $2</span>
                                    <span className="text-green-300">Méd: $4</span>
                                    <span className="text-blue-300">Máx: $6</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-amber-900/20 rounded p-2 border border-amber-500/20">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                                  <div className="text-[10px] text-amber-300">
                                    <strong>Importante:</strong> Ganhos baseados em arbitragem real. 
                                    Valores variam conforme oportunidades de mercado. 
                                    Não há garantia de ganhos fixos.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Advanced Arbitrage Trading Simulator - Only for available plans */}
                        {canInvest && <div className="mb-4 bg-gradient-to-br from-slate-900/20 via-blue-900/10 to-slate-900/20 rounded-xl p-5 border border-cyan-500/20 shadow-lg shadow-cyan-500/5 animate-fade-in backdrop-blur-sm">
                            {/* Header with live indicator */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                                    <TrendingUp className="w-4 h-4 text-white animate-pulse" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    AI Arbitrage Engine
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 animate-pulse">
                                      LIVE
                                    </span>
                                  </h4>
                                  <p className="text-xs text-cyan-300 flex items-center gap-1">
                                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                                    Scanning 15+ exchanges
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-cyan-300">Spread médio</div>
                              </div>
                            </div>

                            {/* Trading Chart Section */}
                            <div className="mb-4 bg-black/40 rounded-lg p-3 border border-cyan-500/20">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="text-xs font-semibold text-cyan-300">BTC/USDT Live Chart</div>
                                  <div className="flex items-center space-x-1">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-400">Real-time</span>
                                  </div>
                                </div>
                                <div className="text-xs text-cyan-300">
                                  ${(67000 + (Math.random() - 0.5) * 1000).toFixed(2)}
                                </div>
                              </div>
                              <div className="h-24 bg-gradient-to-r from-slate-800/20 to-blue-900/15 rounded border border-cyan-500/10 relative overflow-hidden">
                                {/* Wave animation overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-slide-in-right"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent animate-slide-in-right" style={{
                            animationDelay: '0.5s'
                          }}></div>
                                
                                {/* Animated wave bars */}
                                <div className="absolute inset-2 flex items-end justify-between">
                                  {Array.from({
                              length: 24
                            }, (_, i) => <div key={i} className="w-1 bg-gradient-to-t from-cyan-400/40 via-green-400/60 to-cyan-400/40 rounded-sm" style={{
                              height: `${30 + 40 * Math.sin((Date.now() / 500 + i * 0.3) % (2 * Math.PI))}%`,
                              animation: `fade-in 0.5s ease-out ${i * 0.05}s infinite alternate`,
                              transform: `scaleY(${1 + 0.3 * Math.sin((Date.now() / 300 + i * 0.5) % (2 * Math.PI))})`
                            }}></div>)}
                                </div>
                                
                                {/* Animated trading line with wave effect */}
                                <div className="absolute inset-0 flex items-center">
                                  <div className="w-full h-px bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 opacity-80 animate-pulse shadow-lg shadow-cyan-400/50"></div>
                                </div>
                                
                                {/* Floating particles effect */}
                                <div className="absolute top-2 left-4 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
                                <div className="absolute top-4 right-6 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-40" style={{
                            animationDelay: '0.5s'
                          }}></div>
                                <div className="absolute bottom-3 left-8 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-50" style={{
                            animationDelay: '1s'
                          }}></div>
                              </div>
                            </div>

                            {/* Exchange Comparison */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-lg p-3 border border-red-500/30 hover-scale">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-red-300">Binance</span>
                                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                                    BUY
                                  </span>
                                </div>
                                <div className="text-sm font-bold text-white">${(67000 - Math.random() * 80 - 20).toFixed(2)}</div>
                                <div className="text-xs text-red-300 flex items-center gap-1">
                                  <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
                                  Vol: {(Math.random() * 1000 + 500).toFixed(0)} BTC
                                </div>
                              </div>
                              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-3 border border-green-500/30 hover-scale">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-green-300">Coinbase Pro</span>
                                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">
                                    SELL
                                  </span>
                                </div>
                                <div className="text-sm font-bold text-white">${(67000 + Math.random() * 80 + 20).toFixed(2)}</div>
                                <div className="text-xs text-green-300 flex items-center gap-1">
                                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                                  Vol: {(Math.random() * 800 + 400).toFixed(0)} BTC
                                </div>
                              </div>
                            </div>

                            {/* Active Arbitrage Opportunities */}
                            <div className="space-y-2 mb-4">
                              <div className="text-xs font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                                Active Opportunities
                              </div>
                              
                              <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 rounded-lg p-2 border border-green-500/20 hover-scale animate-fade-in">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-medium text-white">BTC/USDT</span>
                                    <span className="text-xs text-green-300">Kraken → Bybit</span>
                                    <span className="text-xs bg-green-500/20 text-green-400 px-1 py-0.5 rounded text-[10px]">
                                      ACTIVE
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 rounded-lg p-2 border border-yellow-500/20 hover-scale animate-fade-in" style={{
                          animationDelay: '0.1s'
                        }}>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-medium text-white">ETH/USDT</span>
                                    <span className="text-xs text-yellow-300">Binance → OKX</span>
                                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded text-[10px]">
                                      PENDING
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/10 rounded-lg p-2 border border-blue-500/20 hover-scale animate-fade-in" style={{
                          animationDelay: '0.2s'
                        }}>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-medium text-white">ADA/USDT</span>
                                    <span className="text-xs text-blue-300">Coinbase → Huobi</span>
                                    <span className="text-xs bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded text-[10px]">
                                      SCANNING
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* AI Status Footer */}
                            <div className="flex items-center justify-between text-xs border-t border-cyan-500/20 pt-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                                <span className="text-cyan-300 animate-pulse">
                                  AI scanning: {new Date().toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-green-400 font-semibold animate-pulse">
                                  Next: {Math.floor(Math.random() * 15 + 5)}s
                                </span>
                                <div className="flex items-center space-x-1">
                                  <div className="w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
                                  <div className="w-1 h-1 bg-green-400 rounded-full animate-ping" style={{
                              animationDelay: '0.2s'
                            }}></div>
                                  <div className="w-1 h-1 bg-green-400 rounded-full animate-ping" style={{
                              animationDelay: '0.4s'
                            }}></div>
                                </div>
                              </div>
                            </div>
                          </div>}

                        <Button onClick={() => {
                      if (canInvest) {
                        setSelectedPlan(plan);
                        setShowInvestDialog(true);
                      }
                    }} disabled={isLocked} className={`w-full flex items-center justify-center gap-2 ${isLocked ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-slate-900 font-bold hover-scale'}`}>
                          {isLocked && <Lock className="w-4 h-4" />}
                          {canInvest ? 'Investir Agora' : plan.id === '2' ? 'Precisa de 10 indicações ativas' : plan.id === '3' ? 'Precisa de 40 indicações ativas' : `Precisa de ${plan.minimum_indicators} indicações`}
                        </Button>

                        {plan.max_investment_amount && <div className="text-xs text-center text-white">
                            Máximo: ${plan.max_investment_amount}
                          </div>}
                      </CardContent>
                    </Card>

                    {/* Trading Chart for this plan - Temporariamente removido */}
                    {/*
                     <PlanTradingChart 
                      planId={plan.id}
                      planName={plan.name}
                      dailyRate={plan.daily_rate}
                      isLocked={isLocked}
                      userInvestmentAmount={1000}
                     />
                     */}
                  </div>;
            })}
            </div>
          </div>}

        {activeTab === 'active' && <div className="space-y-6">
            {activeInvestments.length === 0 ? <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30">
                <CardContent className="p-12 text-center">
                  <Bot className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Nenhum Investimento Ativo
                  </h3>
                  <p className="text-slate-300 mb-6">
                    Comece a investir em nossos robôs de arbitragem!
                  </p>
                  <Button onClick={() => setActiveTab('plans')} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold">
                    Ver Planos Disponíveis
                  </Button>
                </CardContent>
              </Card> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeInvestments.map(investment => {
              const isHidden = hiddenAmounts.has(investment.id);
              const isProcessing = processingOperations.has(investment.id);
              const canExecuteOperation = investment.operations_completed < 2;
              const planName = getPlanDisplayName(investment.investment_plan_id);
              return <Card key={investment.id} className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30 hover:border-emerald-500/50 transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-yellow-400" />
                            <CardTitle className="text-white">{planName}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => toggleHideAmount(investment.id)} className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                              {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Badge className="bg-emerald-500/20 text-yellow-400 border-emerald-500/30">
                              {((plans.find(p => p.id === investment.investment_plan_id)?.daily_rate || 0.0033) * 100).toFixed(2)}% / dia
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-slate-400 text-sm">Valor Investido</p>
                            <p className="text-xl font-bold text-white">
                              {isHidden ? '•••••' : `$${investment.amount.toFixed(2)}`}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-400 text-sm">Total Ganhos</p>
                            <p className="text-xl font-bold text-yellow-400">
                              {isHidden ? '•••••' : `+$${investment.total_earned.toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Progresso Diário</span>
                            <span className="text-white">{investment.current_day_progress}%</span>
                          </div>
                          <Progress value={investment.current_day_progress} className="h-2 bg-slate-700" />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="space-y-1">
                            <p className="text-slate-400 text-xs">Operações</p>
                            <p className="text-white font-bold">
                              {investment.operations_completed}/2
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-400 text-xs">Dias Restantes</p>
                            <p className="text-white font-bold">{investment.days_remaining}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-400 text-xs">Hoje</p>
                            <p className="text-yellow-400 font-bold">
                              {isHidden ? '•••' : `$${investment.today_earnings.toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button onClick={() => executeArbitrage(investment)} disabled={!canExecuteOperation || isProcessing} className={`flex-1 ${canExecuteOperation ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-slate-900' : 'bg-slate-600 text-slate-400'} font-bold transition-all duration-300`}>
                            {isProcessing ? <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
                                Executando Arbitragem...
                              </> : canExecuteOperation ? <>
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                Executar Arbitragem
                              </> : <>
                                <Clock className="h-4 w-4 mr-2" />
                                Aguardar Reset (24h)
                              </>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>;
            })}
              </div>}
          </div>}

        {activeTab === 'history' && <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Histórico de Operações
              </h3>
              <p className="text-slate-300">
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
          </Card>}
      </div>

      {/* Investment Dialog */}
      <Dialog open={showInvestDialog} onOpenChange={setShowInvestDialog}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Investir em {selectedPlan?.id === '1' ? 'Robo 4.0' : selectedPlan?.id === '2' ? 'Robô 4.0.5' : selectedPlan?.id === '3' ? 'Robô 4.1.0' : selectedPlan?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4 p-4 bg-slate-700/50 rounded-lg">
              <h4 className="font-bold text-yellow-400 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Detalhes do Plano:
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-yellow-400" />
                  Taxa Diária: <span className="text-yellow-400 font-bold">até 2%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  Duração: <span className="text-white font-bold">{selectedPlan?.duration_days} dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-green-400" />
                  Mínimo: <span className="text-white font-bold">${selectedPlan?.minimum_amount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-400" />
                  Máximo: <span className="text-white font-bold">${selectedPlan?.max_investment_amount || 'Ilimitado'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-yellow-400 font-bold">
                Valor do Investimento
              </Label>
              <Input id="amount" type="number" placeholder="Digite o valor" value={selectedAmount} onChange={e => setSelectedAmount(e.target.value)} className="bg-slate-700 border-slate-600 text-white placeholder-slate-400" min={selectedPlan?.minimum_amount} max={selectedPlan?.max_investment_amount} />
            </div>
            
            {selectedAmount && selectedPlan && <div className="space-y-2 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                <h4 className="font-bold text-yellow-400">Projeção de Ganhos:</h4>
                <div className="text-sm space-y-1">
                  <div>Ganho Diário: <span className="text-yellow-400 font-bold">
                    Até ${(parseFloat(selectedAmount) * (selectedPlan.id === '1' ? 2 : selectedPlan.id === '2' ? 3 : selectedPlan.id === '3' ? 4 : 2) / 100).toFixed(2)}
                  </span></div>
                  <div>Ganho Total: <span className="text-yellow-400 font-bold">
                    Até ${(parseFloat(selectedAmount) * (selectedPlan.daily_rate * 100) * selectedPlan.duration_days / 100).toFixed(2)}
                  </span></div>
                  <div>ROI: <span className="text-yellow-400 font-bold">
                    Até {(selectedPlan.daily_rate * 100 * selectedPlan.duration_days).toFixed(1)}%
                  </span></div>
                </div>
              </div>}
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowInvestDialog(false)} className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                Cancelar
              </Button>
              <Button onClick={createInvestment} disabled={!selectedAmount || isLoading} className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 font-bold">
                {isLoading ? 'Criando...' : 'Confirmar Investimento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Simulação de Arbitragem */}
      <Dialog open={showArbitrageModal} onOpenChange={setShowArbitrageModal}>
        <DialogContent className="p-0 w-screen h-[100dvh] max-w-none max-h-none bg-gradient-to-br from-black via-zinc-900 to-black text-white border border-yellow-500/20 rounded-none">
          <div className="h-full flex flex-col">
            {/* Super Header - sticky */}
            <div className="sticky top-0 z-20 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20 px-4 sm:px-6 py-3">
              <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 border border-yellow-500/40">
                    <TrendingUp className="h-5 w-5 text-black" />
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-yellow-400">Arbitragem em Tempo Real</h3>
                    <p className="text-xs sm:text-sm text-yellow-300/70">Operando • {currentArbitrage.pair || '---'}</p>
                </div>
              </div>
                <div className="flex items-end gap-3">
              <div className="text-right">
                    <div className="text-xl sm:text-2xl font-extrabold text-yellow-400">+${currentArbitrage.currentProfit.toFixed(2)}</div>
                    <div className="text-[11px] sm:text-xs text-yellow-300/70">Lucro Atual</div>
              </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowArbitrageModal(false)}
                    className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/15"
                  >
                    Fechar
                  </Button>
            </div>
              </div>
            </div>
          
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-28 sm:pb-6 touch-pan-y overscroll-y-contain">
              {/* Primary Action - Above Progress */}
              {currentArbitrage.progress === 0 && (
                <div className="flex gap-3">
                  <Button
                    onClick={runArbitrageSimulation}
                    className="w-full h-12 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-base sm:text-lg shadow-[0_8px_25px_rgba(240,185,11,0.35)]"
                  >
                    <Play className="h-5 w-5 mr-2" /> Executar Operação de Arbitragem
                  </Button>
                </div>
              )}
            {/* Progress Bar com Ícones */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-white">Progresso da Operação</span>
                <span className="text-xl font-bold text-white">{currentArbitrage.progress}%</span>
              </div>
              <Progress value={currentArbitrage.progress} className="h-3 bg-slate-700" />
              <div className="flex justify-between">
                   <div className={`flex flex-col items-center ${currentArbitrage.stage === 'analyzing' || currentArbitrage.progress > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                     <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 ${currentArbitrage.stage === 'analyzing' || currentArbitrage.progress > 0 ? 'border-emerald-400 bg-emerald-400/20' : 'border-slate-500'}`}>✓</div>
                  <span className="text-xs">Análise</span>
                </div>
                <div className={`flex flex-col items-center ${['buying', 'transferring', 'selling', 'finalizing', 'completed'].includes(currentArbitrage.stage) ? 'text-blue-400' : 'text-slate-500'}`}>
                     <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 ${['buying', 'transferring', 'selling', 'finalizing', 'completed'].includes(currentArbitrage.stage) ? 'border-blue-400 bg-blue-400/20' : 'border-slate-500'}`}>💰</div>
                  <span className="text-xs">Compra</span>
                </div>
                <div className={`flex flex-col items-center ${['selling', 'finalizing', 'completed'].includes(currentArbitrage.stage) ? 'text-yellow-400' : 'text-slate-500'}`}>
                     <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 ${['selling', 'finalizing', 'completed'].includes(currentArbitrage.stage) ? 'border-yellow-400 bg-yellow-400/20' : 'border-slate-500'}`}>⏳</div>
                  <span className="text-xs">Aguardo</span>
                </div>
                   <div className={`flex flex-col items-center ${currentArbitrage.stage === 'completed' ? 'text-yellow-400' : 'text-slate-500'}`}>
                     <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 ${currentArbitrage.stage === 'completed' ? 'border-emerald-400 bg-emerald-400/20' : 'border-slate-500'}`}>✓</div>
                  <span className="text-xs">Venda</span>
                </div>
              </div>
            </div>

            {/* Main Section - Chart + Right Panel */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chart Section - 60% */}
                 <div className="lg:col-span-6">
                <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{currentArbitrage.pair} - Gráfico em Tempo Real</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                         <span className="text-sm text-yellow-400">LIVE</span>
                    </div>
                  </div>
                     <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={currentArbitrage.chartData}>
                           <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} domain={['dataMin - 50', 'dataMax + 50']} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                           <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }} />
                           <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#10b981' }} isAnimationActive animationDuration={800} animationEasing="linear" />
                      </LineChart>
                    </ResponsiveContainer>
                   </div>
                     {/* Existing orders list remains unchanged below */}
                     // ... existing code ...
                         </div>
                       </div>

                                 {/* Order Book + Trades - Desktop */}
                <div className="hidden md:block lg:col-span-3 space-y-4">
                  {/* Order Book Box */}
                  <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-yellow-400 font-bold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Order Book
                      </h4>
                      <span className="text-xs text-yellow-300/70">{currentArbitrage.exchanges.join(' ⚡ ')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-emerald-400 font-bold mb-2 flex items-center gap-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          Compras (Bids)
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-500/50 scrollbar-track-transparent">
                          {orderBook.buys.map((o, idx) => (
                            <div key={o.id} className={`flex justify-between p-1.5 rounded transition-all duration-300 ${o.status === 'filled' ? 'bg-emerald-500/20 ring-1 ring-emerald-500/40 text-emerald-200' : 'text-emerald-300/90 hover:bg-emerald-500/10'} ${idx < 2 ? 'animate-pulse' : ''}`}>
                              <span className="font-mono">${o.price.toFixed(4)}</span>
                              <span className="font-mono">{o.qty.toFixed(4)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-red-400 font-bold mb-2 flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          Vendas (Asks)
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-red-500/50 scrollbar-track-transparent">
                          {orderBook.sells.map((o, idx) => (
                            <div key={o.id} className={`flex justify-between p-1.5 rounded transition-all duration-300 ${o.status === 'filled' ? 'bg-red-500/20 ring-1 ring-red-500/40 text-red-200' : 'text-red-300/90 hover:bg-red-500/10'} ${idx < 2 ? 'animate-pulse' : ''}`}>
                              <span className="font-mono">${o.price.toFixed(4)}</span>
                              <span className="font-mono">{o.qty.toFixed(4)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                                     {/* Trades Recentes Box */}
                  <div className="bg-gradient-to-br from-zinc-900/90 to-black/90 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-yellow-400 font-bold flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Trades Recentes
                      </h4>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-yellow-300/70">${tickerPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-yellow-500/50 scrollbar-track-transparent">
                      <div className="grid grid-cols-5 gap-2 text-xs text-yellow-300/70 font-bold mb-2 pb-1 border-b border-yellow-500/20">
                        <span>Lado</span>
                        <span>Preço</span>
                        <span>Qtd</span>
                        <span>Exchange</span>
                        <span>Hora</span>
                      </div>
                      {recentTrades.map((t, idx) => (
                        <div key={t.id} className={`grid grid-cols-5 gap-2 p-1.5 rounded transition-all duration-300 ${idx < 3 ? 'animate-pulse bg-yellow-500/10' : 'hover:bg-yellow-500/5'}`}>
                          <span className={`${t.side === 'buy' ? 'text-emerald-400' : 'text-red-400'} font-bold font-mono`}>{t.side.toUpperCase()}</span>
                          <span className="text-white font-mono">${t.price.toFixed(4)}</span>
                          <span className="text-slate-300 font-mono">{t.qty.toFixed(4)}</span>
                          <span className="text-slate-400 text-xs">{t.exchange}</span>
                          <span className="text-slate-500 text-xs">{t.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                 {/* Right KPIs */}
                 <div className="lg:col-span-3 space-y-4">
                {/* Operação Atual */}
                <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-lg font-bold text-white">Operação Atual</h4>
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Par:</span>
                      <span className="text-white font-semibold">{currentArbitrage.pair}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-blue-400 font-semibold">
                        {currentArbitrage.stage === 'analyzing' && 'Aguardando'}
                        {currentArbitrage.stage === 'opportunity' && 'Analisando'}
                        {currentArbitrage.stage === 'calculating' && 'Calculando'}
                        {currentArbitrage.stage === 'buying' && 'Comprando'}
                        {currentArbitrage.stage === 'transferring' && 'Transferindo'}
                        {currentArbitrage.stage === 'selling' && 'Vendendo'}
                        {currentArbitrage.stage === 'finalizing' && 'Finalizando'}
                        {currentArbitrage.stage === 'completed' && 'Concluído'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Preço Compra:</span>
                      <span className="text-white font-semibold">${currentArbitrage.buyPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Meta Venda:</span>
                         <span className="text-yellow-400 font-semibold">${currentArbitrage.sellPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Lucro em Tempo Real */}
                <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-white">Lucro em Tempo Real</h4>
                       <TrendingUp className="h-4 w-4 text-yellow-400" />
                  </div>
                     <div className="text-3xl font-bold text-yellow-400 mb-1">
                    +${currentArbitrage.currentProfit.toFixed(2)}
                  </div>
                     <div className="text-xs text-yellow-300/70">Taxas: ${feesAccum.toFixed(2)} • PnL não-realizado: ${unrealizedPnl.toFixed(2)}</div>
                </div>

                {/* Informações do Investimento */}
                <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-4">Informações do Investimento</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capital:</span>
                      <span className="text-white font-semibold">${currentArbitrage.investment?.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Robô:</span>
                      <span className="text-white font-semibold">Robô de Arbitragem</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Operações Hoje:</span>
                      <span className="text-white font-semibold">{currentArbitrage.investment?.operations_completed || 0}/2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer to avoid content under mobile fixed bar */}
            <div className="md:hidden h-6" />

            {/* Action Buttons - Desktop */}
            <div className="hidden md:flex gap-3">
              {currentArbitrage.stage !== 'completed' ? (
                <Button onClick={runArbitrageSimulation} className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-lg py-3" disabled={currentArbitrage.progress > 0}>
                  {currentArbitrage.progress === 0 ? (<><Play className="h-5 w-5 mr-2" />Iniciar Operação de Arbitragem</>) : (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>Operação em Andamento...</>)}
                </Button>
              ) : (
                <Button onClick={() => setShowArbitrageModal(false)} className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-lg py-3">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Finalizar Operação
                </Button>
              )}
            </div>

                          {/* Mobile Trading Panel - Bottom Sheet */}
              <div className={`md:hidden fixed left-0 right-0 bottom-0 z-[11000] transition-transform duration-500 ease-out ${isOpsSheetOpen ? 'translate-y-0' : 'translate-y-[75%]'} bg-gradient-to-t from-black/98 via-zinc-900/95 to-zinc-900/90 border-t border-yellow-500/30 rounded-t-2xl shadow-[0_-20px_50px_rgba(240,185,11,0.15)]`}>
                {/* Drag Handle */}
                <div className="flex items-center justify-center px-4 pt-3 pb-2">
                  <div 
                    className="h-1.5 w-16 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 cursor-pointer hover:scale-110 transition-transform" 
                    onClick={() => setIsOpsSheetOpen(!isOpsSheetOpen)}
                  />
                </div>
                
                <div className="px-4 pb-[calc(env(safe-area-inset-bottom,0)+80px)] max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-yellow-400 font-bold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Operações em Tempo Real
                    </h4>
                    <button 
                      onClick={() => setIsOpsSheetOpen(false)} 
                      className="text-xs text-yellow-300/70 hover:text-yellow-400 transition-colors"
                    >
                      Minimizar
                    </button>
                  </div>
                  
                  {/* Mobile Order Book */}
                  <div className="bg-zinc-900/60 rounded-lg p-3 mb-4 border border-yellow-500/20">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-emerald-400 font-bold mb-2 flex items-center gap-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          Bids
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/50 scrollbar-track-transparent">
                          {orderBook.buys.slice(0, 8).map((o, idx) => (
                            <div key={o.id} className={`flex justify-between p-1 rounded transition-all ${o.status === 'filled' ? 'bg-emerald-500/20 text-emerald-200' : 'text-emerald-300/90'} ${idx < 2 ? 'animate-pulse' : ''}`}>
                              <span className="font-mono text-xs">${o.price.toFixed(4)}</span>
                              <span className="font-mono text-xs">{o.qty.toFixed(3)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-red-400 font-bold mb-2 flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          Asks
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/50 scrollbar-track-transparent">
                          {orderBook.sells.slice(0, 8).map((o, idx) => (
                            <div key={o.id} className={`flex justify-between p-1 rounded transition-all ${o.status === 'filled' ? 'bg-red-500/20 text-red-200' : 'text-red-300/90'} ${idx < 2 ? 'animate-pulse' : ''}`}>
                              <span className="font-mono text-xs">${o.price.toFixed(4)}</span>
                              <span className="font-mono text-xs">{o.qty.toFixed(3)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Trades */}
                  <div className="bg-zinc-900/60 rounded-lg p-3 border border-yellow-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-yellow-400 font-bold flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Trades
                      </h5>
                      <span className="text-xs text-yellow-300/70">${tickerPrice.toFixed(2)}</span>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500/50 scrollbar-track-transparent">
                      <div className="grid grid-cols-4 gap-2 text-xs text-yellow-300/70 font-bold mb-2 pb-1 border-b border-yellow-500/20">
                        <span>Lado</span>
                        <span>Preço</span>
                        <span>Qtd</span>
                        <span>Exchange</span>
                      </div>
                      {recentTrades.slice(0, 10).map((t, idx) => (
                        <div key={t.id} className={`grid grid-cols-4 gap-2 p-1 rounded transition-all ${idx < 3 ? 'animate-pulse bg-yellow-500/10' : 'hover:bg-yellow-500/5'}`}>
                          <span className={`${t.side === 'buy' ? 'text-emerald-400' : 'text-red-400'} font-bold font-mono text-xs`}>{t.side.toUpperCase()}</span>
                          <span className="text-white font-mono text-xs">${t.price.toFixed(4)}</span>
                          <span className="text-slate-300 font-mono text-xs">{t.qty.toFixed(3)}</span>
                          <span className="text-slate-400 text-xs">{t.exchange.slice(0, 3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

                          {/* Fixed Action Bar - Mobile */}
              <div className="md:hidden fixed left-0 right-0 bottom-0 z-[10000] bg-gradient-to-t from-black/95 via-zinc-900/90 to-transparent border-t border-yellow-500/20 px-3 pb-[calc(env(safe-area-inset-bottom,0)+12px)] pt-3">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsOpsSheetOpen(!isOpsSheetOpen)}
                    variant="outline"
                    className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/15"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  {currentArbitrage.stage !== 'completed' ? (
                    <Button onClick={runArbitrageSimulation} className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-base" disabled={currentArbitrage.progress > 0}>
                      {currentArbitrage.progress === 0 ? (<><Play className="h-4 w-4 mr-2" />Executar</>) : (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>Operando...</>)}
                    </Button>
                  ) : (
                    <Button onClick={() => setShowArbitrageModal(false)} className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-base">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Finalizar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
  } catch (error) {
    console.error('🚨 Erro em TradingInvestments:', error);
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Erro na Página de Investimentos</h1>
          <p className="text-slate-300 mb-4">Ocorreu um erro ao carregar a página.</p>
          <button onClick={() => window.location.reload()} className="bg-blue-500 text-white px-4 py-2 rounded">
            Recarregar Página
          </button>
        </div>
      </div>;
  }
};
export default TradingInvestments;

















import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  Calendar,
  PiggyBank,
  Plus,
  Bot,
  Timer,
  Play,
  ArrowUpDown,
  Activity,
  Zap,
  Sparkles,
  BarChart3,
  CreditCard,
  Wallet,
  ChevronRight,
  Shield,
  TrendingDown,
  CheckCircle,
  PlayCircle,
  Users,
  ChevronDown,
  ChevronUp,
  Lock,
  Crown,
  Settings,
  User,
  Key,
  LogOut,
  Menu
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Tooltip
} from "recharts";
import TradingSimulator from "@/components/TradingSimulator";
import { TradingHistory } from "@/components/TradingHistory";
import { useNavigate } from "react-router-dom";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { useCurrency } from "@/hooks/useCurrency";

interface Investment {
  id: string;
  name: string;
  dailyRate: number;
  minimumAmount: number;
  maximumAmount: number;
  duration: number; // dias
  description: string;
  status: "active" | "inactive";
  operations?: number; // operações por dia
  requiredReferrals?: number; // indicações necessárias
  contractFee?: number; // taxa do contrato
}

interface UserInvestment {
  id: string;
  investmentId: string;
  investmentName: string;
  amount: number;
  dailyRate: number;
  startDate: string;
  endDate: string;
  totalEarned: number;
  status: "active" | "completed";
  daysRemaining: number;
  currentDayProgress: number; // 0-100 (% do dia atual)
  todayEarnings: number; // ganhos do dia atual
  dailyTarget: number; // meta de ganho diário
  currentOperation?: {
    pair: string;
    buyPrice: number;
    sellPrice: number;
    profit: number;
    progress: number; // 0-100
    timeRemaining: number; // segundos
  };
  operationsCompleted: number;
  totalOperations: number;
}

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [activeTab, setActiveTab] = useState<'investments' | 'history'>('investments');
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const { formatUSD, formatBRL } = useCurrency();
  const [chartData, setChartData] = useState<{date: string; value: number}[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [investmentPlans, setInvestmentPlans] = useState<{
    id: string;
    name: string;
    daily_rate: number;
    minimum_amount: number;
    maximum_amount: number;
    duration_days: number;
    description: string;
    status: string;
    required_referrals?: number;
  }[]>([]);
  const [isTradingSimulatorOpen, setIsTradingSimulatorOpen] = useState(false);
  const [selectedInvestmentForTrading, setSelectedInvestmentForTrading] = useState<UserInvestment | null>(null);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [sliderProgress, setSliderProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [showExecutionPopup, setShowExecutionPopup] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionStep, setExecutionStep] = useState('');


  const [showActivePlans, setShowActivePlans] = useState(false);
  const [dailyResetTimers, setDailyResetTimers] = useState<Record<string, number>>({});
  const [timerIntervals, setTimerIntervals] = useState<Record<string, NodeJS.Timeout>>({});

  const [showOperationHistory, setShowOperationHistory] = useState(false);
  const [operationHistory, setOperationHistory] = useState<Array<{
    id: string;
    investmentId: string;
    investmentName: string;
    timestamp: string;
    operationType: string;
    pair: string;
    amount: number;
    profit: number;
    spread: number;
    exchanges: string[];
    duration: number;
    buyPrice?: number;
    sellPrice?: number;
    details?: {
      buyExchange: string;
      sellExchange: string;
      spreadPercent: number;
      volumeTraded: number;
    };
  }>>([]);
  
  // Estado para controlar a visibilidade das tabelas de cada plano
  const [hiddenTables, setHiddenTables] = useState<Record<string, boolean>>({});
  
  // Estados para o sistema de bloqueio de planos
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedPlanInfo, setBlockedPlanInfo] = useState<{
    planId: string, 
    planName: string, 
    requiredPlan: string, 
    potentialEarnings: string,
    missionRequirements?: any,
    missionProgress?: any
  } | null>(null);
  
  // Estados para o menu de usuário
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Função para alternar a visibilidade da tabela
  const toggleTableVisibility = (planId: string) => {
    setHiddenTables(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };
  
  // Função para verificar se um plano pode ser ativado
  const canActivatePlan = (planId: string): boolean => {
    const userActivePlans = userInvestments.filter(inv => inv.status === 'active');
    const userCompletedPlans = userInvestments.filter(inv => inv.status === 'completed');
    
    // Verificar se tem o plano anterior ativo OU concluído
    if (planId === 'robo-4-0-0') {
      return true; // Sempre disponível
    } else if (planId === 'robo-4-0-5') {
      const hasRobo400 = userActivePlans.some(inv => inv.investmentName.includes('4.0.0')) ||
                        userCompletedPlans.some(inv => inv.investmentName.includes('4.0.0'));
      const hasRequiredReferrals = referralCount >= 10; // 10 indicações necessárias
      return hasRobo400 && hasRequiredReferrals;
    } else if (planId === 'robo-4-1-0') {
      const hasRobo405 = userActivePlans.some(inv => inv.investmentName.includes('4.0.5')) ||
                        userCompletedPlans.some(inv => inv.investmentName.includes('4.0.5'));
      const hasRequiredReferrals = referralCount >= 20; // 20 indicações necessárias
      return hasRobo405 && hasRequiredReferrals;
    }
    
    return false;
  };
  
  // Função para obter os requisitos de missão de um plano
  const getMissionRequirements = (planId: string) => {
    const requirements = {
      'robo-4-0-0': {
        title: 'Missão Iniciante',
        description: 'Complete o Robô 4.0.0',
        tasks: [
          'Ativar o Robô 4.0.0',
          'Investir mínimo $10 USDT',
          'Gerar lucro de $5 USDT',
          'Completar 40 dias de operação'
        ],
        reward: 'Desbloqueia Robô 4.0.5'
      },
      'robo-4-0-5': {
        title: 'Missão Intermediária',
        description: 'Complete o Robô 4.0.5',
        tasks: [
          'Ativar o Robô 4.0.5',
          'Investir mínimo $20 USDT',
          'Gerar lucro de $10 USDT',
          'Completar 40 dias de operação',
          'Pagar taxa de contrato $10 USDT'
        ],
        reward: 'Desbloqueia Robô 4.1.0'
      },
      'robo-4-1-0': {
        title: 'Missão Premium',
        description: 'Complete o Robô 4.1.0',
        tasks: [
          'Ativar o Robô 4.1.0',
          'Investir mínimo $500 USDT',
          'Gerar lucro de $50 USDT',
          'Completar 40 dias de operação',
          'Pagar taxa de contrato $10 USDT'
        ],
        reward: 'Acesso total ao sistema'
      }
    };
    return requirements[planId as keyof typeof requirements];
  };
  
  // Função para obter o progresso da missão
  const getMissionProgress = (planId: string) => {
    const userActivePlans = userInvestments.filter(inv => inv.status === 'active');
    const userCompletedPlans = userInvestments.filter(inv => inv.status === 'completed');
    
    if (planId === 'robo-4-0-0') {
      const plan = userActivePlans.find(inv => inv.investmentName.includes('4.0.0')) ||
                  userCompletedPlans.find(inv => inv.investmentName.includes('4.0.0'));
      
      if (!plan) return { completed: 0, total: 4, progress: 0 };
      
      const tasks = [
        plan.status === 'active' || plan.status === 'completed', // Ativado
        plan.amount >= 10, // Investimento mínimo
        plan.totalEarned >= 5, // Lucro mínimo
        plan.daysRemaining <= 0 || plan.status === 'completed' // 40 dias completos
      ];
      
      const completed = tasks.filter(Boolean).length;
      return { completed, total: 4, progress: (completed / 4) * 100 };
      
    } else if (planId === 'robo-4-0-5') {
      const plan = userActivePlans.find(inv => inv.investmentName.includes('4.0.5')) ||
                  userCompletedPlans.find(inv => inv.investmentName.includes('4.0.5'));
      
      if (!plan) return { completed: 0, total: 5, progress: 0 };
      
      const tasks = [
        plan.status === 'active' || plan.status === 'completed', // Ativado
        plan.amount >= 20, // Investimento mínimo
        plan.totalEarned >= 10, // Lucro mínimo
        plan.daysRemaining <= 0 || plan.status === 'completed', // 40 dias completos
        true // Taxa de contrato (assumindo que foi paga se o plano está ativo)
      ];
      
      const completed = tasks.filter(Boolean).length;
      return { completed, total: 5, progress: (completed / 5) * 100 };
      
    } else if (planId === 'robo-4-1-0') {
      const plan = userActivePlans.find(inv => inv.investmentName.includes('4.1.0')) ||
                  userCompletedPlans.find(inv => inv.investmentName.includes('4.1.0'));
      
      if (!plan) return { completed: 0, total: 5, progress: 0 };
      
      const tasks = [
        plan.status === 'active' || plan.status === 'completed', // Ativado
        plan.amount >= 500, // Investimento mínimo
        plan.totalEarned >= 50, // Lucro mínimo
        plan.daysRemaining <= 0 || plan.status === 'completed', // 40 dias completos
        true // Taxa de contrato (assumindo que foi paga se o plano está ativo)
      ];
      
      const completed = tasks.filter(Boolean).length;
      return { completed, total: 5, progress: (completed / 5) * 100 };
    }
    
    return { completed: 0, total: 0, progress: 0 };
  };
  
  // Função para calcular ganhos potenciais
  const getPotentialEarnings = (planId: string): string => {
    const earnings = {
      'robo-4-0-0': 'até $5.00/dia com $200',
      'robo-4-0-5': 'até $6.00/dia com $200',
      'robo-4-1-0': 'até $8.00/dia com $200'
    };
    return earnings[planId as keyof typeof earnings] || '';
  };
  
  // Dados das tabelas de investimentos para cada plano (10-200 dólares)
  const investmentTables = {
    'robo-4-0-0': [
      { day: 1, investment: 10, profit: 0.20, total: 10.20, status: 'completed' },
      { day: 2, investment: 20, profit: 0.40, total: 20.40, status: 'completed' },
      { day: 3, investment: 30, profit: 0.60, total: 30.60, status: 'completed' },
      { day: 4, investment: 40, profit: 0.80, total: 40.80, status: 'completed' },
      { day: 5, investment: 50, profit: 1.00, total: 51.00, status: 'completed' },
      { day: 6, investment: 60, profit: 1.20, total: 61.20, status: 'completed' },
      { day: 7, investment: 70, profit: 1.40, total: 71.40, status: 'completed' },
      { day: 8, investment: 80, profit: 1.60, total: 81.60, status: 'completed' },
      { day: 9, investment: 90, profit: 1.80, total: 91.80, status: 'completed' },
      { day: 10, investment: 100, profit: 2.00, total: 102.00, status: 'completed' },
      { day: 11, investment: 150, profit: 3.00, total: 153.00, status: 'completed' },
      { day: 12, investment: 200, profit: 4.00, total: 204.00, status: 'completed' },
      { day: 13, investment: 204.00, profit: 4.08, total: 208.08, status: 'completed' },
      { day: 14, investment: 208.08, profit: 4.16, total: 212.24, status: 'completed' },
      { day: 15, investment: 212.24, profit: 4.24, total: 216.48, status: 'completed' },
      { day: 16, investment: 216.48, profit: 4.33, total: 220.81, status: 'completed' },
      { day: 17, investment: 220.81, profit: 4.42, total: 225.23, status: 'completed' },
      { day: 18, investment: 225.23, profit: 4.50, total: 229.73, status: 'completed' },
      { day: 19, investment: 229.73, profit: 4.59, total: 234.32, status: 'completed' },
      { day: 20, investment: 234.32, profit: 4.69, total: 239.01, status: 'completed' },
      { day: 21, investment: 239.01, profit: 4.78, total: 243.79, status: 'completed' },
      { day: 22, investment: 243.79, profit: 4.88, total: 248.67, status: 'completed' },
      { day: 23, investment: 248.67, profit: 4.97, total: 253.64, status: 'completed' },
      { day: 24, investment: 253.64, profit: 5.07, total: 258.71, status: 'completed' },
      { day: 25, investment: 258.71, profit: 5.17, total: 263.88, status: 'completed' },
      { day: 26, investment: 263.88, profit: 5.28, total: 269.16, status: 'completed' },
      { day: 27, investment: 269.16, profit: 5.38, total: 274.54, status: 'completed' },
      { day: 28, investment: 274.54, profit: 5.49, total: 280.03, status: 'completed' },
      { day: 29, investment: 280.03, profit: 5.60, total: 285.63, status: 'completed' },
      { day: 30, investment: 285.63, profit: 5.71, total: 291.34, status: 'completed' },
      { day: 31, investment: 291.34, profit: 5.83, total: 297.17, status: 'completed' },
      { day: 32, investment: 297.17, profit: 5.94, total: 303.11, status: 'completed' },
      { day: 33, investment: 303.11, profit: 6.06, total: 309.17, status: 'completed' },
      { day: 34, investment: 309.17, profit: 6.18, total: 315.35, status: 'completed' },
      { day: 35, investment: 315.35, profit: 6.31, total: 321.66, status: 'completed' },
      { day: 36, investment: 321.66, profit: 6.43, total: 328.09, status: 'completed' },
      { day: 37, investment: 328.09, profit: 6.56, total: 334.65, status: 'completed' },
      { day: 38, investment: 334.65, profit: 6.69, total: 341.34, status: 'completed' },
      { day: 39, investment: 341.34, profit: 6.83, total: 348.17, status: 'completed' },
      { day: 40, investment: 348.17, profit: 6.96, total: 355.13, status: 'active' }
    ],
    'robo-4-0-5': [
      { day: 1, investment: 10, profit: 0.25, total: 10.25, status: 'completed' },
      { day: 2, investment: 20, profit: 0.50, total: 20.50, status: 'completed' },
      { day: 3, investment: 30, profit: 0.75, total: 30.75, status: 'completed' },
      { day: 4, investment: 40, profit: 1.00, total: 41.00, status: 'completed' },
      { day: 5, investment: 50, profit: 1.25, total: 51.25, status: 'completed' },
      { day: 6, investment: 60, profit: 1.50, total: 61.50, status: 'completed' },
      { day: 7, investment: 70, profit: 1.75, total: 71.75, status: 'completed' },
      { day: 8, investment: 80, profit: 2.00, total: 82.00, status: 'completed' },
      { day: 9, investment: 90, profit: 2.25, total: 92.25, status: 'completed' },
      { day: 10, investment: 100, profit: 2.50, total: 102.50, status: 'completed' },
      { day: 11, investment: 150, profit: 3.75, total: 153.75, status: 'completed' },
      { day: 12, investment: 200, profit: 5.00, total: 205.00, status: 'completed' },
      { day: 13, investment: 205.00, profit: 5.13, total: 210.13, status: 'completed' },
      { day: 14, investment: 210.13, profit: 5.25, total: 215.38, status: 'completed' },
      { day: 15, investment: 215.38, profit: 5.38, total: 220.76, status: 'completed' },
      { day: 16, investment: 220.76, profit: 5.52, total: 226.28, status: 'completed' },
      { day: 17, investment: 226.28, profit: 5.66, total: 231.94, status: 'completed' },
      { day: 18, investment: 231.94, profit: 5.80, total: 237.74, status: 'completed' },
      { day: 19, investment: 237.74, profit: 5.94, total: 243.68, status: 'completed' },
      { day: 20, investment: 243.68, profit: 6.09, total: 249.77, status: 'completed' },
      { day: 21, investment: 249.77, profit: 6.24, total: 256.01, status: 'completed' },
      { day: 22, investment: 256.01, profit: 6.40, total: 262.41, status: 'completed' },
      { day: 23, investment: 262.41, profit: 6.56, total: 268.97, status: 'completed' },
      { day: 24, investment: 268.97, profit: 6.72, total: 275.69, status: 'completed' },
      { day: 25, investment: 275.69, profit: 6.89, total: 282.58, status: 'completed' },
      { day: 26, investment: 282.58, profit: 7.06, total: 289.64, status: 'completed' },
      { day: 27, investment: 289.64, profit: 7.24, total: 296.88, status: 'completed' },
      { day: 28, investment: 296.88, profit: 7.42, total: 304.30, status: 'completed' },
      { day: 29, investment: 304.30, profit: 7.61, total: 311.91, status: 'completed' },
      { day: 30, investment: 311.91, profit: 7.80, total: 319.71, status: 'completed' },
      { day: 31, investment: 319.71, profit: 7.99, total: 327.70, status: 'completed' },
      { day: 32, investment: 327.70, profit: 8.19, total: 335.89, status: 'completed' },
      { day: 33, investment: 335.89, profit: 8.40, total: 344.29, status: 'completed' },
      { day: 34, investment: 344.29, profit: 8.61, total: 352.90, status: 'completed' },
      { day: 35, investment: 352.90, profit: 8.82, total: 361.72, status: 'completed' },
      { day: 36, investment: 361.72, profit: 9.04, total: 370.76, status: 'completed' },
      { day: 37, investment: 370.76, profit: 9.27, total: 380.03, status: 'completed' },
      { day: 38, investment: 380.03, profit: 9.50, total: 389.53, status: 'completed' },
      { day: 39, investment: 389.53, profit: 9.74, total: 399.27, status: 'completed' },
      { day: 40, investment: 399.27, profit: 9.98, total: 409.25, status: 'active' }
    ],
    'robo-4-1-0': [
      { day: 1, investment: 10, profit: 0.30, total: 10.30, status: 'completed' },
      { day: 2, investment: 20, profit: 0.60, total: 20.60, status: 'completed' },
      { day: 3, investment: 30, profit: 0.90, total: 30.90, status: 'completed' },
      { day: 4, investment: 40, profit: 1.20, total: 41.20, status: 'completed' },
      { day: 5, investment: 50, profit: 1.50, total: 51.50, status: 'completed' },
      { day: 6, investment: 60, profit: 1.80, total: 61.80, status: 'completed' },
      { day: 7, investment: 70, profit: 2.10, total: 72.10, status: 'completed' },
      { day: 8, investment: 80, profit: 2.40, total: 82.40, status: 'completed' },
      { day: 9, investment: 90, profit: 2.70, total: 92.70, status: 'completed' },
      { day: 10, investment: 100, profit: 3.00, total: 103.00, status: 'completed' },
      { day: 11, investment: 150, profit: 4.50, total: 154.50, status: 'completed' },
      { day: 12, investment: 200, profit: 6.00, total: 206.00, status: 'completed' },
      { day: 13, investment: 206.00, profit: 6.18, total: 212.18, status: 'completed' },
      { day: 14, investment: 212.18, profit: 6.37, total: 218.55, status: 'completed' },
      { day: 15, investment: 218.55, profit: 6.56, total: 225.11, status: 'completed' },
      { day: 16, investment: 225.11, profit: 6.75, total: 231.86, status: 'completed' },
      { day: 17, investment: 231.86, profit: 6.96, total: 238.82, status: 'completed' },
      { day: 18, investment: 238.82, profit: 7.16, total: 245.98, status: 'completed' },
      { day: 19, investment: 245.98, profit: 7.38, total: 253.36, status: 'completed' },
      { day: 20, investment: 253.36, profit: 7.60, total: 260.96, status: 'completed' },
      { day: 21, investment: 260.96, profit: 7.83, total: 268.79, status: 'completed' },
      { day: 22, investment: 268.79, profit: 8.06, total: 276.85, status: 'completed' },
      { day: 23, investment: 276.85, profit: 8.31, total: 285.16, status: 'completed' },
      { day: 24, investment: 285.16, profit: 8.55, total: 293.71, status: 'completed' },
      { day: 25, investment: 293.71, profit: 8.81, total: 302.52, status: 'completed' },
      { day: 26, investment: 302.52, profit: 9.08, total: 311.60, status: 'completed' },
      { day: 27, investment: 311.60, profit: 9.35, total: 320.95, status: 'completed' },
      { day: 28, investment: 320.95, profit: 9.63, total: 330.58, status: 'completed' },
      { day: 29, investment: 330.58, profit: 9.92, total: 340.50, status: 'completed' },
      { day: 30, investment: 340.50, profit: 10.22, total: 350.72, status: 'completed' },
      { day: 31, investment: 350.72, profit: 10.52, total: 361.24, status: 'completed' },
      { day: 32, investment: 361.24, profit: 10.84, total: 372.08, status: 'completed' },
      { day: 33, investment: 372.08, profit: 11.16, total: 383.24, status: 'completed' },
      { day: 34, investment: 383.24, profit: 11.50, total: 394.74, status: 'completed' },
      { day: 35, investment: 394.74, profit: 11.84, total: 406.58, status: 'completed' },
      { day: 36, investment: 406.58, profit: 12.20, total: 418.78, status: 'completed' },
      { day: 37, investment: 418.78, profit: 12.56, total: 431.34, status: 'completed' },
      { day: 38, investment: 431.34, profit: 12.94, total: 444.28, status: 'completed' },
      { day: 39, investment: 444.28, profit: 13.33, total: 457.61, status: 'completed' },
      { day: 40, investment: 457.61, profit: 13.73, total: 471.34, status: 'active' }
    ]
  };
  
  // Definir requisitos de indicações para cada nível
  const referralRequirements = {
    iniciante: 0,     // Robô 4.0.0 - Nenhuma indicação
    intermediario: 10, // Robô 4.0.5 - 10 indicações
    premium: 20       // Robô 4.1.0 - 20 indicações
  };
  
  // Definir informações dos planos
  const planDetails = {
    '4.0.0': {
      name: '🤖 Robô 4.0.0',
      dailyRate: 2.0,
      minimumAmount: 10,
      referralsRequired: 0,
      contractFee: 0,
      description: '1 iniciação de operação - Taxa diária: 2,0%'
    },
    '4.0.5': {
      name: '🚀 Robô 4.0.5',
      dailyRate: 2.0,
      minimumAmount: 20,
      referralsRequired: 10,
      contractFee: 10,
      description: 'Indicações necessárias: 10 ativos - Taxa diária: 2,0% - Investimento mínimo: $20 USDT - Extra: precisa assinar contrato e pagar $10 USDT'
    },
    '4.1.0': {
      name: '💎 Robô 4.1.0',
      dailyRate: 3.0,
      minimumAmount: 500,
      referralsRequired: 20,
      contractFee: 10,
      description: 'Indicações necessárias: 20 ativos - Taxa diária: 3,0% - Investimento mínimo: $500 USDT - Extra: precisa assinar contrato e pagar $10 USDT'
    }
  };
  
  // Calcular nível atual baseado nas indicações
  const getCurrentLevelFromReferrals = () => {
    if (referralCount >= referralRequirements.premium) return 2; // Premium
    if (referralCount >= referralRequirements.intermediario) return 1; // Intermediário
    return 0; // Iniciante
  };
  
  // Calcular progresso para o próximo nível
  const getProgressToNextLevel = () => {
    const currentLevel = getCurrentLevelFromReferrals();
    if (currentLevel === 2) return 100; // Já está no máximo
    
    const nextLevelRequirement = currentLevel === 0 ? referralRequirements.intermediario : referralRequirements.premium;
    const currentLevelRequirement = currentLevel === 0 ? referralRequirements.iniciante : referralRequirements.intermediario;
    
    const progress = ((referralCount - currentLevelRequirement) / (nextLevelRequirement - currentLevelRequirement)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };
  
  // Calcular quantas indicações faltam para o próximo nível
  const getReferralsNeededForNextLevel = () => {
    const currentLevel = getCurrentLevelFromReferrals();
    if (currentLevel === 2) return 0; // Já está no máximo
    
    const nextLevelRequirement = currentLevel === 0 ? referralRequirements.intermediario : referralRequirements.premium;
    return Math.max(0, nextLevelRequirement - referralCount);
  };
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Função para calcular o lucro do dia atual
  const calculateTodayEarnings = (investment: UserInvestment) => {
    // Cada operação rende 1% (metade da taxa diária de 2%)
    const operationRate = 1.0;
    const earningsPerOperation = (investment.amount * operationRate) / 100;
    
    // Lucro do dia = operações realizadas hoje × ganho por operação
    const todayEarnings = earningsPerOperation * investment.operationsCompleted;
    return todayEarnings;
  };

  // Função para ativar um plano
  const handleActivatePlan = (planId: string) => {
    console.log('Ativando plano:', planId);
    
          // Verificar se o plano pode ser ativado
      if (!canActivatePlan(planId)) {
        const requiredPlanId = planId === 'robo-4-0-5' ? 'robo-4-0-0' : planId === 'robo-4-1-0' ? 'robo-4-0-5' : '';
        const missionRequirements = getMissionRequirements(requiredPlanId);
        const missionProgress = getMissionProgress(requiredPlanId);
        
        setBlockedPlanInfo({
          planId,
          planName: planId === 'robo-4-0-5' ? '🚀 Robô 4.0.5' : planId === 'robo-4-1-0' ? '💎 Robô 4.1.0' : '🤖 Robô 4.0.0',
          requiredPlan: requiredPlanId,
          potentialEarnings: getPotentialEarnings(planId),
          missionRequirements,
          missionProgress
        });
        setShowBlockedModal(true);
        return;
      }
    
    // Mapear planId para o plano correto
    let selectedPlan = null;
    if (planId === 'robo-4-0-0') {
      selectedPlan = {
        id: 'robo-4-0-0',
        name: '🤖 Robô 4.0.0',
        dailyRate: 2.0,
        minimumAmount: 10,
        maximumAmount: 200,
        operations: 2,
        description: 'Plano Iniciante - Sem Requisitos',
        requiredReferrals: 0,
        contractFee: 0
      };
    } else if (planId === 'robo-4-0-5') {
      selectedPlan = {
        id: 'robo-4-0-5',
        name: '🚀 Robô 4.0.5',
        dailyRate: 2.0,
        minimumAmount: 20,
        maximumAmount: 200,
        operations: 3,
        description: 'Plano Intermediário - 10 indicações necessárias',
        requiredReferrals: 10,
        contractFee: 10
      };
    } else if (planId === 'robo-4-1-0') {
      selectedPlan = {
        id: 'robo-4-1-0',
        name: '💎 Robô 4.1.0',
        dailyRate: 3.0,
        minimumAmount: 500,
        maximumAmount: 200,
        operations: 4,
        description: 'Plano Premium - 20 indicações necessárias',
        requiredReferrals: 20,
        contractFee: 10
      };
    }
    
    if (selectedPlan) {
      setSelectedInvestment(selectedPlan);
      setIsInvestModalOpen(true);
      setInvestmentAmount("");
    }
  };

  const cryptoPairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT", "SOL/USDT", "XRP/USDT", "DOGE/USDT", "MATIC/USDT"];

  // Função para calcular operações de um plano
  const getDailyOperationsFromPlan = (planName: string): number => {
    if (planName?.includes('4.0.0') || planName?.includes('4.0')) {
      return 2;
    } else if (planName?.includes('4.0.5')) {
      return 3;
    } else if (planName?.includes('4.1.0')) {
      return 4;
    }
    return 2; // padrão
  };

  // Calcular total de operações de todos os planos ativos
  const getTotalActiveOperations = (): number => {
    return userInvestments
      .filter(inv => inv.status === "active")
      .reduce((total, inv) => total + getDailyOperationsFromPlan(inv.investmentName), 0);
  };

  // Gerar dados do gráfico
  const generateChartData = () => {
    const data = [];
    const basePrice = 43000;
    let currentPrice = basePrice;
    
    for (let i = 0; i < 50; i++) {
      const variation = (Math.random() - 0.5) * 1000;
      currentPrice += variation;
      
      data.push({
        time: i,
        price: Math.max(currentPrice, basePrice * 0.8),
        volume: Math.random() * 100000 + 50000,
        support: basePrice * 0.95,
        resistance: basePrice * 1.05
      });
    }
    
    return data;
  };

  // Atualizar dados do gráfico a cada 3 segundos
  useEffect(() => {
    setChartData(generateChartData());
    
    const interval = setInterval(() => {
      setChartData(generateChartData());
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  
  // Sincronizar currentPlanIndex com o nível baseado em indicações
  useEffect(() => {
    const currentLevel = getCurrentLevelFromReferrals();
    // Só atualiza se o nível atual for diferente do index atual
    // e se o usuário não estiver navegando manualmente
    if (currentPlanIndex > currentLevel) {
      setCurrentPlanIndex(currentLevel);
    }
  }, [referralCount]);

  // Helper functions
  const loadInvestmentPlans = async () => {
    try {
      console.log('Iniciando carregamento dos planos de investimento...');
      
      const { data: plans, error } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('❌ Erro ao carregar planos de investimento:', error);
        return;
      }

      console.log('✅ Planos carregados com sucesso:', plans?.length || 0);
      setInvestmentPlans(plans || []);
      
      // Criar objetos Investment para compatibilidade com o código existente
      if (plans && plans.length > 0) {
        const investmentObjects: Investment[] = plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          dailyRate: plan.daily_rate,
          minimumAmount: plan.minimum_amount,
          maximumAmount: plan.maximum_amount,
          duration: plan.duration_days,
          description: plan.description || '',
          status: plan.status as "active" | "inactive"
        }));
        
        setInvestments(investmentObjects);
      }
    } catch (error) {
      console.error('❌ Erro geral ao carregar planos:', error);
    }
  };

  const canInvestInPlan = (planName: string) => {
    // Usuários podem ativar quantos planos quiserem
    return true;
  };

  const getReferralRequirement = (planName: string) => {
    const plan = investmentPlans.find(p => p.name === planName);
    return plan?.required_referrals || 0;
  };

  // Função para carregar dados do usuário
  const loadUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
      }

      if (profile) {
        setUserBalance(profile.balance || 0);
      }

      // Fetch user investments
      const { data: userInvs, error: userInvsError } = await supabase
        .from('user_investments')
        .select(`
          id,
          amount,
          created_at,
          user_id,
          operations_completed,
          total_earned,
          daily_rate,
          status
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userInvsError) {
        console.error('Erro ao buscar investimentos do usuário:', userInvsError);
      }

      if (userInvs) {
        const formattedInvestments = userInvs.map(inv => ({
          id: inv.id,
          investmentId: 'basic-plan',
          investmentName: 'Plano Básico',
          amount: inv.amount,
          dailyRate: inv.daily_rate || 2.5,
          startDate: inv.created_at?.split('T')[0] || '',
          endDate: '',
          totalEarned: inv.total_earned || 0,
          status: (inv.status as "active" | "completed") || "active",
          daysRemaining: 30,
          currentDayProgress: 0,
          todayEarnings: 0,
          dailyTarget: (inv.amount * (inv.daily_rate || 2.5)) / 100,
          currentOperation: undefined,
          operationsCompleted: inv.operations_completed || 0,
          totalOperations: 2
        }));
        setUserInvestments(formattedInvestments);
        
        // Iniciar timers de liberação para investimentos ativos
        formattedInvestments.forEach(investment => {
          // Investimento ativo carregado
        });
      }

      // Fetch referral count
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', user.id)
        .eq('status', 'active');
      
      if (referralsError) {
        console.error('Erro ao buscar referrals:', referralsError);
      }
      
      if (referrals) {
        setReferralCount(referrals.length);
        console.log('Referrals encontrados:', referrals.length);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // Load user data and investment plans
  useEffect(() => {
    loadUserData();
    loadInvestmentPlans();
  }, [user]);



  // Update progress every second for active investments
  useEffect(() => {
    if (userInvestments.length === 0) return;

    const interval = setInterval(() => {
      setUserInvestments(prev => prev.map(investment => {
        if (investment.status !== 'active' || !investment.currentOperation) {
          return investment;
        }

        const newTimeRemaining = Math.max(0, investment.currentOperation.timeRemaining - 1);
        const newProgress = Math.min(100, ((300 - newTimeRemaining) / 300) * 100);
        
        return {
          ...investment,
          currentOperation: {
            ...investment.currentOperation,
            timeRemaining: newTimeRemaining,
            progress: newProgress
          }
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [userInvestments.length]);

  // Simulate trading operations
  useEffect(() => {
    if (userInvestments.length === 0) return;

    const interval = setInterval(() => {
      setUserInvestments(prev => prev.map(investment => {
        if (investment.status !== 'active' || !investment.currentOperation) {
          return investment;
        }

        // Simulate operation completion and start new one
        if (investment.currentOperation.timeRemaining <= 0) {
          const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
          const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
          const buyPrice = 45000 + Math.random() * 10000;
          const sellPrice = buyPrice * (1 + (Math.random() * 0.02 + 0.005));
          
          return {
            ...investment,
            operationsCompleted: investment.operationsCompleted + 1,
            currentOperation: {
              pair: randomPair,
              buyPrice,
              sellPrice,
              profit: sellPrice - buyPrice,
              progress: 0,
              timeRemaining: 300 // 5 minutes
            }
          };
        }

        return investment;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [userInvestments.length]);

  const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = userInvestments.reduce((sum, inv) => sum + inv.totalEarned, 0);
  const activeInvestments = userInvestments.filter(inv => inv.status === "active").length;
  const completedInvestments = userInvestments.filter(inv => inv.status === "completed").length;

  // Função para iniciar timer de 24h para um investimento específico
  const startDailyResetTimer = (investmentId: string) => {
    // Limpar timer existente se houver
    if (timerIntervals[investmentId]) {
      clearInterval(timerIntervals[investmentId]);
    }

    // Iniciar novo timer com 24 horas (86400 segundos)
    const startTime = Date.now();
    const duration = 24 * 60 * 60 * 1000; // 24 horas em millisegundos
    
    setDailyResetTimers(prev => ({
      ...prev,
      [investmentId]: 24 * 60 * 60 // 24 horas em segundos
    }));

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      
      setDailyResetTimers(prev => ({
        ...prev,
        [investmentId]: remaining
      }));

      if (remaining <= 0) {
        // Reset do investimento
        setUserInvestments(prevInvestments => 
          prevInvestments.map(inv => {
            if (inv.id === investmentId) {
              return {
                ...inv,
                operationsCompleted: 0,
                currentDayProgress: 0,
                todayEarnings: 0
              };
            }
            return inv;
          })
        );

        // Limpar timer
        clearInterval(interval);
        setTimerIntervals(prev => {
          const newIntervals = { ...prev };
          delete newIntervals[investmentId];
          return newIntervals;
        });
        
        setDailyResetTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[investmentId];
          return newTimers;
        });

        toast({
          title: "🔄 Ciclo Diário Reiniciado!",
          description: "Suas operações diárias foram resetadas. Você pode iniciar novas operações.",
        });
      }
    }, 1000);

    setTimerIntervals(prev => ({
      ...prev,
      [investmentId]: interval
    }));
  };

  // Função para formatar tempo restante
  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



  // Limpar todos os timers ao desmontar o componente
  useEffect(() => {
    return () => {
      Object.values(timerIntervals).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, [timerIntervals]);

  const handleTradingComplete = async (profit: number) => {
    try {
      console.log('🎉 Trading completo! Profit:', profit);
      
      // Atualizar investimento primeiro
      if (selectedInvestmentForTrading) {
        setUserInvestments(prev => prev.map(inv => {
          if (inv.id === selectedInvestmentForTrading.id) {
            const newOperationsCompleted = inv.operationsCompleted + 1;
            const newTotalEarned = inv.totalEarned + profit;
            const newProgress = (newOperationsCompleted / 2) * 100;
            
            console.log('📊 Atualizando investimento:', {
              id: inv.id,
              operationsCompleted: newOperationsCompleted,
              totalEarned: newTotalEarned,
              progress: newProgress
            });
            
            // Se completou 2 operações, iniciar timer de 24h
            if (newOperationsCompleted >= 2) {
              console.log('⏰ Iniciando timer de 24h para investimento:', inv.id);
              startDailyResetTimer(inv.id);
            }
            
            return {
              ...inv,
              operationsCompleted: newOperationsCompleted,
              totalEarned: newTotalEarned,
              todayEarnings: inv.todayEarnings + profit,
              currentDayProgress: newProgress
            };
          }
          return inv;
        }));
        
        // Registrar no histórico
        const newOperation = {
          id: `${Date.now()}-${selectedInvestmentForTrading.operationsCompleted + 1}`,
          investmentId: selectedInvestmentForTrading.id,
          investmentName: selectedInvestmentForTrading.investmentName,
          timestamp: new Date().toISOString(),
          operationType: `Arbitragem ${selectedInvestmentForTrading.operationsCompleted + 1}/2`,
          pair: 'BTC/USDT',
          amount: selectedInvestmentForTrading.amount / 2,
          profit: profit,
          spread: 0.5,
          exchanges: ['Binance', 'Kraken'],
          duration: 60,
          buyPrice: 43250.50,
          sellPrice: 43480.30,
          details: {
            buyExchange: 'Binance',
            sellExchange: 'Kraken',
            spreadPercent: 0.5,
            volumeTraded: selectedInvestmentForTrading.amount / 2
          }
        };
        
        setOperationHistory(prev => [newOperation, ...prev]);
        
        // Toast de sucesso
        const remaining = 2 - (selectedInvestmentForTrading.operationsCompleted + 1);
        if (remaining > 0) {
          toast({
            title: "✅ Arbitragem Executada!",
            description: `+$${profit.toFixed(2)} ganhos. ${remaining} operação restante hoje.`,
          });
        } else {
          toast({
            title: "🎉 Operações Completas!",
            description: `+$${profit.toFixed(2)} ganhos. Próximas operações em 24h.`,
          });
        }
      }

      // Atualizar saldo
      setUserBalance(prev => {
        const newBalance = prev + profit;
        console.log('💰 Atualizando saldo:', prev, '+', profit, '=', newBalance);
        return newBalance;
      });

      // Recarregar investimentos para atualizar o contador de operações
      setTimeout(async () => {
        await loadUserData();
      }, 1000);

      // Buscar dados atuais do usuário no Supabase
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('balance, total_profit')
        .eq('user_id', user?.id)
        .single();

      const newBalance = (currentProfile?.balance || 0) + profit;
      const newTotalProfit = (currentProfile?.total_profit || 0) + profit;

              // Atualizar investimento no banco de dados
        if (selectedInvestmentForTrading && user) {
          const newOperationsCompleted = selectedInvestmentForTrading.operationsCompleted + 1;
          const newTotalEarned = selectedInvestmentForTrading.totalEarned + profit;
          
          const { error: updateError } = await supabase
            .from('user_investments')
            .update({
              operations_completed: newOperationsCompleted,
              total_earned: newTotalEarned,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedInvestmentForTrading.id)
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Erro ao atualizar investimento no banco:', updateError);
          } else {
            console.log('✅ Investimento atualizado no banco de dados');
          }
        }

        // Registrar operação de trading na tabela trading_history
        if (selectedInvestmentForTrading) {
          const operationId = `OP_${Date.now()}_${selectedInvestmentForTrading.investmentName}`;
          const buyPrice = 43000 + (Math.random() - 0.5) * 1000; // Preço base com variação
          const sellPrice = buyPrice * (1 + (Math.random() * 0.002 + 0.001)); // 0.1% a 0.3% lucro
        
        await supabase
          .from('trading_history')
          .insert({
            user_id: user?.id,
            buy_price: buyPrice,
            sell_price: sellPrice,
            amount: selectedInvestmentForTrading.amount,
            profit: profit,
            profit_percent: ((sellPrice - buyPrice) / buyPrice) * 100,
            execution_time: Math.floor(Math.random() * 60 + 30), // 30-90 segundos
            status: 'completed',
            exchange_1: 'Binance Spot',
            exchange_2: 'Binance Futures',
            operation_id: operationId,
            pair: 'BTC/USDT',
            type: 'investment_trading',
            strategy: selectedInvestmentForTrading.investmentName
          });
        
        // Salvar último claim
        localStorage.setItem(`lastClaim_${selectedInvestmentForTrading.id}`, Date.now().toString());
      }

      // Atualizar saldo do usuário no Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
          balance: newBalance,
          total_profit: newTotalProfit
        })
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
    } catch (error) {
      console.error('Erro ao processar rendimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar rendimento",
        variant: "destructive"
      });
    }
  };

  const handleInvest = async () => {
    if (!selectedInvestment || !investmentAmount || !user) return;

    const amount = parseFloat(investmentAmount);
    
    console.log('Processando investimento:', {
      investmentName: selectedInvestment.name,
      amount: amount
    });

    // Validações
    if (amount < selectedInvestment.minimumAmount) {
      toast({
        title: "Valor insuficiente",
        description: `O valor mínimo para este investimento é $${selectedInvestment.minimumAmount}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > selectedInvestment.maximumAmount) {
      toast({
        title: "Valor excede o limite",
        description: `O valor máximo para este investimento é $${selectedInvestment.maximumAmount}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > userBalance) {
      toast({
        title: "Saldo insuficiente",
        description: `Saldo atual: $${userBalance.toFixed(2)}. Valor necessário: $${amount.toFixed(2)}. Faça um depósito para continuar.`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Buscar o plano de investimento no banco
      const { data: investmentPlan, error: planError } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('name', selectedInvestment.name)
        .single();

      if (planError || !investmentPlan) {
        console.error('Erro ao buscar plano:', planError);
        toast({
          title: "Erro",
          description: "Plano de investimento não encontrado",
          variant: "destructive"
        });
        return;
      }

      // Calcular datas
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (investmentPlan.duration_days * 24 * 60 * 60 * 1000));
      const dailyTarget = (amount * investmentPlan.daily_rate) / 100;

      // Criar investimento no banco (usando apenas campos que existem na tabela)
      const { data: newUserInvestment, error: investError } = await supabase
        .from('user_investments')
        .insert({
          user_id: user.id,
          amount: amount,
          daily_rate: investmentPlan.daily_rate,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          days_remaining: investmentPlan.duration_days,
          daily_target: dailyTarget,
          total_operations: 0
        })
        .select()
        .single();

      if (investError) {
        console.error('Erro ao criar investimento:', investError);
        
        // Determinar mensagem de erro específica
        let errorMessage = "Erro ao criar investimento";
        
        if (investError.code === '23502') {
          errorMessage = "Campos obrigatórios não preenchidos";
        } else if (investError.code === '42501') {
          errorMessage = "Sem permissão para criar investimento";
        } else if (investError.code === '23503') {
          errorMessage = "Plano de investimento inválido";
        } else if (investError.code === 'PGRST204') {
          errorMessage = "Estrutura da tabela incompatível";
        } else if (investError.message) {
          errorMessage = investError.message;
        }
        
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      // Debitar do saldo do usuário
      const newBalance = userBalance - amount;
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (balanceError) {
        console.error('Erro ao atualizar saldo:', balanceError);
        
        // Determinar mensagem de erro específica para saldo
        let balanceErrorMessage = "Erro ao processar pagamento";
        
        if (balanceError.code === '23514') {
          balanceErrorMessage = "Saldo insuficiente para o investimento";
        } else if (balanceError.code === '42501') {
          balanceErrorMessage = "Sem permissão para atualizar saldo";
        } else if (balanceError.message) {
          balanceErrorMessage = balanceError.message;
        }
        
        // Reverter o investimento se não conseguir debitar
        await supabase
          .from('user_investments')
          .delete()
          .eq('id', newUserInvestment.id);
        
        toast({
          title: "Erro",
          description: balanceErrorMessage,
          variant: "destructive"
        });
        return;
      }

      // Atualizar estado local
      setUserBalance(newBalance);
      
      // Criar objeto para o estado local
      const newInvestment: UserInvestment = {
        id: newUserInvestment.id,
        investmentId: investmentPlan.id,
        investmentName: investmentPlan.name,
        amount: amount,
        dailyRate: investmentPlan.daily_rate,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalEarned: 0,
        status: "active",
        daysRemaining: investmentPlan.duration_days,
        currentDayProgress: 0,
        todayEarnings: 0,
        dailyTarget: dailyTarget,
        currentOperation: {
          pair: cryptoPairs[0],
          buyPrice: 67420.50,
          sellPrice: 67451.20,
          profit: dailyTarget / 15,
          progress: 0,
          timeRemaining: 60
        },
        operationsCompleted: 0,
        totalOperations: 15
      };

      setUserInvestments([...userInvestments, newInvestment]);
      setIsInvestModalOpen(false);
      setInvestmentAmount("");
      setSelectedInvestment(null);


      
      // Mostrar popup de execução e simular
      setShowExecutionPopup(true);
      simulateInvestmentExecution(investmentPlan.name, amount);

    } catch (error) {
      console.error('Erro geral ao processar investimento:', error);
      toast({
        title: "Erro",
        description: "Erro interno do sistema",
        variant: "destructive"
      });
    }
  };

  const simulateInvestmentExecution = (planName: string, amount: number) => {
    const steps = [
      'Conectando ao robô de arbitragem...',
      'Analisando oportunidades de mercado...',
      'Configurando parâmetros de trading...',
      'Iniciando operações automáticas...',
      'Plano ativado com sucesso!'
    ];
    
    let currentStep = 0;
    setExecutionProgress(0);
    setExecutionStep(steps[0]);
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / steps.length) * 100;
      setExecutionProgress(progress);
      
      if (currentStep < steps.length) {
        setExecutionStep(steps[currentStep]);
      } else {
        setExecutionStep('Plano ativado com sucesso!');
        setTimeout(() => {
          setShowExecutionPopup(false);
          toast({
            title: "✅ Plano Ativado com Sucesso!",
            description: `${planName} foi ativado com investimento de $${amount.toFixed(2)}. Você pode executar operações quando quiser.`,
            variant: "default"
          });
        }, 2000);
        clearInterval(interval);
      }
    }, 1500);
  };







  const openInvestModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setIsInvestModalOpen(true);
    // Reset slider state
    setSliderProgress(0);
    setIsDragging(false);
    setIsActivated(false);
    // Reset execution popup state
    setShowExecutionPopup(false);
    setExecutionProgress(0);
    setExecutionStep('');
    // Reset timer state
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Binance-style Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, hsl(var(--trading-green)) 0%, transparent 50%),
                           radial-gradient(circle at 40% 80%, hsl(var(--warning)) 0%, transparent 50%)`
        }} />
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)/0.1) 1px, transparent 1px),
                         linear-gradient(90deg, hsl(var(--primary)/0.1) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }} />

      <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Binance-style Header */}
        <div className="text-center space-y-3 sm:space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary/20 to-trading-green/20 rounded-full flex items-center justify-center border-2 border-primary/30">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Contratos Alpha
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
            Trading automatizado com tecnologia de ponta para maximizar seus rendimentos
          </p>
          
          {/* Aviso sobre regras de investimento */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-xl p-3 sm:p-4 md:p-6 border border-primary/30 max-w-4xl mx-auto">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm sm:text-base font-bold text-primary mb-2">
                  🎉 Liberdade Total de Investimento
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                   <p className="text-primary font-medium">
                     ✅ <strong>Novidade:</strong> Agora você pode ativar quantos planos de investimento quiser!
                   </p>
                   <p>
                     <strong className="text-foreground">Robô 4.0.0:</strong> Plano Iniciante - Sem Requisitos
                   </p>
                   <p>
                     <strong className="text-foreground">Robô 4.0.5:</strong> Plano Intermediário - Disponível para todos
                   </p>
                   <p>
                     <strong className="text-foreground">Robô 4.1.0:</strong> Plano Premium - Disponível para todos
                   </p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-black/20 rounded-lg p-1 border border-gray-700/50 max-w-md mx-auto">
          <Button
            variant={activeTab === 'investments' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('investments')}
            className={`flex-1 ${
              activeTab === 'investments' 
                ? 'bg-green-400/20 text-green-400 border-green-400/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            size="sm"
          >
            <Bot className="h-4 w-4 mr-2" />
            Contratos
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className={`flex-1 ${
              activeTab === 'history' 
                ? 'bg-green-400/20 text-green-400 border-green-400/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            size="sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Extrato
          </Button>
        </div>

        {/* Box de Planos Ativos - Movido para cá */}
        {activeInvestments > 0 && (
          <div className="relative overflow-hidden bg-gradient-to-r from-green-500/10 via-green-600/15 to-green-500/10 rounded-xl p-4 sm:p-6 mb-6 border border-green-500/30 backdrop-blur-sm">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-transparent to-green-400/20 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full">
                <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path
                    d="M0,10 Q10,5 20,10 T40,10 T60,10 T80,10 T100,10"
                    fill="none"
                    stroke="url(#greenGradient)"
                    strokeWidth="0.5"
                    className="animate-pulse"
                  />
                  <path
                    d="M0,8 Q10,13 20,8 T40,8 T60,8 T80,8 T100,8"
                    fill="none"
                    stroke="url(#greenGradient2)"
                    strokeWidth="0.3"
                    className="animate-pulse"
                    style={{ animationDelay: '0.5s' }}
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#059669" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="greenGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#34D399" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#6EE7B7" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#34D399" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-2 right-4 animate-bounce" style={{ animationDelay: '0.2s' }}>
              <div className="w-2 h-2 bg-green-400 rounded-full opacity-60"></div>
            </div>
            <div className="absolute bottom-4 left-6 animate-bounce" style={{ animationDelay: '0.8s' }}>
              <div className="w-1 h-1 bg-green-300 rounded-full opacity-40"></div>
            </div>
            <div className="absolute top-6 left-8 animate-bounce" style={{ animationDelay: '1.2s' }}>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full opacity-50"></div>
            </div>
            
            {/* Market Chart Mini */}
            <div className="absolute top-2 left-2 w-16 h-8 opacity-30">
              <svg viewBox="0 0 60 20" className="w-full h-full">
                <path
                  d="M0,15 L5,12 L10,14 L15,8 L20,10 L25,6 L30,9 L35,4 L40,7 L45,3 L50,5 L55,2 L60,4"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="0.8"
                  className="animate-pulse"
                />
              </svg>
            </div>
            
            {/* Content */}
            <div className="relative z-10 text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="relative">
                  <Activity className="h-5 w-5 text-green-400 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-green-400 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                  🟢 PLANOS ATIVOS
                </h3>
              </div>
              
              <div className="relative">
                <p className="text-gray-200 text-sm font-medium">
                  {activeInvestments} {activeInvestments === 1 ? 'plano ativo' : 'planos ativos'} gerando rendimentos automaticamente
                </p>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"></div>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-xs text-green-300/80">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Operações ativas</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <span>Lucros em tempo real</span>
                </div>
              </div>
              
              <Button
                onClick={() => setShowActivePlans(!showActivePlans)}
                className={`${
                  showActivePlans 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                } text-white font-bold px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group`}
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Activity className="h-5 w-5 mr-2 relative z-10" />
                <span className="relative z-10">
                  {showActivePlans ? 'Ver Planos de Investimento' : 'Ver Planos Ativos'}
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'history' ? (
          <div className="space-y-6">
            <TradingHistoryExtrato />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Box de Planos Ativos - Trading Style */}
            {activeInvestments > 0 && !showActivePlans && (
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950/80 via-green-900/60 to-teal-950/80 rounded-2xl p-6 mb-6 border border-emerald-400/30 backdrop-blur-sm animate-fade-in">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent animate-pulse"></div>
                  <div className="absolute top-2 right-4 w-16 h-16 border-2 border-emerald-400/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                  <div className="absolute bottom-4 left-8 w-8 h-8 border border-green-400/40 rounded animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/2 left-4 w-2 h-2 bg-emerald-400/60 rounded-full animate-ping"></div>
                  <div className="absolute top-1/4 right-8 w-3 h-3 bg-green-400/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

                </div>

                {/* Trading Chart Background */}
                <div className="absolute inset-0 opacity-5">
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                        <stop offset="50%" stopColor="#059669" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#047857" stopOpacity="0.3"/>
                      </linearGradient>
                    </defs>
                    <path 
                      d="M0,150 Q50,120 100,100 T200,80 T300,60 T400,40" 
                      stroke="url(#chartGradient)" 
                      strokeWidth="2" 
                      fill="none"
                      className="animate-pulse"
                    />
                    <path 
                      d="M0,160 Q60,140 120,120 T240,100 T360,80 T400,60" 
                      stroke="url(#chartGradient)" 
                      strokeWidth="1" 
                      fill="none" 
                      opacity="0.6"
                      className="animate-pulse"
                      style={{ animationDelay: '0.5s' }}
                    />
                  </svg>
                </div>

                {/* Floating Numbers Animation */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-8 text-xs font-mono text-emerald-400/60 animate-bounce" style={{ animationDelay: '0.2s' }}>
                    +{(Math.random() * 10).toFixed(2)}%
                  </div>
                  <div className="absolute top-8 right-12 text-xs font-mono text-green-400/50 animate-bounce" style={{ animationDelay: '1.2s' }}>
                    ${(Math.random() * 1000).toFixed(2)}
                  </div>
                  <div className="absolute bottom-8 left-16 text-xs font-mono text-teal-400/40 animate-bounce" style={{ animationDelay: '2s' }}>
                    ↗ {(Math.random() * 5).toFixed(1)}%
                  </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 text-center space-y-6">
                  {/* Header with Trading Icon */}
                  <div className="flex items-center justify-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center animate-pulse">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-emerald-300 flex items-center space-x-2">
                        <span className="animate-pulse">📈</span>
                        <span>TRADING ATIVO</span>
                      </h3>
                      <div className="text-sm text-emerald-200/80 font-mono animate-fade-in">
                        Real-time profit generation
                      </div>
                    </div>
                  </div>

                  {/* Stats Display */}
                  <div className="bg-black/20 rounded-xl p-4 border border-emerald-400/20 backdrop-blur-sm">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-emerald-300 animate-pulse">
                          {activeInvestments}
                        </div>
                        <div className="text-xs text-emerald-200/70 uppercase tracking-wider">
                          {activeInvestments === 1 ? 'Plano Ativo' : 'Planos Ativos'}
                        </div>
                      </div>
                      <div className="space-y-1 border-x border-emerald-400/20">
                        <div className="text-2xl font-bold text-green-300 animate-pulse flex items-center justify-center">
                          <Activity className="w-4 h-4 mr-1" />
                          {getTotalActiveOperations()}
                        </div>
                        <div className="text-xs text-green-200/70 uppercase tracking-wider">
                          Operações/dia
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-teal-300 flex items-center justify-center animate-pulse">
                          <Sparkles className="w-4 h-4 mr-1" />
                          ON
                        </div>
                        <div className="text-xs text-teal-200/70 uppercase tracking-wider">
                          Status
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => setShowActivePlans(true)}
                    className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 hover-scale group"
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 group-hover:animate-pulse" />
                      <span>Acessar Dashboard Trading</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </Button>

                  {/* Real-time Ticker */}
                  <div className="text-xs text-emerald-300/60 font-mono animate-pulse">
                    <div className="flex items-center justify-center space-x-4">
                      <span>BTC/USDT: +2.34%</span>
                      <span className="text-emerald-400">•</span>
                      <span>ETH/USDT: +1.87%</span>
                      <span className="text-emerald-400">•</span>
                      <span>Lucro: +{((Math.random() * 100) + 50).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-emerald-400/30 rounded-tl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-emerald-400/30 rounded-br-2xl"></div>
              </div>
              
              <Button
                onClick={() => setShowActivePlans(!showActivePlans)}
                className={`${
                  showActivePlans 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                } text-white font-bold px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group`}
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Activity className="h-5 w-5 mr-2 relative z-10" />
                <span className="relative z-10">
                  {showActivePlans ? 'Ver Planos de Investimento' : 'Ver Planos Ativos'}
                </span>
              </Button>
            </div>
          </div>
        )}





        {showActivePlans ? (
          /* Active Plans View */
          <div className="space-y-6">

            {userInvestments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userInvestments
                  .filter(investment => investment.status === "active")
                  .map((investment) => (
                    <div key={investment.id} className={`bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 hover:shadow-2xl transition-all duration-300 overflow-hidden relative rounded-lg ${isMobile ? 'mx-2' : ''}`}>
                      {/* Background pattern */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent"></div>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                      
                      {/* Header */}
                      <div className={`border-b border-blue-700/30 relative z-10 ${isMobile ? 'p-4' : 'p-4'}`}>
                        <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-3' : ''}`}>
                          <div className={`flex items-center gap-3 flex-1 min-w-0 ${isMobile ? 'w-full justify-center' : ''}`}>
                            <div className={`font-bold text-white ${isMobile ? 'text-3xl' : 'text-2xl'}`}>
                              {investment.investmentName.includes('4.0.0') && '🤖'}
                              {investment.investmentName.includes('4.0.5') && '🚀'}
                              {investment.investmentName.includes('4.1.0') && '💎'}
                              {!investment.investmentName.includes('4.0') && '📈'}
                            </div>
                            <div className={`min-w-0 flex-1 ${isMobile ? 'text-center' : ''}`}>
                              <div className={`text-white font-bold truncate ${isMobile ? 'text-xl' : 'text-lg'}`}>
                                {investment.investmentName.includes('4.0.0') && 'Robô 4.0.0'}
                                {investment.investmentName.includes('4.0.5') && 'Robô 4.0.5'}
                                {investment.investmentName.includes('4.1.0') && 'Robô 4.1.0'}
                                {!investment.investmentName.includes('4.0') && investment.investmentName}
                              </div>
                              <p className={`text-gray-400 truncate ${isMobile ? 'text-base' : 'text-sm'}`}>
                                {getDailyOperationsFromPlan(investment.investmentName)} operações diárias
                              </p>
                            </div>
                          </div>
                          <Badge className={`bg-gradient-to-r from-green-500 to-green-600 text-white border-0 font-bold ${isMobile ? 'text-sm px-3 py-1' : ''}`}>
                            Ativo
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className={`relative z-10 ${isMobile ? 'p-4' : 'p-4'}`}>
                        <div className={`space-y-4 ${isMobile ? 'space-y-5' : ''}`}>
                          <div className="flex justify-between items-center">
                            <span className={`text-gray-400 ${isMobile ? 'text-base' : 'text-sm'}`}>Valor Investido</span>
                            <span className={`font-bold text-white ${isMobile ? 'text-lg' : ''}`}>${investment.amount.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className={`text-gray-400 ${isMobile ? 'text-base' : 'text-sm'}`}>Ganhos Atuais</span>
                            <span className={`font-bold text-green-400 ${isMobile ? 'text-lg' : ''}`}>+${investment.totalEarned.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className={`text-gray-400 ${isMobile ? 'text-base' : 'text-sm'}`}>Lucro do Dia</span>
                            <span className={`font-bold text-yellow-400 ${isMobile ? 'text-lg' : ''}`}>+${calculateTodayEarnings(investment).toFixed(2)}</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Dias Restantes</span>
                              <span className="text-white font-medium">40 de 40 dias</span>
                            </div>
                            <Progress value={100} className="h-2" />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Progresso Diário</span>
                              <span className="text-white font-medium">{investment.currentDayProgress.toFixed(1)}%</span>
                            </div>
                            <Progress value={investment.currentDayProgress} className="h-2" />
                          </div>
                          
                          <div className="pt-4 border-t border-gray-700/50 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">Operações Hoje</span>
                              <span className="font-medium text-white text-sm">
                                {investment.operationsCompleted}/2
                              </span>
                            </div>
                            

                            
                            {/* Timer de Reset Diário */}
                            {dailyResetTimers[investment.id] && (
                              <div className={`bg-orange-500/10 border border-orange-500/30 rounded-lg ${isMobile ? 'p-4' : 'p-3'}`}>
                                <div className={`flex items-center justify-between mb-2 ${isMobile ? 'flex-col gap-2' : ''}`}>
                                  <span className={`text-orange-400 font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
                                    ⏰ Próximas Operações
                                  </span>
                                  <div className={`text-orange-400 font-bold ${isMobile ? 'text-2xl' : 'text-xl'}`}>
                                    {formatTimeRemaining(dailyResetTimers[investment.id])}
                                  </div>
                                </div>
                                <div className={`text-gray-400 ${isMobile ? 'text-center text-sm' : 'text-xs'}`}>
                                  Aguarde 24h para executar novas operações de arbitragem
                                </div>
                              </div>
                            )}
                            
                            {/* Status quando operações estão disponíveis */}
                            {!dailyResetTimers[investment.id] && investment.operationsCompleted < 2 && (
                              <div className={`bg-green-500/10 border border-green-500/30 rounded-lg ${isMobile ? 'p-4' : 'p-3'}`}>
                                <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className={`text-green-400 font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
                                    🚀 Arbitragem disponível
                                  </span>
                                </div>
                                <div className={`text-gray-400 mt-1 ${isMobile ? 'text-center text-sm' : 'text-xs'}`}>
                                  Você pode executar {2 - investment.operationsCompleted} operações de arbitragem hoje
                                </div>
                              </div>
                            )}
                            
                            {/* Box de Trading Melhorado para Mobile */}
                            <div className={`${isMobile ? 'space-y-3' : 'flex gap-2'}`}>
                              {/* Botão Principal de Arbitragem */}
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  console.log('🎯 Abrindo Simulador de Trading...');
                                  
                                  // Verificar se já executou 2 operações hoje
                                  if (investment.operationsCompleted >= 2) {
                                    toast({
                                      title: "⏰ Operações Limitadas",
                                      description: "Você já executou 2 operações hoje. Aguarde 24h para novas operações.",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  
                                  // Verificar se há timer ativo
                                  if (dailyResetTimers[investment.id]) {
                                    toast({
                                      title: "⏰ Aguarde o Timer",
                                      description: "Aguarde o timer de 24h terminar para executar novas operações.",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  
                                  // Abrir simulador de trading
                                  setSelectedInvestmentForTrading(investment);
                                  setIsTradingSimulatorOpen(true);
                                  
                                  toast({
                                    title: "🚀 Abrindo Simulador",
                                    description: "Buscando melhores oportunidades de arbitragem no mercado...",
                                  });
                                }}
                                disabled={
                                  investment.operationsCompleted >= 2 || // Bloqueado quando 2 operações completas
                                  !!dailyResetTimers[investment.id] // Bloqueado durante timer de 24h
                                }
                                className={`${isMobile ? 'w-full' : 'flex-1'} bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] ${isMobile ? 'py-4 text-base font-semibold' : 'py-2'}`}
                                size={isMobile ? "lg" : "sm"}
                              >
                                <div className={`${isMobile ? 'flex flex-col items-center gap-1' : 'flex items-center'}`}>
                                  <Play className={`${isMobile ? 'h-6 w-6' : 'h-4 w-4 mr-2'}`} />
                                  <span className={isMobile ? 'text-sm' : ''}>
                                    {dailyResetTimers[investment.id] 
                                      ? `⏰ ${formatTimeRemaining(dailyResetTimers[investment.id])}` 
                                      : investment.operationsCompleted >= 2 
                                        ? 'Operações Completas' 
                                        : `Executar Arbitragem (${investment.operationsCompleted}/2)`
                                    }
                                  </span>
                                </div>
                              </Button>
                              
                              {/* Botão de Histórico */}
                              <Button
                                variant="outline"
                                onClick={() => setShowOperationHistory(true)}
                                className={`${isMobile ? 'w-full' : 'px-3'} text-sm hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300 ${isMobile ? 'py-3 border-2' : ''}`}
                                size={isMobile ? "lg" : "sm"}
                                title="Ver histórico de operações"
                              >
                                <div className={`${isMobile ? 'flex items-center justify-center gap-2' : 'flex items-center'}`}>
                                  <BarChart3 className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                                  {isMobile && <span className="text-sm font-medium">Histórico</span>}
                                </div>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhum plano ativo</h3>
                <p className="text-gray-500 mb-4">Ative um plano de investimento para começar a gerar rendimentos</p>
                <Button
                  onClick={() => setShowActivePlans(false)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Ver Planos Disponíveis
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Investment Plans Section - Binance Style */
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl sm:text-2xl md:text-3xl'} font-bold text-foreground`}>
              Planos de Trading
            </h2>
            <p className={`${isMobile ? 'text-xs' : 'text-sm sm:text-base'} text-muted-foreground max-w-2xl mx-auto px-2 sm:px-4`}>
              Escolha o plano ideal para maximizar seus rendimentos com trading automatizado
            </p>
            
            {/* Referral-Based Progress Bar */}
            <div className="max-w-lg mx-auto mt-6 space-y-4">
              {/* Level Progress Indicator */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Nível Atual</span>
                  <span className="text-xs text-muted-foreground">
                    {getCurrentLevelFromReferrals() === 0 && "Iniciante"}
                    {getCurrentLevelFromReferrals() === 1 && "Intermediário"}
                    {getCurrentLevelFromReferrals() === 2 && "Premium"}
                  </span>
                </div>
                
                {/* Referral Count Display */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{referralCount} Indicações</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getCurrentLevelFromReferrals() === 2 ? "Máximo" : `Meta: ${getCurrentLevelFromReferrals() === 0 ? referralRequirements.intermediario : referralRequirements.premium}`}
                  </span>
                </div>
                
                {/* Animated Progress Bar */}
                <div className="relative mb-3">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${getCurrentLevelFromReferrals() === 2 ? 100 : getProgressToNextLevel()}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Level Markers */}
                  <div className="absolute top-0 left-0 w-full h-3 flex items-center justify-between px-1">
                    {[0, 1, 2].map((index) => {
                      const isUnlocked = getCurrentLevelFromReferrals() >= index;
                      const requiredReferrals = index === 0 ? 0 : index === 1 ? referralRequirements.intermediario : referralRequirements.premium;
                      
                      return (
                        <div
                          key={index}
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${
                            isUnlocked
                              ? 'bg-primary border-primary shadow-lg'
                              : 'bg-background border-muted-foreground/30'
                          }`}
                          title={`${index === 0 ? 'Iniciante' : index === 1 ? 'Intermediário' : 'Premium'} - ${requiredReferrals} indicações`}
                        >
                          {isUnlocked && (
                            <CheckCircle className="w-3 h-3 text-primary-foreground" />
                          )}
          
          {/* Todos os planos agora estão disponíveis para todos os usuários */}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Todos os planos disponíveis */}
                <div className="flex items-center justify-center space-x-2 text-xs text-primary">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span className="font-medium">🎉 Liberdade Total de Investimento - Todos os Planos Disponíveis!</span>
                </div>
              </div>
              
              {/* Plan Names */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                <span className="text-primary font-medium">🤖 Robô 4.0.0</span>
                <span className="text-primary font-medium">🚀 Robô 4.0.5</span>
                <span className="text-primary font-medium">💎 Robô 4.1.0</span>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPlanIndex(Math.max(0, currentPlanIndex - 1))}
                  disabled={currentPlanIndex === 0}
                  className="text-xs transition-all duration-300 hover:scale-105"
                >
                  ← Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPlanIndex(Math.min(2, currentPlanIndex + 1))}
                  disabled={currentPlanIndex >= 2}
                  className="text-xs transition-all duration-300 hover:scale-105"
                >
                  Próximo →
                </Button>
              </div>
              
              {/* Informação sobre disponibilidade dos planos */}
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">🎉 Liberdade Total de Investimento</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                                          <p>✅ <strong>Robô 4.0.0 (Iniciante):</strong> Sem Requisitos - Taxa 2,0%</p>
                    <p>✅ <strong>Robô 4.0.5 (Intermediário):</strong> Disponível para todos - Taxa 2,0%</p>
                                          <p>✅ <strong>Robô 4.1.0 (Premium):</strong> Disponível para todos - Taxa 3,0%</p>
                  </div>
                  
                  {/* Quantos ativos (indicações) para cada nível */}
                   <div className="mt-3 p-3 bg-muted/30 rounded border border-muted-foreground/20">
                     <div className="flex items-center justify-center space-x-2 mb-3">
                       <Users className="w-4 h-4 text-muted-foreground" />
                       <span className="text-sm font-medium text-foreground">📊 Quantos ativos (indicações) para cada nível</span>
                     </div>
                     
                     {/* Robô 4.0.0 */}
                     <div className="mb-3 p-2 bg-background/50 rounded border border-border/30">
                       <div className="text-xs font-semibold text-primary mb-1">🤖 Robô 4.0.0</div>
                       <div className="text-xs text-muted-foreground space-y-0.5">
                         <p><strong>Indicações necessárias:</strong> Nenhuma (0 ativos)</p>
                         <p><strong>Taxa diária:</strong> 2,0%</p>
                         <p><strong>Investimento mínimo:</strong> $10 USDT</p>
                       </div>
                     </div>
                     
                     {/* Robô 4.0.5 */}
                     <div className="mb-3 p-2 bg-background/50 rounded border border-border/30">
                       <div className="text-xs font-semibold text-primary mb-1">🚀 Robô 4.0.5</div>
                       <div className="text-xs text-muted-foreground space-y-0.5">
                         <p><strong>Indicações necessárias:</strong> 10 ativos (pessoas indicadas)</p>
                         <p><strong>Taxa diária:</strong> 3,0%</p>
                         <p><strong>Investimento mínimo:</strong> $20 USDT</p>
                         <p><strong>Extra:</strong> precisa assinar contrato e pagar $10 USDT</p>
                       </div>
                     </div>
                     
                     {/* Robô 4.1.0 */}
                     <div className="mb-3 p-2 bg-background/50 rounded border border-border/30">
                       <div className="text-xs font-semibold text-primary mb-1">💎 Robô 4.1.0</div>
                       <div className="text-xs text-muted-foreground space-y-0.5">
                         <p><strong>Indicações necessárias:</strong> 20 ativos (pessoas indicadas)</p>
                         <p><strong>Taxa diária:</strong> 4,0%</p>
                         <p><strong>Investimento mínimo:</strong> $500 USDT</p>
                         <p><strong>Extra:</strong> precisa assinar contrato e pagar $10 USDT</p>
                       </div>
                     </div>
                     
                     <div className="mt-3 text-xs text-primary/80 text-center">
                       <span className="font-medium">💡 Novidade: Todos podem ativar qualquer plano independente do nível!</span>
                     </div>
                   </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/referrals')}
                      className="text-xs mt-2"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      Ver Sistema de Indicações
                    </Button>
                  </div>
                </div>
            </div>
          </div>



          {/* Todos os Planos Disponíveis */}
          <div className="space-y-6">
            {/* Robô 4.0.0 - Iniciante */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-500/30 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
              {/* Indicador de Missão Ativa */}
              {userInvestments.some(inv => inv.investmentName.includes('4.0.0') && inv.status === 'active') && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-yellow-500/20 rounded-lg p-2 border border-yellow-500/30">
                    <div className="text-yellow-400 text-xs font-medium">Missão Ativa</div>
                    <div className="text-white text-xs">
                      {getMissionProgress('robo-4-0-0').completed}/{getMissionProgress('robo-4-0-0').total} tarefas
                    </div>
                  </div>
                </div>
              )}
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <CardHeader className="border-b border-yellow-500/20 p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Bot className="h-6 w-6 text-black font-bold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-xl font-bold text-white mb-1">
                        🤖 Robô 4.0.0
                      </CardTitle>
                      <p className="text-sm text-yellow-300/80">
                        2 operações por dia - Taxa diária: 2,0%
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 font-bold">
                      Disponível
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-400">2.0%</div>
                      <div className="text-xs text-gray-400">diário</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 relative z-10">
                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">ROI Diário</div>
                    <div className="text-lg font-bold text-yellow-400">2.0%</div>
                    <div className="text-xs text-green-400">+2.0% BTC</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Operações</div>
                    <div className="text-lg font-bold text-blue-400">2x</div>
                    <div className="text-xs text-gray-400">por dia</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Período</div>
                    <div className="text-lg font-bold text-orange-400">40</div>
                    <div className="text-xs text-gray-400">dias</div>
                  </div>
                </div>
                
                {/* Range de Investimento */}
                <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-lg p-4 mb-6 border border-gray-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Range de Investimento</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border">
                      Iniciante
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mín:</span>
                    <span className="font-bold text-white">$10 USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Máx:</span>
                    <span className="font-bold text-white">$5,000 USDT</span>
                  </div>
                </div>
                
                {/* Características */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 border rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Shield className="h-3 w-3 text-black" />
                    </div>
                    <h4 className="text-sm font-bold text-yellow-400">Características do Bot</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span><strong className="text-white">Disponível para todos</strong> - Sem restrições</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span><strong className="text-white">Indicações necessárias:</strong> Nenhuma (0 ativos)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span><strong className="text-white">Taxa diária:</strong> 2,0%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span><strong className="text-white">Investimento mínimo:</strong> $10 USDT</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span><strong className="text-white">2 operações automáticas</strong> por dia</span>
                    </div>
                  </div>
                </div>
                
                {/* Botão de Ativação */}
                <div className="mt-6">
                  <Button 
                    onClick={() => handleActivatePlan('robo-4-0-0')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 text-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    🚀 Ativar Robô 4.0.0
                  </Button>
                </div>
                
                {/* Tabela de Investimentos */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-yellow-400 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Tabela de Investimentos
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTableVisibility('robo-4-0-0')}
                      className="text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      {hiddenTables['robo-4-0-0'] ? (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Veja Rentabilidade
                        </>
                      ) : (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Ocultar
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {!hiddenTables['robo-4-0-0'] && (
                    <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-900/50">
                            <tr>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Dia</th>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Investimento</th>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Lucro</th>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Total</th>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700/50">
                            {investmentTables['robo-4-0-0'].map((row, index) => (
                              <tr key={index} className={`hover:bg-gray-700/30 transition-colors ${
                                row.status === 'active' ? 'bg-green-500/10' : ''
                              }`}>
                                <td className="px-3 py-2 text-gray-300">{row.day}</td>
                                <td className="px-3 py-2 text-white">${row.investment.toFixed(2)}</td>
                                <td className="px-3 py-2 text-green-400">+${row.profit.toFixed(2)}</td>
                                <td className="px-3 py-2 text-yellow-400 font-medium">${row.total.toFixed(2)}</td>
                                <td className="px-3 py-2">
                                  <Badge 
                                    variant={row.status === 'active' ? 'default' : 'secondary'}
                                    className={`text-xs ${
                                      row.status === 'active' 
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                    }`}
                                  >
                                    {row.status === 'active' ? 'Ativo' : 'Concluído'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Robô 4.0.5 - Intermediário */}
            <Card className={`bg-gradient-to-br from-gray-900 to-gray-800 border hover:shadow-2xl transition-all duration-300 overflow-hidden relative ${
              canActivatePlan('robo-4-0-5') ? 'border-orange-500/30' : 'border-gray-600/30'
            }`}>
              {!canActivatePlan('robo-4-0-5') && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-400 text-sm mb-2">Bloqueado</div>
                    <div className="bg-blue-500/20 rounded-lg p-2 border border-blue-500/30">
                      <div className="text-blue-400 text-xs font-medium">Missão Robô 4.0.0</div>
                      <div className="text-white text-xs">
                        {getMissionProgress('robo-4-0-0').completed}/{getMissionProgress('robo-4-0-0').total} tarefas
                      </div>
                      <div className="text-yellow-400 text-xs mt-1">
                        {referralCount}/10 indicações
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <CardHeader className="border-b border-orange-500/20 p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Zap className="h-6 w-6 text-black font-bold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-xl font-bold text-white mb-1">
                        🚀 Robô 4.0.5
                      </CardTitle>
                      <p className="text-sm text-orange-300/80">
                        3 operações por dia - Taxa diária: 3,0%
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 font-bold">
                      Intermediário
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-400">2.0%</div>
                      <div className="text-xs text-gray-400">diário</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 relative z-10">
                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">ROI Diário</div>
                    <div className="text-lg font-bold text-orange-400">2.0%</div>
                    <div className="text-xs text-green-400">+2.0% BTC</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Operações</div>
                    <div className="text-lg font-bold text-blue-400">3x</div>
                    <div className="text-xs text-gray-400">por dia</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Período</div>
                    <div className="text-lg font-bold text-orange-400">40</div>
                    <div className="text-xs text-gray-400">dias</div>
                  </div>
                </div>
                
                {/* Range de Investimento */}
                <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-lg p-4 mb-6 border border-gray-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Range de Investimento</span>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 border">
                      Intermediário
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mín:</span>
                    <span className="font-bold text-white">$20 USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Máx:</span>
                    <span className="font-bold text-white">$5,000 USDT</span>
                  </div>
                </div>
                
                {/* Características */}
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 border rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <Shield className="h-3 w-3 text-black" />
                    </div>
                    <h4 className="text-sm font-bold text-orange-400">Características do Bot</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span><strong className="text-white">Indicações necessárias:</strong> 10 ativos (pessoas indicadas)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span><strong className="text-white">Taxa diária:</strong> 2,0%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span><strong className="text-white">Investimento mínimo:</strong> $20 USDT</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span><strong className="text-white">Extra:</strong> precisa assinar contrato e pagar $10 USDT</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span><strong className="text-white">3 operações automáticas</strong> por dia</span>
                    </div>
                  </div>
                </div>
                
                {/* Botão de Ativação */}
                <div className="mt-6">
                  <Button 
                    onClick={() => handleActivatePlan('robo-4-0-5')}
                    className={`w-full font-bold py-3 text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                      canActivatePlan('robo-4-0-5') 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' 
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed'
                    }`}
                    disabled={!canActivatePlan('robo-4-0-5')}
                  >
                    {canActivatePlan('robo-4-0-5') ? '🚀 Ativar Robô 4.0.5' : '🔒 Bloqueado'}
                  </Button>
                </div>
                
                {/* Tabela de Investimentos */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-orange-400 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Tabela de Investimentos
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTableVisibility('robo-4-0-5')}
                      className="text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                    >
                      {hiddenTables['robo-4-0-5'] ? (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Veja Rentabilidade
                        </>
                      ) : (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Ocultar
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {!hiddenTables['robo-4-0-5'] && (
                    <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-900/50">
                            <tr>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Dia</th>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Investimento</th>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Lucro</th>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Total</th>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700/50">
                            {investmentTables['robo-4-0-5'].map((row, index) => (
                              <tr key={index} className={`hover:bg-gray-700/30 transition-colors ${
                                row.status === 'active' ? 'bg-green-500/10' : ''
                              }`}>
                                <td className="px-3 py-2 text-gray-300">{row.day}</td>
                                <td className="px-3 py-2 text-white">${row.investment.toFixed(2)}</td>
                                <td className="px-3 py-2 text-green-400">+${row.profit.toFixed(2)}</td>
                                <td className="px-3 py-2 text-orange-400 font-medium">${row.total.toFixed(2)}</td>
                                <td className="px-3 py-2">
                                  <Badge 
                                    variant={row.status === 'active' ? 'default' : 'secondary'}
                                    className={`text-xs ${
                                      row.status === 'active' 
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                    }`}
                                  >
                                    {row.status === 'active' ? 'Ativo' : 'Concluído'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Robô 4.1.0 - Premium */}
            <Card className={`bg-gradient-to-br from-gray-900 to-gray-800 border hover:shadow-2xl transition-all duration-300 overflow-hidden relative ${
              canActivatePlan('robo-4-1-0') ? 'border-purple-500/30' : 'border-gray-600/30'
            }`}>
              {!canActivatePlan('robo-4-1-0') && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-400 text-sm mb-2">Bloqueado</div>
                    <div className="bg-purple-500/20 rounded-lg p-2 border border-purple-500/30">
                      <div className="text-purple-400 text-xs font-medium">Missão Robô 4.0.5</div>
                      <div className="text-white text-xs">
                        {getMissionProgress('robo-4-0-5').completed}/{getMissionProgress('robo-4-0-5').total} tarefas
                      </div>
                      <div className="text-yellow-400 text-xs mt-1">
                        {referralCount}/20 indicações
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <CardHeader className="border-b border-purple-500/20 p-4 sm:p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Crown className="h-6 w-6 text-black font-bold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-xl font-bold text-white mb-1">
                        💎 Robô 4.1.0
                      </CardTitle>
                      <p className="text-sm text-purple-300/80">
                        4 operações por dia - Taxa diária: 4,0%
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 font-bold">
                      Premium
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">3.0%</div>
                      <div className="text-xs text-gray-400">diário</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 relative z-10">
                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">ROI Diário</div>
                    <div className="text-lg font-bold text-purple-400">3.0%</div>
                    <div className="text-xs text-green-400">+3.0% BTC</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Operações</div>
                    <div className="text-lg font-bold text-blue-400">4x</div>
                    <div className="text-xs text-gray-400">por dia</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Período</div>
                    <div className="text-lg font-bold text-orange-400">40</div>
                    <div className="text-xs text-gray-400">dias</div>
                  </div>
                </div>
                
                {/* Range de Investimento */}
                <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-lg p-4 mb-6 border border-gray-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Range de Investimento</span>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 border">
                      Premium
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mín:</span>
                    <span className="font-bold text-white">$500 USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Máx:</span>
                    <span className="font-bold text-white">$5,000 USDT</span>
                  </div>
                </div>
                
                {/* Características */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 border rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Shield className="h-3 w-3 text-black" />
                    </div>
                    <h4 className="text-sm font-bold text-purple-400">Características do Bot</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span><strong className="text-white">Indicações necessárias:</strong> 20 ativos (pessoas indicadas)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span><strong className="text-white">Taxa diária:</strong> 3,0%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span><strong className="text-white">Investimento mínimo:</strong> $500 USDT</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span><strong className="text-white">Extra:</strong> precisa assinar contrato e pagar $10 USDT</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span><strong className="text-white">4 operações automáticas</strong> por dia</span>
                    </div>
                  </div>
                </div>
                
                {/* Botão de Ativação */}
                <div className="mt-6">
                  <Button 
                    onClick={() => handleActivatePlan('robo-4-1-0')}
                    className={`w-full font-bold py-3 text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                      canActivatePlan('robo-4-1-0') 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white' 
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed'
                    }`}
                    disabled={!canActivatePlan('robo-4-1-0')}
                  >
                    {canActivatePlan('robo-4-1-0') ? '🚀 Ativar Robô 4.1.0' : '🔒 Bloqueado'}
                  </Button>
                </div>
                
                {/* Tabela de Investimentos */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Tabela de Investimentos
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTableVisibility('robo-4-1-0')}
                      className="text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    >
                      {hiddenTables['robo-4-1-0'] ? (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Veja Rentabilidade
                        </>
                      ) : (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Ocultar
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {!hiddenTables['robo-4-1-0'] && (
                    <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-900/50">
                            <tr>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Dia</th>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Investimento</th>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Lucro</th>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Total</th>
                              <th className="px-3 py-2 text-left text-gray-300 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700/50">
                            {investmentTables['robo-4-1-0'].map((row, index) => (
                              <tr key={index} className={`hover:bg-gray-700/30 transition-colors ${
                                row.status === 'active' ? 'bg-green-500/10' : ''
                              }`}>
                                <td className="px-3 py-2 text-gray-300">{row.day}</td>
                                <td className="px-3 py-2 text-white">${row.investment.toFixed(2)}</td>
                                <td className="px-3 py-2 text-green-400">+${row.profit.toFixed(2)}</td>
                                <td className="px-3 py-2 text-purple-400 font-medium">${row.total.toFixed(2)}</td>
                                <td className="px-3 py-2">
                                  <Badge 
                                    variant={row.status === 'active' ? 'default' : 'secondary'}
                                    className={`text-xs ${
                                      row.status === 'active' 
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                    }`}
                                  >
                                    {row.status === 'active' ? 'Ativo' : 'Concluído'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <div className="flex items-center justify-between">
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold text-foreground`}>
              Meus Investimentos
            </h2>
            <Badge variant="outline" className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
              {userInvestments.length} {userInvestments.length === 1 ? 'Investimento' : 'Investimentos'}
            </Badge>
          </div>

          {/* ESTATÍSTICAS GERAIS */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Investido</div>
              <div className="text-base sm:text-lg font-bold text-foreground">${totalInvested.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Ganhos Totais</div>
              <div className="text-base sm:text-lg font-bold text-trading-green">+${totalEarnings.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Ativos</div>
              <div className="text-base sm:text-lg font-bold text-primary">{activeInvestments}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Operações Hoje</div>
              <div className="text-base sm:text-lg font-bold text-warning">
                {userInvestments.reduce((total, inv) => total + inv.operationsCompleted, 0)}/{getTotalActiveOperations()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Lucro do Dia</div>
              <div className="text-base sm:text-lg font-bold text-yellow-400">
                +${userInvestments.reduce((total, inv) => total + calculateTodayEarnings(inv), 0).toFixed(2)}
              </div>
            </div>
          </div>





          {userInvestments.length > 0 ? (
            <>


              {/* CONTAINER PARA INVESTIMENTOS CONCLUÍDOS (se houver) */}
              {completedInvestments > 0 && (
                <div className="bg-gradient-to-br from-muted/20 to-muted/40 border border-muted-foreground/20 rounded-xl p-4 sm:p-6 space-y-4">
                  <div className="text-center py-2">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg sm:text-xl font-bold text-muted-foreground">
                        ✅ INVESTIMENTOS CONCLUÍDOS
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {completedInvestments} {completedInvestments === 1 ? 'investimento concluído' : 'investimentos concluídos'}
                    </p>
                  </div>

                  <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'}`}>
                    {userInvestments
                      .filter(investment => investment.status === "completed")
                      .map((investment) => (
                        <Card key={investment.id} className="bg-card border-border opacity-75">
                          <CardHeader className={`border-b border-border/50 p-3 sm:p-4 md:p-6`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8 sm:w-10 sm:h-10'} bg-muted/30 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                  <CheckCircle className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4 sm:h-5 sm:w-5'} text-muted-foreground`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <CardTitle className={`${isMobile ? 'text-sm' : 'text-base sm:text-lg'} text-foreground truncate`}>
                                    {investment.investmentName}
                                  </CardTitle>
                                  <p className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground truncate`}>
                                    Concluído em {investment.endDate}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs">
                                Concluído
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className={`p-3 sm:p-4 md:p-6`}>
                            <div className={`space-y-2 sm:space-y-3`}>
                              <div className="flex justify-between items-center">
                                <span className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground`}>Valor Investido</span>
                                <span className={`font-bold ${isMobile ? 'text-sm' : 'text-sm sm:text-base'} text-foreground`}>${investment.amount.toFixed(2)}</span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground`}>Ganhos Totais</span>
                                <span className={`font-bold ${isMobile ? 'text-sm' : 'text-sm sm:text-base'} text-trading-green`}>+${investment.totalEarned.toFixed(2)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className={`text-center ${isMobile ? 'py-4' : 'py-6 sm:py-8'}`}>
                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20'} bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                  <PiggyBank className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8 sm:h-10 sm:w-10'} text-muted-foreground`} />
                </div>
                <p className={`${isMobile ? 'text-sm' : 'text-base sm:text-lg'} text-muted-foreground mb-2`}>Você ainda não possui investimentos</p>
                <p className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground`}>Escolha um plano acima para começar</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Operation History Modal */}
      <Dialog open={showOperationHistory} onOpenChange={setShowOperationHistory}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gray-900 border-gray-800 text-white">
          <DialogHeader className="border-b border-gray-800 pb-4">
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              Histórico de Operações
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {operationHistory.length}
                  </div>
                  <div className="text-sm text-gray-400">Total de Operações</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    ${operationHistory.reduce((sum, op) => sum + op.profit, 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Lucro Total</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {operationHistory.length > 0 ? (operationHistory.reduce((sum, op) => sum + op.spread, 0) / operationHistory.length).toFixed(3) : '0.000'}%
                  </div>
                  <div className="text-sm text-gray-400">Spread Médio</div>
                </div>
              </div>
            </div>

            {/* Lista de Operações */}
            {operationHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhuma operação realizada</h3>
                <p className="text-gray-500">Execute operações para ver o histórico detalhado aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {operationHistory.map((operation) => (
                  <div key={operation.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <ArrowUpDown className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">{operation.pair}</div>
                          <div className="text-sm text-gray-400">
                            {operation.investmentName} • {operation.operationType}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-400">
                          +${operation.profit.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(operation.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Valor Operado</div>
                        <div className="text-white font-medium">${operation.amount.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Spread</div>
                        <div className="text-yellow-400 font-medium">{operation.spread.toFixed(3)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Duração</div>
                        <div className="text-blue-400 font-medium">{operation.duration}s</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Exchanges</div>
                        <div className="text-purple-400 font-medium text-xs">
                          {operation.exchanges.join(' ↔ ')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Indicador de rentabilidade */}
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Rentabilidade:</span>
                        <span className="text-green-400 font-medium">
                          +{((operation.profit / operation.amount) * 100).toFixed(3)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-800 pt-4 flex justify-end">
            <Button
              onClick={() => setShowOperationHistory(false)}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Investment Modal - Dark Theme Improved */}
      <Dialog open={isInvestModalOpen} onOpenChange={setIsInvestModalOpen}>
        <DialogContent className="max-w-sm sm:max-w-md mx-4 bg-gray-900 border-gray-800 text-white">
          <DialogHeader className="border-b border-gray-800 pb-4">
            <DialogTitle className="text-lg sm:text-xl text-white flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              {selectedInvestment ? `Ativar ${selectedInvestment.name}` : 'Ativar Investimento'}
            </DialogTitle>
          </DialogHeader>
          {selectedInvestment && (
            <div className="space-y-6">
              {/* Plan Info Card - Dark */}
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{selectedInvestment.name}</h3>
                    <p className="text-sm text-gray-400">{selectedInvestment.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Taxa Diária</p>
                    <p className="text-primary font-bold text-lg">
                      {selectedInvestment.dailyRate}%
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Operações</p>
                    <p className="text-white font-bold text-lg">
                      {selectedInvestment.operations}x/dia
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Mínimo</p>
                    <p className="text-green-400 font-bold text-lg">
                      ${selectedInvestment.minimumAmount}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Máximo</p>
                    <p className="text-yellow-400 font-bold text-lg">
                      ${selectedInvestment.maximumAmount}
                    </p>
                  </div>
                </div>
                
                {/* Requisitos e Taxas */}
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">Indicações necessárias:</strong> {selectedInvestment.requiredReferrals} ativos
                      </span>
                    </div>
                    {selectedInvestment.contractFee > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-gray-300">
                          <strong className="text-white">Taxa de contrato:</strong> ${selectedInvestment.contractFee} USDT
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Investment Amount Input - Dark */}
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-white font-medium">Valor do Investimento</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    placeholder={`Mínimo: $${selectedInvestment.minimumAmount}`}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-primary"
                    min={selectedInvestment.minimumAmount}
                    max={selectedInvestment.maximumAmount}
                    step="0.01"
                  />
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {[selectedInvestment.minimumAmount, 50, 100, 150, 200].filter(amount => amount <= selectedInvestment.maximumAmount).map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setInvestmentAmount(amount.toString())}
                      className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>

                {/* Rentabilidade Preview */}
                {investmentAmount && parseFloat(investmentAmount) > 0 && selectedInvestment && (
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <div className="text-center space-y-3">
                      <h4 className="text-sm font-bold text-primary">📈 Projeção de Rentabilidade</h4>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-gray-800/50 rounded p-2">
                          <p className="text-gray-400">Ganho Diário</p>
                          <p className="text-green-400 font-bold">
                            +${((parseFloat(investmentAmount) * selectedInvestment.dailyRate) / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded p-2">
                          <p className="text-gray-400">Ganho Semanal</p>
                          <p className="text-blue-400 font-bold">
                            +${((parseFloat(investmentAmount) * selectedInvestment.dailyRate * 7) / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded p-2">
                          <p className="text-gray-400">Ganho Mensal</p>
                          <p className="text-yellow-400 font-bold">
                            +${((parseFloat(investmentAmount) * selectedInvestment.dailyRate * 30) / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded p-2">
                          <p className="text-gray-400">Ganho em 40 dias</p>
                          <p className="text-purple-400 font-bold">
                            +${((parseFloat(investmentAmount) * selectedInvestment.dailyRate * 40) / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/30 rounded p-2">
                        <p className="text-xs text-gray-400">Valor total após 40 dias:</p>
                        <p className="text-white font-bold text-lg">
                          ${(parseFloat(investmentAmount) + (parseFloat(investmentAmount) * selectedInvestment.dailyRate * 40) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drag to Activate Slider */}
               <div className="space-y-4">
                 <div className="text-center">
                   <p className="text-gray-400 text-sm mb-2">
                     {isActivated ? "✅ Investimento Ativado!" : "Arraste para ativar o investimento"}
                   </p>
                 </div>
                 
                 <div className="relative">
                   <div className="h-14 bg-gray-800 rounded-full border-2 border-gray-700 overflow-hidden relative">
                     {/* Progress background */}
                     <div 
                       className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 transition-all duration-300"
                       style={{ width: `${sliderProgress}%` }}
                     ></div>
                     
                     {/* Background gradient */}
                     <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-primary/5 to-primary/10"></div>
                     
                     {/* Slider track */}
                     <div className="relative h-full flex items-center px-2">
                       <div 
                         className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                           isActivated 
                             ? 'bg-green-500 cursor-default' 
                             : isDragging 
                               ? 'bg-primary/90 cursor-grabbing scale-110' 
                               : 'bg-primary cursor-grab hover:scale-105'
                         }`}
                         style={{ 
                           transform: `translateX(${sliderProgress * 2.8}px)`,
                           transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                         }}
                         onMouseDown={(e) => {
                           if (isActivated) return;
                           setIsDragging(true);
                           const startX = e.clientX;
                           const slider = e.currentTarget.parentElement?.parentElement;
                           if (!slider) return;
                           
                           const handleMouseMove = (moveEvent: MouseEvent) => {
                             const rect = slider.getBoundingClientRect();
                             const deltaX = moveEvent.clientX - startX;
                             const maxWidth = rect.width - 48; // Account for button width
                             const progress = Math.min(Math.max((deltaX / maxWidth) * 100, 0), 100);
                             setSliderProgress(progress);
                             
                             if (progress >= 85) {
                               setIsActivated(true);
                               setSliderProgress(100);
                               setTimeout(() => {
                                 handleInvest();
                               }, 500);
                               document.removeEventListener('mousemove', handleMouseMove);
                               document.removeEventListener('mouseup', handleMouseUp);
                             }
                           };
                           
                           const handleMouseUp = () => {
                             setIsDragging(false);
                             if (!isActivated && sliderProgress < 85) {
                               setSliderProgress(0);
                             }
                             document.removeEventListener('mousemove', handleMouseMove);
                             document.removeEventListener('mouseup', handleMouseUp);
                           };
                           
                           document.addEventListener('mousemove', handleMouseMove);
                           document.addEventListener('mouseup', handleMouseUp);
                         }}
                         onTouchStart={(e) => {
                           if (isActivated) return;
                           setIsDragging(true);
                           const startX = e.touches[0].clientX;
                           const slider = e.currentTarget.parentElement?.parentElement;
                           if (!slider) return;
                           
                           const handleTouchMove = (moveEvent: TouchEvent) => {
                             const rect = slider.getBoundingClientRect();
                             const deltaX = moveEvent.touches[0].clientX - startX;
                             const maxWidth = rect.width - 48;
                             const progress = Math.min(Math.max((deltaX / maxWidth) * 100, 0), 100);
                             setSliderProgress(progress);
                             
                             if (progress >= 85) {
                               setIsActivated(true);
                               setSliderProgress(100);
                               setTimeout(() => {
                                 handleInvest();
                               }, 500);
                               document.removeEventListener('touchmove', handleTouchMove);
                               document.removeEventListener('touchend', handleTouchEnd);
                             }
                           };
                           
                           const handleTouchEnd = () => {
                             setIsDragging(false);
                             if (!isActivated && sliderProgress < 85) {
                               setSliderProgress(0);
                             }
                             document.removeEventListener('touchmove', handleTouchMove);
                             document.removeEventListener('touchend', handleTouchEnd);
                           };
                           
                           document.addEventListener('touchmove', handleTouchMove);
                           document.addEventListener('touchend', handleTouchEnd);
                         }}
                       >
                         {isActivated ? (
                           <CheckCircle className="h-5 w-5 text-white" />
                         ) : (
                           <ChevronRight className="h-5 w-5 text-white" />
                         )}
                       </div>
                       
                       {/* Text overlay */}
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className={`font-medium text-sm transition-all duration-300 ${
                           sliderProgress > 50 ? 'text-white' : 'text-gray-400'
                         }`}>
                           {isActivated ? '✅ Ativado!' : sliderProgress > 50 ? 'Continue arrastando →' : 'Arraste para ativar →'}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

              {/* Steps Info - Dark */}
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Play className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-primary">Como funciona</h4>
                </div>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">1</span>
                    </div>
                    <p>Arraste o botão para confirmar o investimento</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">2</span>
                    </div>
                    <p>Faça o depósito do valor na página de depósitos</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">3</span>
                    </div>
                    <p>Seu plano será ativado automaticamente</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Dark */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsInvestModalOpen(false)}
                  className="flex-1 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleInvest} 
                  disabled={!investmentAmount}
                  className="flex-1 font-semibold bg-primary hover:bg-primary/90 text-white"
                >
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Confirmar
                    </>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Execution Popup */}
      <Dialog open={showExecutionPopup} onOpenChange={setShowExecutionPopup}>
        <DialogContent className="max-w-sm mx-4 bg-gray-900 border-gray-800 text-white">
          <div className="text-center space-y-6 py-4">
            {/* Header */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">Ativando Plano</h3>
            </div>

            {/* Progress */}
            <div className="space-y-4">
              <div className="relative">
                <Progress 
                  value={executionProgress} 
                  className="h-3 bg-gray-800"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full opacity-50 animate-pulse" />
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <p className="text-gray-300 text-sm font-medium">{executionStep}</p>
              <p className="text-xs text-gray-500">Aguarde enquanto configuramos seu investimento...</p>
            </div>

            {/* Progress Percentage */}
            <div className="text-2xl font-bold text-primary">
              {Math.round(executionProgress)}%
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Operation History Modal */}
      <Dialog open={showOperationHistory} onOpenChange={setShowOperationHistory}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-gray-900 border-gray-800 text-white">
          <DialogHeader className="border-b border-gray-800 pb-4">
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              Histórico Completo de Arbitragem
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {operationHistory.length}
                  </div>
                  <div className="text-sm text-gray-400">Total de Operações</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    ${operationHistory.reduce((sum, op) => sum + op.profit, 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Lucro Total</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {operationHistory.length > 0 ? (operationHistory.reduce((sum, op) => sum + op.spread, 0) / operationHistory.length).toFixed(3) : '0.000'}%
                  </div>
                  <div className="text-sm text-gray-400">Spread Médio</div>
                </div>
              </div>
            </div>

            {/* Lista de Operações Detalhada */}
            {operationHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhuma operação realizada</h3>
                <p className="text-gray-500">Execute operações para ver o histórico detalhado aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {operationHistory.map((operation) => (
                  <div key={operation.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <ArrowUpDown className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xl">{operation.pair}</div>
                          <div className="text-sm text-gray-400">
                            {operation.investmentName} • {operation.operationType}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">
                          +${operation.profit.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(operation.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    {/* Detalhes da Arbitragem */}
                    <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                      <div className="text-sm font-medium text-yellow-400 mb-3">🔍 Detalhes da Arbitragem</div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Compra */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-blue-400 font-medium text-sm">COMPRA</span>
                          </div>
                          <div className="text-white font-bold">{operation.exchanges[0]}</div>
                          <div className="text-blue-200">
                            ${operation.buyPrice ? operation.buyPrice.toFixed(4) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Volume: ${operation.amount.toFixed(2)}
                          </div>
                        </div>

                        {/* Venda */}
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 font-medium text-sm">VENDA</span>
                          </div>
                          <div className="text-white font-bold">{operation.exchanges[1]}</div>
                          <div className="text-green-200">
                            ${operation.sellPrice ? operation.sellPrice.toFixed(4) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Lucro: +${operation.profit.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Métricas da Operação */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Spread Capturado</div>
                        <div className="text-yellow-400 font-bold text-lg">{operation.spread.toFixed(3)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Duração Total</div>
                        <div className="text-blue-400 font-medium">{operation.duration}s</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Rentabilidade</div>
                        <div className="text-green-400 font-medium">
                          +{((operation.profit / operation.amount) * 100).toFixed(3)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Exchanges</div>
                        <div className="text-purple-400 font-medium text-xs">
                          {operation.exchanges.join(' ↔ ')}
                        </div>
                      </div>
                    </div>

                    {/* Fluxo de Arbitragem */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="text-xs text-gray-400 mb-2">Fluxo da Operação:</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-300">🔍 Detectar → 💰 Comprar → 📈 Transferir → 💸 Vender → ✅ Lucro</span>
                        <span className="text-green-400 font-medium">
                          ROI: +{((operation.profit / operation.amount) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-800 pt-4 flex justify-end">
            <Button
              onClick={() => setShowOperationHistory(false)}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trading Simulator */}
      {selectedInvestmentForTrading && (
        <TradingSimulator
          isOpen={isTradingSimulatorOpen}
          onClose={() => {
            setIsTradingSimulatorOpen(false);
            setSelectedInvestmentForTrading(null);
          }}
          investmentAmount={selectedInvestmentForTrading.amount}
          dailyRate={selectedInvestmentForTrading.dailyRate}
          planName={selectedInvestmentForTrading.investmentName}
          totalActiveOperations={getTotalActiveOperations()}
          onComplete={handleTradingComplete}
        />
      )}

      {/* Modal de Plano Bloqueado */}
      <Dialog open={showBlockedModal} onOpenChange={setShowBlockedModal}>
        <DialogContent className="bg-gray-900 border border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-red-400 flex items-center justify-center gap-2">
              <Lock className="h-6 w-6" />
              Plano Bloqueado
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="text-2xl mb-2">{blockedPlanInfo?.planName}</div>
              <div className="text-red-400 font-medium">Bloqueado por você!</div>
              <div className="text-red-300 text-sm mt-1">Faltam indicações necessárias</div>
            </div>
            
            {/* Requisito Bloqueador */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="text-red-400 mb-2 font-medium">❌ Bloqueado por:</div>
              <div className="text-white font-medium">
                {blockedPlanInfo?.planId === 'robo-4-0-5' && 'Indicações necessárias: 10 ativos (pessoas indicadas)'}
                {blockedPlanInfo?.planId === 'robo-4-1-0' && 'Indicações necessárias: 20 ativos (pessoas indicadas)'}
              </div>
              <div className="text-gray-300 text-sm mt-1">
                Você precisa indicar mais pessoas para desbloquear este plano
              </div>
              
              {/* Progresso das Indicações */}
              <div className="mt-3 pt-3 border-t border-red-500/20">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-300">Suas indicações:</span>
                  <span className="text-white font-medium">{referralCount} ativos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={
                      blockedPlanInfo?.planId === 'robo-4-0-5' 
                        ? (referralCount / 10) * 100 
                        : (referralCount / 20) * 100
                    } 
                    className="flex-1" 
                  />
                  <span className="text-white text-xs font-medium">
                    {referralCount}/{blockedPlanInfo?.planId === 'robo-4-0-5' ? '10' : '20'}
                  </span>
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Faltam {blockedPlanInfo?.planId === 'robo-4-0-5' ? 10 - referralCount : 20 - referralCount} indicações
                </div>
              </div>
            </div>
            
            {/* Características do Bot Bloqueado */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-blue-400 mb-3 font-medium">🤖 Características do Bot</div>
              <div className="space-y-2 text-sm text-left">
                {blockedPlanInfo?.planId === 'robo-4-0-5' && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">Indicações necessárias:</strong> 10 ativos (pessoas indicadas)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">Taxa diária:</strong> 3,0%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">Investimento mínimo:</strong> $20 USDT
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">Extra:</strong> precisa assinar contrato e pagar $10 USDT
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">3 operações automáticas</strong> por dia
                      </span>
                    </div>
                  </>
                )}
                {blockedPlanInfo?.planId === 'robo-4-1-0' && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">Indicações necessárias:</strong> 20 ativos (pessoas indicadas)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">Taxa diária:</strong> 4,0%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">Investimento mínimo:</strong> $500 USDT
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">Extra:</strong> precisa assinar contrato e pagar $10 USDT
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-300">
                        <strong className="text-white">4 operações automáticas</strong> por dia
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
              <div className="text-green-400 mb-1">💰 Potencial de ganhos:</div>
              <div className="text-white font-medium">{blockedPlanInfo?.potentialEarnings}</div>
            </div>
            
            {/* Progresso da Missão */}
            {blockedPlanInfo?.missionProgress && (
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                <div className="text-blue-400 mb-2 font-medium">📊 Progresso da Missão</div>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={blockedPlanInfo.missionProgress.progress} className="flex-1" />
                  <span className="text-white text-sm font-medium">
                    {blockedPlanInfo.missionProgress.completed}/{blockedPlanInfo.missionProgress.total}
                  </span>
                </div>
                <div className="text-gray-300 text-xs">
                  {blockedPlanInfo.missionProgress.progress.toFixed(0)}% concluído
                </div>
              </div>
            )}
            
            {/* Requisitos da Missão */}
            {blockedPlanInfo?.missionRequirements && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="text-yellow-400 mb-3 font-medium">🎯 {blockedPlanInfo.missionRequirements.title}</div>
                <div className="text-gray-300 text-sm mb-3">{blockedPlanInfo.missionRequirements.description}</div>
                
                <div className="space-y-2">
                  {blockedPlanInfo.missionRequirements.tasks.map((task: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">{task}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="text-green-400 font-medium text-sm">🏆 Recompensa: {blockedPlanInfo.missionRequirements.reward}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowBlockedModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600"
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                setShowBlockedModal(false);
                // Redirecionar para o plano necessário
                if (blockedPlanInfo?.planId === 'robo-4-0-5') {
                  handleActivatePlan('robo-4-0-0');
                } else if (blockedPlanInfo?.planId === 'robo-4-1-0') {
                  handleActivatePlan('robo-4-0-5');
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Ver Missão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Investments;
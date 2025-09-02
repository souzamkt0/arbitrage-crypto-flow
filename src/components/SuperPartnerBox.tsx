import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Sparkles,
  Zap,
  Star,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface SuperPartnerBoxProps {
  partnerBalance: number;
  totalCommission: number;
  canWithdraw: boolean;
  nextWithdrawalDate: Date | null;
  isWithdrawing: boolean;
  onWithdraw: () => void;
}

export const SuperPartnerBox = ({
  partnerBalance,
  totalCommission,
  canWithdraw,
  nextWithdrawalDate,
  isWithdrawing,
  onWithdraw
}: SuperPartnerBoxProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedBalance, setAnimatedBalance] = useState(0);

  // Animação do saldo
  useEffect(() => {
    const duration = 2000; // 2 segundos
    const steps = 60;
    const increment = partnerBalance / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= partnerBalance) {
        current = partnerBalance;
        clearInterval(timer);
      }
      setAnimatedBalance(current);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [partnerBalance]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getTimeUntilFriday = () => {
    if (!nextWithdrawalDate) return "";
    
    const now = new Date();
    const diff = nextWithdrawalDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Hoje!";
    if (days === 1) return "Amanhã";
    return `${days} dias`;
  };

  return (
    <Card 
      className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-yellow-800/20 border-2 border-yellow-400/30 shadow-2xl transition-all duration-500 hover:shadow-yellow-500/25 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-orange-400/5" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/10 rounded-full translate-y-12 -translate-x-12" />
      
      {/* Sparkle Effects */}
      <div className="absolute top-4 right-4">
        <Sparkles className={`h-6 w-6 text-yellow-500 transition-all duration-300 ${isHovered ? 'animate-pulse scale-110' : ''}`} />
      </div>
      <div className="absolute top-6 right-16">
        <Star className={`h-4 w-4 text-orange-500 transition-all duration-500 ${isHovered ? 'animate-spin' : ''}`} />
      </div>

      <CardContent className="relative p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Crown className={`h-12 w-12 text-yellow-600 dark:text-yellow-400 transition-all duration-300 ${isHovered ? 'scale-110 rotate-12' : ''}`} />
              <div className="absolute -top-1 -right-1">
                <Zap className="h-4 w-4 text-orange-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-700 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
                Sócio Premium
              </h2>
              <p className="text-sm text-yellow-700/70 dark:text-yellow-300/70 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Rendimentos exclusivos
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-4 py-2 shadow-lg">
            <Crown className="h-3 w-3 mr-1" />
            VIP
          </Badge>
        </div>

        {/* Main Balance */}
        <div className="text-center space-y-4 py-6">
          <div className="space-y-2">
            <p className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
              Saldo Disponível
            </p>
            <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
              {formatCurrency(animatedBalance)}
            </div>
            <p className="text-sm text-yellow-700/60 dark:text-yellow-300/60">
              1% de todos os depósitos da plataforma
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4 border border-yellow-300/30">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {formatCurrency(totalCommission)}
              </div>
              <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">
                Total Acumulado
              </p>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4 border border-orange-300/30">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {getTimeUntilFriday()}
              </div>
              <p className="text-xs text-orange-600/70 dark:text-orange-400/70">
                Próximo Saque
              </p>
            </div>
          </div>
        </div>

        {/* Withdrawal Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border border-yellow-300/30">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Saques às Sextas-feiras
                </p>
                <p className="text-sm text-yellow-700/70 dark:text-yellow-300/70">
                  {nextWithdrawalDate ? formatDate(nextWithdrawalDate) : "Calculando..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canWithdraw ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-orange-500" />
              )}
              <span className={`text-sm font-medium ${canWithdraw ? 'text-green-600' : 'text-orange-600'}`}>
                {canWithdraw ? 'Disponível' : 'Aguardando'}
              </span>
            </div>
          </div>

          {/* Withdrawal Button */}
          <Button
            onClick={onWithdraw}
            disabled={!canWithdraw || isWithdrawing || partnerBalance <= 0}
            className={`w-full h-14 text-lg font-bold transition-all duration-300 ${
              canWithdraw && partnerBalance > 0
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-xl hover:shadow-yellow-500/25 hover:scale-105'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isWithdrawing ? (
              <>
                <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                Processando Saque...
              </>
            ) : canWithdraw && partnerBalance > 0 ? (
              <>
                <Download className="h-5 w-5 mr-3" />
                Sacar {formatCurrency(partnerBalance)}
              </>
            ) : partnerBalance <= 0 ? (
              <>
                <AlertCircle className="h-5 w-5 mr-3" />
                Sem Saldo Disponível
              </>
            ) : (
              <>
                <Clock className="h-5 w-5 mr-3" />
                Disponível às Sextas-feiras
              </>
            )}
          </Button>

          {!canWithdraw && partnerBalance > 0 && (
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 border border-orange-300/30 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-300 text-center flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                Saques liberados apenas às sextas-feiras
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};



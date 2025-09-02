import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Calendar, 
  TrendingUp,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  DollarSign,
  Star,
  Zap
} from "lucide-react";

interface PremiumPartnerBannerProps {
  partnerBalance: number;
  totalCommission: number;
  canWithdraw: boolean;
  nextWithdrawalDate: Date | null;
  isWithdrawing: boolean;
  onWithdraw: () => void;
  partnerEmail?: string;
  commissionRate?: number;
}

export const PremiumPartnerBanner = ({
  partnerBalance,
  totalCommission,
  canWithdraw,
  nextWithdrawalDate,
  isWithdrawing,
  onWithdraw,
  partnerEmail,
  commissionRate = 1.00
}: PremiumPartnerBannerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [timeUntilFriday, setTimeUntilFriday] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTimeUntilFriday = () => {
    if (!nextWithdrawalDate) return "";
    
    const now = new Date();
    const diff = nextWithdrawalDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days === 0 && hours <= 0) return "Disponível agora!";
    if (days === 0) return `${hours}h restantes`;
    if (days === 1) return "Amanhã";
    return `${days} dias`;
  };

  useEffect(() => {
    const updateTimer = () => {
      setTimeUntilFriday(calculateTimeUntilFriday());
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Atualizar a cada minuto
    
    return () => clearInterval(interval);
  }, [nextWithdrawalDate]);

  return (
    <div className="w-full mb-6">
      <Card 
        className="relative overflow-hidden bg-gradient-to-r from-[#F0B90B]/20 via-[#F0B90B]/10 to-[#FCD535]/20 border-2 border-[#F0B90B]/40 shadow-2xl shadow-[#F0B90B]/10 transition-all duration-500 hover:shadow-[#F0B90B]/20 hover:scale-[1.01]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Effects - Binance Style */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F0B90B]/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#FCD535]/15 to-transparent rounded-full translate-y-12 -translate-x-12" />
        
        {/* Floating Particles */}
        <div className="absolute top-4 right-8">
          <Sparkles className={`h-5 w-5 text-[#F0B90B] transition-all duration-300 ${isHovered ? 'animate-pulse scale-110' : 'animate-bounce'}`} />
        </div>
        <div className="absolute top-8 right-16">
          <Star className={`h-3 w-3 text-[#FCD535] transition-all duration-500 ${isHovered ? 'animate-spin' : ''}`} />
        </div>

        <CardContent className="relative p-6 lg:p-8">
          {/* Premium Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center gap-4 mb-4 lg:mb-0">
              <div className="relative">
                <Crown className={`h-10 w-10 lg:h-12 lg:w-12 text-[#F0B90B] transition-all duration-300 ${isHovered ? 'scale-110 rotate-12' : ''}`} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#F0B90B] to-[#FCD535] rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#F0B90B] via-[#FCD535] to-[#F0B90B] bg-clip-text text-transparent">
                  Sócio Premium
                </h1>
                <p className="text-sm lg:text-base text-[#F0B90B]/80 font-medium">
                  Ganhos exclusivos • {commissionRate}% sobre depósitos
                </p>
                {partnerEmail && (
                  <p className="text-xs text-gray-400 mt-1">
                    {partnerEmail}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-[#F0B90B] to-[#FCD535] text-black font-bold px-4 py-2 text-sm shadow-lg">
                <Zap className="h-4 w-4 mr-1" />
                VIP ELITE
              </Badge>
              <Badge variant="outline" className="border-[#F0B90B]/50 text-[#F0B90B] font-medium">
                <Crown className="h-3 w-3 mr-1" />
                Partner
              </Badge>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            {/* Available Balance */}
            <div className="lg:col-span-2 bg-gradient-to-br from-black/40 via-black/20 to-black/40 rounded-xl p-4 lg:p-6 border border-[#F0B90B]/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-[#F0B90B]" />
                <span className="text-sm font-medium text-[#F0B90B]/90">Saldo Disponível</span>
              </div>
              <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#F0B90B] via-[#FCD535] to-[#F0B90B] bg-clip-text text-transparent mb-2">
                {formatCurrency(partnerBalance)}
              </div>
              <p className="text-xs text-gray-400">
                Comissões acumuladas para saque
              </p>
            </div>

            {/* Total Earned */}
            <div className="bg-gradient-to-br from-[#F0B90B]/10 via-transparent to-[#FCD535]/10 rounded-xl p-4 border border-[#F0B90B]/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-[#F0B90B]" />
                <span className="text-sm font-medium text-[#F0B90B]/90">Total Acumulado</span>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-[#F0B90B]">
                {formatCurrency(totalCommission)}
              </div>
              <p className="text-xs text-gray-400">
                Ganhos históricos
              </p>
            </div>

            {/* Next Withdrawal */}
            <div className="bg-gradient-to-br from-[#F0B90B]/10 via-transparent to-[#FCD535]/10 rounded-xl p-4 border border-[#F0B90B]/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-[#F0B90B]" />
                <span className="text-sm font-medium text-[#F0B90B]/90">Próximo Saque</span>
              </div>
              <div className="text-lg lg:text-xl font-bold text-[#FCD535]">
                {timeUntilFriday || "Calculando..."}
              </div>
              <p className="text-xs text-gray-400">
                Toda sexta-feira
              </p>
            </div>
          </div>

          {/* Withdrawal Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 lg:p-6 bg-gradient-to-r from-[#F0B90B]/5 via-black/20 to-[#FCD535]/5 rounded-xl border border-[#F0B90B]/30">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full transition-all duration-300 ${
                canWithdraw 
                  ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30' 
                  : 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-400/30'
              }`}>
                {canWithdraw ? (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                ) : (
                  <Clock className="h-6 w-6 text-orange-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  {canWithdraw ? '✅ Saque Liberado' : '⏰ Aguardando Sexta'}
                </h3>
                <p className="text-sm text-gray-400">
                  {canWithdraw 
                    ? 'Você pode sacar seus ganhos agora' 
                    : 'Saques são processados toda sexta-feira'
                  }
                </p>
              </div>
            </div>

            <Button
              onClick={onWithdraw}
              disabled={!canWithdraw || isWithdrawing || partnerBalance <= 0}
              className={`min-w-[160px] h-12 font-bold text-base transition-all duration-300 ${
                canWithdraw && partnerBalance > 0
                  ? 'bg-gradient-to-r from-[#F0B90B] to-[#FCD535] hover:from-[#F0B90B]/90 hover:to-[#FCD535]/90 text-black shadow-lg shadow-[#F0B90B]/25 hover:shadow-[#F0B90B]/40 hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isWithdrawing ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : canWithdraw && partnerBalance > 0 ? (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Sacar {formatCurrency(partnerBalance)}
                </>
              ) : partnerBalance <= 0 ? (
                <>
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Sem Saldo Disponível
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 mr-2" />
                  Aguardar Sexta-feira
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 p-4 bg-black/20 rounded-lg border border-[#F0B90B]/20">
            <div className="flex items-center gap-2 text-sm text-[#F0B90B]/80">
              <Sparkles className="h-4 w-4" />
              <span>
                Como sócio, você recebe <strong>{commissionRate}%</strong> de todos os depósitos confirmados na plataforma
              </span>
            </div>
          </div>
        </CardContent>

        {/* Animated Border Effect */}
        <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-[#F0B90B]/30 via-[#FCD535]/30 to-[#F0B90B]/30 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
             style={{
               background: 'linear-gradient(90deg, #F0B90B30, #FCD53530, #F0B90B30)',
               WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
               WebkitMaskComposite: 'xor',
               maskComposite: 'exclude'
             }} 
        />
      </Card>
    </div>
  );
};

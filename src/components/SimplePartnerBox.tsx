import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles
} from "lucide-react";

interface SimplePartnerBoxProps {
  partnerBalance: number;
  totalCommission: number;
  canWithdraw: boolean;
  nextWithdrawalDate: Date | null;
  isWithdrawing: boolean;
  onWithdraw: () => void;
}

export const SimplePartnerBox = ({
  partnerBalance,
  totalCommission,
  canWithdraw,
  nextWithdrawalDate,
  isWithdrawing,
  onWithdraw
}: SimplePartnerBoxProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
      className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-yellow-600/10 border border-yellow-400/30 shadow-lg transition-all duration-300 hover:shadow-yellow-500/20 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/5 rounded-full -translate-y-10 translate-x-10" />
      <div className="absolute top-2 right-4">
        <Sparkles className={`h-4 w-4 text-yellow-500 transition-all duration-300 ${isHovered ? 'animate-pulse scale-110' : ''}`} />
      </div>

      <CardContent className="relative p-6">

        {/* Balance Display */}
        <div className="text-center mb-4">
          <p className="text-sm text-yellow-300/80 mb-1">
            Saldo Disponível
          </p>
          <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent">
            {formatCurrency(partnerBalance)}
          </div>
          <p className="text-xs text-yellow-400/60 mt-1">
            1% dos depósitos da plataforma
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-black/20 rounded-lg p-3 border border-yellow-400/20">
            <div className="text-lg font-bold text-yellow-400">
              {formatCurrency(totalCommission)}
            </div>
            <p className="text-xs text-yellow-300/70">
              Total Acumulado
            </p>
          </div>
          <div className="bg-black/20 rounded-lg p-3 border border-orange-400/20">
            <div className="text-lg font-bold text-orange-400">
              {getTimeUntilFriday()}
            </div>
            <p className="text-xs text-orange-300/70">
              Próximo Saque
            </p>
          </div>
        </div>

        {/* Withdrawal Status */}
        <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-400/20 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-yellow-200">
              Saques às Sextas
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canWithdraw ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <Clock className="h-4 w-4 text-orange-400" />
            )}
            <span className={`text-sm font-medium ${canWithdraw ? 'text-green-400' : 'text-orange-400'}`}>
              {canWithdraw ? 'Disponível' : 'Aguardando'}
            </span>
          </div>
        </div>

        {/* Withdrawal Button */}
        <Button
          onClick={onWithdraw}
          disabled={!canWithdraw || isWithdrawing || partnerBalance <= 0}
          className={`w-full h-12 font-bold transition-all duration-300 ${
            canWithdraw && partnerBalance > 0
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black shadow-lg hover:shadow-yellow-500/25 hover:scale-105'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isWithdrawing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : canWithdraw && partnerBalance > 0 ? (
            <>
              <Download className="h-4 w-4 mr-2" />
              Sacar Agora
            </>
          ) : partnerBalance <= 0 ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              Sem Saldo
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Aguardar Sexta
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};



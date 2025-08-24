import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, TrendingUp, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface InvestmentPlanCardProps {
  plan: InvestmentPlan;
  userReferrals?: number;
}

export function InvestmentPlanCard({ plan, userReferrals = 0 }: InvestmentPlanCardProps) {
  const navigate = useNavigate();
  const canInvest = userReferrals >= plan.minimum_indicators;

  const handleInvest = () => {
    navigate('/investments', { state: { selectedPlan: plan } });
  };

  return (
    <Card className="bg-[#1a1f2e] border-gray-700 hover:border-teal-500/50 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-400" />
            {plan.name}
          </CardTitle>
          <Badge variant={canInvest ? "default" : "secondary"} className="bg-teal-500/20 text-teal-400">
            até {(plan.daily_rate * 100).toFixed(1)}% / dia*
          </Badge>
        </div>
        <p className="text-gray-400 text-sm">{plan.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              Valor Mínimo
            </div>
            <div className="text-white font-semibold">${plan.minimum_amount}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              Duração
            </div>
            <div className="text-white font-semibold">{plan.duration_days} dias</div>
          </div>
        </div>

        {plan.minimum_indicators > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Users className="w-4 h-4" />
              Indicações Necessárias
            </div>
            <div className="flex items-center gap-2">
              <div className="text-white font-semibold">{plan.minimum_indicators}</div>
              <Badge variant={canInvest ? "default" : "destructive"} className="text-xs">
                Você tem: {userReferrals}
              </Badge>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Recursos:</h4>
          <div className="space-y-1">
            {plan.features?.slice(0, 3).map((feature, index) => (
              <div key={index} className="text-xs text-gray-400 flex items-center gap-1">
                <div className="w-1 h-1 bg-teal-400 rounded-full"></div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleInvest}
          disabled={!canInvest}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white disabled:bg-gray-600 disabled:text-gray-400"
        >
          {canInvest ? 'Investir Agora' : `Precisa de ${plan.minimum_indicators} indicações ativas`}
        </Button>

        {plan.max_investment_amount && (
          <div className="text-xs text-gray-500 text-center">
            Máximo: ${plan.max_investment_amount}
          </div>
        )}
        
        <div className="text-xs text-gray-500 text-center">
          * Ganhos variáveis através de arbitragem, não garantidos
        </div>
      </CardContent>
    </Card>
  );
}
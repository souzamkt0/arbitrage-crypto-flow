import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, TrendingUp, Clock, Users, Calculator, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [simulatorValue, setSimulatorValue] = useState<number>(plan.minimum_amount);

  const handleInvest = () => {
    navigate('/investments', { state: { selectedPlan: plan } });
  };

  // Gerar dados do gráfico de trading simulado
  const generateTradingData = () => {
    const data = [];
    let price = 45000; // Preço inicial do BTC
    
    for (let i = 0; i < 24; i++) {
      const variation = (Math.random() - 0.5) * 1000; // Variação aleatória
      price += variation;
      data.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        price: Math.round(price),
        profit: Math.random() * 2, // Lucro de 0-2%
      });
    }
    return data;
  };

  const tradingData = generateTradingData();

  // Calcular simulação de ganhos
  const calculateSimulation = (amount: number) => {
    const days = plan.name === 'Robô 4.0.0' ? 30 : plan.duration_days;
    let total = amount;
    const dailyGains = [];
    
    for (let day = 1; day <= days; day++) {
      const dailyRate = Math.random() * plan.daily_rate; // Taxa variável até o máximo
      const dailyGain = total * dailyRate;
      total += dailyGain;
      
      if (day <= 7) { // Mostrar apenas os primeiros 7 dias
        dailyGains.push({
          day,
          gain: dailyGain,
          total: total
        });
      }
    }
    
    return {
      finalAmount: total,
      totalProfit: total - amount,
      profitPercentage: ((total - amount) / amount) * 100,
      dailyGains
    };
  };

  const simulation = calculateSimulation(simulatorValue);

  return (
    <Card className="bg-[#1a1f2e] border-gray-700 hover:border-teal-500/50 transition-all duration-300">
      {/* Header com lucro diário potencial */}
      {canInvest && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 rounded-t-lg">
          <div className="flex justify-between items-center text-white">
            <div>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <DollarSign className="w-4 h-4" />
                Lucro Diário Potencial
              </div>
              <div className="text-lg font-bold">Até {(plan.daily_rate * 100).toFixed(2)}% ao dia</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Simulação com ${simulatorValue.toFixed(0)}</div>
              <div className="text-lg font-bold">Até ${(simulatorValue * plan.daily_rate).toFixed(2)}/dia</div>
            </div>
          </div>
          <div className="mt-2 text-sm text-white/80">
            🎯 Participe e veja seus lucros crescerem diariamente com arbitragem automática!
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-400" />
            {plan.name}
          </CardTitle>
          <Badge variant={canInvest ? "default" : "secondary"} className="bg-teal-500/20 text-teal-400">
            {(plan.daily_rate * 100).toFixed(2)}% / dia
          </Badge>
        </div>
        <p className="text-gray-400 text-sm">{plan.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <DollarSign className="w-4 h-4" />
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

        {/* Gráfico de Trading - apenas para planos disponíveis */}
        {canInvest && (
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Trading ao Vivo (BTC/USDT)
            </h4>
            <div className="h-40 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tradingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    interval={3}
                  />
                  <YAxis 
                    hide={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    domain={['dataMin - 500', 'dataMax + 500']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #14b8a6',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: any, name: string) => [
                      name === 'price' ? `$${value.toLocaleString()}` : `${value.toFixed(2)}%`,
                      name === 'price' ? 'Preço BTC' : 'Lucro'
                    ]}
                    labelFormatter={(label) => `Hora: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#14b8a6" 
                    strokeWidth={2.5}
                    dot={{ fill: '#14b8a6', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#14b8a6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Últimas 24h</span>
              <div className="flex gap-4">
                <span className="text-teal-400">📈 +1.8% média</span>
                <span className="text-green-400">🟢 Ativo</span>
              </div>
            </div>
          </div>
        )}

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
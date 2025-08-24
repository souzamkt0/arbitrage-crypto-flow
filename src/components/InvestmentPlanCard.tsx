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

        {/* Gráfico de Trading para planos disponíveis */}
        {canInvest && (
          <div className="space-y-4 border-t border-gray-700 pt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                Trading ao Vivo (BTC/USDT)
              </h4>
              <div className="h-32 bg-gray-800/50 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tradingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                      formatter={(value: any, name: string) => [
                        name === 'price' ? `$${value}` : `${value.toFixed(2)}%`,
                        name === 'price' ? 'Preço' : 'Lucro'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#14b8a6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Últimas 24h</span>
                <span className="text-teal-400">+1.8% média</span>
              </div>
            </div>

            {/* Simulador para planos disponíveis */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1">
                <Calculator className="w-4 h-4 text-teal-400" />
                Simulador de Ganhos ({plan.name === 'Robô 4.0.0' ? '30' : plan.duration_days} dias)
              </h4>
              
              <div className="space-y-2">
                <Label htmlFor="simulator-input" className="text-xs text-gray-400">
                  Valor do Investimento
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="simulator-input"
                    type="number"
                    value={simulatorValue}
                    onChange={(e) => setSimulatorValue(Number(e.target.value) || plan.minimum_amount)}
                    min={plan.minimum_amount}
                    max={plan.max_investment_amount || 10000}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white text-sm h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-800/30 rounded-lg p-2">
                  <div className="text-gray-400">Lucro Total</div>
                  <div className="text-teal-400 font-semibold">
                    ${simulation.totalProfit.toFixed(2)}
                  </div>
                  <div className="text-gray-500">
                    +{simulation.profitPercentage.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-2">
                  <div className="text-gray-400">Total Final</div>
                  <div className="text-white font-semibold">
                    ${simulation.finalAmount.toFixed(2)}
                  </div>
                  <div className="text-gray-500">
                    em {plan.name === 'Robô 4.0.0' ? '30' : plan.duration_days} dias
                  </div>
                </div>
              </div>

              <div className="text-xs text-amber-400 bg-amber-500/10 rounded p-2">
                ⚠️ Simulação baseada em ganhos variáveis até {(plan.daily_rate * 100).toFixed(1)}% ao dia. Resultados não garantidos.
              </div>
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
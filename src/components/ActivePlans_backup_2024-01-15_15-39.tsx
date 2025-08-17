import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  CheckCircle, 
  PlayCircle, 
  Activity,
  Clock,
  DollarSign,
  Target
} from 'lucide-react';

interface Investment {
  id: string;
  investmentName: string;
  amount: number;
  totalEarned: number;
  daysRemaining: number;
  status: string;
  startDate: string;
  endDate?: string;
  operationsCompleted: number;
  currentOperation?: {
    pair: string;
    profit: number;
    progress: number;
    timeRemaining: number;
  };
}

interface ActivePlansProps {
  userInvestments: Investment[];
  isMobile: boolean;
  activeInvestments: number;
}

export function ActivePlans({ userInvestments, isMobile, activeInvestments }: ActivePlansProps) {
  if (activeInvestments === 0) {
    return (
      <div className="bg-gradient-to-br from-muted/20 to-muted/40 border border-muted-foreground/20 rounded-xl p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-xl font-bold text-muted-foreground">
            Nenhum Plano Ativo
          </h3>
        </div>
        <p className="text-muted-foreground mb-4">
          Você ainda não possui planos de investimento ativos.
        </p>
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Para começar a investir, acesse a aba "Investimentos" e escolha um plano.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-trading-green/5 to-trading-green/10 border-2 border-trading-green/30 rounded-xl p-4 sm:p-6 space-y-4">
      <div className="text-center py-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-trading-green" />
          <h3 className="text-lg sm:text-xl font-bold text-trading-green">
            🟢 PLANOS ATIVOS
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {activeInvestments} {activeInvestments === 1 ? 'plano ativo' : 'planos ativos'} gerando rendimentos automaticamente
        </p>
      </div>

      <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'}`}>
        {userInvestments
          .filter(investment => investment.status === "active")
          .map((investment) => (
            <Card key={investment.id} className="bg-card border-border hover:shadow-lg transition-all duration-300 relative">
              {/* Indicador visual de ativo */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-trading-green to-trading-green/60 rounded-t-lg"></div>
              
              <CardHeader className={`border-b border-border/50 p-3 sm:p-4 md:p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8 sm:w-10 sm:h-10'} bg-trading-green/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <TrendingUp className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4 sm:h-5 sm:w-5'} text-trading-green`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className={`${isMobile ? 'text-sm' : 'text-base sm:text-lg'} text-foreground truncate`}>
                        {investment.investmentName}
                      </CardTitle>
                      <p className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground truncate`}>
                        Ativo desde {investment.startDate}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-trading-green text-white ml-2 flex-shrink-0 text-xs">
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className={`p-3 sm:p-4 md:p-6`}>
                <div className={`space-y-2 sm:space-y-3 md:space-y-4`}>
                  <div className="flex justify-between items-center">
                    <span className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground`}>Valor Investido</span>
                    <span className={`font-bold ${isMobile ? 'text-sm' : 'text-sm sm:text-base'} text-foreground`}>${investment.amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground`}>Ganhos Atuais</span>
                    <span className={`font-bold ${isMobile ? 'text-sm' : 'text-sm sm:text-base'} text-trading-green`}>+${investment.totalEarned.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <div className={`flex justify-between ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                      <span className="text-muted-foreground">Progresso Diário</span>
                      <span className="text-trading-green font-medium">
                        {investment.operationsCompleted}/3 operações
                      </span>
                    </div>
                    
                    <div className="flex gap-1">
                      {[1, 2, 3].map((op) => (
                        <div
                          key={op}
                          className={`flex-1 h-1.5 rounded-full ${
                            op <= investment.operationsCompleted 
                              ? 'bg-trading-green' 
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`px-2 sm:px-3 ${isMobile ? 'text-xs' : 'text-sm'}`}
                      >
                        <Activity className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      </Button>
                    </div>
                    
                    {/* Status da operação atual */}
                    {investment.currentOperation && (
                      <div className="bg-muted/30 rounded-lg p-2 sm:p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-medium text-foreground`}>
                            {investment.currentOperation.pair}
                          </span>
                          <span className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-trading-green font-medium`}>
                            +${investment.currentOperation.profit.toFixed(2)}
                          </span>
                        </div>
                        <Progress value={investment.currentOperation.progress} className="h-1.5 mb-1" />
                        <div className="flex justify-between items-center">
                          <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                            {Math.floor(investment.currentOperation.timeRemaining / 60)}:{(investment.currentOperation.timeRemaining % 60).toString().padStart(2, '0')}
                          </span>
                          <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
                            {investment.currentOperation.progress.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground`}>Dias Restantes</span>
                    <span className={`font-bold ${isMobile ? 'text-sm' : 'text-base sm:text-lg'} text-primary`}>
                      {investment.daysRemaining} dias
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}

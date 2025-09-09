import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Bot, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  Shield,
  Target,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Crown,
  Zap,
  BarChart3,
  Wallet
} from "lucide-react";

const ExplanationPage = () => {
  const navigate = useNavigate();

  const investmentPlans = [
    {
      id: 'robo-400',
      name: 'Robô 4.0.0',
      dailyRate: '0.5% a 2.0%',
      minimumAmount: 100,
      maximumAmount: 10000,
      duration: 30,
      requiredReferrals: 0,
      icon: <Bot className="w-8 h-8" />,
      color: 'bg-blue-500',
      description: 'Sistema automatizado de arbitragem básico. Ideal para iniciantes.',
      features: [
        'Arbitragem automática entre exchanges',
        'Ganhos diários variáveis',
        'Sem necessidade de indicações',
        'Operações em tempo real'
      ]
    },
    {
      id: 'robo-405',
      name: 'Robô 4.0.5',
      dailyRate: '1.0% a 3.0%',
      minimumAmount: 500,
      maximumAmount: 25000,
      duration: 30,
      requiredReferrals: 10,
      icon: <Zap className="w-8 h-8" />,
      color: 'bg-purple-500',
      description: 'Sistema avançado com maior rentabilidade.',
      features: [
        'Algoritmos otimizados',
        'Maior taxa de retorno',
        'Requer 10 indicações ativas',
        'Análise de mercado aprimorada'
      ]
    },
    {
      id: 'robo-410',
      name: 'Robô 4.1.0',
      dailyRate: '2.0% a 4.0%',
      minimumAmount: 1000,
      maximumAmount: 50000,
      duration: 30,
      requiredReferrals: 40,
      icon: <Crown className="w-8 h-8" />,
      color: 'bg-gold-500',
      description: 'Plano premium com máxima rentabilidade.',
      features: [
        'IA avançada de trading',
        'Máxima rentabilidade',
        'Requer 40 indicações ativas',
        'Acesso a estratégias premium'
      ]
    },
    {
      id: 'seja-socio',
      name: 'Seja Sócio',
      dailyRate: '0.5% a 2.0%',
      minimumAmount: 5000,
      maximumAmount: 2000000,
      duration: 365,
      requiredReferrals: 0,
      icon: <Target className="w-8 h-8" />,
      color: 'bg-gradient-to-r from-gold-400 to-gold-600',
      description: 'Participação nos lucros da empresa.',
      features: [
        'Participação no faturamento',
        'Saques semanais (sexta-feira)',
        'Potencial de $200k a $2M/dia',
        'Contato via WhatsApp'
      ]
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Cadastro e Depósito',
      description: 'Crie sua conta e faça um depósito via PIX usando o sistema DigitoPay.',
      icon: <Wallet className="w-6 h-6" />
    },
    {
      step: '2',
      title: 'Escolha do Plano',
      description: 'Selecione o plano de investimento de acordo com seu perfil e orçamento.',
      icon: <Target className="w-6 h-6" />
    },
    {
      step: '3',
      title: 'Sistema Automatizado',
      description: 'O robô executa operações de arbitragem automaticamente entre diferentes exchanges.',
      icon: <Bot className="w-6 h-6" />
    },
    {
      step: '4',
      title: 'Ganhos Diários',
      description: 'Acompanhe seus ganhos diários e o progresso do seu investimento em tempo real.',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      step: '5',
      title: 'Saques',
      description: 'Realize saques diários de seus lucros (limitado a 1 saque por dia).',
      icon: <DollarSign className="w-6 h-6" />
    }
  ];

  const arbitrageExplanation = [
    {
      title: 'O que é Arbitragem?',
      content: 'Arbitragem é a prática de comprar um ativo em uma exchange por um preço menor e vendê-lo simultaneamente em outra exchange por um preço maior, lucrando com a diferença.',
      icon: <BarChart3 className="w-6 h-6 text-blue-500" />
    },
    {
      title: 'Como Funciona?',
      content: 'Nosso robô monitora constantemente os preços de criptomoedas em múltiplas exchanges, identificando oportunidades de lucro e executando operações automaticamente.',
      icon: <Zap className="w-6 h-6 text-purple-500" />
    },
    {
      title: 'Por que é Rentável?',
      content: 'As diferenças de preço entre exchanges são comuns devido à volatilidade do mercado, volume de negociação e liquidez variada, criando oportunidades constantes.',
      icon: <TrendingUp className="w-6 h-6 text-green-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            Como Funciona o Sistema de Investimentos
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Entenda nosso sistema de arbitragem automatizada e como começar a investir
          </p>
        </div>

        {/* O que é Arbitragem */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Entendendo a Arbitragem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {arbitrageExplanation.map((item, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Como Funciona */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              Como Funciona o Processo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {howItWorks.map((step, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className={`w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto font-bold`}>
                    {step.step}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      {step.icon}
                      <h3 className="font-semibold text-sm">{step.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block">
                      <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Planos Disponíveis */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Planos de Investimento
            </h2>
            <p className="text-muted-foreground">
              Escolha o plano que melhor se adequa ao seu perfil
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {investmentPlans.map((plan, index) => (
              <Card key={plan.id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-xl ${plan.color} flex items-center justify-center text-white mb-4`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-lg font-bold">
                      {plan.dailyRate}
                    </Badge>
                    <span className="text-sm text-muted-foreground">por dia</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mínimo:</span>
                      <span className="font-medium">${plan.minimumAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Máximo:</span>
                      <span className="font-medium">${plan.maximumAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duração:</span>
                      <span className="font-medium">{plan.duration} dias</span>
                    </div>
                    {plan.requiredReferrals > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Indicações:</span>
                        <Badge variant="outline" className="text-xs">
                          {plan.requiredReferrals} pessoas
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      {plan.description}
                    </p>
                    
                    <ul className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Avisos Importantes */}
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-5 h-5" />
              Avisos Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-yellow-800 dark:text-yellow-200">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong>Riscos:</strong> Investimentos em criptomoedas envolvem riscos. 
                Os ganhos não são garantidos e podem variar conforme as condições de mercado.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong>Saques:</strong> Limitado a 1 saque por dia. 
                Processe seus saques com responsabilidade.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong>Indicações:</strong> Alguns planos requerem um número específico de indicações ativas 
                para liberar o acesso.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">Pronto para começar?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/register')} size="lg" className="min-w-[200px]">
              Criar Conta
            </Button>
            <Button onClick={() => navigate('/trading-investments')} variant="outline" size="lg" className="min-w-[200px]">
              Ver Investimentos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplanationPage;
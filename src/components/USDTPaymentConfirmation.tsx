import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentResponse } from '@/services/usdtPaymentService';
import { 
  CheckCircle, 
  CreditCard, 
  Calendar, 
  Hash,
  ArrowRight,
  Home,
  Receipt
} from 'lucide-react';

interface USDTPaymentConfirmationProps {
  paymentData: PaymentResponse & { order_description?: string; price_amount?: number };
  onStartOver: () => void;
}

export function USDTPaymentConfirmation({ paymentData, onStartOver }: USDTPaymentConfirmationProps) {
  return (
    <div className="space-y-6 animate-fade-in-scale">
      {/* Success Header */}
      <Card className="border-2 border-success text-center">
        <CardContent className="p-8">
          <div className="mx-auto w-16 h-16 bg-success rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-success-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-success mb-2">
            Pagamento Confirmado!
          </h1>
          <p className="text-muted-foreground">
            Sua transação foi processada com sucesso
          </p>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Detalhes da Transação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Valor</span>
              </div>
              <p className="text-2xl font-bold text-success">
                ${paymentData.price_amount?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-muted-foreground">
                ≈ {paymentData.pay_amount?.toFixed(8) || '0'} USDT
              </p>
            </div>

            {/* Status */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <Badge variant="default" className="bg-success text-success-foreground">
                <CheckCircle className="h-3 w-3 mr-1" />
                Confirmado
              </Badge>
            </div>

            {/* Payment ID */}
            {paymentData.payment_id && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">ID do Pagamento</span>
                </div>
                <code className="text-sm break-all">{paymentData.payment_id}</code>
              </div>
            )}

            {/* Date */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Data</span>
              </div>
              <p className="text-sm">
                {new Date().toLocaleString('pt-BR')}
              </p>
            </div>

            {/* Description */}
            {paymentData.order_description && (
              <div className="p-4 bg-muted/50 rounded-lg md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Descrição</span>
                </div>
                <p className="text-sm">{paymentData.order_description}</p>
              </div>
            )}

            {/* Payment Address */}
            {paymentData.pay_address && (
              <div className="p-4 bg-muted/50 rounded-lg md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Endereço de Pagamento</span>
                </div>
                <code className="text-sm break-all">{paymentData.pay_address}</code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary-foreground font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Pagamento Processado</p>
                <p className="text-sm text-muted-foreground">
                  Seu pagamento foi confirmado e processado com sucesso
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary-foreground font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Crédito Adicionado</p>
                <p className="text-sm text-muted-foreground">
                  O valor será creditado em sua conta em alguns minutos
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary-foreground font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Acompanhe no Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  Acesse seu dashboard para verificar o saldo atualizado
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => window.location.href = '/dashboard'}
          className="flex-1"
          size="lg"
        >
          <Home className="h-4 w-4 mr-2" />
          Ir para Dashboard
        </Button>
        
        <Button 
          onClick={onStartOver}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Novo Pagamento
        </Button>
      </div>

      {/* Support Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda? Entre em contato conosco através do suporte.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
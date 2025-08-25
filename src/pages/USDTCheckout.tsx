import React, { useState } from 'react';
import { USDTPaymentForm } from '@/components/USDTPaymentForm';
import { USDTPaymentActive } from '@/components/USDTPaymentActive';
import { USDTPaymentConfirmation } from '@/components/USDTPaymentConfirmation';
import { PaymentResponse } from '@/services/usdtPaymentService';

type CheckoutStep = 'form' | 'payment' | 'confirmation';

interface PaymentData extends PaymentResponse {
  order_description?: string;
  price_amount?: number;
}

export default function USDTCheckout() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('form');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const handlePaymentCreated = (data: PaymentResponse & { order_description?: string; price_amount?: number }) => {
    setPaymentData(data);
    setCurrentStep('payment');
  };

  const handlePaymentComplete = () => {
    setCurrentStep('confirmation');
  };

  const handleStartOver = () => {
    setCurrentStep('form');
    setPaymentData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep === 'form' 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'bg-card border-border text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 ${
              currentStep !== 'form' ? 'bg-primary' : 'bg-border'
            }`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep === 'payment' 
                ? 'bg-primary border-primary text-primary-foreground' 
                : currentStep === 'confirmation'
                ? 'bg-success border-success text-success-foreground'
                : 'bg-card border-border text-muted-foreground'
            }`}>
              2
            </div>
            <div className={`h-1 w-16 ${
              currentStep === 'confirmation' ? 'bg-success' : 'bg-border'
            }`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep === 'confirmation' 
                ? 'bg-success border-success text-success-foreground' 
                : 'bg-card border-border text-muted-foreground'
            }`}>
              3
            </div>
          </div>
          <div className="flex items-center justify-center space-x-8 mt-2">
            <span className={`text-sm ${
              currentStep === 'form' ? 'text-foreground font-medium' : 'text-muted-foreground'
            }`}>
              Dados
            </span>
            <span className={`text-sm ${
              currentStep === 'payment' ? 'text-foreground font-medium' : 'text-muted-foreground'
            }`}>
              Pagamento
            </span>
            <span className={`text-sm ${
              currentStep === 'confirmation' ? 'text-foreground font-medium' : 'text-muted-foreground'
            }`}>
              Confirmação
            </span>
          </div>
        </div>

        {/* Steps Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 'form' && (
            <USDTPaymentForm onPaymentCreated={handlePaymentCreated} />
          )}
          
          {currentStep === 'payment' && paymentData && (
            <USDTPaymentActive 
              paymentData={paymentData}
              onPaymentComplete={handlePaymentComplete}
            />
          )}
          
          {currentStep === 'confirmation' && paymentData && (
            <USDTPaymentConfirmation 
              paymentData={paymentData}
              onStartOver={handleStartOver}
            />
          )}
        </div>
      </div>
    </div>
  );
}
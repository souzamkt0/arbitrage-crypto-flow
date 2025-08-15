import React from 'react';
import { useQuickConversion } from '@/hooks/useCurrency';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CurrencyDisplayProps {
  usdAmount: number;
  showRefresh?: boolean;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Componente para exibir valores em USD e BRL
 * Mostra a conversão em tempo real
 */
export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  usdAmount,
  showRefresh = false,
  size = 'md',
  orientation = 'horizontal',
  className = ''
}) => {
  const { brlAmount, isLoading, formatBRL, formatUSD } = useQuickConversion(usdAmount);
  
  // Definir classes baseadas no tamanho
  const sizeClasses = {
    sm: {
      text: 'text-xs',
      badge: 'text-xs px-2 py-1',
      gap: 'gap-1'
    },
    md: {
      text: 'text-sm',
      badge: 'text-sm px-3 py-1',
      gap: 'gap-2'
    },
    lg: {
      text: 'text-base',
      badge: 'text-base px-4 py-2',
      gap: 'gap-3'
    }
  };
  
  const classes = sizeClasses[size];
  const isVertical = orientation === 'vertical';
  
  if (usdAmount <= 0) {
    return null;
  }
  
  return (
    <div className={`flex ${isVertical ? 'flex-col' : 'flex-row items-center'} ${classes.gap} ${className}`}>
      {/* Valor em USD */}
      <Badge variant="outline" className={`bg-blue-50 text-blue-700 border-blue-200 ${classes.badge}`}>
        {formatUSD(usdAmount)}
      </Badge>
      
      {/* Separador */}
      {!isVertical && (
        <span className="text-muted-foreground text-xs">≈</span>
      )}
      
      {/* Valor em BRL */}
      <div className="flex items-center gap-1">
        {isLoading ? (
          <Badge variant="outline" className={`bg-gray-50 text-gray-500 border-gray-200 ${classes.badge}`}>
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Convertendo...
          </Badge>
        ) : brlAmount !== null ? (
          <Badge variant="outline" className={`bg-green-50 text-green-700 border-green-200 ${classes.badge}`}>
            {formatBRL(brlAmount)}
          </Badge>
        ) : (
          <Badge variant="outline" className={`bg-red-50 text-red-700 border-red-200 ${classes.badge}`}>
            Erro na conversão
          </Badge>
        )}
        
        {/* Botão de refresh (opcional) */}
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => window.location.reload()} // Força reload para atualizar cotação
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Componente simplificado para exibir apenas o valor convertido
 */
interface SimpleCurrencyProps {
  usdAmount: number;
  currency: 'USD' | 'BRL' | 'both';
  className?: string;
}

export const SimpleCurrency: React.FC<SimpleCurrencyProps> = ({
  usdAmount,
  currency,
  className = ''
}) => {
  const { brlAmount, isLoading, formatBRL, formatUSD } = useQuickConversion(usdAmount);
  
  if (usdAmount <= 0) {
    return <span className={className}>-</span>;
  }
  
  if (isLoading) {
    return (
      <span className={`flex items-center gap-1 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        Carregando...
      </span>
    );
  }
  
  switch (currency) {
    case 'USD':
      return <span className={className}>{formatUSD(usdAmount)}</span>;
    
    case 'BRL':
      return (
        <span className={className}>
          {brlAmount !== null ? formatBRL(brlAmount) : 'Erro'}
        </span>
      );
    
    case 'both':
    default:
      return (
        <span className={`flex items-center gap-2 ${className}`}>
          <span className="text-blue-600">{formatUSD(usdAmount)}</span>
          <span className="text-muted-foreground">≈</span>
          <span className="text-green-600">
            {brlAmount !== null ? formatBRL(brlAmount) : 'Erro'}
          </span>
        </span>
      );
  }
};

/**
 * Componente para exibir informações da cotação atual
 */
interface ExchangeRateInfoProps {
  className?: string;
}

export const ExchangeRateInfo: React.FC<ExchangeRateInfoProps> = ({ className = '' }) => {
  const { brlAmount, formatBRL } = useQuickConversion(1); // Converter 1 USD para BRL
  
  if (brlAmount === null) {
    return null;
  }
  
  return (
    <div className={`text-xs text-muted-foreground ${className}`}>
      Cotação: 1 USD = {formatBRL(brlAmount)}
    </div>
  );
};
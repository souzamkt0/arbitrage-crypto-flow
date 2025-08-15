import { useState, useEffect, useCallback } from 'react';
import { currencyService, CurrencyConversion } from '@/services/currencyService';

interface UseCurrencyReturn {
  // Estado da cotação
  exchangeRate: number | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  
  // Funções de conversão
  convertUSDToBRL: (usdAmount: number) => Promise<CurrencyConversion>;
  convertBRLToUSD: (brlAmount: number) => Promise<CurrencyConversion>;
  
  // Funções de formatação
  formatBRL: (amount: number) => string;
  formatUSD: (amount: number) => string;
  
  // Utilitários
  refreshRate: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook personalizado para conversão de moedas
 * Gerencia estado da cotação e fornece funções de conversão
 */
export const useCurrency = (): UseCurrencyReturn => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Função para carregar a cotação
  const loadExchangeRate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const rate = await currencyService.getUSDToBRLRate();
      setExchangeRate(rate);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar cotação';
      setError(errorMessage);
      console.error('❌ Erro no hook useCurrency:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Carregar cotação na inicialização
  useEffect(() => {
    loadExchangeRate();
  }, [loadExchangeRate]);
  
  // Função para atualizar cotação manualmente
  const refreshRate = useCallback(async () => {
    currencyService.clearCache();
    await loadExchangeRate();
  }, [loadExchangeRate]);
  
  // Função para limpar cache
  const clearCache = useCallback(() => {
    currencyService.clearCache();
    setExchangeRate(null);
    setLastUpdate(null);
  }, []);
  
  // Funções de conversão
  const convertUSDToBRL = useCallback(async (usdAmount: number): Promise<CurrencyConversion> => {
    return await currencyService.convertUSDToBRL(usdAmount);
  }, []);
  
  const convertBRLToUSD = useCallback(async (brlAmount: number): Promise<CurrencyConversion> => {
    return await currencyService.convertBRLToUSD(brlAmount);
  }, []);
  
  // Funções de formatação
  const formatBRL = useCallback((amount: number): string => {
    return currencyService.formatBRL(amount);
  }, []);
  
  const formatUSD = useCallback((amount: number): string => {
    return currencyService.formatUSD(amount);
  }, []);
  
  return {
    exchangeRate,
    isLoading,
    error,
    lastUpdate,
    convertUSDToBRL,
    convertBRLToUSD,
    formatBRL,
    formatUSD,
    refreshRate,
    clearCache
  };
};

/**
 * Hook simplificado para conversão rápida de valores
 * Útil quando você só precisa converter um valor específico
 */
export const useQuickConversion = (usdAmount: number) => {
  const [brlAmount, setBrlAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { convertUSDToBRL } = useCurrency();
  
  useEffect(() => {
    if (usdAmount > 0) {
      setIsLoading(true);
      convertUSDToBRL(usdAmount)
        .then(conversion => {
          setBrlAmount(conversion.brlAmount);
        })
        .catch(error => {
          console.error('Erro na conversão rápida:', error);
          setBrlAmount(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setBrlAmount(null);
    }
  }, [usdAmount, convertUSDToBRL]);
  
  return {
    brlAmount,
    isLoading,
    formatBRL: (amount: number) => currencyService.formatBRL(amount),
    formatUSD: (amount: number) => currencyService.formatUSD(amount)
  };
};
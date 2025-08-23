import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Timer, AlertTriangle } from 'lucide-react';

interface DepositTimerProps {
  expiresAt: number;
  onExpired: () => void;
}

export const DepositTimer: React.FC<DepositTimerProps> = ({ expiresAt, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      
      setTimeLeft(remaining);
      
      const totalTime = 15 * 60 * 1000; // 15 minutos em ms
      const elapsedTime = totalTime - remaining;
      const progressPercent = (elapsedTime / totalTime) * 100;
      setProgress(Math.min(100, Math.max(0, progressPercent)));
      
      if (remaining <= 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft < 300000) return 'text-destructive'; // menos de 5 min
    if (timeLeft < 600000) return 'text-warning'; // menos de 10 min
    return 'text-success';
  };

  const getProgressColor = () => {
    if (progress > 80) return 'bg-destructive';
    if (progress > 60) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <Card className={`border ${timeLeft < 300000 ? 'border-destructive/30 bg-destructive/5' : 'border-success/30 bg-success/5'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className={`h-5 w-5 ${getTimerColor()}`} />
            <span className="font-medium text-foreground">Tempo Restante</span>
          </div>
          {timeLeft < 300000 && (
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
          )}
        </div>
        
        <div className="text-center space-y-3">
          <div className={`text-3xl font-bold ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </div>
          
          {/* Barra de progresso */}
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            {timeLeft < 300000 
              ? '⚠️ PIX expira em breve! Complete o pagamento'
              : 'Complete o pagamento antes do tempo esgotar'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
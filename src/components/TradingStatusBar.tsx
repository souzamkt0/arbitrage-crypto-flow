import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Shield } from 'lucide-react';

export const TradingStatusBar: React.FC = () => {
  return (
    <div className="hidden md:flex items-center gap-4">
      <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 border-success/30 text-success">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        SISTEMA ONLINE
      </Badge>
      
      <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 border-binance-yellow/30 text-binance-yellow">
        <Activity className="h-4 w-4" />
        TEMPO REAL
      </Badge>
      
      <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 border-muted-foreground/30 text-muted-foreground">
        <Shield className="h-4 w-4" />
        SEGURO
      </Badge>
    </div>
  );
};
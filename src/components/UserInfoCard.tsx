import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Wallet, TrendingUp } from 'lucide-react';
import { formatUSD } from '@/utils/currency';

interface UserInfoCardProps {
  user: any;
  profile: any;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, profile }) => {
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'partner': return 'bg-binance-yellow text-binance-black';
      default: return 'bg-success text-success-foreground';
    }
  };

  if (!user || !profile) {
    return (
      <Card className="bg-gradient-to-br from-muted/20 to-muted/5 border border-border">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-muted/5 border border-border shadow-lg">
      <CardContent className="p-6">
        {/* Header do usuário */}
        <div className="flex items-center space-x-3 mb-6">
          <Avatar className="w-12 h-12 border-2 border-success">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-success text-success-foreground font-bold">
              {getInitials(profile.display_name || profile.username || 'User')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {profile.display_name || profile.username || 'Usuário'}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {profile.email || user.email}
            </p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-6">
          <Badge className={`${getRoleColor(profile.role || 'user')} text-xs px-2 py-1`}>
            {profile.role === 'admin' ? 'ADMINISTRADOR' : 
             profile.role === 'partner' ? 'PARCEIRO' : 'TRADER'}
          </Badge>
        </div>

        {/* Saldo principal */}
        <div className="bg-gradient-to-r from-success/10 to-trading-green/10 rounded-lg p-4 mb-4 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-success" />
            <span className="text-sm text-muted-foreground">Saldo Trading</span>
          </div>
          <div className="text-2xl font-bold text-success">
            {formatUSD(profile.balance || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Disponível para trading
          </div>
        </div>

        {/* Lucros totais */}
        <div className="bg-gradient-to-r from-binance-yellow/10 to-warning/10 rounded-lg p-4 border border-binance-yellow/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-binance-yellow" />
            <span className="text-sm text-muted-foreground">Lucros Totais</span>
          </div>
          <div className="text-xl font-bold text-binance-yellow">
            {formatUSD(profile.total_profit || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Ganhos acumulados
          </div>
        </div>

        {/* Status de verificação */}
        {profile.email_verified && (
          <div className="mt-4 flex items-center gap-2 text-xs text-success">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            Conta verificada
          </div>
        )}
      </CardContent>
    </Card>
  );
};
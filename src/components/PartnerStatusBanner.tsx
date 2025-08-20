import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Shield, DollarSign, Users, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PartnerStatus {
  isPartner: boolean;
  isAdmin: boolean;
  partnerData?: {
    commission_percentage: number;
    total_earnings: number;
    total_deposits: number;
    status: string;
  };
  totalPlatformDeposits: number;
}

export const PartnerStatusBanner = () => {
  const { user } = useAuth();
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus>({
    isPartner: false,
    isAdmin: false,
    totalPlatformDeposits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkPartnerStatus();
    }
  }, [user]);

  const checkPartnerStatus = async () => {
    try {
      setLoading(true);

      // Verificar se é admin e sócio
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('user_id', user?.id)
        .single();

      if (!profileData) {
        console.log('❌ Perfil não encontrado');
        return;
      }

      const isAdmin = profileData.role === 'admin';

      // Verificar se é sócio
      const { data: partnerData } = await supabase
        .from('partners')
        .select('*')
        .eq('email', profileData.email)
        .eq('status', 'active')
        .single();

      const isPartner = !!partnerData;

      // Calcular total de depósitos da plataforma
      const { data: depositsData } = await supabase
        .from('deposits')
        .select('amount_usd')
        .eq('status', 'paid');

      const totalDeposits = depositsData?.reduce((sum, deposit) => 
        sum + (deposit.amount_usd || 0), 0) || 0;

      setPartnerStatus({
        isPartner,
        isAdmin,
        partnerData: partnerData || undefined,
        totalPlatformDeposits: totalDeposits
      });

      console.log('✅ Status verificado:', {
        isAdmin,
        isPartner,
        partnerData,
        totalDeposits
      });

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Se o usuário não estiver logado ou não for admin/sócio, não mostrar nada
  if (!user || (!partnerStatus.isAdmin && !partnerStatus.isPartner)) {
    return null;
  }

  if (loading) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <span className="ml-2 text-sm text-muted-foreground">Verificando status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const calculatePartnerEarnings = () => {
    if (!partnerStatus.partnerData) return 0;
    return partnerStatus.totalPlatformDeposits * (partnerStatus.partnerData.commission_percentage / 100);
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {partnerStatus.isAdmin && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Administrador
                </Badge>
              )}
              {partnerStatus.isPartner && (
                <Badge variant="default" className="flex items-center gap-1 bg-purple-600">
                  <Crown className="h-3 w-3" />
                  Sócio VIP
                </Badge>
              )}
            </div>
            
            {partnerStatus.isPartner && partnerStatus.partnerData && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">Comissão:</span>
                  <span className="font-semibold text-green-600">
                    {partnerStatus.partnerData.commission_percentage}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-muted-foreground">Ganhos estimados:</span>
                  <span className="font-semibold text-blue-600">
                    ${calculatePartnerEarnings().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={checkPartnerStatus}
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {partnerStatus.isPartner && (
          <div className="mt-3 p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Depósitos Plataforma:</span>
                <div className="font-semibold text-green-600">
                  ${partnerStatus.totalPlatformDeposits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Sua Comissão:</span>
                <div className="font-semibold text-purple-600">
                  {partnerStatus.partnerData?.commission_percentage || 0}%
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="font-semibold text-blue-600">
                  {partnerStatus.partnerData?.status === 'active' ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Shield, DollarSign, Users, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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
      console.log('🔍 Verificando status de sócio para usuário:', user?.id);

      // Verificar se é admin e sócio
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('user_id', user?.id)
        .single();

        if (profileError) {
          toast({
            title: "Erro ao buscar perfil",
            description: "Não foi possível carregar as informações do perfil",
            variant: "destructive"
          });
          return;
        }

      if (!profileData) {
        console.log('❌ Perfil não encontrado');
        return;
      }

      const isAdmin = profileData.role === 'admin';
      console.log('📊 Dados do perfil:', { email: profileData.email, role: profileData.role, isAdmin });

      // Verificar se é sócio
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('email', profileData.email)
        .eq('status', 'active')
        .single();

      if (partnerError && partnerError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar dados de sócio:', partnerError);
      }

      const isPartner = !!partnerData;
      console.log('🤝 Status de sócio:', { isPartner, partnerData });

      // Calcular total de depósitos da plataforma
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('amount_usd')
        .eq('status', 'paid');

      if (depositsError) {
        console.error('❌ Erro ao buscar depósitos:', depositsError);
      }

      const totalDeposits = depositsData?.reduce((sum, deposit) => 
        sum + (deposit.amount_usd || 0), 0) || 0;

      setPartnerStatus({
        isPartner,
        isAdmin,
        partnerData: partnerData || undefined,
        totalPlatformDeposits: totalDeposits
      });

      console.log('✅ Status final:', {
        isAdmin,
        isPartner,
        totalDeposits,
        willShowBanner: isAdmin || isPartner
      });

      } catch (error) {
        toast({
          title: "Erro geral",
          description: "Houve um problema ao verificar o status",
          variant: "destructive"
        });
      } finally {
      setLoading(false);
    }
  };

  // Se o usuário não estiver logado, não mostrar nada
  if (!user) {
    console.log('❌ Usuário não logado, não exibindo banner');
    return null;
  }

  // Se não for admin nem sócio, não mostrar nada
  if (!partnerStatus.isAdmin && !partnerStatus.isPartner) {
    console.log('❌ Usuário não é admin nem sócio, não exibindo banner:', {
      isAdmin: partnerStatus.isAdmin,
      isPartner: partnerStatus.isPartner,
      loading
    });
    return null;
  }

  if (loading) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-primary/10 to-warning/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
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
    <Card className="mb-6 bg-gradient-to-r from-primary/20 to-warning/20 border-2 border-primary/40 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {partnerStatus.isAdmin && (
                <Badge variant="destructive" className="flex items-center gap-1 text-sm px-3 py-1">
                  <Shield className="h-4 w-4" />
                  Administrador
                </Badge>
              )}
              {partnerStatus.isPartner && (
                <Badge className="flex items-center gap-1 bg-gradient-to-r from-primary to-warning text-primary-foreground text-sm px-3 py-1 shadow-md">
                  <Crown className="h-4 w-4" />
                  🎯 SÓCIO VIP
                </Badge>
              )}
            </div>
          </div>

          <Button
            onClick={checkPartnerStatus}
            variant="outline"
            size="sm"
            className="border-primary/50 hover:bg-primary/10"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>


      </CardContent>
    </Card>
  );
};
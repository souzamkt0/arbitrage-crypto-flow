import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Link, Users, DollarSign, Percent } from "lucide-react";

const ReferralSystem = () => {
  const [userReferralCode, setUserReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalCommission: 0,
    referralPercent: 5
  });
  const { toast } = useToast();

  useEffect(() => {
    // Simulação: gerar código único para o usuário logado
    const userName = "Usuario"; // Em produção, viria do contexto do usuário
    const code = Math.random().toString(36).substring(2, 15);
    setUserReferralCode(code);
    setReferralLink(`${window.location.origin}/register/${code}`);

    // Carregar configurações do admin
    const settings = JSON.parse(localStorage.getItem("alphabit_admin_settings") || "{}");
    if (settings.referralPercent) {
      setReferralStats(prev => ({ ...prev, referralPercent: settings.referralPercent }));
    }

    // Simular dados de indicações (em produção viria do backend)
    setReferralStats(prev => ({
      ...prev,
      totalReferrals: 3,
      totalCommission: 245.50
    }));

    // Salvar usuário com código de referral no localStorage
    const users = JSON.parse(localStorage.getItem("alphabit_users") || "[]");
    const existingUser = users.find((u: any) => u.name === userName);
    
    if (!existingUser) {
      users.push({
        name: userName,
        email: "usuario@email.com",
        referralCode: code,
        registeredAt: new Date().toISOString()
      });
      localStorage.setItem("alphabit_users", JSON.stringify(users));
    }
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link copiado!",
        description: "O link de indicação foi copiado para a área de transferência.",
      });
    } catch (err) {
      console.error("Erro ao copiar link:", err);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Copie manualmente.",
        variant: "destructive",
      });
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Junte-se ao Alphabit",
          text: "Conheça a plataforma de arbitragem automatizada que estou usando!",
          url: referralLink,
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Indicações Feitas
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {referralStats.totalReferrals}
            </div>
            <p className="text-xs text-muted-foreground">
              pessoas indicadas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Comissão Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-trading-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-trading-green">
              ${referralStats.totalCommission.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              ganhos por indicação
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Taxa de Comissão
            </CardTitle>
            <Percent className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {referralStats.referralPercent}%
            </div>
            <p className="text-xs text-muted-foreground">
              sobre investimentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center">
            <Link className="h-5 w-5 mr-2 text-primary" />
            Seu Link de Indicação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referralCode" className="text-sm font-medium">
              Código de Indicação
            </Label>
            <div className="flex gap-2">
              <Input
                id="referralCode"
                value={userReferralCode}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="px-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralLink" className="text-sm font-medium">
              Link Completo
            </Label>
            <div className="flex gap-2">
              <Input
                id="referralLink"
                value={referralLink}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="px-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={shareLink} className="bg-primary hover:bg-primary/90 flex-1">
              <Link className="h-4 w-4 mr-2" />
              Compartilhar Link
            </Button>
            <Button variant="outline" onClick={copyToClipboard} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copiar Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Como Funciona o Sistema de Indicações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Badge variant="default" className="text-xs px-2 py-1 mt-0.5">1</Badge>
                <div>
                  <h4 className="text-sm font-medium">Compartilhe seu link</h4>
                  <p className="text-xs text-muted-foreground">Envie seu link único para amigos e conhecidos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="default" className="text-xs px-2 py-1 mt-0.5">2</Badge>
                <div>
                  <h4 className="text-sm font-medium">Eles se cadastram</h4>
                  <p className="text-xs text-muted-foreground">Quando alguém usa seu link, você aparece como indicador</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="default" className="text-xs px-2 py-1 mt-0.5">3</Badge>
                <div>
                  <h4 className="text-sm font-medium">Ganhe comissão</h4>
                  <p className="text-xs text-muted-foreground">Receba {referralStats.referralPercent}% sobre todos os investimentos dos indicados</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="text-sm font-medium mb-2 text-primary">
                Exemplo de Ganhos
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Indicado investe $1.000</span>
                  <span className="font-medium">Comissão: ${(1000 * referralStats.referralPercent / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lucro diário: $10</span>
                  <span className="font-medium">Residual: $1.00/dia</span>
                </div>
                <div className="flex justify-between">
                  <span>Indicado investe $5.000</span>
                  <span className="font-medium">Comissão: ${(5000 * referralStats.referralPercent / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lucro diário: $50</span>
                  <span className="font-medium">Residual: $5.00/dia</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Comissão total:</span>
                  <span className="font-bold text-primary">${(6000 * referralStats.referralPercent / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Residual mensal:</span>
                  <span className="font-bold text-trading-green">$180.00</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralSystem;
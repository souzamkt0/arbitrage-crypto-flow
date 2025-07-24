import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReferralSystem from "@/components/ReferralSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Save, 
  User,
  Lock,
  Users,
  Crown,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = () => {
    toast({
      title: "Configurações salvas!",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro!",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Senha alterada!",
      description: "Sua senha foi atualizada com sucesso.",
    });
    
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Mock data - in a real app this would come from your auth context or API
  const userInfo = {
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "+55 (11) 99999-9999",
    joinDate: "15/03/2024",
    location: "São Paulo, SP",
    referrals: 12,
    activePlans: 2,
    communityRank: "Gold",
    totalEarnings: 1250.50
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
              <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 mr-3 text-primary" />
              Configurações do Bot
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">Configure os parâmetros de arbitragem</p>
          </div>
          
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Referral System */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Sistema de Indicações</CardTitle>
            </CardHeader>
            <CardContent>
              <ReferralSystem />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Editar Perfil</p>
                  <p className="text-sm text-muted-foreground">
                    Altere suas informações pessoais, foto e biografia
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/edit-profile')}
                >
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{userInfo.email}</p>
                    <p className="text-xs text-muted-foreground">Email</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{userInfo.phone}</p>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{userInfo.joinDate}</p>
                    <p className="text-xs text-muted-foreground">Membro desde</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{userInfo.location}</p>
                    <p className="text-xs text-muted-foreground">Localização</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estatísticas de Indicações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{userInfo.referrals}</p>
                  <p className="text-sm text-muted-foreground">Indicados</p>
                </div>
                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-green-500">R$ {userInfo.totalEarnings.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Ganhos Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Planos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Planos Ativos</p>
                    <p className="text-sm text-muted-foreground">
                      {userInfo.activePlans} planos ativos
                    </p>
                  </div>
                  <Badge variant="secondary">{userInfo.communityRank}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Plano Premium</span>
                    <Badge variant="outline">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Plano VIP</span>
                    <Badge variant="outline">Ativo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Trocar Senha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handlePasswordChange} className="bg-primary hover:bg-primary/90">
                <Lock className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" className="border-border text-card-foreground">
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Salvar e Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
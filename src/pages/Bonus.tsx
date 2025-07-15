import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift, Lock, DollarSign, Calendar, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TreasureChest {
  id: number;
  prize: number;
  opened: boolean;
  isOpening: boolean;
}

interface BonusSettings {
  minDepositForBonus: number;
  chestsPerDay: number;
  prizes: number[];
}

const Bonus = () => {
  const [chests, setChests] = useState<TreasureChest[]>([]);
  const [canOpenChests, setCanOpenChests] = useState(false);
  const [chestsOpened, setChestsOpened] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [lastDepositAmount, setLastDepositAmount] = useState(0);
  const [bonusSettings, setBonusSettings] = useState<BonusSettings>({
    minDepositForBonus: 50,
    chestsPerDay: 3,
    prizes: [1, 2, 3, 5, 8, 10, 15, 20, 25, 30]
  });
  const { toast } = useToast();

  useEffect(() => {
    // Simular verificação de depósito do usuário
    const checkUserDeposit = () => {
      const savedDeposit = localStorage.getItem("last_deposit_amount");
      const depositAmount = savedDeposit ? parseFloat(savedDeposit) : 0;
      setLastDepositAmount(depositAmount);
      
      if (depositAmount >= bonusSettings.minDepositForBonus) {
        setCanOpenChests(true);
        initializeChests();
      }
    };

    checkUserDeposit();
  }, [bonusSettings.minDepositForBonus]);

  const initializeChests = () => {
    const newChests = Array.from({ length: bonusSettings.chestsPerDay }, (_, i) => ({
      id: i + 1,
      prize: getRandomPrize(),
      opened: false,
      isOpening: false
    }));
    setChests(newChests);
  };

  const getRandomPrize = () => {
    const randomIndex = Math.floor(Math.random() * bonusSettings.prizes.length);
    return bonusSettings.prizes[randomIndex];
  };

  const openChest = async (chestId: number) => {
    if (chestsOpened >= bonusSettings.chestsPerDay) {
      toast({
        title: "Limite atingido",
        description: "Você já abriu todos os baús disponíveis hoje!",
        variant: "destructive"
      });
      return;
    }

    setChests(prev => prev.map(chest => 
      chest.id === chestId ? { ...chest, isOpening: true } : chest
    ));

    // Simular animação de abertura
    setTimeout(() => {
      setChests(prev => prev.map(chest => 
        chest.id === chestId 
          ? { ...chest, opened: true, isOpening: false }
          : chest
      ));

      const chest = chests.find(c => c.id === chestId);
      if (chest) {
        setTotalEarned(prev => prev + chest.prize);
        setChestsOpened(prev => prev + 1);
        
        toast({
          title: "Parabéns! 🎉",
          description: `Você ganhou $${chest.prize}!`,
        });
      }
    }, 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Gift className="h-8 w-8" />
          Baús de Tesouro
        </h1>
        <p className="text-muted-foreground mt-2">
          Faça um depósito de ${bonusSettings.minDepositForBonus}+ e ganhe direito a abrir {bonusSettings.chestsPerDay} baús por dia!
        </p>
      </div>

      {/* Status do usuário */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Último Depósito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${lastDepositAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastDepositAmount >= bonusSettings.minDepositForBonus ? "Qualificado para bônus" : "Depósito mínimo necessário"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Baús Abertos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {chestsOpened} / {bonusSettings.chestsPerDay}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponível diariamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ganho Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalEarned.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Prêmios dos baús
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Aviso se não pode abrir baús */}
      {!canOpenChests && (
        <Alert className="mb-8">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Para desbloquear os baús de tesouro, você precisa fazer um depósito de pelo menos ${bonusSettings.minDepositForBonus}.
            Faça seu depósito na página de <strong>Depósito</strong> e volte aqui para abrir seus baús!
          </AlertDescription>
        </Alert>
      )}

      {/* Baús de Tesouro */}
      {canOpenChests && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Seus Baús de Tesouro
            </CardTitle>
            <CardDescription>
              Clique nos baús para abri-los e descobrir seus prêmios! Você pode abrir {bonusSettings.chestsPerDay} baús por dia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {chests.map((chest) => (
                <div key={chest.id} className="flex flex-col items-center">
                  <Button
                    onClick={() => openChest(chest.id)}
                    disabled={chest.opened || chest.isOpening || chestsOpened >= bonusSettings.chestsPerDay}
                    className={`
                      w-32 h-32 rounded-xl text-6xl transition-all duration-300
                      ${chest.opened 
                        ? 'bg-green-100 text-green-600 border-2 border-green-300 hover:bg-green-100' 
                        : chest.isOpening
                        ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-300 animate-pulse'
                        : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700 shadow-lg hover:shadow-xl'
                      }
                    `}
                    variant={chest.opened ? "outline" : "default"}
                  >
                    {chest.isOpening ? (
                      <div className="animate-spin">⚡</div>
                    ) : chest.opened ? (
                      <div className="flex flex-col items-center">
                        <div className="text-2xl">💰</div>
                        <div className="text-sm font-bold">${chest.prize}</div>
                      </div>
                    ) : (
                      '🎁'
                    )}
                  </Button>
                  
                  <div className="mt-3 text-center">
                    <Badge variant={chest.opened ? "default" : "secondary"} className="mb-1">
                      Baú #{chest.id}
                    </Badge>
                    {chest.opened && (
                      <div className="text-sm text-green-600 font-medium">
                        Prêmio: ${chest.prize}
                      </div>
                    )}
                    {chest.isOpening && (
                      <div className="text-sm text-yellow-600 animate-pulse">
                        Abrindo...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {chestsOpened >= bonusSettings.chestsPerDay && (
              <div className="mt-8 text-center">
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Você abriu todos os baús disponíveis hoje! Volte amanhã para mais prêmios.
                    <br />
                    <strong>Total ganho hoje: ${totalEarned.toFixed(2)}</strong>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Regras */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📋 Regras dos Baús de Tesouro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span>Depósito mínimo de <strong>${bonusSettings.minDepositForBonus}</strong> para desbloquear os baús</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-blue-600" />
            <span>Máximo de <strong>{bonusSettings.chestsPerDay} baús</strong> por dia</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>Os baús são renovados diariamente</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <span>Prêmios variam de <strong>${Math.min(...bonusSettings.prizes)}</strong> a <strong>${Math.max(...bonusSettings.prizes)}</strong></span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Bonus;
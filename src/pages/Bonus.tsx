import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift, Lock, DollarSign, Calendar, Sparkles, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import treasureChestImage from "@/assets/treasure-chest.png";

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

interface RecentWinner {
  id: number;
  userName: string;
  prize: number;
  timeAgo: string;
  chestNumber: number;
}

const Bonus = () => {
  const [chests, setChests] = useState<TreasureChest[]>([]);
  const [canOpenChests, setCanOpenChests] = useState(false);
  const [chestsOpened, setChestsOpened] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [lastDepositAmount, setLastDepositAmount] = useState(0);
  const [recentWinners, setRecentWinners] = useState<RecentWinner[]>([]);
  const [bonusSettings, setBonusSettings] = useState<BonusSettings>({
    minDepositForBonus: 50,
    chestsPerDay: 3,
    prizes: [1, 2, 3, 5, 8, 10, 15, 20, 25, 30]
  });
  const { toast } = useToast();

  // Simulador de usuários ganhando prêmios
  useEffect(() => {
    // Gerar dados iniciais de vencedores
    const initialWinners: RecentWinner[] = [
      { id: 1, userName: "João Silva", prize: 25, timeAgo: "2 min atrás", chestNumber: 1 },
      { id: 2, userName: "Maria Santos", prize: 10, timeAgo: "5 min atrás", chestNumber: 3 },
      { id: 3, userName: "Pedro Costa", prize: 50, timeAgo: "8 min atrás", chestNumber: 2 },
      { id: 4, userName: "Ana Oliveira", prize: 15, timeAgo: "12 min atrás", chestNumber: 1 },
      { id: 5, userName: "Carlos Lima", prize: 5, timeAgo: "15 min atrás", chestNumber: 3 }
    ];
    setRecentWinners(initialWinners);

    // Simular novos vencedores a cada 8-15 segundos
    const interval = setInterval(() => {
      const names = ["Lucas Almeida", "Fernanda Rocha", "Ricardo Santos", "Juliana Costa", "Rafael Silva", "Beatriz Lima", "Gabriel Souza", "Camila Ferreira"];
      const prizes = [1, 2, 3, 5, 8, 10, 15, 20, 25, 30];
      
      const newWinner: RecentWinner = {
        id: Date.now(),
        userName: names[Math.floor(Math.random() * names.length)],
        prize: prizes[Math.floor(Math.random() * prizes.length)],
        timeAgo: "Agora",
        chestNumber: Math.floor(Math.random() * 3) + 1
      };

      setRecentWinners(prev => [newWinner, ...prev.slice(0, 9)]); // Manter apenas os 10 mais recentes
    }, Math.random() * 7000 + 8000); // Entre 8-15 segundos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simular verificação de depósito do usuário
    const checkUserDeposit = () => {
      const savedDeposit = localStorage.getItem("last_deposit_amount");
      const depositAmount = savedDeposit ? parseFloat(savedDeposit) : 0;
      setLastDepositAmount(depositAmount);
      
      // Sempre inicializar os baús para mostrar
      initializeChests();
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
    // Verificar se o usuário tem direito aos baús
    if (lastDepositAmount < bonusSettings.minDepositForBonus) {
      toast({
        title: "Depósito necessário",
        description: `Para abrir os baús, você precisa fazer um depósito de pelo menos $${bonusSettings.minDepositForBonus}. Vá para a página de Depósito!`,
        variant: "destructive"
      });
      return;
    }

    if (chestsOpened >= bonusSettings.chestsPerDay) {
      toast({
        title: "Limite atingido",
        description: "Você já abriu todos os baús disponíveis para este depósito!",
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
            <CardTitle className="text-sm font-medium">Baús Abertos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {chestsOpened} / {bonusSettings.chestsPerDay}
            </div>
            <p className="text-xs text-muted-foreground">
              Por depósito qualificado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
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
      {lastDepositAmount < bonusSettings.minDepositForBonus && (
        <Alert className="mb-8">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Para desbloquear os baús de tesouro, você precisa fazer um depósito de pelo menos ${bonusSettings.minDepositForBonus}.
            Faça seu depósito na página de <strong>Depósito</strong> e volte aqui para abrir seus baús!
          </AlertDescription>
        </Alert>
      )}

      {/* Baús de Tesouro - Sempre visíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Seus Baús de Tesouro
          </CardTitle>
          <CardDescription>
            {lastDepositAmount >= bonusSettings.minDepositForBonus 
              ? `Clique nos baús para abri-los e descobrir seus prêmios! Você pode abrir ${bonusSettings.chestsPerDay} baús por depósito qualificado.`
              : `Faça um depósito de $${bonusSettings.minDepositForBonus}+ para desbloquear os baús e ganhar prêmios incríveis!`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {chests.map((chest) => (
              <div key={chest.id} className="flex flex-col items-center">
                <div className="relative">
                  <Button
                    onClick={() => openChest(chest.id)}
                    disabled={chest.opened || chest.isOpening || (lastDepositAmount >= bonusSettings.minDepositForBonus && chestsOpened >= bonusSettings.chestsPerDay)}
                    className={`
                      w-40 h-40 rounded-xl p-0 overflow-hidden transition-all duration-300 relative
                      ${chest.opened 
                        ? 'border-4 border-green-400 shadow-lg shadow-green-200' 
                        : chest.isOpening
                        ? 'border-4 border-yellow-400 shadow-lg shadow-yellow-200 animate-pulse'
                        : lastDepositAmount < bonusSettings.minDepositForBonus
                        ? 'border-4 border-gray-300 grayscale hover:grayscale-0 cursor-pointer'
                        : 'border-4 border-yellow-400 shadow-lg shadow-yellow-200 hover:shadow-xl hover:shadow-yellow-300 animate-pulse'
                      }
                    `}
                    variant="ghost"
                    style={{ padding: 0 }}
                  >
                    <img 
                      src={treasureChestImage} 
                      alt="Baú do tesouro" 
                      className={`w-full h-full object-cover ${
                        chest.isOpening ? 'animate-bounce' : ''
                      } ${
                        !chest.opened && lastDepositAmount >= bonusSettings.minDepositForBonus ? 'golden-glow' : ''
                      }`}
                    />
                    {chest.opened && (
                      <div className="absolute inset-0 bg-green-400 bg-opacity-20 flex items-center justify-center">
                        <div className="text-center text-white font-bold">
                          <div className="text-2xl">💰</div>
                          <div className="text-lg">${chest.prize}</div>
                        </div>
                      </div>
                    )}
                    {chest.isOpening && (
                      <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 flex items-center justify-center">
                        <div className="text-white text-3xl animate-spin">✨</div>
                      </div>
                    )}
                  </Button>
                </div>
                
                <div className="mt-4 text-center">
                  <Badge variant={chest.opened ? "default" : "secondary"} className="mb-2">
                    Baú #{chest.id}
                  </Badge>
                  {chest.opened && (
                    <div className="text-sm text-green-600 font-medium animate-bounce">
                      Prêmio: ${chest.prize} 🎉
                    </div>
                  )}
                  {chest.isOpening && (
                    <div className="text-sm text-yellow-600 animate-pulse font-medium">
                      Abrindo... ✨
                    </div>
                  )}
                  {!chest.opened && !chest.isOpening && lastDepositAmount < bonusSettings.minDepositForBonus && (
                    <div className="text-sm text-gray-500">
                      Bloqueado 🔒
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

            {chestsOpened >= bonusSettings.chestsPerDay && lastDepositAmount >= bonusSettings.minDepositForBonus && (
              <div className="mt-8 text-center">
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Você abriu todos os baús disponíveis para este depósito! 
                    <br />
                    Faça um novo depósito de ${bonusSettings.minDepositForBonus}+ para ganhar direito a mais baús.
                    <br />
                    <strong>Total ganho: ${totalEarned.toFixed(2)}</strong>
                  </AlertDescription>
                </Alert>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Simulador de Vencedores */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Últimos Vencedores
          </CardTitle>
          <CardDescription>
            Veja quem está ganhando prêmios dos baús de tesouro em tempo real!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentWinners.map((winner) => (
              <div 
                key={winner.id} 
                className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <img 
                      src={treasureChestImage} 
                      alt="Baú" 
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{winner.userName}</div>
                    <div className="text-sm text-gray-600">
                      Abriu o Baú #{winner.chestNumber}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600 text-lg">
                    +${winner.prize}
                  </div>
                  <div className="text-sm text-gray-500">
                    {winner.timeAgo}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 inline mr-1" />
            Novos vencedores aparecem em tempo real!
          </div>
        </CardContent>
      </Card>

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
            <span>Direito a <strong>{bonusSettings.chestsPerDay} baús</strong> por depósito qualificado</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>Novos baús só após novo depósito de ${bonusSettings.minDepositForBonus}+</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <span>Prêmios variam de <strong>${Math.min(...bonusSettings.prizes)}</strong> a <strong>${Math.max(...bonusSettings.prizes)}</strong></span>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .golden-glow {
          animation: goldenGlow 2s infinite ease-in-out;
        }
        
        @keyframes goldenGlow {
          0%, 100% {
            filter: drop-shadow(0 0 5px #ffd700) brightness(1);
          }
          50% {
            filter: drop-shadow(0 0 20px #ffd700) brightness(1.2);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Bonus;
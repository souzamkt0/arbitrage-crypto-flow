import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  User,
  PiggyBank,
  Percent
} from "lucide-react";

interface ResidualEarning {
  id: string;
  referredUserName: string;
  referredUserPlan: string;
  investmentAmount: number;
  dailyProfit: number;
  residualPercent: number;
  residualEarning: number;
  date: string;
  status: "active" | "completed" | "paused";
}

interface ResidualStats {
  totalResidual: number;
  dailyResidual: number;
  monthlyResidual: number;
  activeInvestments: number;
}

const ResidualEarnings = () => {
  const [residualEarnings, setResidualEarnings] = useState<ResidualEarning[]>([]);
  const [residualStats, setResidualStats] = useState<ResidualStats>({
    totalResidual: 0,
    dailyResidual: 0,
    monthlyResidual: 0,
    activeInvestments: 0
  });

  useEffect(() => {
    // Carregar configurações do admin para % residual
    const settings = JSON.parse(localStorage.getItem("alphabit_admin_settings") || "{}");
    const residualPercent = settings.residualPercent || 10;

    // All residual data reset to zero
    setResidualEarnings([]);

    // Reset all stats to zero
    setResidualStats({
      totalResidual: 0,
      dailyResidual: 0,
      monthlyResidual: 0,
      activeInvestments: 0
    });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-trading-green">Ativo</Badge>;
      case "completed":
        return <Badge variant="secondary">Concluído</Badge>;
      case "paused":
        return <Badge variant="outline">Pausado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Residual Diário
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-trading-green" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-trading-green">
              {formatCurrency(residualStats.dailyResidual)}
            </div>
            <p className="text-xs text-muted-foreground">
              ganho diário atual
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Residual Mensal
            </CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-warning">
              {formatCurrency(residualStats.monthlyResidual)}
            </div>
            <p className="text-xs text-muted-foreground">
              projeção mensal
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total Residual
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(residualStats.totalResidual)}
            </div>
            <p className="text-xs text-muted-foreground">
              total acumulado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Investimentos Ativos
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-secondary-foreground">
              {residualStats.activeInvestments}
            </div>
            <p className="text-xs text-muted-foreground">
              gerando residuais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center">
            <Percent className="h-5 w-5 mr-2 text-primary" />
            Detalhamento dos Residuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicado</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Investimento</TableHead>
                  <TableHead>Lucro Diário</TableHead>
                  <TableHead>% Residual</TableHead>
                  <TableHead>Ganho Residual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residualEarnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        {earning.referredUserName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {earning.referredUserPlan}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(earning.investmentAmount)}
                    </TableCell>
                    <TableCell className="text-trading-green font-medium">
                      {formatCurrency(earning.dailyProfit)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{earning.residualPercent}%</span>
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      {formatCurrency(earning.residualEarning)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(earning.status)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDate(earning.date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {residualEarnings.length === 0 && (
            <div className="text-center py-8">
              <Percent className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum residual encontrado
              </h3>
              <p className="text-muted-foreground">
                Os residuais aparecerão quando seus indicados começarem a investir
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How Residuals Work */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Como Funcionam os Residuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Badge variant="default" className="text-xs px-2 py-1 mt-0.5">1</Badge>
                <div>
                  <h4 className="text-sm font-medium">Indicado investe</h4>
                  <p className="text-xs text-muted-foreground">Quando seu indicado faz um investimento ativo</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="default" className="text-xs px-2 py-1 mt-0.5">2</Badge>
                <div>
                  <h4 className="text-sm font-medium">Bot gera lucros</h4>
                  <p className="text-xs text-muted-foreground">O bot de arbitragem gera lucros diários para o investimento</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="default" className="text-xs px-2 py-1 mt-0.5">3</Badge>
                <div>
                  <h4 className="text-sm font-medium">Você ganha residual</h4>
                  <p className="text-xs text-muted-foreground">Receba uma porcentagem dos lucros diários, todos os dias</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="text-sm font-medium mb-2 text-primary">
                Exemplo de Cálculo Residual
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Indicado investe:</span>
                  <span className="font-medium">$1.000</span>
                </div>
                <div className="flex justify-between">
                  <span>Lucro diário (1%):</span>
                  <span className="font-medium">$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Seu residual (10%):</span>
                  <span className="font-medium">$1.00/dia</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Residual mensal:</span>
                  <span className="font-bold text-primary">$30.00</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Residuais são creditados enquanto o investimento estiver ativo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResidualEarnings;
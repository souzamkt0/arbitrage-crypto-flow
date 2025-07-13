import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Download, Filter, History as HistoryIcon, Search, TrendingUp, TrendingDown } from "lucide-react";

const History = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const trades = [
    {
      id: "ARB001",
      timestamp: "2024-01-15 14:32:15",
      pair: "BTC/USDT",
      type: "Arbitrage",
      buyPrice: 42150.50,
      sellPrice: 42680.20,
      amount: 0.5,
      profit: 264.85,
      profitPercent: 1.25,
      status: "Completed",
      exchange1: "Binance Spot",
      exchange2: "Binance Futures"
    },
    {
      id: "ARB002", 
      timestamp: "2024-01-15 14:28:42",
      pair: "ETH/USDT",
      type: "Arbitrage",
      buyPrice: 2580.30,
      sellPrice: 2601.80,
      amount: 2.1,
      profit: 45.15,
      profitPercent: 0.83,
      status: "Completed",
      exchange1: "Binance Spot",
      exchange2: "Binance Futures"
    },
    {
      id: "ARB003",
      timestamp: "2024-01-15 14:25:11", 
      pair: "BNB/USDT",
      type: "Arbitrage",
      buyPrice: 315.20,
      sellPrice: 321.90,
      amount: 15.0,
      profit: 100.50,
      profitPercent: 2.12,
      status: "Completed",
      exchange1: "Binance Spot",
      exchange2: "Binance Futures"
    },
    {
      id: "ARB004",
      timestamp: "2024-01-15 14:22:03",
      pair: "ADA/USDT", 
      type: "Arbitrage",
      buyPrice: 0.4520,
      sellPrice: 0.4575,
      amount: 1000,
      profit: 55.00,
      profitPercent: 1.22,
      status: "Failed",
      exchange1: "Binance Spot",
      exchange2: "Binance Futures"
    },
    {
      id: "ARB005",
      timestamp: "2024-01-15 14:18:35",
      pair: "DOT/USDT",
      type: "Arbitrage", 
      buyPrice: 7.25,
      sellPrice: 7.32,
      amount: 50,
      profit: 3.50,
      profitPercent: 0.97,
      status: "Completed",
      exchange1: "Binance Spot",
      exchange2: "Binance Futures"
    }
  ];

  const filteredTrades = trades.filter(trade => {
    const matchesFilter = filter === "all" || trade.status.toLowerCase() === filter;
    const matchesSearch = trade.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalProfit = trades.filter(t => t.status === "Completed").reduce((sum, trade) => sum + trade.profit, 0);
  const successRate = (trades.filter(t => t.status === "Completed").length / trades.length * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <HistoryIcon className="h-8 w-8 mr-3 text-primary" />
              Histórico de Operações
            </h1>
            <p className="text-muted-foreground">Acompanhe todas as arbitragens executadas</p>
          </div>
          
          <Button className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Total</p>
                  <p className="text-2xl font-bold text-trading-green">
                    +${totalProfit.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-trading-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-primary">
                    {successRate}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Operações</p>
                  <p className="text-2xl font-bold text-foreground">
                    {trades.length}
                  </p>
                </div>
                <HistoryIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Filter className="h-5 w-5 mr-2 text-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Par ou ID da operação"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Status</label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="failed">Falharam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Data Início</label>
                <Input type="date" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Data Fim</label>
                <Input type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trades Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Operações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Par</TableHead>
                    <TableHead>Exchanges</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Lucro</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-mono text-sm">{trade.id}</TableCell>
                      <TableCell className="text-sm">{trade.timestamp}</TableCell>
                      <TableCell className="font-medium">{trade.pair}</TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <div>{trade.exchange1}</div>
                          <div className="text-muted-foreground">→ {trade.exchange2}</div>
                        </div>
                      </TableCell>
                      <TableCell>${(trade.amount * trade.buyPrice).toFixed(2)}</TableCell>
                      <TableCell className={trade.profit > 0 ? "text-trading-green" : "text-trading-red"}>
                        {trade.profit > 0 ? "+" : ""}${trade.profit.toFixed(2)}
                      </TableCell>
                      <TableCell className={trade.profitPercent > 0 ? "text-trading-green" : "text-trading-red"}>
                        {trade.profitPercent > 0 ? "+" : ""}{trade.profitPercent}%
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={trade.status === "Completed" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {trade.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Search, TrendingUp, Eye, DollarSign, Clock, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NFTs = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const nftOpportunities = [
    {
      id: "NFT001",
      name: "CryptoPunk #7804",
      collection: "CryptoPunks",
      currentPrice: 150.5,
      floorPrice: 120.0,
      marketCap: "2.1M",
      volume24h: 45.2,
      profitPotential: 25.4,
      rarity: "Rare",
      lastSale: "145 ETH",
      image: "/api/placeholder/150/150"
    },
    {
      id: "NFT002", 
      name: "Bored Ape #3749",
      collection: "Bored Ape Yacht Club",
      currentPrice: 89.2,
      floorPrice: 75.0,
      marketCap: "1.8M",
      volume24h: 32.1,
      profitPotential: 18.9,
      rarity: "Ultra Rare",
      lastSale: "85 ETH",
      image: "/api/placeholder/150/150"
    },
    {
      id: "NFT003",
      name: "Azuki #2847",
      collection: "Azuki",
      currentPrice: 25.3,
      floorPrice: 20.5,
      marketCap: "850K",
      volume24h: 18.7,
      profitPotential: 23.4,
      rarity: "Common",
      lastSale: "24 ETH",
      image: "/api/placeholder/150/150"
    },
    {
      id: "NFT004",
      name: "Doodle #5623",
      collection: "Doodles",
      currentPrice: 12.8,
      floorPrice: 10.2,
      marketCap: "420K",
      volume24h: 8.9,
      profitPotential: 25.5,
      rarity: "Rare",
      lastSale: "12.5 ETH",
      image: "/api/placeholder/150/150"
    },
    {
      id: "NFT005",
      name: "CloneX #8291",
      collection: "CloneX",
      currentPrice: 8.5,
      floorPrice: 7.1,
      marketCap: "290K",
      volume24h: 5.2,
      profitPotential: 19.7,
      rarity: "Common",
      lastSale: "8.2 ETH",
      image: "/api/placeholder/150/150"
    },
    {
      id: "NFT006",
      name: "Moonbird #1847",
      collection: "Moonbirds",
      currentPrice: 35.7,
      floorPrice: 28.9,
      marketCap: "1.2M",
      volume24h: 22.4,
      profitPotential: 23.5,
      rarity: "Ultra Rare",
      lastSale: "34 ETH",
      image: "/api/placeholder/150/150"
    }
  ];

  const filteredNFTs = nftOpportunities.filter(nft => {
    const matchesFilter = filter === "all" || 
                         (filter === "high-potential" && nft.profitPotential > 20) ||
                         (filter === "rare" && nft.rarity !== "Common");
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.collection.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAnalyze = (nftId: string) => {
    toast({
      title: "Análise iniciada",
      description: `Analisando oportunidade de flip para ${nftId}`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Image className="h-8 w-8 mr-3 text-primary" />
              Monitor de NFTs
            </h1>
            <p className="text-muted-foreground">Identifique oportunidades de flip em NFTs</p>
          </div>
          
          <Button className="bg-primary hover:bg-primary/90">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analisar Mercado
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Oportunidades</p>
                  <p className="text-2xl font-bold text-primary">{nftOpportunities.length}</p>
                </div>
                <Image className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Volume 24h</p>
                  <p className="text-2xl font-bold text-trading-green">
                    ${nftOpportunities.reduce((sum, nft) => sum + nft.volume24h, 0).toFixed(1)}K
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
                  <p className="text-sm text-muted-foreground">Lucro Médio</p>
                  <p className="text-2xl font-bold text-primary">
                    {(nftOpportunities.reduce((sum, nft) => sum + nft.profitPotential, 0) / nftOpportunities.length).toFixed(1)}%
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Atualizações</p>
                  <p className="text-2xl font-bold text-foreground">Real-time</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Buscar NFT</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome ou coleção"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Categoria</label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="high-potential">Alto Potencial ({`>`}20%)</SelectItem>
                    <SelectItem value="rare">Apenas Raros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Faixa de Preço</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar faixa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">0 - 10 ETH</SelectItem>
                    <SelectItem value="medium">10 - 50 ETH</SelectItem>
                    <SelectItem value="high">50+ ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNFTs.map((nft) => (
            <Card key={nft.id} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={nft.rarity === "Ultra Rare" ? "default" : "secondary"} className="text-xs">
                    {nft.rarity}
                  </Badge>
                  <Badge variant="outline" className="text-trading-green text-xs">
                    +{nft.profitPotential}%
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* NFT Image Placeholder */}
                <div className="w-full h-48 bg-secondary rounded-lg flex items-center justify-center">
                  <Image className="h-16 w-16 text-muted-foreground" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-card-foreground">{nft.name}</h3>
                  <p className="text-sm text-muted-foreground">{nft.collection}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Preço Atual</p>
                    <p className="font-medium text-card-foreground">{nft.currentPrice} ETH</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Floor Price</p>
                    <p className="font-medium text-card-foreground">{nft.floorPrice} ETH</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Volume 24h</p>
                    <p className="font-medium text-card-foreground">{nft.volume24h}K</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Market Cap</p>
                    <p className="font-medium text-card-foreground">{nft.marketCap}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => handleAnalyze(nft.id)}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Analisar
                  </Button>
                  <Button size="sm" variant="outline" className="border-border">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NFTs;
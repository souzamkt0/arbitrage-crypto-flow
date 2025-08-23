import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface PixCodeDisplayProps {
  pixCode: string;
}

export const PixCodeDisplay: React.FC<PixCodeDisplayProps> = ({ pixCode }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyPixCode = () => {
    if (!pixCode) return;
    
    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true);
      toast({
        title: "✅ Código PIX Copiado!",
        description: "Cole no app do seu banco para efetuar o pagamento",
      });
      
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card className="bg-background border border-border">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Código PIX</h4>
            <Button
              onClick={copyPixCode}
              variant="outline"
              size="sm"
              className={`transition-colors ${copied ? 'bg-success text-success-foreground' : ''}`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <div className="font-mono text-sm text-foreground break-all">
              {pixCode || 'Código PIX não disponível'}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Cole este código no seu app bancário ou PIX
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
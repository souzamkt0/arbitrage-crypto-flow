import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCodeBase64: string;
  amount: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCodeBase64, amount }) => {
  const downloadQRCode = () => {
    if (!qrCodeBase64) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${qrCodeBase64}`;
    link.download = `qr-code-pix-${amount.replace(/[^0-9]/g, '')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="bg-background border border-border">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode className="h-5 w-5 text-foreground" />
            <h4 className="font-semibold text-foreground">QR Code PIX</h4>
          </div>
          
          {qrCodeBase64 ? (
            <div className="bg-white p-4 rounded-lg inline-block">
              <img 
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-48 h-48 mx-auto"
              />
            </div>
          ) : (
            <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
              <div className="text-muted-foreground">QR Code indisponível</div>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            Escaneie com o app do seu banco
          </p>
          
          {qrCodeBase64 && (
            <Button
              onClick={downloadQRCode}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar QR Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
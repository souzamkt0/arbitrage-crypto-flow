// API Route para webhook do DigitoPay
// Este arquivo funciona como uma API route no Vercel

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Responder a requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apenas aceitar requisições POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('🔔 Webhook recebido em alphabit.vu:', JSON.stringify(req.body, null, 2));

    // Enviar para Supabase Edge Function
    const response = await fetch('https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-deposit-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8'
      },
      body: JSON.stringify(req.body)
    });

    const result = await response.json();
    
    console.log('✅ Webhook processado com sucesso:', result);
    
    // Retornar resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso',
      data: result
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    
    // Retornar erro
    res.status(500).json({
      success: false,
      message: 'Erro ao processar webhook',
      error: error.message
    });
  }
}

import { useState, useEffect } from "react";

const Investments = () => {
  console.log('🚀 Investments component starting to render - SIMPLE VERSION');
  
  useEffect(() => {
    console.log('🔄 Investments useEffect triggered');
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-center">Página de Investimentos</h1>
      <p className="text-center mt-4">Se você está vendo esta mensagem, a página está funcionando!</p>
      <p className="text-center mt-2 text-gray-400">Debug: Componente renderizado com sucesso</p>
    </div>
  );
};

export default Investments;
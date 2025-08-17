// Script para aplicar correção na tabela profiles
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = "https://cbwpghrkfvczjqzefvix.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyProfilesFix() {
  console.log('🔄 Aplicando correção na tabela profiles...');
  
  try {
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('fix-profiles-table.sql', 'utf8');
    
    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Erro ao aplicar correção:', error);
      return;
    }
    
    console.log('✅ Correção aplicada com sucesso!');
    console.log('📊 Resultado:', data);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

applyProfilesFix();

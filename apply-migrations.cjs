const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const SUPABASE_URL = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyMigrations() {
  console.log('🔧 Aplicando migrações do Supabase...');
  
  try {
    // 1. Aplicar migração da constraint
    console.log('\n📋 Aplicando migração da constraint...');
    const constraintMigration = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20250115000009_fix_role_constraint.sql'),
      'utf8'
    );
    
    const { data: constraintResult, error: constraintError } = await supabase
      .rpc('exec_sql', { sql: constraintMigration });
    
    if (constraintError) {
      console.log('❌ Erro na migração da constraint:', constraintError);
    } else {
      console.log('✅ Migração da constraint aplicada:', constraintResult);
    }

    // 2. Aplicar função update_user_role
    console.log('\n⚙️ Aplicando função update_user_role...');
    const updateRoleMigration = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20250115000008_add_update_user_role_function.sql'),
      'utf8'
    );
    
    const { data: updateRoleResult, error: updateRoleError } = await supabase
      .rpc('exec_sql', { sql: updateRoleMigration });
    
    if (updateRoleError) {
      console.log('❌ Erro na função update_user_role:', updateRoleError);
    } else {
      console.log('✅ Função update_user_role aplicada:', updateRoleResult);
    }

    // 3. Aplicar migração de partner commission
    console.log('\n💰 Aplicando migração de partner commission...');
    const partnerMigration = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20250115000007_add_partner_commission.sql'),
      'utf8'
    );
    
    const { data: partnerResult, error: partnerError } = await supabase
      .rpc('exec_sql', { sql: partnerMigration });
    
    if (partnerError) {
      console.log('❌ Erro na migração de partner:', partnerError);
    } else {
      console.log('✅ Migração de partner aplicada:', partnerResult);
    }

    // 4. Aplicar migração de constraint fix
    console.log('\n🔧 Aplicando fix da constraint...');
    const constraintFixMigration = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20250115000010_apply_role_constraint_migration.sql'),
      'utf8'
    );
    
    const { data: constraintFixResult, error: constraintFixError } = await supabase
      .rpc('exec_sql', { sql: constraintFixMigration });
    
    if (constraintFixError) {
      console.log('❌ Erro no fix da constraint:', constraintFixError);
    } else {
      console.log('✅ Fix da constraint aplicado:', constraintFixResult);
    }

    // 5. Testar se Admin Souza pode ser atualizado
    console.log('\n👤 Testando atualização do Admin Souza...');
    const { data: adminSouza, error: adminError } = await supabase
      .from('profiles')
      .select('user_id, email, role, display_name')
      .eq('email', 'souzamkt0@gmail.com')
      .single();
    
    if (adminError) {
      console.log('❌ Erro ao buscar Admin Souza:', adminError);
    } else {
      console.log('✅ Admin Souza encontrado:', adminSouza);
      
      // Tentar atualizar para partner
      const { data: updateResult, error: updateError } = await supabase
        .rpc('update_user_role', {
          user_id_param: adminSouza.user_id,
          new_role: 'partner'
        });
      
      if (updateError) {
        console.log('❌ Erro ao atualizar Admin Souza:', updateError);
        
        // Tentar update direto
        const { data: directUpdate, error: directError } = await supabase
          .from('profiles')
          .update({ role: 'partner' })
          .eq('user_id', adminSouza.user_id)
          .select();
        
        if (directError) {
          console.log('❌ Erro no update direto:', directError);
        } else {
          console.log('✅ Admin Souza atualizado via update direto:', directUpdate);
        }
      } else {
        console.log('✅ Admin Souza atualizado via RPC:', updateResult);
      }
    }

    // 6. Verificar sócios
    console.log('\n👥 Verificando sócios...');
    const { data: partners, error: partnersError } = await supabase
      .from('profiles')
      .select('user_id, email, role, display_name')
      .eq('role', 'partner');
    
    if (partnersError) {
      console.log('❌ Erro ao buscar sócios:', partnersError);
    } else {
      console.log('✅ Sócios encontrados:', partners);
      console.log('📊 Quantidade de sócios:', partners?.length || 0);
    }

    console.log('\n🎉 Migrações aplicadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar as migrações
applyMigrations();




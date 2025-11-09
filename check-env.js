// Script de diagnóstico para verificar variáveis de ambiente
import 'dotenv/config';

console.log('=== DIAGNÓSTICO DE VARIÁVEIS DE AMBIENTE ===\n');

const requiredVars = {
  'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY,
  'DATABASE_URL': process.env.DATABASE_URL,
};

let hasErrors = false;

for (const [varName, varValue] of Object.entries(requiredVars)) {
  if (varValue) {
    // Mostra apenas os primeiros e últimos caracteres por segurança
    const masked = varValue.length > 20 
      ? `${varValue.substring(0, 10)}...${varValue.substring(varValue.length - 5)}`
      : varValue.substring(0, 15) + '...';
    console.log(`✅ ${varName}: ${masked}`);
  } else {
    console.log(`❌ ${varName}: NÃO DEFINIDA`);
    hasErrors = true;
  }
}

console.log('\n=== VERIFICAÇÃO DE ARQUIVO .env ===');
const fs = await import('fs');
const path = await import('path');

const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Arquivo .env encontrado em:', envPath);
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
  console.log(`   Encontradas ${lines.length} variáveis no arquivo`);
} else {
  console.log('❌ Arquivo .env NÃO encontrado em:', envPath);
  hasErrors = true;
}

if (hasErrors) {
  console.log('\n⚠️  PROBLEMAS ENCONTRADOS!');
  console.log('Verifique se:');
  console.log('1. O arquivo .env existe na raiz do projeto');
  console.log('2. As variáveis estão escritas corretamente (sem espaços extras)');
  console.log('3. Você reiniciou o servidor após criar/modificar o .env');
  process.exit(1);
} else {
  console.log('\n✅ Todas as variáveis estão configuradas corretamente!');
  process.exit(0);
}


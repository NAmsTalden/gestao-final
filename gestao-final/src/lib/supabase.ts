import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined') {
  const missingVars = []
  if (!supabaseUrl || supabaseUrl === 'undefined') missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey || supabaseAnonKey === 'undefined') missingVars.push('VITE_SUPABASE_ANON_KEY')
  
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!')
  console.error(`Faltam: ${missingVars.join(', ')}`)
  console.error('\n📝 SOLUÇÃO:')
  console.error('1. Crie um arquivo .env na raiz do projeto')
  console.error('2. Adicione as seguintes linhas:')
  console.error('   VITE_SUPABASE_URL=https://seu-projeto.supabase.co')
  console.error('   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui')
  console.error('3. Obtenha essas informações em: https://app.supabase.com')
  console.error('4. Reinicie o servidor de desenvolvimento (npm run dev)')
  
  throw new Error(`Variáveis de ambiente faltando: ${missingVars.join(', ')}. Veja o console para mais detalhes.`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
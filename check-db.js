import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tzixuvhhepohrhnslfxv.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aXh1dmhoZXBvaHJobnNsZnh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY0ODgwMSwiZXhwIjoyMDg1MjI0ODAxfQ.Fk0AIN9nrM3Tn6IMc4eAEK9zojKXjR6TFpazNISWIwM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  try {
    console.log('Checking RLS policies on users table...\n')
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Error accessing users table:', error.message)
    } else {
      console.log('✅ Users table is accessible')
    }

    console.log('\nChecking if users table has RLS enabled...')
    const { data: schemaData, error: schemaError } = await supabase.rpc('check_rls_status', {
      table_name: 'users'
    }).catch(() => ({ data: null, error: { message: 'RPC not available' } }))

    console.log('Note: RLS configuration must be checked in Supabase Dashboard UI')
    console.log('Go to: Database → Tables → users → RLS')
    
  } catch (err) {
    console.error('Error:', err)
  }
}

checkDatabase()

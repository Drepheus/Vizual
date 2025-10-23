// Deploy database functions to Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deploySQL() {
  console.log('🚀 Deploying usage tracking functions to Supabase...\n');

  // Read the SQL file
  const sql = readFileSync('./deploy-usage-tracking.sql', 'utf8');

  // Split into individual statements (rough split, but should work)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    
    // Skip comments
    if (statement.startsWith('--') || statement.startsWith('/*')) {
      continue;
    }

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        errorCount++;
      } else {
        successCount++;
        process.stdout.write('.');
      }
    } catch (err) {
      console.error(`❌ Exception on statement ${i + 1}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n\n✅ Deployment complete!`);
  console.log(`   Success: ${successCount} statements`);
  console.log(`   Errors: ${errorCount} statements\n`);

  if (errorCount === 0) {
    console.log('🎉 All functions deployed successfully!');
    console.log('   Your usage tracking should now work.\n');
  } else {
    console.log('⚠️  Some errors occurred. You may need to run the SQL manually in Supabase SQL Editor.\n');
  }
}

deploySQL().catch(console.error);

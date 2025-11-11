import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NBS_DATASET_URL = 'https://drive.google.com/uc?export=download&id=1rDD7k6Z95JsSyjJ1qHnyVI6ZWfETE45o';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create sync history record
    const { data: syncRecord, error: syncError } = await supabase
      .from('data_sync_history')
      .insert({
        status: 'running',
        triggered_by: 'manual',
        user_id: user.id,
        dataset_source_url: NBS_DATASET_URL
      })
      .select()
      .single();

    if (syncError) {
      console.error('Failed to create sync record:', syncError);
      throw new Error('Failed to initialize sync');
    }

    const syncId = syncRecord.id;

    try {
      console.log('Downloading NBS dataset from:', NBS_DATASET_URL);
      
      // Download the file
      const downloadResponse = await fetch(NBS_DATASET_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!downloadResponse.ok) {
        throw new Error(`Failed to download file: ${downloadResponse.status}`);
      }

      const fileContent = await downloadResponse.text();
      console.log('File downloaded, size:', fileContent.length, 'bytes');

      // Parse CSV/TSV data
      const records = parseDataFile(fileContent);
      console.log(`Parsed ${records.length} records`);

      if (records.length === 0) {
        throw new Error('No valid records found in dataset');
      }

      // Bulk insert with deduplication
      const BATCH_SIZE = 1000;
      let totalInserted = 0;
      let totalSkipped = 0;

      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        
        // Check for existing records (deduplicate by date + state + lga + food_item)
        const existingKeys = await supabase
          .from('market_prices')
          .select('date, state, lga, food_item')
          .in('date', [...new Set(batch.map(r => r.date))])
          .in('state', [...new Set(batch.map(r => r.state))])
          .in('lga', [...new Set(batch.map(r => r.lga))])
          .in('food_item', [...new Set(batch.map(r => r.food_item))]);

        const existingSet = new Set(
          (existingKeys.data || []).map(e => `${e.date}|${e.state}|${e.lga}|${e.food_item}`)
        );

        // Filter out duplicates
        const newRecords = batch.filter(r => 
          !existingSet.has(`${r.date}|${r.state}|${r.lga}|${r.food_item}`)
        );

        if (newRecords.length > 0) {
          const { error: insertError } = await supabase
            .from('market_prices')
            .insert(newRecords);

          if (insertError) {
            console.error('Batch insert error:', insertError);
          } else {
            totalInserted += newRecords.length;
          }
        }

        totalSkipped += (batch.length - newRecords.length);
        
        console.log(`Progress: ${i + batch.length}/${records.length} | Inserted: ${totalInserted} | Skipped: ${totalSkipped}`);
      }

      // Update sync history as completed
      await supabase
        .from('data_sync_history')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          records_processed: records.length,
          records_inserted: totalInserted,
          records_skipped: totalSkipped
        })
        .eq('id', syncId);

      console.log('Sync completed successfully');

      return new Response(
        JSON.stringify({
          success: true,
          syncId,
          processed: records.length,
          inserted: totalInserted,
          skipped: totalSkipped,
          source: NBS_DATASET_URL
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      // Update sync history as failed
      await supabase
        .from('data_sync_history')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', syncId);

      throw error;
    }

  } catch (error) {
    console.error('Error in fetch-nbs-data:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseDataFile(text: string): any[] {
  console.log('=== DATA PARSING START ===');
  
  // Remove BOM if present
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  
  // Split into lines
  const lines = text.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0);
  
  if (lines.length < 2) {
    console.error('File must have at least 2 lines');
    return [];
  }
  
  // Detect separator
  const headerLine = lines[0];
  const tabCount = (headerLine.match(/\t/g) || []).length;
  const commaCount = (headerLine.match(/,/g) || []).length;
  const separator = tabCount > commaCount ? '\t' : ',';
  
  console.log(`Detected separator: ${separator === '\t' ? 'TAB' : 'COMMA'}`);
  
  const records = [];
  const errors: string[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      const values = line.split(separator);
      
      if (values.length < 9) {
        if (errors.length < 10) errors.push(`Line ${i}: Only ${values.length} columns`);
        continue;
      }
      
      // Parse date (DD/MM/YYYY)
      const dateStr = values[0].trim();
      const dateParts = dateStr.split('/');
      if (dateParts.length !== 3) continue;
      
      const day = dateParts[0].padStart(2, '0');
      const month = dateParts[1].padStart(2, '0');
      const year = dateParts[2];
      const formattedDate = `${year}-${month}-${day}`;
      
      // Parse price
      const price = parseFloat(values[8].trim());
      if (isNaN(price) || price < 0) continue;
      
      records.push({
        date: formattedDate,
        state: values[1].trim().toUpperCase(),
        lga: values[2].trim().toUpperCase(),
        outlet_type: values[3].trim(),
        sector: values[5].trim(),
        food_item: values[6].trim(),
        price_category: values[7].trim(),
        uprice: price
      });
      
    } catch (error) {
      if (errors.length < 10) {
        errors.push(`Line ${i}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    }
  }
  
  console.log(`Parsed ${records.length} valid records from ${lines.length - 1} lines`);
  if (errors.length > 0) {
    console.log('Sample errors:', errors.slice(0, 5));
  }
  
  return records;
}
